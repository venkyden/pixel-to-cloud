import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Camera, Upload, Check, X, Clock, Image as ImageIcon, FileText, Calendar } from "lucide-react";

interface Room {
  name: string;
  photos: File[];
  condition: "excellent" | "bon" | "moyen" | "mauvais";
  notes: string;
}

const DEFAULT_ROOMS = [
  "Séjour",
  "Cuisine",
  "Salle de bain",
  "Chambre 1",
  "Chambre 2",
  "WC",
  "Couloir",
  "Balcon/Terrasse"
];

export const EtatDesLieux = ({ propertyId, type = "check-in" }: { propertyId: string; type: "check-in" | "check-out" }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(
    DEFAULT_ROOMS.map(name => ({ name, photos: [], condition: "bon" as const, notes: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [existingInspection, setExistingInspection] = useState<any>(null);
  const [signingStatus, setSigningStatus] = useState<"pending" | "landlord-signed" | "tenant-signed" | "both-signed">("pending");

  useEffect(() => {
    if (propertyId) {
      fetchExistingInspection();
    }
  }, [propertyId]);

  const fetchExistingInspection = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("property_inspections")
        .select("*")
        .eq("property_id", propertyId)
        .eq("type", type)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setExistingInspection(data);
        // Parse existing data
        const parsedData = JSON.parse(data.notes || "{}");
        if (parsedData.rooms) {
          setRooms(parsedData.rooms);
        }
        // Determine signing status
        if (parsedData.landlordSignature && parsedData.tenantSignature) {
          setSigningStatus("both-signed");
        } else if (parsedData.landlordSignature) {
          setSigningStatus("landlord-signed");
        } else if (parsedData.tenantSignature) {
          setSigningStatus("tenant-signed");
        }
      }
    } catch (error: any) {
      console.error("Error fetching inspection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (roomIndex: number, files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    setRooms(prev => {
      const updated = [...prev];
      updated[roomIndex].photos = [...updated[roomIndex].photos, ...newFiles];
      return updated;
    });
    
    toast.success(`${newFiles.length} photo(s) ajoutée(s)`);
  };

  const handleConditionChange = (roomIndex: number, condition: string) => {
    setRooms(prev => {
      const updated = [...prev];
      updated[roomIndex].condition = condition as any;
      return updated;
    });
  };

  const handleNotesChange = (roomIndex: number, notes: string) => {
    setRooms(prev => {
      const updated = [...prev];
      updated[roomIndex].notes = notes;
      return updated;
    });
  };

  const uploadPhotosToStorage = async () => {
    const uploadedUrls: string[] = [];
    
    for (const room of rooms) {
      for (const photo of room.photos) {
        try {
          const fileExt = photo.name.split(".").pop();
          const fileName = `${propertyId}/${type}/${room.name}/${Date.now()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from("property-videos") // Reusing existing bucket
            .upload(fileName, photo, {
              cacheControl: "3600",
              upsert: false
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from("property-videos")
            .getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);
        } catch (error: any) {
          console.error("Error uploading photo:", error);
          toast.error(`Erreur upload: ${photo.name}`);
        }
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmitInspection = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    // Validate that at least one photo per room
    const roomsWithoutPhotos = rooms.filter(r => r.photos.length === 0);
    if (roomsWithoutPhotos.length > 0) {
      toast.error(`Photos manquantes pour: ${roomsWithoutPhotos.map(r => r.name).join(", ")}`);
      return;
    }

    try {
      setUploading(true);
      toast.loading("Upload des photos en cours...");

      const photoUrls = await uploadPhotosToStorage();

      const inspectionData = {
        rooms: rooms.map((room, idx) => ({
          ...room,
          photos: room.photos.map((_, photoIdx) => photoUrls[idx * room.photos.length + photoIdx])
        })),
        createdAt: new Date().toISOString(),
        createdBy: user.id
      };

      const { error } = await supabase
        .from("property_inspections")
        .insert({
          property_id: propertyId,
          type,
          user_id: user.id,
          notes: JSON.stringify(inspectionData),
          video_url: photoUrls[0] // Store first photo as reference
        });

      if (error) throw error;

      toast.success("État des lieux enregistré!");
      fetchExistingInspection();
    } catch (error: any) {
      console.error("Error submitting inspection:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setUploading(false);
    }
  };

  const handleSign = async () => {
    if (!user || !existingInspection) return;

    try {
      const parsedData = JSON.parse(existingInspection.notes || "{}");
      const isLandlord = true; // TODO: Check actual role from property ownership
      
      if (isLandlord) {
        parsedData.landlordSignature = {
          userId: user.id,
          timestamp: new Date().toISOString()
        };
      } else {
        parsedData.tenantSignature = {
          userId: user.id,
          timestamp: new Date().toISOString()
        };
      }

      const { error } = await supabase
        .from("property_inspections")
        .update({ notes: JSON.stringify(parsedData) })
        .eq("id", existingInspection.id);

      if (error) throw error;

      toast.success("Signature enregistrée!");
      fetchExistingInspection();
    } catch (error: any) {
      console.error("Error signing:", error);
      toast.error("Erreur lors de la signature");
    }
  };

  if (loading) {
    return <Card className="p-8 text-center"><p className="text-muted-foreground">Chargement...</p></Card>;
  }

  if (existingInspection && signingStatus === "both-signed") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>État des Lieux {type === "check-in" ? "d'Entrée" : "de Sortie"}</CardTitle>
              <CardDescription>Complété et signé par les deux parties</CardDescription>
            </div>
            <Badge variant="default" className="bg-success">
              <Check className="w-4 h-4 mr-1" />
              Validé
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  Date de création
                </div>
                <p className="font-medium">{new Date(existingInspection.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <FileText className="w-4 h-4" />
                  Photos
                </div>
                <p className="font-medium">{rooms.reduce((acc, r) => acc + r.photos.length, 0)} photos</p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchExistingInspection} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Voir le Détail
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>État des Lieux {type === "check-in" ? "d'Entrée" : "de Sortie"}</CardTitle>
        <CardDescription>
          Photos obligatoires pour chaque pièce. Les deux parties doivent signer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {existingInspection && signingStatus !== "both-signed" && (
          <div className="p-4 bg-accent/10 border border-accent rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <span className="font-medium">En attente de signature</span>
              </div>
              <Badge variant="outline">
                {signingStatus === "landlord-signed" ? "Propriétaire signé" : "Locataire signé"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              L'autre partie doit signer pour finaliser l'état des lieux.
            </p>
            <Button onClick={handleSign} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Signer Numériquement
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {rooms.map((room, roomIndex) => (
            <Card key={roomIndex} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{room.name}</h4>
                  <Badge variant={
                    room.condition === "excellent" ? "default" :
                    room.condition === "bon" ? "secondary" :
                    room.condition === "moyen" ? "outline" : "destructive"
                  }>
                    {room.condition}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>État de la pièce</Label>
                  <Select value={room.condition} onValueChange={(val) => handleConditionChange(roomIndex, val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="bon">Bon</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="mauvais">Mauvais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Photos ({room.photos.length})</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      onChange={(e) => handlePhotoUpload(roomIndex, e.target.files)}
                      className="flex-1"
                    />
                    <Button type="button" size="icon" variant="outline">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  {room.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {room.photos.map((photo, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Photo {idx + 1}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Remarques</Label>
                  <Textarea
                    value={room.notes}
                    onChange={(e) => handleNotesChange(roomIndex, e.target.value)}
                    placeholder="Observations particulières..."
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button 
          onClick={handleSubmitInspection} 
          disabled={uploading || rooms.some(r => r.photos.length === 0)}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>Upload en cours...</>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Enregistrer l'État des Lieux
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          ⚖️ Conforme à la loi du 6 juillet 1989 - Article 3 (État des lieux contradictoire obligatoire)
        </p>
      </CardContent>
    </Card>
  );
};
