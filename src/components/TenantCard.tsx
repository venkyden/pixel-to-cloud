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
        return 'glass-effect bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30';
      case 'medium':
        return 'glass-effect bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30';
      case 'high':
        return 'glass-effect bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive border-destructive/30';
      default:
        return 'glass-effect bg-muted/50 text-muted-foreground border-border/50';
    }
  };

  return (
    <Card className="group relative overflow-hidden glass-effect border-border/50 hover:shadow-elegant transition-all duration-500 hover:scale-[1.02] cursor-pointer">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {tenant.name}
                </h3>
                {tenant.verified && (
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {tenant.age} years • {tenant.profession}
              </p>
            </div>
          </div>
          <Badge className="glass-effect bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30 hover:scale-105 transition-transform duration-300">
            <TrendingUp className="w-3 h-3 mr-1" />
            {tenant.match_score}%
          </Badge>
        </div>

        {/* Info Section */}
        <div className="space-y-3 p-4 rounded-xl glass-effect border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-foreground">
                €{tenant.income}/month
              </span>
              {tenant.co_signer_income && (
                <span className="text-xs text-muted-foreground ml-2">
                  + €{tenant.co_signer_income} co-signer
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Move-in: {tenant.move_in}
            </span>
          </div>
        </div>

        {/* Risk Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getRiskColor(tenant.risk_level)}>
            Risk: {tenant.risk_level}
          </Badge>
        </div>

        {/* Rental History */}
        <div className="p-4 rounded-xl glass-effect border border-border/50">
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "{tenant.rental_history}"
          </p>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105" 
          onClick={() => onSelect(tenant)}
        >
          Select Tenant
        </Button>
      </div>
    </Card>
  );
};
