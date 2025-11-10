import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookie-consent", "rejected");
    // Clear any existing cookies except essential ones
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      if (name !== "sidebar:state") {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-4xl mx-auto p-6 shadow-lg border-2">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              Protection de vos données
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nous utilisons des cookies essentiels pour assurer le bon fonctionnement de notre plateforme. 
              Conformément au RGPD et à la législation française, nous respectons votre vie privée. 
              Nous ne stockons que les cookies nécessaires à l'authentification et aux préférences de l'interface.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={acceptCookies} size="sm">
                Accepter les cookies essentiels
              </Button>
              <Button onClick={rejectCookies} variant="outline" size="sm">
                Refuser les cookies non-essentiels
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open("/privacy", "_blank")}
              >
                En savoir plus
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBanner(false)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
