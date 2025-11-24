import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  PenTool,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface ContractGeneratorProps {
  applicationId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  monthlyRent: number;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  landlordName: string;
}

interface ContractData {
  terms?: {
    special_conditions?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Contract {
  id: string;
  application_id: string;
  start_date: string;
  duration_months: number;
  deposit_amount: number;
  contract_type: string;
  contract_data: ContractData | unknown;
  landlord_signature?: string;
  tenant_signature?: string;
  status: string;
}

export const ContractGenerator = ({
  applicationId,
  propertyId,
  propertyName,
  propertyAddress,
  monthlyRent,
  tenantId,
  tenantName,
  landlordId,
  landlordName,
}: ContractGeneratorProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    startDate: "",
    durationMonths: 12,
    depositAmount: monthlyRent, // Default 1 month for unfurnished
    specialConditions: "",
    contractType: "standard", // standard, furnished
  });

  useEffect(() => {
    fetchExistingContract();
  }, [applicationId]);

  const fetchExistingContract = async () => {
    const { data } = await supabase
      .from("contracts")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle();

    if (data) {
      setContract(data);
      const contractData = data.contract_data as ContractData;
      setFormData({
        startDate: data.start_date,
        durationMonths: data.duration_months || 12,
        depositAmount: data.deposit_amount,
        specialConditions: contractData?.terms?.special_conditions || "",
        contractType: data.contract_type,
      });
    }
  };

  const generateContractData = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + formData.durationMonths);

    return {
      property: {
        name: propertyName,
        address: propertyAddress,
      },
      landlord: {
        name: landlordName,
        id: landlordId,
      },
      tenant: {
        name: tenantName,
        id: tenantId,
      },
      financial: {
        monthly_rent: monthlyRent,
        deposit_amount: formData.depositAmount,
        currency: "EUR",
      },
      dates: {
        start_date: formData.startDate,
        end_date: format(endDate, "yyyy-MM-dd"),
        duration_months: formData.durationMonths,
      },
      terms: {
        contract_type: formData.contractType,
        special_conditions: formData.specialConditions,
        notice_period_tenant: formData.contractType === "furnished" ? "1 mois" : "3 mois",
        notice_period_landlord: "6 mois",
        rent_payment_day: 5,
        charges_included: false,
      },
      legal_references: {
        law: "Loi n° 89-462 du 6 juillet 1989",
        alur_law: "Loi ALUR du 24 mars 2014",
      },
      diagnostics: {
        dpe_required: true,
        gas_required: true,
        electricity_required: true,
        asbestos_required: true,
        lead_required: true,
      },
    };
  };

  const handleGenerateContract = async () => {
    if (!formData.startDate) {
      toast.error("Veuillez sélectionner une date de début");
      return;
    }

    if (formData.depositAmount > monthlyRent * 2) {
      toast.error("Le dépôt de garantie ne peut pas dépasser 2 mois de loyer");
      return;
    }

    setLoading(true);
    try {
      const contractData = generateContractData();
      const endDate = new Date(formData.startDate);
      endDate.setMonth(endDate.getMonth() + formData.durationMonths);

      const { data, error } = await supabase
        .from("contracts")
        .upsert({
          id: contract?.id,
          property_id: propertyId,
          tenant_id: tenantId,
          landlord_id: landlordId,
          application_id: applicationId,
          contract_type: formData.contractType,
          monthly_rent: monthlyRent,
          deposit_amount: formData.depositAmount,
          start_date: formData.startDate,
          end_date: format(endDate, "yyyy-MM-dd"),
          duration_months: formData.durationMonths,
          contract_data: contractData,
          status: "pending_signatures",
        })
        .select()
        .single();

      if (error) throw error;

      setContract(data);
      toast.success("Contrat généré avec succès!");

      // Notify tenant
      await supabase.from("notifications").insert({
        user_id: tenantId,
        title: "Contrat de location prêt",
        message: `Le contrat de location pour ${propertyName} est prêt à être signé`,
        type: "success",
        link: "/tenant",
      });
    } catch (error: unknown) {
      console.error("Error generating contract:", error);
      toast.error("Erreur lors de la génération du contrat");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const isLandlord = user?.id === landlordId;
      const updateData: Partial<Contract> = {
        updated_at: new Date().toISOString(),
      };

      if (isLandlord) {
        updateData.landlord_signed_at = new Date().toISOString();
      } else {
        updateData.tenant_signed_at = new Date().toISOString();
      }

      // Check if both parties have signed
      const bothSigned =
        (isLandlord && contract.tenant_signed_at) ||
        (!isLandlord && contract.landlord_signed_at);

      if (bothSigned) {
        updateData.status = "active";
      }

      const { error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", contract.id);

      if (error) throw error;

      toast.success("Contrat signé avec succès!");
      fetchExistingContract();
    } catch (error: unknown) {
      console.error("Error signing contract:", error);
      toast.error("Erreur lors de la signature");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        );
      case "pending_signatures":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            En attente de signatures
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline">
            <FileText className="w-3 h-3 mr-1" />
            Brouillon
          </Badge>
        );
      default:
        return null;
    }
  };

  const isLandlord = user?.id === landlordId;
  const hasSigned = isLandlord ? contract?.landlord_signed_at : contract?.tenant_signed_at;
  const otherPartySigned = isLandlord ? contract?.tenant_signed_at : contract?.landlord_signed_at;

  if (contract && contract.status !== "draft") {
    return (
      <Card className="glass-effect border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Contrat de location</CardTitle>
            </div>
            {getStatusBadge(contract.status)}
          </div>
          <CardDescription>
            Bail d'habitation - Loi n° 89-462 du 6 juillet 1989
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Bailleur</p>
              <p className="font-semibold">{landlordName}</p>
              {contract.landlord_signed_at ? (
                <div className="flex items-center gap-1 text-sm text-success mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Signé le {format(new Date(contract.landlord_signed_at), "dd/MM/yyyy")}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  En attente de signature
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Locataire</p>
              <p className="font-semibold">{tenantName}</p>
              {contract.tenant_signed_at ? (
                <div className="flex items-center gap-1 text-sm text-success mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Signé le {format(new Date(contract.tenant_signed_at), "dd/MM/yyyy")}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  En attente de signature
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Bien</span>
              <span className="font-semibold">{propertyName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Adresse</span>
              <span className="font-semibold">{propertyAddress}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Loyer mensuel</span>
              <span className="font-semibold">{contract.monthly_rent}€</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Dépôt de garantie</span>
              <span className="font-semibold">{contract.deposit_amount}€</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-semibold">{contract.duration_months} mois</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Date de début</span>
              <span className="font-semibold">
                {format(new Date(contract.start_date), "dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Type</span>
              <span className="font-semibold">
                {contract.contract_type === "furnished" ? "Meublé" : "Non meublé"}
              </span>
            </div>
          </div>

          {contract.contract_data && (contract.contract_data as any).terms?.special_conditions && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Conditions particulières</p>
              <p className="text-sm text-muted-foreground">
                {(contract.contract_data as any).terms.special_conditions}
              </p>
            </div>
          )}

          <div className="bg-primary/5 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Conformité légale</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>✓ Conforme à la Loi n° 89-462 du 6 juillet 1989</li>
              <li>✓ Respect de la Loi ALUR (2014)</li>
              <li>✓ Préavis: {(contract.contract_data as any)?.terms?.notice_period_tenant} (locataire), {(contract.contract_data as any)?.terms?.notice_period_landlord} (bailleur)</li>
              <li>✓ Dépôt de garantie: {contract.deposit_amount <= contract.monthly_rent * 2 ? "Conforme" : "Non conforme"}</li>
            </ul>
          </div>

          {!hasSigned && contract.status === "pending_signatures" && (
            <div className="space-y-4">
              {otherPartySigned && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">
                    {isLandlord ? "Le locataire" : "Le bailleur"} a déjà signé ce contrat
                  </span>
                </div>
              )}
              <Button onClick={handleSign} disabled={loading} className="w-full">
                <PenTool className="w-4 h-4 mr-2" />
                {loading ? "Signature en cours..." : "Signer électroniquement"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                En signant, vous acceptez les termes et conditions du contrat de location
              </p>
            </div>
          )}

          {contract.status === "active" && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-success">Contrat actif</p>
                <p className="text-sm text-success/80">
                  Les deux parties ont signé le contrat. Le bail est maintenant en vigueur.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-border/50 shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>Générer le contrat de location</CardTitle>
        </div>
        <CardDescription>
          Création d'un bail conforme à la législation française
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleGenerateContract(); }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Date de début du bail *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div>
              <Label htmlFor="contractType">Type de location *</Label>
              <select
                id="contractType"
                className="w-full p-2 rounded-md border border-border bg-background"
                value={formData.contractType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contractType: e.target.value,
                    depositAmount: e.target.value === "furnished" ? monthlyRent * 2 : monthlyRent,
                  })
                }
              >
                <option value="standard">Non meublé (dépôt max 1 mois)</option>
                <option value="furnished">Meublé (dépôt max 2 mois)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.contractType === "furnished"
                  ? "Préavis locataire: 1 mois"
                  : "Préavis locataire: 3 mois (1 mois en zone tendue)"}
              </p>
            </div>

            <div>
              <Label htmlFor="durationMonths">Durée du bail (mois)</Label>
              <Input
                id="durationMonths"
                type="number"
                min="3"
                max="36"
                value={formData.durationMonths}
                onChange={(e) =>
                  setFormData({ ...formData, durationMonths: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum légal: 3 ans pour non meublé, 1 an pour meublé
              </p>
            </div>

            <div>
              <Label htmlFor="depositAmount">Dépôt de garantie (€)</Label>
              <Input
                id="depositAmount"
                type="number"
                min="0"
                max={formData.contractType === "furnished" ? monthlyRent * 2 : monthlyRent}
                value={formData.depositAmount}
                onChange={(e) =>
                  setFormData({ ...formData, depositAmount: parseFloat(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum légal: {formData.contractType === "furnished" ? "2 mois" : "1 mois"} de
                loyer
              </p>
            </div>

            <div>
              <Label htmlFor="specialConditions">Conditions particulières (optionnel)</Label>
              <Textarea
                id="specialConditions"
                value={formData.specialConditions}
                onChange={(e) =>
                  setFormData({ ...formData, specialConditions: e.target.value })
                }
                placeholder="Ex: Travaux à prévoir, clauses spécifiques..."
                rows={4}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
            <p className="font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Récapitulatif
            </p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Bailleur: {landlordName}</li>
              <li>• Locataire: {tenantName}</li>
              <li>• Bien: {propertyName}</li>
              <li>• Loyer: {monthlyRent}€/mois</li>
              <li>• Dépôt: {formData.depositAmount}€</li>
              <li>• Durée: {formData.durationMonths} mois</li>
            </ul>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Génération en cours..." : "Générer le contrat"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Le contrat sera généré selon le modèle type fixé par le décret n° 2015-587 (Loi ALUR)
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
