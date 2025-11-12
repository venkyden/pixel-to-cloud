import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Home, 
  Shield, 
  Zap, 
  CheckCircle, 
  Users, 
  FileCheck,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: t("landing.securePayment"),
      description: t("landing.securePaymentDesc")
    },
    {
      icon: FileCheck,
      title: t("landing.photoInspection"),
      description: t("landing.photoInspectionDesc")
    },
    {
      icon: CheckCircle,
      title: t("landing.idVerification"),
      description: t("landing.idVerificationDesc")
    },
    {
      icon: Zap,
      title: t("landing.smartAutomation"),
      description: t("landing.smartAutomationDesc")
    },
    {
      icon: Users,
      title: t("landing.simpleManagement"),
      description: t("landing.simpleManagementDesc")
    },
    {
      icon: Shield,
      title: t("landing.legalCompliance"),
      description: t("landing.legalComplianceDesc")
    }
  ];

  const stats = [
    { value: "100%", label: t("landing.statsCompliance") },
    { value: "48h", label: t("landing.statsSpeed") },
    { value: "0€", label: t("landing.statsNoFees") }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse floating" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("landing.title")}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:bg-muted/50 transition-all duration-300">
              {t("landing.login")}
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg">
              {t("landing.getStarted")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4 relative">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full glass-effect mb-4">
              <span className="text-sm font-medium text-primary">✨ The Future of Rental Management</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
              {t("landing.title")}
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                {t("landing.tagline")}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("landing.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              className="text-lg h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-elegant hover:shadow-lg hover:scale-105"
              onClick={() => navigate("/auth")}
            >
              {t("landing.startFree")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8 glass-effect hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/auth")}
            >
              {t("landing.howItWorks")}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="glass-effect p-6 rounded-2xl space-y-2 animate-fade-in hover:scale-105 transition-all duration-300 shadow-md hover:shadow-elegant"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto space-y-12">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full glass-effect mb-2">
              <span className="text-sm font-medium text-primary">💎 Premium Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 space-y-4 cursor-pointer transition-all duration-300 hover:shadow-elegant animate-fade-in group glass-effect hover:scale-105 border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 shadow-md">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <Card className="p-12 md:p-16 text-center space-y-8 glass-effect border-primary/20 shadow-elegant relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 animate-gradient" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {t("landing.ctaTitle")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("landing.ctaSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button 
                  size="lg" 
                  className="text-lg h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-elegant hover:shadow-lg hover:scale-105"
                  onClick={() => navigate("/auth")}
                >
                  {t("landing.createAccount")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-xl bg-background/70 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">{t("landing.title")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("landing.footerTagline")}
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">{t("landing.footerProduct")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerFeatures")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerPricing")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerSecurity")}</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">{t("landing.footerCompany")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerAbout")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerBlog")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("landing.footerCareers")}</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">{t("landing.footerLegal")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => navigate("/privacy")}
                    className="hover:text-primary transition-colors"
                  >
                    {t("landing.footerPrivacy")}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/terms")}
                    className="hover:text-primary transition-colors"
                  >
                    {t("landing.footerTerms")}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {t("landing.title")}. {t("landing.footerRights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
