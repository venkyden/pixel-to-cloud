import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          {language === "fr" ? "Page non trouvée" : "Page not found"}
        </p>
        <Button onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2" />
          {language === "fr" ? "Retour à l'accueil" : "Return to Home"}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
