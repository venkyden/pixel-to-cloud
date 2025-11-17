import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Shield, Upload, CheckCircle2, Clock, XCircle } from "lucide-react";

export const LandlordVerificationForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [documents, setDocuments] = useState({
    governmentId: null as File | null,
    ownershipDocument: null as File | null,
  });

  useEffect(() => {
    if (user) {
      fetchVerification();
    }
  }, [user]);

  const fetchVerification = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("landlord_verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setVerification(data);
      setFormData({
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
      });
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Upload documents
      const timestamp = Date.now();
      let governmentIdUrl, ownershipDocumentUrl;

      if (documents.governmentId) {
        governmentIdUrl = await uploadFile(
          documents.governmentId,
          `${user.id}/verification/government-id-${timestamp}`
        );
      }
      if (documents.ownershipDocument) {
        ownershipDocumentUrl = await uploadFile(
          documents.ownershipDocument,
          `${user.id}/verification/ownership-${timestamp}`
        );
      }

      // Create or update verification
      const verificationData = {
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        government_id_url: governmentIdUrl || verification?.government_id_url,
        ownership_document_url: ownershipDocumentUrl || verification?.ownership_document_url,
        status: "pending",
      };

      const { error } = verification
        ? await supabase
            .from("landlord_verifications")
            .update(verificationData)
            .eq("id", verification.id)
        : await supabase
            .from("landlord_verifications")
            .insert(verificationData);

      if (error) throw error;

      toast.success("Verification submitted successfully!");
      fetchVerification();
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      toast.error("Failed to submit verification");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Vérifié
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="glass-effect border-border/50 shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Vérification du propriétaire</CardTitle>
          </div>
          {verification && getStatusBadge(verification.status)}
        </div>
        <CardDescription>
          Complétez votre vérification pour gagner la confiance des locataires
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verification?.status === "verified" ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Compte vérifié !</h3>
              <p className="text-sm text-muted-foreground">
                Votre identité de propriétaire a été vérifiée avec succès.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jean Dupont"
                  disabled={verification?.status === "pending"}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean.dupont@email.com"
                  disabled={verification?.status === "pending"}
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                  disabled={verification?.status === "pending"}
                />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Documents requis
                </h4>

                <div>
                  <Label htmlFor="governmentId">
                    Pièce d'identité * (CNI, Passeport)
                  </Label>
                  {verification?.government_id_url && (
                    <p className="text-xs text-success mb-1">✓ Document déjà fourni</p>
                  )}
                  <Input
                    id="governmentId"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocuments({ ...documents, governmentId: e.target.files?.[0] || null })}
                    required={!verification?.government_id_url}
                    disabled={verification?.status === "pending"}
                  />
                </div>

                <div>
                  <Label htmlFor="ownershipDocument">
                    Justificatif de propriété * (Acte de propriété, taxe foncière)
                  </Label>
                  {verification?.ownership_document_url && (
                    <p className="text-xs text-success mb-1">✓ Document déjà fourni</p>
                  )}
                  <Input
                    id="ownershipDocument"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocuments({ ...documents, ownershipDocument: e.target.files?.[0] || null })}
                    required={!verification?.ownership_document_url}
                    disabled={verification?.status === "pending"}
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">Processus de vérification</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Vérification d'identité sous 24-48h</li>
                <li>Validation des documents de propriété</li>
                <li>Badge vérifié sur votre profil après validation</li>
              </ul>
            </div>

            {verification?.status === "rejected" && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg text-sm">
                <p className="font-medium text-destructive mb-2">Demande rejetée</p>
                <p className="text-destructive/80">
                  Veuillez vérifier vos documents et soumettre à nouveau.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || verification?.status === "pending"} 
              className="w-full"
            >
              {loading ? "Envoi en cours..." : verification ? "Mettre à jour" : "Soumettre pour vérification"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
