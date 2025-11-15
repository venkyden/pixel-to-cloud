import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";

export const EndOfLeaseDocument = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    tenantName: "",
    landlordName: "",
    propertyAddress: "",
    leaseStartDate: "",
    noticeDate: "",
    endDate: "",
    noticePeriod: "3",
    depositAmount: "",
    reason: ""
  });

  const handleGenerate = () => {
    if (!formData.tenantName || !formData.endDate) {
      toast({
        title: t("documents.endOfLease.requiredFields"),
        description: t("documents.endOfLease.fillRequired"),
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t("documents.endOfLease.generated"),
      description: t("documents.endOfLease.generatedSuccess"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("documents.endOfLease.title")}
          </CardTitle>
          <Badge className="bg-warning/10 text-warning border-warning/20">
            {t("documents.endOfLease.subtitle")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>{t("documents.endOfLease.legalNote")}</strong>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>{t("documents.endOfLease.noticeType")}</Label>
          <RadioGroup 
            value={formData.noticePeriod} 
            onValueChange={(value) => setFormData({...formData, noticePeriod: value})}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="normal" />
              <Label htmlFor="normal" className="font-normal">
                {t("documents.endOfLease.normalNotice")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="reduced" />
              <Label htmlFor="reduced" className="font-normal">
                {t("documents.endOfLease.reducedNotice")}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="tenantName">{t("documents.endOfLease.tenantName")} *</Label>
          <Input 
            id="tenantName"
            placeholder="Jean Dupont"
            value={formData.tenantName}
            onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landlordName">{t("documents.endOfLease.landlordName")}</Label>
          <Input 
            id="landlordName"
            placeholder="Marie Martin"
            value={formData.landlordName}
            onChange={(e) => setFormData({...formData, landlordName: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyAddress">{t("documents.endOfLease.propertyAddress")}</Label>
          <Input 
            id="propertyAddress"
            placeholder="123 Rue de la Paix, 75001 Paris"
            value={formData.propertyAddress}
            onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leaseStartDate">{t("documents.endOfLease.leaseStartDate")}</Label>
            <Input 
              id="leaseStartDate"
              type="date"
              value={formData.leaseStartDate}
              onChange={(e) => setFormData({...formData, leaseStartDate: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="noticeDate">{t("documents.endOfLease.noticeDate")} *</Label>
            <Input 
              id="noticeDate"
              type="date"
              value={formData.noticeDate}
              onChange={(e) => setFormData({...formData, noticeDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">{t("documents.endOfLease.endDate")} *</Label>
          <Input 
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
          />
          <p className="text-xs text-muted-foreground">
            {t("documents.endOfLease.endDateNote")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="depositAmount">{t("documents.endOfLease.depositAmount")}</Label>
          <Input 
            id="depositAmount"
            type="number"
            placeholder="1200"
            value={formData.depositAmount}
            onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
          />
          <p className="text-xs text-muted-foreground">
            {t("documents.endOfLease.depositNote")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">{t("documents.endOfLease.reason")}</Label>
          <Textarea 
            id="reason"
            placeholder={t("documents.endOfLease.reasonPlaceholder")}
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            rows={3}
          />
        </div>

        <Separator />

        <div className="bg-accent/5 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">{t("documents.endOfLease.nextSteps")}</h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
            <li>{t("documents.endOfLease.checkOut")}</li>
            <li>{t("documents.endOfLease.returnKeys")}</li>
            <li>{t("documents.endOfLease.returnDeposit")}</li>
            <li>{t("documents.endOfLease.finalAccount")}</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={handleGenerate}>
            <FileText className="mr-2 h-4 w-4" />
            {t("documents.endOfLease.generate")}
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            {t("documents.endOfLease.download")}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {t("documents.endOfLease.legalCompliance")}
        </p>
      </CardContent>
    </Card>
  );
};
