import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ProgressSteps";
import { TenantCard } from "@/components/TenantCard";
import { VerificationStep } from "@/components/VerificationStep";
import { PropertyListing } from "@/components/PropertyListing";
import { ContractPreview } from "@/components/ContractPreview";
import { ApplicationStatus } from "@/components/ApplicationStatus";
import { tenants } from "@/data/mockData";
import { Tenant } from "@/types";
import { ArrowLeft, CheckCircle2, Users, FileText, MessageSquare, Wrench } from "lucide-react";
import { toast } from "sonner";

const landlordSteps = ["Verify", "Listing", "Applications", "Compare", "Contract", "Management", "Support"];

const LandlordFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const handleVerification = () => {
    setCurrentStep(2);
    toast.success("Verification complete!");
  };

  const handleListingSubmit = () => {
    setCurrentStep(3);
    toast.success("Listing published! AI matching in progress...");
  };

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCurrentStep(4);
    toast.success(`${tenant.name} selected!`);
  };

  const handleConfirmSelection = () => {
    setCurrentStep(5);
    toast.success("Tenant approved! Contract generation in progress...");
  };

  const handleContractApproval = () => {
    setCurrentStep(6);
    toast.success("Contract sent to tenant for signature!");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <VerificationStep onVerify={handleVerification} />;

      case 2:
        return <PropertyListing onSubmit={handleListingSubmit} />;

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
        return selectedTenant ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Contract Generation</h2>
                  <p className="text-sm text-muted-foreground">
                    Legally compliant contract created for {selectedTenant.name}
                  </p>
                </div>
              </div>
            </Card>

            <ContractPreview
              propertyName="Cozy Apartment in Marais, Paris"
              tenantName={selectedTenant.name}
              landlordName="Your Name"
              monthlyRent={850}
              deposit={850}
              startDate="2026-01-01"
            />

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Ready to send?</h3>
                  <p className="text-sm text-muted-foreground">
                    Contract will be sent to {selectedTenant.name} for digital signature
                  </p>
                </div>
                <Button onClick={handleContractApproval} size="lg">
                  Send Contract
                  <FileText className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        ) : null;

      case 6:
        return selectedTenant ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="p-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground text-center">Rental Management Active!</h2>
              <p className="text-muted-foreground mb-6 text-center">
                Contract sent to <strong>{selectedTenant.name}</strong>. Track the rental process below.
              </p>
            </Card>

            <ApplicationStatus
              currentStage="Awaiting Tenant Signature"
              steps={[
                {
                  title: "Tenant Approved",
                  status: "completed",
                  date: new Date().toLocaleDateString('en-GB'),
                  description: `${selectedTenant.name} approved as your tenant`
                },
                {
                  title: "Contract Generated",
                  status: "completed",
                  date: new Date().toLocaleDateString('en-GB'),
                  description: "Legally compliant contract created and sent"
                },
                {
                  title: "Tenant Signature",
                  status: "in-progress",
                  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
                  description: "Waiting for tenant to review and sign digitally"
                },
                {
                  title: "Payment & Escrow",
                  status: "pending",
                  description: "Tenant payment secured in escrow"
                },
                {
                  title: "Move-in Coordination",
                  status: "pending",
                  date: selectedTenant.move_in,
                  description: "Schedule property inspection and key handover"
                }
              ]}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Communication</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Message {selectedTenant.name} directly through the platform
                </p>
                <Button className="w-full" variant="outline">
                  Open Chat
                </Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wrench className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Property Support</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  24/7 support for maintenance and issues
                </p>
                <Button className="w-full" variant="outline">
                  Get Support
                </Button>
              </Card>
            </div>

            <Card className="p-6">
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Return to Dashboard
              </Button>
            </Card>
          </div>
        ) : null;

      case 7:
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Support & Maintenance</h2>
              <p className="text-muted-foreground mb-8">
                Get 24/7 support for your rental property and tenant management
              </p>
              <div className="space-y-4 text-left">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2 text-foreground">Available Services:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Emergency maintenance coordination</li>
                    <li>✓ Rent collection & payment tracking</li>
                    <li>✓ Legal support & dispute resolution</li>
                    <li>✓ Property inspection scheduling</li>
                    <li>✓ Tenant communication management</li>
                  </ul>
                </div>
                <Button className="w-full" size="lg">
                  Contact Support Team
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
