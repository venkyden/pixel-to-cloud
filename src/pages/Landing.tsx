import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Shield, 
  Zap, 
  CheckCircle, 
  Users, 
  FileCheck,
  ArrowRight,
  Video
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Paiement Sécurisé par Séquestre",
      description: "Votre argent protégé jusqu'à l'emménagement. Conforme à la loi française (DSP2)"
    },
    {
      icon: FileCheck,
      title: "État des Lieux Photo",
      description: "Preuve légale incontestable. Les deux parties signent numériquement l'inspection"
    },
    {
      icon: CheckCircle,
      title: "Vérification d'Identité",
      description: "Protection anti-arnaque. Vérification RGPD-conforme dès la candidature"
    },
    {
      icon: Zap,
      title: "Automatisation Intelligente",
      description: "Pas de réponse? Pas de problème. Actions automatiques après délai d'attente"
    },
    {
      icon: Users,
      title: "Gestion Simplifiée",
      description: "Tableau de bord unique pour tout gérer. Zéro paperasse, zéro stress"
    },
    {
      icon: Shield,
      title: "100% Conforme Loi Française",
      description: "Loi du 6 juillet 1989, ALUR, ELAN. Tous vos documents légaux générés automatiquement"
    }
  ];

  const stats = [
    { value: "100%", label: "Conforme Loi 1989" },
    { value: "48h", label: "Premier Emménagement" },
    { value: "0€", label: "Frais Cachés" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Roomivo</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
              Roomivo
              <br />
              <span className="text-primary">Le premier pas vers l'installation</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Location sécurisée, anti-arnaque, 100% conforme à la loi française.
              Pour les locataires et propriétaires qui veulent gagner du temps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg h-14 px-8"
              onClick={() => navigate("/auth")}
            >
              Commencer Gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8"
              onClick={() => navigate("/auth")}
            >
              Comment ça marche?
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="space-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Anti-Arnaque · Gain de Temps · Légal
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              L'essentiel pour louer en toute sécurité, sans paperasse ni mauvaises surprises
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 space-y-4 hover-scale cursor-pointer transition-all hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto">
          <Card className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Prêt à Démarrer?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Inscription gratuite. Aucune carte bancaire requise.
              Propriétaires et locataires bienvenus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8"
                onClick={() => navigate("/auth")}
              >
                Créer un Compte Gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Roomivo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Le premier pas vers l'installation
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => navigate("/privacy")}
                    className="hover:text-primary transition-colors"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/terms")}
                    className="hover:text-primary transition-colors"
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Roomivo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
