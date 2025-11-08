import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ProgressSteps";
import { TenantCard } from "@/components/TenantCard";
import { tenants } from "@/data/mockData";
import { Tenant } from "@/types";
import { ArrowLeft, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";

const landlordSteps = ["Verify", "Listing", "Applications", "Compare", "Contract", "Management", "Support"];

const LandlordFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(3); // Start at Applications for demo
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCurrentStep(4);
    toast.success(`${tenant.name} selected!`);
  };

  const handleConfirmSelection = () => {
    setCurrentStep(5);
    toast.success("Tenant approved! Contract generation in progress...");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 3:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Tenant Applications</h2>
                  <p className="text-muted-foreground">AI-ranked applicants for your property</p>
                </div>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground">
                  <strong>Parallel Processing Active:</strong> All {tenants.length} applications reviewed simultaneously. 
                  Top matches shown first based on income verification, rental history, and move-in date compatibility.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  onSelect={handleTenantSelect}
                />
              ))}
            </div>
          </div>
        );

      case 4:
        return selectedTenant ? (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Compare & Verify: {selectedTenant.name}</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Tenant Profile</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-semibold text-foreground">{selectedTenant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-semibold text-foreground">{selectedTenant.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profession:</span>
                      <span className="font-semibold text-foreground">{selectedTenant.profession}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Income:</span>
                      <span className="font-semibold text-foreground">€{selectedTenant.income}</span>
                    </div>
                    {selectedTenant.co_signer_income && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Co-signer Income:</span>
                        <span className="font-semibold text-foreground">€{selectedTenant.co_signer_income}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Move-in Date:</span>
                      <span className="font-semibold text-foreground">{selectedTenant.move_in}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    Verification Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">Identity verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">Income verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">Credit check passed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">References checked</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm font-semibold text-foreground mb-1">Match Score: {selectedTenant.match_score}%</p>
                  <p className="text-xs text-muted-foreground">
                    Excellent match based on income-to-rent ratio, rental history, and move-in timeline.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-1">Rental History</p>
                  <p className="text-xs text-muted-foreground italic">"{selectedTenant.rental_history}"</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-1">Risk Assessment</p>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-success">Risk Level: {selectedTenant.risk_level}</strong> - This tenant poses minimal financial risk based on our AI analysis.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                  View Other Applicants
                </Button>
                <Button onClick={handleConfirmSelection} className="flex-1">
                  Approve & Generate Contract
                </Button>
              </div>
            </Card>
          </div>
        ) : null;

      case 5:
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Tenant Approved!</h2>
              <p className="text-muted-foreground mb-8">
                <strong>{selectedTenant?.name}</strong> has been approved as your tenant. 
                A legally compliant contract is being generated automatically.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg text-left">
                  <h3 className="font-semibold mb-2 text-foreground">Next Steps:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Contract generation (automated)</li>
                    <li>✓ Digital signature collection</li>
                    <li>✓ Deposit & rent escrow setup</li>
                    <li>✓ Move-in coordination</li>
                  </ul>
                </div>
                <Button onClick={() => navigate('/')} variant="outline">
                  Return to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Step {currentStep}</h2>
              <p className="text-muted-foreground">This step is under construction.</p>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">Roomivo</h1>
              <span className="text-sm text-muted-foreground">🏠 Landlord Mode</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Role
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProgressSteps steps={landlordSteps} currentStep={currentStep} />
        {renderStep()}
      </main>
    </div>
  );
};

export default LandlordFlow;
