import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Rental Contract</h3>
        </div>
        <Badge className="bg-success/10 text-success border-success/20">
          Legally Compliant
        </Badge>
      </div>

      <div className="prose prose-sm max-w-none text-foreground mb-6">
        <h4 className="font-semibold text-lg mb-4">RENTAL AGREEMENT</h4>
        
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Property:</p>
            <p className="text-muted-foreground">{propertyName}</p>
          </div>

          {tenantName && (
            <div>
              <p className="font-medium">Tenant:</p>
              <p className="text-muted-foreground">{tenantName}</p>
            </div>
          )}

          {landlordName && (
            <div>
              <p className="font-medium">Landlord:</p>
              <p className="text-muted-foreground">{landlordName}</p>
            </div>
          )}

          <div>
            <p className="font-medium">Monthly Rent:</p>
            <p className="text-muted-foreground">€{monthlyRent}</p>
          </div>

          <div>
            <p className="font-medium">Security Deposit:</p>
            <p className="text-muted-foreground">€{deposit}</p>
          </div>

          <div>
            <p className="font-medium">Lease Start Date:</p>
            <p className="text-muted-foreground">{new Date(startDate).toLocaleDateString('en-GB')}</p>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">Key Terms:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Lease duration: 12 months (renewable)</li>
              <li>Notice period: 3 months for tenant, 6 months for landlord</li>
              <li>Tenant insurance: Mandatory</li>
              <li>Rent payment: Due on 1st of each month</li>
              <li>Deposit return: Within 2 months of lease end</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium mb-2">Legal Compliance:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Compliant with French Tenancy Law (Loi ALUR)</li>
              <li>All mandatory clauses included</li>
              <li>Energy performance certificate attached</li>
              <li>Lead and asbestos diagnostics provided</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">
          <FileText className="w-4 h-4 mr-2" />
          Sign Digitally
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </Card>
  );
};
