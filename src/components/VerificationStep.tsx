import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";

interface VerificationStepProps {
  onVerify: () => void;
}

export const VerificationStep = ({ onVerify }: VerificationStepProps) => {
  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Landlord Verification</h2>
          <p className="text-sm text-muted-foreground">Verify your identity to ensure tenant trust</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
        <h3 className="font-semibold mb-2 text-foreground">Why Verification Matters</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Builds trust with potential tenants</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Increases response rates by 3x</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Protects against fraud</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Required for legal compliance</span>
          </li>
        </ul>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="John Smith" required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="john@example.com" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input type="tel" placeholder="+33 6 12 34 56 78" required />
        </div>

        <div className="space-y-2">
          <Label>Property Ownership Document</Label>
          <Input type="file" accept=".pdf,.jpg,.png" required />
          <p className="text-xs text-muted-foreground">Upload proof of ownership or authorization to rent</p>
        </div>

        <div className="space-y-2">
          <Label>Government-Issued ID</Label>
          <Input type="file" accept=".pdf,.jpg,.png" required />
          <p className="text-xs text-muted-foreground">Passport, national ID, or driver's license</p>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Complete Verification
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};
