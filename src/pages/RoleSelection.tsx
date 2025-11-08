import { useNavigate } from "react-router-dom";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">Roomivo</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 text-foreground">
              Welcome to Roomivo
            </h2>
            <p className="text-2xl text-primary font-semibold mb-2">
              Transparent Rentals, Zero Disputes
            </p>
            <p className="text-lg text-muted-foreground mt-4">
              Find Your Perfect Home or Tenant in Minutes, Not Days
            </p>
            
            <div className="flex items-center justify-center gap-6 mt-8 p-6 bg-accent/5 rounded-lg border border-accent/20 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Traditional Search</p>
                <p className="text-3xl font-bold text-foreground">40 hours</p>
              </div>
              <ArrowRight className="w-8 h-8 text-primary" />
              <div className="text-center">
                <p className="text-sm text-primary mb-1">With Roomivo</p>
                <p className="text-3xl font-bold text-primary">15 minutes</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <RoleCard
              icon="👤"
              title="Find Your Home"
              description="Find your perfect home with AI-powered matching"
              benefits={[
                "Smart property matching",
                "Legal contract audit",
                "Secure escrow payments",
                "Verified landlords"
              ]}
              onClick={() => navigate('/tenant')}
            />
            <RoleCard
              icon="🏠"
              title="Find Tenants"
              description="Find quality tenants faster with parallel processing"
              benefits={[
                "AI tenant matching",
                "Parallel application review",
                "Automated compliance",
                "Verified tenants"
              ]}
              onClick={() => navigate('/landlord')}
            />
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/incidents')}
              className="gap-2"
            >
              <Shield className="w-5 h-5" />
              View Transparency Dashboard
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Roomivo - Transparent Rentals, Zero Disputes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;
