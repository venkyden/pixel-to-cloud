import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, Users, Key, Shield, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleRoleSelection = async (role: "tenant" | "landlord") => {
    if (!user) {
      toast.error(t("roleSelection.mustBeLoggedIn"));
      navigate("/auth");
      return;
    }

    try {
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", role)
        .single();

      if (!existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role });

        if (error) throw error;
      }

      toast.success(role === "tenant" ? t("roleSelection.welcomeTenant") : t("roleSelection.welcomeLandlord"));
      navigate(role === "tenant" ? "/tenant" : "/landlord");
    } catch (error: any) {
      console.error("Error setting role:", error);
      toast.error(t("roleSelection.errorSelectingRole"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <nav className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Roomivo</span>
          </button>
          <Button variant="ghost" onClick={() => navigate("/profile")}>
            {t("roleSelection.myProfile")}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {t("roleSelection.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("roleSelection.subtitle")}
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tenant Card */}
            <Card className="hover-scale cursor-pointer transition-all hover:shadow-xl animate-fade-in group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("roleSelection.tenantTitle")}</CardTitle>
                <CardDescription className="text-base">
                  {t("roleSelection.tenantDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t("roleSelection.tenantFeature1")}</p>
                      <p className="text-muted-foreground">{t("roleSelection.tenantFeature1Desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t("roleSelection.tenantFeature2")}</p>
                      <p className="text-muted-foreground">{t("roleSelection.tenantFeature2Desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t("roleSelection.tenantFeature3")}</p>
                      <p className="text-muted-foreground">{t("roleSelection.tenantFeature3Desc")}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleRoleSelection("tenant")}
                  className="w-full" 
                  size="lg"
                >
                  {t("roleSelection.tenantCta")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Landlord Card */}
            <Card className="hover-scale cursor-pointer transition-all hover:shadow-xl animate-fade-in group" style={{ animationDelay: "0.1s" }}>
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-secondary/10 mx-auto flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Key className="w-10 h-10 text-secondary" />
                </div>
                <CardTitle className="text-2xl">{t("roleSelection.landlordTitle")}</CardTitle>
                <CardDescription className="text-base">
                  {t("roleSelection.landlordDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t("roleSelection.landlordFeature1")}</p>
                      <p className="text-muted-foreground">{t("roleSelection.landlordFeature1Desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t("roleSelection.landlordFeature2")}</p>
                      <p className="text-muted-foreground">{t("roleSelection.landlordFeature2Desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t("roleSelection.landlordFeature3")}</p>
                      <p className="text-muted-foreground">{t("roleSelection.landlordFeature3Desc")}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleRoleSelection("landlord")}
                  className="w-full" 
                  size="lg"
                  variant="secondary"
                >
                  {t("roleSelection.landlordCta")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="text-center space-y-4 pt-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <p className="text-sm text-muted-foreground">
              {t("roleSelection.dualRole")}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>{t("roleSelection.secure")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>{t("roleSelection.gdprCompliant")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>{t("roleSelection.law1989")}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
