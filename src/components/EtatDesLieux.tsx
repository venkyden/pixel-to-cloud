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
import { useLanguage } from "@/contexts/LanguageContext";

interface Room {
  name: string;
  photos: File[];
  condition: "excellent" | "bon" | "moyen" | "mauvais";
  notes: string;
}

const getRoomNames = (t: (key: string) => string) => [
  t("inspection.rooms.living"),
  t("inspection.rooms.kitchen"),
  t("inspection.rooms.bathroom"),
  t("inspection.rooms.bedroom1"),
  t("inspection.rooms.bedroom2"),
  t("inspection.rooms.wc"),
  t("inspection.rooms.hallway"),
  t("inspection.rooms.balcony")
];

export const EtatDesLieux = ({ propertyId, type = "check-in" }: { propertyId: string; type: "check-in" | "check-out" }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>(
    getRoomNames(t).map(name => ({ name, photos: [], condition: "bon" as const, notes: "" }))
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
    } catch (error: unknown) {
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

    toast.success(`${newFiles.length} ${t("inspection.photosAdded")}`);
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
        } catch (error: unknown) {
          console.error("Error uploading photo:", error);
          toast.error(`${t("inspection.error")}: ${photo.name}`);
        }
      }
    }

    return uploadedUrls;
  };

  const handleSubmitInspection = async () => {
    if (!user) {
      toast.error(t("inspection.mustBeLoggedIn"));
      return;
    }

    // Validate that at least one photo per room
    const roomsWithoutPhotos = rooms.filter(r => r.photos.length === 0);
    if (roomsWithoutPhotos.length > 0) {
      toast.error(`${t("inspection.missingPhotos")} ${roomsWithoutPhotos.map(r => r.name).join(", ")}`);
      return;
    }

    try {
      setUploading(true);
      toast.loading(t("inspection.uploadInProgress"));

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

      toast.success(t("inspection.inspectionSaved"));
      fetchExistingInspection();
    } catch (error: unknown) {
      console.error("Error submitting inspection:", error);
      toast.error(t("inspection.error"));
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

      toast.success(t("inspection.signatureSaved"));
      fetchExistingInspection();
    } catch (error: unknown) {
      console.error("Error signing:", error);
      toast.error(t("inspection.error"));
    }
  };

  if (loading) {
    return <Card className="p-8 text-center"><p className="text-muted-foreground">{t("tenantDashboard.loading")}</p></Card>;
  }

  if (existingInspection && signingStatus === "both-signed") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("inspection.title")} {type === "check-in" ? t("inspection.checkIn") : t("inspection.checkOut")}</CardTitle>
              <CardDescription>{t("inspection.completed")}</CardDescription>
            </div>
            <Badge variant="default" className="bg-success">
              <Check className="w-4 h-4 mr-1" />
              {t("inspection.validated")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  {t("inspection.creationDate")}
                </div>
                <p className="font-medium">{new Date(existingInspection.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <FileText className="w-4 h-4" />
                  {t("inspection.photos")}
                </div>
                <p className="font-medium">{rooms.reduce((acc, r) => acc + r.photos.length, 0)} {t("inspection.photos")}</p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchExistingInspection} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              {t("inspection.viewDetails")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("inspection.title")} {type === "check-in" ? t("inspection.checkIn") : t("inspection.checkOut")}</CardTitle>
        <CardDescription>
          {t("inspection.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {existingInspection && signingStatus !== "both-signed" && (
          <div className="p-4 bg-accent/10 border border-accent rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <span className="font-medium">{t("inspection.awaitingSignature")}</span>
              </div>
              <Badge variant="outline">
                {signingStatus === "landlord-signed" ? t("inspection.landlordSigned") : t("inspection.tenantSigned")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("inspection.otherPartyMustSign")}
            </p>
            <Button onClick={handleSign} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              {t("inspection.signDigitally")}
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
                    {t(`inspection.conditions.${room.condition === "bon" ? "good" : room.condition === "moyen" ? "average" : room.condition === "mauvais" ? "poor" : "excellent"}`)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>{t("inspection.roomCondition")}</Label>
                  <Select value={room.condition} onValueChange={(val) => handleConditionChange(roomIndex, val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">{t("inspection.conditions.excellent")}</SelectItem>
                      <SelectItem value="bon">{t("inspection.conditions.good")}</SelectItem>
                      <SelectItem value="moyen">{t("inspection.conditions.average")}</SelectItem>
                      <SelectItem value="mauvais">{t("inspection.conditions.poor")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("inspection.photos")} ({room.photos.length})</Label>
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
                  <Label>{t("inspection.remarks")}</Label>
                  <Textarea
                    value={room.notes}
                    onChange={(e) => handleNotesChange(roomIndex, e.target.value)}
                    placeholder={t("inspection.observations")}
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
            <>{t("inspection.uploading")}</>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {t("inspection.saveInspection")}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {t("inspection.legalCompliance")}
        </p>
      </CardContent>
    </Card>
  );
};
