import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Scale, MessageCircle, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface DisputeCase {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string;
}

export const MediationSystem = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<DisputeCase[]>([]);
  const [showNewCase, setShowNewCase] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "rent_payment",
    propertyId: "",
  });

  useEffect(() => {
    if (user) {
      fetchDisputes();
    }
  }, [user]);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error("Error fetching disputes:", error);
    }
  };

  const handleSubmitCase = async () => {
    if (!user) return;

    if (!formData.title || !formData.description || !formData.propertyId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Get property and tenant info
      const { data: propertyData, error: propError } = await supabase
        .from("properties")
        .select("owner_id")
        .eq("id", formData.propertyId)
        .single();

      if (propError) throw propError;

      // Get tenant from active contract
      const { data: contractData } = await supabase
        .from("contracts")
        .select("tenant_id")
        .eq("property_id", formData.propertyId)
        .eq("status", "active")
        .maybeSingle();

      const tenantId = contractData?.tenant_id || user.id;

      // Create dispute
      const { data, error } = await supabase
        .from("disputes")
        .insert({
          property_id: formData.propertyId,
          landlord_id: propertyData.owner_id,
          tenant_id: tenantId,
          title: formData.title,
          description: formData.description,
          category: formData.category as "rent_payment" | "property_damage" | "maintenance" | "lease_terms" | "deposit" | "noise" | "other",
          status: "open",
          priority: 2,
        })
        .select()
        .single();

      if (error) throw error;

      // Create timeline entry
      await supabase.from("dispute_timeline").insert({
        dispute_id: data.id,
        actor_id: user.id,
        actor_name: user.email || "User",
        action: "Dispute created",
        details: `Category: ${formData.category}`,
      });

      toast.success("Mediation case submitted successfully");
      setShowNewCase(false);
      setFormData({
        title: "",
        description: "",
        category: "rent_payment",
        propertyId: "",
      });
      fetchDisputes();
    } catch (error: unknown) {
      console.error("Error submitting case:", error);
      toast.error((error instanceof Error ? error.message : "Unknown error") || "Failed to submit mediation case");
    } finally {
      setLoading(false);
    }
  };

  const disputeCategories = [
    { value: "rent_payment", label: "Rent Payment Dispute" },
    { value: "property_damage", label: "Property Damage" },
    { value: "maintenance", label: "Maintenance Issues" },
    { value: "contract_terms", label: "Contract Terms Disagreement" },
    { value: "deposit_return", label: "Deposit Return" },
    { value: "noise_disturbance", label: "Noise/Disturbance" },
    { value: "lease_termination", label: "Lease Termination" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Dispute Resolution & Mediation
              </CardTitle>
              <CardDescription>
                Professional mediation for landlord-tenant disputes
              </CardDescription>
            </div>
            {!showNewCase && (
              <Button onClick={() => setShowNewCase(true)}>
                <FileText className="h-4 w-4 mr-2" />
                New Case
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {showNewCase && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Submit New Mediation Case</CardTitle>
            <CardDescription>
              Provide details about your dispute for professional review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Unpaid rent for November 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {disputeCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyId">Property ID *</Label>
              <Input
                id="propertyId"
                placeholder="Enter property ID"
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the dispute in detail, including dates, amounts, and any relevant information..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitCase} disabled={loading} className="flex-1">
                {loading ? "Submitting..." : "Submit Case"}
              </Button>
              <Button variant="outline" onClick={() => setShowNewCase(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {cases.length === 0 && !showNewCase && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">No Active Mediation Cases</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  When disputes arise, you can submit them for professional mediation.
                  Our team will help facilitate a fair resolution.
                </p>
              </div>
              <Button onClick={() => setShowNewCase(true)}>
                Submit a Case
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {cases.length > 0 && (
        <div className="space-y-4">
          {cases.map((disputeCase) => (
            <Card key={disputeCase.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{disputeCase.title}</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(disputeCase.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    disputeCase.status === "resolved" ? "default" :
                      disputeCase.status === "in_progress" ? "secondary" :
                        "destructive"
                  }>
                    {disputeCase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {disputeCase.description}
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">How Mediation Works</p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Submit your case with detailed information and evidence</li>
                <li>• Our mediation team reviews the case within 48 hours</li>
                <li>• Both parties are contacted to provide their perspective</li>
                <li>• A neutral mediator facilitates communication and resolution</li>
                <li>• Average resolution time: 5-7 business days</li>
                <li>• All communications are confidential and secure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
