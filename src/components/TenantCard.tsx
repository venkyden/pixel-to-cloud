import { Tenant } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Briefcase, TrendingUp, CheckCircle2, Calendar } from "lucide-react";

interface TenantCardProps {
  tenant: Tenant;
  onSelect: (tenant: Tenant) => void;
}

export const TenantCard = ({ tenant, onSelect }: TenantCardProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{tenant.name}</h3>
              {tenant.verified && (
                <CheckCircle2 className="w-4 h-4 text-success" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{tenant.age} years • {tenant.profession}</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          <TrendingUp className="w-3 h-3 mr-1" />
          {tenant.match_score}% Match
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">€{tenant.income}/month income</span>
          {tenant.co_signer_income && (
            <span className="text-muted-foreground text-xs">
              + €{tenant.co_signer_income} co-signer
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Move-in: {tenant.move_in}</span>
        </div>
      </div>

      <div className="mb-4">
        <Badge variant="outline" className={getRiskColor(tenant.risk_level)}>
          Risk: {tenant.risk_level}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-4 italic">
        "{tenant.rental_history}"
      </p>

      <Button className="w-full" onClick={() => onSelect(tenant)}>
        Select Tenant
      </Button>
    </Card>
  );
};
