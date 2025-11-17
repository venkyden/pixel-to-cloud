import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Euro,
  Calendar,
  Briefcase,
  Download,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApplicationReviewProps {
  application: any;
  onUpdate: () => void;
}

export const ApplicationReview = ({ application, onUpdate }: ApplicationReviewProps) => {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tenant_applications")
        .update({ status: "approved" })
        .eq("id", application.id);

      if (error) throw error;

      // Notify tenant
      await supabase.from("notifications").insert({
        user_id: application.user_id,
        title: "Candidature acceptée !",
        message: `Votre candidature pour ${application.properties?.name} a été acceptée.`,
        type: "success",
        link: "/tenant",
      });

      toast.success("Application approved!");
      onUpdate();
    } catch (error: any) {
      console.error("Error approving application:", error);
      toast.error("Failed to approve application");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("tenant_applications")
        .update({ status: "rejected" })
        .eq("id", application.id);

      if (error) throw error;

      // Notify tenant
      await supabase.from("notifications").insert({
        user_id: application.user_id,
        title: "Candidature refusée",
        message: `Votre candidature pour ${application.properties?.name} a été refusée. Raison: ${rejectionReason}`,
        type: "error",
        link: "/tenant",
      });

      toast.success("Application rejected");
      setShowRejectDialog(false);
      onUpdate();
    } catch (error: any) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "low":
        return <Badge className="bg-success/10 text-success border-success/20">Risque faible</Badge>;
      case "medium":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Risque moyen</Badge>;
      case "high":
        return <Badge variant="destructive">Risque élevé</Badge>;
      default:
        return null;
    }
  };

  const rentToIncomeRatio = application.income 
    ? ((application.properties?.price * 12) / application.income * 100).toFixed(1)
    : "0";
  const ratioValue = parseFloat(rentToIncomeRatio);

  return (
    <>
      <Card className="glass-effect border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {application.profiles?.first_name} {application.profiles?.last_name}
              </CardTitle>
              <CardDescription>{application.profiles?.email}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getRiskBadge(application.risk_level)}
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Score: {application.match_score}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenus mensuels</p>
                  <p className="font-semibold">{application.income?.toLocaleString()}€</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Profession</p>
                  <p className="font-semibold">{application.profession || "Non renseigné"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Emménagement souhaité</p>
                  <p className="font-semibold">
                    {application.move_in_date 
                      ? new Date(application.move_in_date).toLocaleDateString("fr-FR")
                      : "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${
                ratioValue > 33 
                  ? "bg-destructive/10 border border-destructive/20"
                  : ratioValue > 25
                  ? "bg-warning/10 border border-warning/20"
                  : "bg-success/10 border border-success/20"
              }`}>
                <p className="text-sm font-medium mb-1">Ratio Loyer/Revenus</p>
                <p className="text-2xl font-bold">{rentToIncomeRatio}%</p>
                <p className="text-xs mt-1">
                  {ratioValue > 33 
                    ? "⚠️ Au-dessus du seuil recommandé (33%)"
                    : ratioValue > 25
                    ? "Proche du seuil recommandé"
                    : "✓ Conforme aux recommandations"}
                </p>
              </div>

              {application.co_signer_income && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Revenus du garant</p>
                  <p className="text-lg font-bold">{application.co_signer_income?.toLocaleString()}€</p>
                </div>
              )}
            </div>
          </div>

          {application.rental_history && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Historique locatif</p>
              <p className="text-sm text-muted-foreground">{application.rental_history}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Documents fournis</p>
            <div className="grid gap-2">
              {application.government_id_url && (
                <a
                  href={application.government_id_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span className="text-sm">Pièce d'identité</span>
                </a>
              )}
              {application.income_proof_url && (
                <a
                  href={application.income_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span className="text-sm">Justificatif de revenus</span>
                </a>
              )}
              {application.bank_statement_url && (
                <a
                  href={application.bank_statement_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span className="text-sm">Relevé bancaire</span>
                </a>
              )}
            </div>
          </div>

          {application.status === "pending" && (
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accepter
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Refuser
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la candidature</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus. Le locataire sera notifié.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Raison du refus *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Revenus insuffisants, dossier incomplet..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
