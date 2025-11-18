import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Home,
  User,
  Shield,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LandlordVerificationForm } from "@/components/LandlordVerificationForm";

const ONBOARDING_STEPS = {
  tenant: [
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your basic information",
      icon: User,
    },
    {
      id: "preferences",
      title: "Set Search Preferences",
      description: "Tell us what you're looking for",
      icon: Home,
    },
    {
      id: "verification",
      title: "Verify Identity",
      description: "Upload required documents",
      icon: Shield,
    },
    {
      id: "explore",
      title: "Explore Properties",
      description: "Start finding your perfect home",
      icon: Sparkles,
    },
  ],
  landlord: [
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your basic information",
      icon: User,
    },
    {
      id: "verification",
      title: "Verify Ownership",
      description: "Prove property ownership",
      icon: Shield,
    },
    {
      id: "diagnostics",
      title: "Upload Diagnostics",
      description: "Mandatory French diagnostics",
      icon: FileText,
    },
    {
      id: "listing",
      title: "List Your Property",
      description: "Create your first listing",
      icon: Home,
    },
  ],
};

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userRole, setUserRole] = useState<"tenant" | "landlord" | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData) {
        navigate("/role-selection");
        return;
      }

      setUserRole(roleData.role as "tenant" | "landlord");

      // Check profile completion
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const completed: string[] = [];

      if (profileData?.first_name && profileData?.last_name) {
        completed.push("profile");
      }

      // Check role-specific completions
      if (roleData.role === "landlord") {
        const { data: verificationData } = await supabase
          .from("landlord_verifications")
          .select("status")
          .eq("user_id", user.id)
          .single();

        if (verificationData?.status === "verified") {
          completed.push("verification");
        }

        const { data: propertiesData } = await supabase
          .from("properties")
          .select("id")
          .eq("owner_id", user.id)
          .limit(1);

        if (propertiesData && propertiesData.length > 0) {
          completed.push("listing");
        }
      } else if (roleData.role === "tenant") {
        // Check tenant verification
        const { data: applicationsData } = await supabase
          .from("tenant_applications")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (applicationsData && applicationsData.length > 0) {
          completed.push("verification");
        }
      }

      setCompletedSteps(completed);

      // If all steps completed, redirect to dashboard
      const steps = ONBOARDING_STEPS[roleData.role as "tenant" | "landlord"];
      if (completed.length >= steps.length) {
        navigate(roleData.role === "landlord" ? "/landlord" : "/tenant");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!userRole) return;
    const steps = ONBOARDING_STEPS[userRole];
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      toast.success("Onboarding complete! Welcome to Roomivo!");
      navigate(userRole === "landlord" ? "/landlord" : "/tenant");
    }
  };

  const handleSkip = () => {
    if (!userRole) return;
    navigate(userRole === "landlord" ? "/landlord" : "/tenant");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  const steps = ONBOARDING_STEPS[userRole];
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            {userRole === "landlord" ? "Landlord" : "Tenant"} Onboarding
          </Badge>
          <h1 className="text-4xl font-bold mb-2">Welcome to Roomivo</h1>
          <p className="text-muted-foreground">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = index === currentStep;

            return (
              <Card
                key={step.id}
                className={`cursor-pointer transition-all ${
                  isCurrent
                    ? "ring-2 ring-primary shadow-lg"
                    : isCompleted
                    ? "bg-success/5 border-success/20"
                    : "opacity-50"
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <CardContent className="pt-6 text-center">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      isCompleted
                        ? "bg-success/20"
                        : isCurrent
                        ? "bg-primary/20"
                        : "bg-accent"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    )}
                  </div>
                  <p className="text-xs font-medium">{step.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Step Content */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StepIcon className="w-6 h-6 text-primary" />
              {currentStepData.title}
            </CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStepData.id === "verification" && userRole === "landlord" && (
              <LandlordVerificationForm />
            )}

            {currentStepData.id === "profile" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Complete your profile to build trust with{" "}
                  {userRole === "landlord" ? "tenants" : "landlords"}.
                </p>
                <Button onClick={() => navigate("/profile")} className="w-full">
                  Go to Profile Settings
                </Button>
              </div>
            )}

            {currentStepData.id === "preferences" && userRole === "tenant" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Set your search preferences to get matched with perfect properties.
                </p>
                <Button onClick={() => navigate("/tenant")} className="w-full">
                  Set Preferences
                </Button>
              </div>
            )}

            {currentStepData.id === "diagnostics" && userRole === "landlord" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload mandatory French diagnostics for your properties.
                </p>
                <Button onClick={() => navigate("/landlord")} className="w-full">
                  Upload Diagnostics
                </Button>
              </div>
            )}

            {currentStepData.id === "listing" && userRole === "landlord" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create your first property listing to start receiving applications.
                </p>
                <Button onClick={() => navigate("/landlord")} className="w-full">
                  Create Listing
                </Button>
              </div>
            )}

            {currentStepData.id === "explore" && userRole === "tenant" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Start exploring verified properties and submit applications.
                </p>
                <Button onClick={() => navigate("/properties")} className="w-full">
                  Browse Properties
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
