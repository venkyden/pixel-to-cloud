import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  category: string;
  property_id: string;
}

export const MaintenanceRequests = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "maintenance",
    property_id: "",
  });

  useEffect(() => {
    if (user) {
      fetchIncidents();
      fetchUserProperties();
    }
  }, [user]);

  const fetchUserProperties = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name")
        .eq("owner_id", user.id);

      if (error) throw error;
      setProperties(data || []);
      
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, property_id: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchIncidents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setIncidents(data || []);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      "in-progress": "default",
      completed: "outline",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-warning/20 text-warning",
      high: "bg-destructive/20 text-destructive",
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a request",
        variant: "destructive",
      });
      return;
    }

    // Validate incident data
    const incidentSchema = z.object({
      title: z.string()
        .trim()
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
      description: z.string()
        .trim()
        .min(1, "Description is required")
        .max(2000, "Description must be less than 2000 characters"),
      property_id: z.string().uuid("Invalid property"),
    });

    try {
      const validated = incidentSchema.parse({
        title: formData.title,
        description: formData.description,
        property_id: formData.property_id,
      });

      setSubmitting(true);

      const { error } = await supabase.from("incidents").insert([{
        title: validated.title,
        description: validated.description,
        priority: formData.priority as any,
        category: formData.category as any,
        property_id: validated.property_id,
        reported_by: user.id,
        status: "open" as any,
      }]);

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "We'll review your maintenance request shortly.",
      });

      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "maintenance",
        property_id: properties[0]?.id || "",
      });
      setIsDialogOpen(false);
      fetchIncidents();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
      
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Requests
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={properties.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Maintenance Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select 
                    value={formData.property_id}
                    onValueChange={(value) => setFormData({...formData, property_id: value})}
                  >
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
                  <Label>Title</Label>
                  <Input 
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Detailed description of the problem" 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {["low", "medium", "high"].map((priority) => (
                      <Button 
                        key={priority} 
                        variant={formData.priority === priority ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setFormData({...formData, priority})}
                      >
                        {priority}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : incidents.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {properties.length === 0 
              ? "You need to add properties first to create maintenance requests"
              : "No maintenance requests yet"}
          </p>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground">{incident.title}</h4>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(incident.priority)}
                    {getStatusBadge(incident.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
