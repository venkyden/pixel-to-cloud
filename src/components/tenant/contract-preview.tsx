import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

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
                    <h3 className="text-xl font-semibold text-foreground">{t("contract.title") || "Lease Agreement"}</h3>
                </div>
                <Badge className="bg-success/10 text-success border-success/20">
                    {t("contract.subtitle") || "Legally Compliant"}
                </Badge>
            </div>

            <div className="prose prose-sm max-w-none text-foreground mb-6">
                <h4 className="font-semibold text-lg mb-4">{t("contract.heading") || "Residential Lease Agreement"}</h4>

                <div className="space-y-4 text-sm">
                    <div>
                        <p className="font-medium">{t("contract.landlord") || "Landlord"}</p>
                        <p className="text-muted-foreground">{landlordName || t("contract.landlordPlaceholder") || "[Landlord Name]"}</p>
                    </div>

                    <div>
                        <p className="font-medium">{t("contract.tenant") || "Tenant"}</p>
                        <p className="text-muted-foreground">{tenantName || t("contract.tenantPlaceholder") || "[Tenant Name]"}</p>
                    </div>

                    <div>
                        <p className="font-medium">{t("contract.property") || "Property"}</p>
                        <p className="text-muted-foreground">{propertyName}</p>
                    </div>

                    <div>
                        <p className="font-medium">{t("contract.monthlyRent") || "Monthly Rent"}</p>
                        <p className="text-muted-foreground">{monthlyRent} €</p>
                    </div>

                    <div>
                        <p className="font-medium">{t("contract.deposit") || "Security Deposit"}</p>
                        <p className="text-muted-foreground">{deposit} € {t("contract.depositCap") || "(Capped by law)"}</p>
                    </div>

                    <div>
                        <p className="font-medium">{t("contract.startDate") || "Start Date"}</p>
                        <p className="text-muted-foreground">{new Date(startDate).toLocaleDateString('fr-FR')}</p>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <p className="font-medium mb-2">{t("contract.durationTitle") || "Duration & Renewal"}</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>{t("contract.duration1") || "Standard 3-year lease for unfurnished"}</li>
                            <li>{t("contract.duration2") || "1-year lease for furnished"}</li>
                            <li>{t("contract.duration3") || "Automatic renewal"}</li>
                            <li>{t("contract.duration4") || "Termination notice periods apply"}</li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <p className="font-medium mb-2">{t("contract.tenantObligationsTitle") || "Tenant Obligations"}</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>{t("contract.tenantObligation1") || "Pay rent on time"}</li>
                            <li>{t("contract.tenantObligation2") || "Maintain the property"}</li>
                            <li>{t("contract.tenantObligation3") || "Respect neighbors"}</li>
                            <li>{t("contract.tenantObligation4") || "Provide insurance certificate"}</li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <p className="font-medium mb-2">{t("contract.landlordObligationsTitle") || "Landlord Obligations"}</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>{t("contract.landlordObligation1") || "Provide decent housing"}</li>
                            <li>{t("contract.landlordObligation2") || "Major repairs"}</li>
                            <li>{t("contract.landlordObligation3") || "Peaceful enjoyment"}</li>
                            <li>{t("contract.landlordObligation4") || "Provide receipts"}</li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <p className="font-medium mb-2">{t("contract.diagnosticsTitle") || "Required Diagnostics"}</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>{t("contract.diagnostic1") || "Energy Performance (DPE)"}</li>
                            <li>{t("contract.diagnostic2") || "Lead exposure risk"}</li>
                            <li>{t("contract.diagnostic3") || "Asbestos"}</li>
                            <li>{t("contract.diagnostic4") || "Electrical installation"}</li>
                            <li>{t("contract.diagnostic5") || "Gas installation"}</li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-border bg-accent/5 p-3 rounded">
                        <p className="font-medium text-sm">
                            {t("contract.compliance") || "This contract is automatically updated to comply with the latest housing laws (ALUR, ELAN)."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    {t("contract.signElectronically") || "Sign Electronically"}
                </Button>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    {t("contract.downloadPDF") || "Download PDF"}
                </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-3 text-center">
                {t("contract.electronicSignatureNote") || "Secure eIDAS compliant signature"}
            </p>
        </Card>
    );
};
