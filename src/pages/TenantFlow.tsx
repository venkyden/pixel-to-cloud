import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ProgressSteps";
import { PropertyCard } from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { properties, amenityLabels } from "@/data/mockData";
import { Property, TenantProfile } from "@/types";
import { ArrowLeft, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const tenantSteps = ["Profile", "Matches", "Details", "Application", "Contract", "Payment", "Status"];

const TenantFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<TenantProfile>({
    budget: "600-900",
    location: "paris",
    moveInDate: "2026-01-01",
    amenities: [],
    roomCount: "2"
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
    toast.success("Profile created! Finding matches...");
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setCurrentStep(3);
  };

  const handleApplicationSubmit = () => {
    setCurrentStep(4);
    toast.success("Application submitted successfully!");
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
                  {Object.entries(amenityLabels).map(([key, label]) => (
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
                        {label}
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

              <Button className="w-full" size="lg" onClick={handleApplicationSubmit}>
                Submit Application
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </div>
        ) : null;

      case 4:
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Application Submitted!</h2>
              <p className="text-muted-foreground mb-8">
                Your application for <strong>{selectedProperty?.name}</strong> has been submitted successfully. 
                The landlord will review it and get back to you within 24-48 hours.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg text-left">
                  <h3 className="font-semibold mb-2 text-foreground">Next Steps:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Contract review & signing</li>
                    <li>✓ Secure deposit payment</li>
                    <li>✓ Move-in coordination</li>
                  </ul>
                </div>
                <Button onClick={() => navigate('/')} variant="outline">
                  Return to Home
                </Button>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">Roomivo</h1>
              <span className="text-sm text-muted-foreground">👤 Tenant Mode</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Role
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProgressSteps steps={tenantSteps} currentStep={currentStep} />
        {renderStep()}
      </main>
    </div>
  );
};

export default TenantFlow;
