import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

export const RentReceipt = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    tenantName: "",
    propertyAddress: "",
    rentAmount: "",
    chargesAmount: "",
    landlordName: ""
  });

  const handleGenerateReceipt = () => {
    if (!formData.tenantName || !formData.rentAmount) {
      toast({
        title: t("documents.rentReceipt.requiredFields"),
        description: t("documents.rentReceipt.fillRequired"),
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t("documents.rentReceipt.generated"),
      description: t("documents.rentReceipt.generatedSuccess"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("documents.rentReceipt.title")}
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {t("documents.rentReceipt.subtitle")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-accent/5 p-3 rounded-md border border-border">
          <p className="text-xs text-muted-foreground">
            {t("documents.rentReceipt.legalNote")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="month">{t("documents.rentReceipt.period")} *</Label>
          <Input 
            id="month"
            type="month" 
            value={formData.month}
            onChange={(e) => setFormData({...formData, month: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenantName">{t("documents.rentReceipt.tenantName")} *</Label>
          <Input 
            id="tenantName"
            placeholder="Jean Dupont"
            value={formData.tenantName}
            onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyAddress">{t("documents.rentReceipt.propertyAddress")}</Label>
          <Input 
            id="propertyAddress"
            placeholder="123 Rue de la Paix, 75001 Paris"
            value={formData.propertyAddress}
            onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="rentAmount">{t("documents.rentReceipt.monthlyRent")} *</Label>
          <Input 
            id="rentAmount"
            type="number" 
            placeholder="1200"
            value={formData.rentAmount}
            onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chargesAmount">{t("documents.rentReceipt.charges")}</Label>
          <Input 
            id="chargesAmount"
            type="number" 
            placeholder="150"
            value={formData.chargesAmount}
            onChange={(e) => setFormData({...formData, chargesAmount: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landlordName">{t("documents.rentReceipt.landlordName")}</Label>
          <Input 
            id="landlordName"
            placeholder="Marie Martin"
            value={formData.landlordName}
            onChange={(e) => setFormData({...formData, landlordName: e.target.value})}
          />
        </div>

        <Separator />

        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("documents.rentReceipt.rentExcludingCharges")}</span>
            <span className="font-semibold">{formData.rentAmount || "0"} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("documents.rentReceipt.charges")}</span>
            <span className="font-semibold">{formData.chargesAmount || "0"} €</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-foreground">{t("documents.rentReceipt.totalPaid")}</span>
            <span className="font-bold text-primary">
              {(parseFloat(formData.rentAmount || "0") + parseFloat(formData.chargesAmount || "0")).toFixed(2)} €
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={handleGenerateReceipt}>
            <FileText className="mr-2 h-4 w-4" />
            {t("documents.rentReceipt.generate")}
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            {t("documents.rentReceipt.download")}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {t("documents.rentReceipt.legalCompliance")}
        </p>
      </CardContent>
    </Card>
  );
};
