import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, User, LogOut, Menu, X } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Roomivo</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/properties" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("header.properties")}
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("header.dashboard")}
          </Link>
          <Link to="/incidents" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("header.incidents")}
          </Link>
          <Link to="/messages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("header.messages")}
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <NotificationBell />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                {t("header.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                {t("header.dashboard")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("header.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col space-y-3">
            <Link to="/properties" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("header.properties")}
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("header.dashboard")}
            </Link>
            <Link to="/incidents" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("header.incidents")}
            </Link>
            <Link to="/messages" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("header.messages")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
