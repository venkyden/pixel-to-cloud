import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Video, Upload, Play, Trash2, Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

interface Inspection {
  id: string;
  property_id: string;
  type: string;
  video_url: string;
  notes: string;
  created_at: string;
}

interface Property {
  id: string;
  name: string;
}

export const PropertyInspection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [inspectionType, setInspectionType] = useState<"check-in" | "check-out">("check-in");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchInspections();
    }
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;

    try {
      // Fetch properties where user is tenant (has application) or owner
      const { data, error } = await supabase
        .from("properties")
        .select("id, name")
        .or(`owner_id.eq.${user.id}`);

      if (error) throw error;
      setProperties(data || []);
      
      if (data && data.length > 0) {
        setSelectedProperty(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchInspections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("property_inspections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error("Error fetching inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);

      toast({
        title: "Recording started",
        description: "Recording property condition...",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to record video",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const file = new File([blob], `inspection-${Date.now()}.webm`, { type: 'video/webm' });
        setSelectedFile(file);
        setRecordedChunks([]);
        
        // Stop camera stream
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      };
      
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB
        toast({
          title: "File too large",
          description: "Video must be less than 100MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile || !selectedProperty) {
      toast({
        title: "Missing information",
        description: "Please select a property and video",
        variant: "destructive",
      });
      return;
    }

    // Validate inspection data
    const inspectionSchema = z.object({
      notes: z.string().trim().max(5000, "Notes must be less than 5000 characters"),
      type: z.enum(["check-in", "check-out"]),
    });

    try {
      const validated = inspectionSchema.parse({ notes, type: inspectionType });

      setUploading(true);
      
      // Upload to storage
      const filePath = `${user.id}/${selectedProperty}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("property-videos")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("property-videos")
        .getPublicUrl(filePath);

      // Create inspection record
      const { error: insertError } = await supabase
        .from("property_inspections")
        .insert({
          property_id: selectedProperty,
          user_id: user.id,
          type: validated.type,
          notes: validated.notes,
          video_url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Upload successful",
        description: `${inspectionType === 'check-in' ? 'Check-in' : 'Check-out'} video uploaded`,
      });

      // Reset form
      setSelectedFile(null);
      setNotes("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Refresh inspections
      fetchInspections();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
      
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteInspection = async (id: string, videoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = videoUrl.split('/property-videos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("property-videos").remove([filePath]);
      }

      const { error } = await supabase
        .from("property_inspections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Inspection video deleted",
      });

      fetchInspections();
    } catch (error) {
      console.error("Error deleting inspection:", error);
      toast({
        title: "Error",
        description: "Failed to delete inspection",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please log in to manage property inspections</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Record Property Condition
          </CardTitle>
          <CardDescription>
            Document property condition at check-in/check-out for security deposit claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Inspection Type</Label>
              <Select value={inspectionType} onValueChange={(v: any) => setInspectionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check-in">Check-in (Moving In)</SelectItem>
                  <SelectItem value="check-out">Check-out (Moving Out)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video Preview */}
          {(recording || selectedFile) && (
            <div className="space-y-2">
              <Label>Video Preview</Label>
              {recording ? (
                <video
                  ref={videoRef}
                  className="w-full rounded-lg border"
                  autoPlay
                  muted
                />
              ) : selectedFile ? (
                <div className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex gap-2">
            {!recording ? (
              <>
                <Button onClick={startRecording} variant="outline" className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Record Video
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex-1">
                Stop Recording
              </Button>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Any observations or damages to note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload Button */}
          {selectedFile && !recording && (
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Submit Inspection
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle>Past Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : inspections.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No inspections recorded yet</p>
          ) : (
            <div className="space-y-4">
              {inspections.map((inspection) => (
                <div key={inspection.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={inspection.type === 'check-in' ? 'default' : 'secondary'}>
                          {inspection.type === 'check-in' ? 'Check-in' : 'Check-out'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(inspection.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {inspection.notes && (
                        <p className="text-sm text-muted-foreground">{inspection.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(inspection.video_url, '_blank')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInspection(inspection.id, inspection.video_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
