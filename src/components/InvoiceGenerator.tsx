import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const InvoiceGenerator = () => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleGenerateInvoice = () => {
    toast({
      title: t("invoice.generated"),
      description: t("invoice.success"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t("invoice.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t("documents.rentReceipt.period")}</Label>
          <Input type="date" />
        </div>

        <div className="space-y-2">
          <Label>{t("documents.rentReceipt.propertyAddress")}</Label>
          <Input placeholder={t("invoice.selectProperty")} />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly Rent</span>
            <span className="font-semibold">$2,500.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Utilities</span>
            <span className="font-semibold">$150.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Maintenance</span>
            <span className="font-semibold">$50.00</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-primary">$2,700.00</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={handleGenerateInvoice}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Invoice
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
