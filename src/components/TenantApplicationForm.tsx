import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, FileText, Euro, Calendar, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TenantApplicationFormProps {
  propertyId: string;
  propertyName: string;
  propertyPrice: number;
}

export const TenantApplicationForm = ({ propertyId, propertyName, propertyPrice }: TenantApplicationFormProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    income: "",
    coSignerIncome: "",
    profession: "",
    rentalHistory: "",
    moveInDate: "",
  });
  const [documents, setDocuments] = useState({
    governmentId: null as File | null,
    incomeProof: null as File | null,
    bankStatement: null as File | null,
  });

  const handleFileChange = (type: keyof typeof documents, file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
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
      // Calculate match score based on income vs rent ratio
      const income = parseFloat(formData.income);
      const rentToIncomeRatio = (propertyPrice * 12) / income;
      let matchScore = 100;
      let riskLevel = "low";

      if (rentToIncomeRatio > 0.33) {
        matchScore -= 30;
        riskLevel = "high";
      } else if (rentToIncomeRatio > 0.25) {
        matchScore -= 15;
        riskLevel = "medium";
      }

      // Upload documents
      const timestamp = Date.now();
      let governmentIdUrl, incomeProofUrl, bankStatementUrl;

      if (documents.governmentId) {
        governmentIdUrl = await uploadFile(
          documents.governmentId,
          `${user.id}/applications/${propertyId}/government-id-${timestamp}`
        );
      }
      if (documents.incomeProof) {
        incomeProofUrl = await uploadFile(
          documents.incomeProof,
          `${user.id}/applications/${propertyId}/income-proof-${timestamp}`
        );
      }
      if (documents.bankStatement) {
        bankStatementUrl = await uploadFile(
          documents.bankStatement,
          `${user.id}/applications/${propertyId}/bank-statement-${timestamp}`
        );
      }

      // Create application
      const { error: appError } = await supabase
        .from("tenant_applications")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          income: parseFloat(formData.income),
          co_signer_income: formData.coSignerIncome ? parseFloat(formData.coSignerIncome) : null,
          profession: formData.profession,
          rental_history: formData.rentalHistory,
          move_in_date: formData.moveInDate,
          government_id_url: governmentIdUrl,
          income_proof_url: incomeProofUrl,
          bank_statement_url: bankStatementUrl,
          match_score: matchScore,
          risk_level: riskLevel,
          status: "pending",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });

      if (appError) throw appError;

      // Get property owner and send notification
      const { data: property } = await supabase
        .from("properties")
        .select("owner_id")
        .eq("id", propertyId)
        .single();

      if (property) {
        await supabase.from("notifications").insert({
          user_id: property.owner_id,
          title: "Nouvelle candidature",
          message: `Nouvelle candidature pour ${propertyName}`,
          type: "info",
          link: "/dashboard",
        });
      }

      toast.success("Application submitted successfully!");
      navigate("/tenant");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-border/50 shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Candidature pour {propertyName}
        </CardTitle>
        <CardDescription>
          Loyer mensuel: {propertyPrice}€ • Complétez votre dossier de candidature
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="income" className="flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Revenus mensuels nets (€) *
              </Label>
              <Input
                id="income"
                type="number"
                required
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                placeholder="Ex: 2500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ratio loyer/revenus recommandé: max 33% (≥ {Math.ceil(propertyPrice * 3)}€/mois)
              </p>
            </div>

            <div>
              <Label htmlFor="profession" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Profession *
              </Label>
              <Input
                id="profession"
                required
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                placeholder="Ex: Ingénieur informatique"
              />
            </div>

            <div>
              <Label htmlFor="moveInDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date d'emménagement souhaitée *
              </Label>
              <Input
                id="moveInDate"
                type="date"
                required
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="coSignerIncome">
                Revenus du garant (€) - Optionnel
              </Label>
              <Input
                id="coSignerIncome"
                type="number"
                value={formData.coSignerIncome}
                onChange={(e) => setFormData({ ...formData, coSignerIncome: e.target.value })}
                placeholder="Ex: 3000"
              />
            </div>

            <div>
              <Label htmlFor="rentalHistory">
                Historique locatif
              </Label>
              <Textarea
                id="rentalHistory"
                value={formData.rentalHistory}
                onChange={(e) => setFormData({ ...formData, rentalHistory: e.target.value })}
                placeholder="Décrivez votre historique de location (logements précédents, durée, etc.)"
                rows={3}
              />
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Documents requis
              </h4>

              <div>
                <Label htmlFor="governmentId">Pièce d'identité * (CNI, Passeport)</Label>
                <Input
                  id="governmentId"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("governmentId", e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="incomeProof">Justificatif de revenus * (3 dernières fiches de paie ou avis d'imposition)</Label>
                <Input
                  id="incomeProof"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("incomeProof", e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bankStatement">Relevé bancaire * (3 derniers mois)</Label>
                <Input
                  id="bankStatement"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("bankStatement", e.target.files?.[0] || null)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Conformité Loi ALUR</p>
            <p className="text-muted-foreground">
              Votre dossier sera évalué selon les critères légaux français. 
              Les documents fournis sont nécessaires pour constituer un dossier conforme à la loi n° 89-462.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Envoi en cours..." : "Soumettre la candidature"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
