import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContractPreviewProps {
  propertyName: string;
  tenantName?: string;
  landlordName?: string;
  monthlyRent: number;
  deposit: number;
  startDate: string;
}

export const ContractPreview = ({ 
  propertyName, 
  tenantName, 
  landlordName,
  monthlyRent, 
  deposit, 
  startDate 
}: ContractPreviewProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">{t("contract.title")}</h3>
        </div>
        <Badge className="bg-success/10 text-success border-success/20">
          {t("contract.subtitle")}
        </Badge>
      </div>

      <div className="prose prose-sm max-w-none text-foreground mb-6">
        <h4 className="font-semibold text-lg mb-4">{t("contract.heading")}</h4>
        
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">{t("contract.landlord")}</p>
            <p className="text-muted-foreground">{landlordName || t("contract.landlordPlaceholder")}</p>
          </div>

          <div>
            <p className="font-medium">{t("contract.tenant")}</p>
            <p className="text-muted-foreground">{tenantName || t("contract.tenantPlaceholder")}</p>
          </div>

          <div>
            <p className="font-medium">{t("contract.property")}</p>
            <p className="text-muted-foreground">{propertyName}</p>
          </div>

          <div>
            <p className="font-medium">{t("contract.monthlyRent")}</p>
            <p className="text-muted-foreground">{monthlyRent} €</p>
          </div>

          <div>
            <p className="font-medium">{t("contract.deposit")}</p>
            <p className="text-muted-foreground">{deposit} € {t("contract.depositCap")}</p>
          </div>

          <div>
            <p className="font-medium">{t("contract.startDate")}</p>
            <p className="text-muted-foreground">{new Date(startDate).toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">{t("contract.durationTitle")}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t("contract.duration1")}</li>
              <li>{t("contract.duration2")}</li>
              <li>{t("contract.duration3")}</li>
              <li>{t("contract.duration4")}</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">{t("contract.tenantObligationsTitle")}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t("contract.tenantObligation1")}</li>
              <li>{t("contract.tenantObligation2")}</li>
              <li>{t("contract.tenantObligation3")}</li>
              <li>{t("contract.tenantObligation4")}</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">{t("contract.landlordObligationsTitle")}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t("contract.landlordObligation1")}</li>
              <li>{t("contract.landlordObligation2")}</li>
              <li>{t("contract.landlordObligation3")}</li>
              <li>{t("contract.landlordObligation4")}</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">{t("contract.diagnosticsTitle")}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t("contract.diagnostic1")}</li>
              <li>{t("contract.diagnostic2")}</li>
              <li>{t("contract.diagnostic3")}</li>
              <li>{t("contract.diagnostic4")}</li>
              <li>{t("contract.diagnostic5")}</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border bg-accent/5 p-3 rounded">
            <p className="font-medium text-sm">
              {t("contract.compliance")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">
          <FileText className="w-4 h-4 mr-2" />
          {t("contract.signElectronically")}
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          {t("contract.downloadPDF")}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {t("contract.electronicSignatureNote")}
      </p>
    </Card>
  );
};
