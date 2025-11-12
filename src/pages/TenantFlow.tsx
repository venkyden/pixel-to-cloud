import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TenantDashboard } from "@/components/TenantDashboard";
import { Card } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ProgressSteps";
import { PropertyCard } from "@/components/PropertyCard";
import { LegalChecks } from "@/components/LegalChecks";
import { ContractPreview } from "@/components/ContractPreview";
import { PaymentEscrow } from "@/components/PaymentEscrow";
import { ApplicationStatus } from "@/components/ApplicationStatus";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { amenityKeys } from "@/data/amenities";
import { useLanguage } from "@/contexts/LanguageContext";
import { legalChecks } from "@/data/legalChecks";
import { Property, TenantProfile } from "@/types";
import { ArrowLeft, ArrowRight, Shield, CheckCircle2, FileText, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { z } from "zod";

const tenantSteps = ["Profile", "Matches", "Details", "Application", "Contract", "Payment", "Status"];

const applicationSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[+\d\s()-]+$/, "Invalid phone number format"),
  occupation: z.string()
    .trim()
    .min(2, "Occupation must be at least 2 characters")
    .max(100, "Occupation must be less than 100 characters"),
  monthlyIncome: z.number()
    .positive("Income must be positive")
    .min(100, "Income must be at least €100")
    .max(1000000, "Income must be less than €1,000,000"),
  hasIdDoc: z.boolean().refine((val) => val === true, "ID document is required"),
  hasIncomeProof: z.boolean().refine((val) => val === true, "Income proof is required"),
  hasBankStatement: z.boolean().refine((val) => val === true, "Bank statement is required")
});

const TenantFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<TenantProfile>({
    budget: "600-900",
    location: "paris",
    moveInDate: "2026-01-01",
    amenities: [],
    roomCount: "2"
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    occupation: "",
    monthlyIncome: "",
    hasIdDoc: false,
    hasIncomeProof: false,
    hasBankStatement: false
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
    fetchProperties();
    toast.success("Profile created! Finding matches...");
  };

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .limit(50);
    
    if (error) {
      if (import.meta.env.DEV) console.error("Error fetching properties:", error);
      return;
    }
    
    setProperties((data as any[]) || []);
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setCurrentStep(3);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProperty || !user) {
      toast.error("Missing property or user information");
      return;
    }

    try {
      // Validate form data
      const validatedData = applicationSchema.parse({
        fullName: applicationForm.fullName,
        email: applicationForm.email,
        phone: applicationForm.phone,
        occupation: applicationForm.occupation,
        monthlyIncome: parseFloat(applicationForm.monthlyIncome),
        hasIdDoc: applicationForm.hasIdDoc,
        hasIncomeProof: applicationForm.hasIncomeProof,
        hasBankStatement: applicationForm.hasBankStatement
      });

      // Submit application to database
      const { error } = await supabase
        .from("tenant_applications")
        .insert({
          user_id: user.id,
          property_id: selectedProperty.id as string,
          profession: validatedData.occupation,
          income: validatedData.monthlyIncome,
          move_in_date: profile.moveInDate || undefined,
          status: "pending" as const
        });

      if (error) throw error;

      setCurrentStep(5);
      toast.success("Application submitted successfully!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error("Application error:", error);
        toast.error("Failed to submit application. Please try again.");
      }
    }
  };

  const handleContractReview = () => {
    setCurrentStep(6);
    toast.success("Contract approved!");
  };

  const handlePayment = () => {
    setCurrentStep(7);
    toast.success("Payment processed successfully!");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-foreground">Create Your Smart Profile</h2>
            <p className="text-muted-foreground mb-6">Tell us about your preferences and we'll find your perfect match using AI</p>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget Range (€/month)</Label>
                  <Select value={profile.budget} onValueChange={(value) => setProfile({...profile, budget: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300-600">€300 - €600</SelectItem>
                      <SelectItem value="600-900">€600 - €900</SelectItem>
                      <SelectItem value="900-1200">€900 - €1,200</SelectItem>
                      <SelectItem value="1200-1500">€1,200 - €1,500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Location</Label>
                  <Select value={profile.location} onValueChange={(value) => setProfile({...profile, location: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paris">Paris</SelectItem>
                      <SelectItem value="lyon">Lyon</SelectItem>
                      <SelectItem value="nantes">Nantes</SelectItem>
                      <SelectItem value="marseille">Marseille</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Move-in Date</Label>
                <Input 
                  type="date" 
                  value={profile.moveInDate}
                  onChange={(e) => setProfile({...profile, moveInDate: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <Label>Desired Amenities</Label>
                <div className="grid grid-cols-2 gap-3">
                  {amenityKeys.map((key) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={key}
                        checked={profile.amenities?.includes(key)}
                        onCheckedChange={(checked) => {
                          const newAmenities = checked
                            ? [...(profile.amenities || []), key]
                            : profile.amenities?.filter(a => a !== key) || [];
                          setProfile({...profile, amenities: newAmenities});
                        }}
                      />
                      <label htmlFor={key} className="text-sm cursor-pointer">
                        {t(`amenities.${key}`)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" onClick={handleProfileSubmit}>
                Find My Perfect Home
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </Card>
        );

      case 2:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-foreground">Your Perfect Matches</h2>
              <p className="text-muted-foreground">AI-powered matching found {properties.length} properties for you</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={handlePropertySelect}
                />
              ))}
            </div>
          </div>
        );

      case 3:
        return selectedProperty ? (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-foreground">{selectedProperty.name}</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Property Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-foreground">{selectedProperty.currency}{selectedProperty.price}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rooms:</span>
                      <span className="font-semibold text-foreground">{selectedProperty.rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-semibold text-foreground">{selectedProperty.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Neighborhood:</span>
                      <span className="font-semibold text-foreground">⭐ {selectedProperty.neighborhood_rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transport:</span>
                      <span className="font-semibold text-foreground">🚇 {selectedProperty.transport_score}/10</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <Shield className="w-5 h-5 text-success" />
                    Legal Compliance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">All required clauses present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">Insurance clause compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">Deposit terms verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">Termination notice aligned with law</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 mb-6">
                <p className="text-sm text-foreground">
                  <strong>Why this is a great match:</strong> {selectedProperty.match_reason}
                </p>
              </div>

              <Button className="w-full" size="lg" onClick={() => setCurrentStep(4)}>
                Submit Application
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </div>
        ) : null;

      case 4:
        return selectedProperty ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Express Application</h2>
                  <p className="text-sm text-muted-foreground">Complete your profile verification</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleApplicationSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input 
                      placeholder="John Doe" 
                      value={applicationForm.fullName}
                      onChange={(e) => setApplicationForm({...applicationForm, fullName: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input 
                      type="email" 
                      placeholder="john@example.com"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input 
                      type="tel" 
                      placeholder="+33 6 12 34 56 78"
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Occupation *</Label>
                    <Input 
                      placeholder="Software Engineer"
                      value={applicationForm.occupation}
                      onChange={(e) => setApplicationForm({...applicationForm, occupation: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Income (€) *</Label>
                  <Input 
                    type="number" 
                    placeholder="3000"
                    value={applicationForm.monthlyIncome}
                    onChange={(e) => setApplicationForm({...applicationForm, monthlyIncome: e.target.value})}
                    required 
                  />
                </div>

                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Required Documents *</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="id-doc"
                        checked={applicationForm.hasIdDoc}
                        onCheckedChange={(checked) => setApplicationForm({...applicationForm, hasIdDoc: checked as boolean})}
                      />
                      <label htmlFor="id-doc" className="cursor-pointer">Government-issued ID</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="income-proof"
                        checked={applicationForm.hasIncomeProof}
                        onCheckedChange={(checked) => setApplicationForm({...applicationForm, hasIncomeProof: checked as boolean})}
                      />
                      <label htmlFor="income-proof" className="cursor-pointer">Proof of income (last 3 months)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="bank-statement"
                        checked={applicationForm.hasBankStatement}
                        onCheckedChange={(checked) => setApplicationForm({...applicationForm, hasBankStatement: checked as boolean})}
                      />
                      <label htmlFor="bank-statement" className="cursor-pointer">Bank statements</label>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="text-sm text-foreground">
                    <strong>Note:</strong> All information is verified and encrypted. Your privacy is protected under GDPR regulations.
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Submit Application
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </Card>
          </div>
        ) : null;

      case 5:
        return selectedProperty ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Contract Review & Legal Audit</h2>
              <p className="text-muted-foreground mb-6">
                Your contract has been automatically generated and audited for legal compliance
              </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <ContractPreview
                propertyName={selectedProperty.name}
                tenantName="Your Name"
                monthlyRent={selectedProperty.price}
                deposit={selectedProperty.price}
                startDate={profile.moveInDate || "2026-01-01"}
              />
              <LegalChecks checks={legalChecks} />
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Ready to proceed?</h3>
                  <p className="text-sm text-muted-foreground">Review complete - move to secure payment</p>
                </div>
                <Button onClick={handleContractReview} size="lg">
                  Approve & Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        ) : null;

      case 6:
        return selectedProperty ? (
          <div className="max-w-2xl mx-auto">
            <PaymentEscrow
              monthlyRent={selectedProperty.price}
              deposit={selectedProperty.price}
              onPayment={handlePayment}
            />
          </div>
        ) : null;

      case 7:
        return selectedProperty ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your payment has been secured in escrow. Track your application status below.
              </p>
            </Card>

            <ApplicationStatus
              currentStage="Payment Received"
              steps={[
                {
                  title: "Application Submitted",
                  status: "completed",
                  date: new Date().toLocaleDateString('en-GB'),
                  description: "Your application has been submitted to the landlord"
                },
                {
                  title: "Contract Generated",
                  status: "completed",
                  date: new Date().toLocaleDateString('en-GB'),
                  description: "Legally compliant contract created and audited"
                },
                {
                  title: "Payment Received",
                  status: "completed",
                  date: new Date().toLocaleDateString('en-GB'),
                  description: "First month rent and deposit secured in escrow"
                },
                {
                  title: "Landlord Review",
                  status: "pending",
                  date: "Pending",
                  description: "Waiting for landlord approval"
                },
                {
                  title: "Move-in Ready",
                  status: "pending",
                  date: "Pending",
                  description: "Final step before moving in"
                }
              ]}
            />

            <Card className="p-6">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/tenant')}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </div>
        ) : null;

      default:
        return <TenantDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <ProgressSteps steps={tenantSteps} currentStep={currentStep} />
        </div>
        
        {renderStep()}
      </div>
    </div>
  );
};

export default TenantFlow;
