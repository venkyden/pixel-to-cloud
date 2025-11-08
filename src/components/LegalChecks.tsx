import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, AlertTriangle } from "lucide-react";

interface LegalCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  details: string;
}

interface LegalChecksProps {
  checks: LegalCheck[];
}

export const LegalChecks = ({ checks }: LegalChecksProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'fail':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-success/10 text-success border-success/20">Pass</Badge>;
      case 'warning':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Warning</Badge>;
      case 'fail':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Fail</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Legal Compliance Check</h3>
      </div>
      
      <div className="space-y-4">
        {checks.map((check, index) => (
          <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            {getStatusIcon(check.status)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-foreground">{check.name}</h4>
                {getStatusBadge(check.status)}
              </div>
              <p className="text-sm text-muted-foreground">{check.details}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
