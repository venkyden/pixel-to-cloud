import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Home, Users, Key, Shield, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRoleSelection = async (role: "tenant" | "landlord") => {
    if (!user) {
      toast.error("Vous devez être connecté");
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

      toast.success(`Bienvenue en tant que ${role === "tenant" ? "locataire" : "propriétaire"}!`);
      navigate(role === "tenant" ? "/tenant" : "/landlord");
    } catch (error: any) {
      console.error("Error setting role:", error);
      toast.error("Erreur lors de la sélection du rôle");
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
            Mon Profil
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Vous êtes...
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choisissez votre profil pour accéder aux fonctionnalités adaptées
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
                <CardTitle className="text-2xl">Je cherche un logement</CardTitle>
                <CardDescription className="text-base">
                  Accédez aux annonces et postulez en toute sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Paiement sécurisé par séquestre</p>
                      <p className="text-muted-foreground">Votre argent protégé jusqu'à l'emménagement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">État des lieux photo</p>
                      <p className="text-muted-foreground">Preuve légale pour récupérer votre dépôt</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Candidature simplifiée</p>
                      <p className="text-muted-foreground">Upload de documents une seule fois</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleRoleSelection("tenant")}
                  className="w-full" 
                  size="lg"
                >
                  Continuer comme Locataire
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
                <CardTitle className="text-2xl">Je loue mon bien</CardTitle>
                <CardDescription className="text-base">
                  Trouvez le locataire idéal rapidement et en sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Vérification d'identité</p>
                      <p className="text-muted-foreground">Locataires vérifiés, zéro arnaque</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Gestion simplifiée</p>
                      <p className="text-muted-foreground">Tout sur un seul tableau de bord</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">100% conforme à la loi</p>
                      <p className="text-muted-foreground">Documents légaux générés automatiquement</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleRoleSelection("landlord")}
                  className="w-full" 
                  size="lg"
                  variant="secondary"
                >
                  Continuer comme Propriétaire
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="text-center space-y-4 pt-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <p className="text-sm text-muted-foreground">
              Vous pouvez avoir les deux profils si vous êtes à la fois locataire et propriétaire
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>100% Sécurisé</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Conforme RGPD</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Loi 1989</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
