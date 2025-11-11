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
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">{t("landing.title")}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              {t("landing.login")}
            </Button>
            <Button onClick={() => navigate("/auth")}>
              {t("landing.getStarted")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
              {t("landing.title")}
              <br />
              <span className="text-primary">{t("landing.tagline")}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg h-14 px-8"
              onClick={() => navigate("/auth")}
            >
              {t("landing.startFree")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8"
              onClick={() => navigate("/auth")}
            >
              {t("landing.howItWorks")}
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
              {t("landing.ctaTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8"
                onClick={() => navigate("/auth")}
              >
                {t("landing.createAccount")}
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
