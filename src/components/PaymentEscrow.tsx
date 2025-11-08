import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CreditCard, Lock, CheckCircle2 } from "lucide-react";

interface PaymentEscrowProps {
  monthlyRent: number;
  deposit: number;
  onPayment: () => void;
}

export const PaymentEscrow = ({ monthlyRent, deposit, onPayment }: PaymentEscrowProps) => {
  const total = monthlyRent + deposit;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Secure Escrow Payment</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">How Escrow Protection Works</p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Your payment is held securely until move-in</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Landlord receives payment after property inspection</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Full refund if property doesn't match description</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Deposit held in escrow for duration of lease</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">First Month's Rent</span>
            <span className="font-semibold text-foreground">€{monthlyRent}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Security Deposit</span>
            <span className="font-semibold text-foreground">€{deposit}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-foreground">Total Due Today</span>
            <span className="text-xl font-bold text-primary">€{total}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={onPayment}>
          <CreditCard className="w-4 h-4 mr-2" />
          Pay Securely with Stripe
        </Button>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>PCI Compliant</span>
          </div>
          <Badge variant="outline" className="text-xs">Escrow Protected</Badge>
        </div>
      </div>
    </Card>
  );
};
