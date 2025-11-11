import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Calendar, 
  Euro,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Upload
} from "lucide-react";
import { EtatDesLieux } from "./EtatDesLieux";

interface Application {
  id: string;
  property_id: string;
  status: string;
  created_at: string;
  property: {
    name: string;
    location: string;
    price: number;
    images: string[];
  };
}

export const TenantDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tenant_applications")
        .select(`
          *,
          property:properties(name, location, price, images)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: "outline", icon: Clock, label: "En attente" },
      approved: { variant: "default", icon: CheckCircle2, label: "Acceptée" },
      rejected: { variant: "destructive", icon: AlertCircle, label: "Refusée" }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const QuickActions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="outline" className="justify-start h-auto py-3" onClick={() => setActiveTab("search")}>
            <Search className="w-4 h-4 mr-2" />
            <div className="text-left">
              <p className="font-medium text-sm">Chercher</p>
              <p className="text-xs text-muted-foreground">Nouveaux biens</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-3" onClick={() => setActiveTab("applications")}>
            <FileText className="w-4 h-4 mr-2" />
            <div className="text-left">
              <p className="font-medium text-sm">Candidatures</p>
              <p className="text-xs text-muted-foreground">{applications.length} en cours</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-3" onClick={() => setActiveTab("messages")}>
            <MessageSquare className="w-4 h-4 mr-2" />
            <div className="text-left">
              <p className="font-medium text-sm">Messages</p>
              <p className="text-xs text-muted-foreground">0 nouveaux</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-3" onClick={() => setActiveTab("inspection")}>
            <Upload className="w-4 h-4 mr-2" />
            <div className="text-left">
              <p className="font-medium text-sm">État des Lieux</p>
              <p className="text-xs text-muted-foreground">Photos requis</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const OverviewTab = () => {
    const pendingApplications = applications.filter(a => a.status === "pending");
    const approvedApplications = applications.filter(a => a.status === "approved");

    return (
      <div className="space-y-6">
        <QuickActions />

        {pendingApplications.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    Candidatures en Attente
                  </CardTitle>
                  <CardDescription>Réponse sous 7 jours maximum</CardDescription>
                </div>
                <Badge variant="outline">{pendingApplications.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApplications.map((app) => (
                <Card key={app.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{app.property.name}</h4>
                      <p className="text-sm text-muted-foreground">{app.property.location}</p>
                      <p className="text-sm font-medium text-primary mt-1">{app.property.price}€/mois</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {approvedApplications.length > 0 && (
          <Card className="border-success">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-5 h-5" />
                    Candidature Acceptée!
                  </CardTitle>
                  <CardDescription>Prochaine étape: Paiement et état des lieux</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvedApplications.map((app) => (
                <Card key={app.id} className="p-4 bg-success/5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{app.property.name}</h4>
                        <p className="text-sm text-muted-foreground">{app.property.location}</p>
                        <p className="text-sm font-medium text-primary mt-1">{app.property.price}€/mois</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Euro className="w-4 h-4 mr-2" />
                        Payer le Dépôt
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setActiveTab("inspection")}>
                        <Calendar className="w-4 h-4 mr-2" />
                        État des Lieux
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {applications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucune candidature</h3>
              <p className="text-muted-foreground mb-4">Commencez par chercher un logement</p>
              <Button onClick={() => setActiveTab("search")}>
                <Search className="w-4 h-4 mr-2" />
                Chercher un Logement
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const ApplicationsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Mes Candidatures</CardTitle>
        <CardDescription>Historique de toutes vos demandes de location</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Chargement...</p>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{app.property.name}</h4>
                    <p className="text-sm text-muted-foreground">{app.property.location}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-primary">{app.property.price}€/mois</p>
                  <p className="text-muted-foreground">
                    {new Date(app.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Aucune candidature</p>
        )}
      </CardContent>
    </Card>
  );

  const InspectionTab = () => {
    const approvedApp = applications.find(a => a.status === "approved");
    
    if (!approvedApp) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun logement accepté</h3>
            <p className="text-muted-foreground">
              L'état des lieux sera disponible après acceptation de votre candidature
            </p>
          </CardContent>
        </Card>
      );
    }

    return <EtatDesLieux propertyId={approvedApp.property_id} type="check-in" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Tableau de Bord Locataire</h2>
          <p className="text-muted-foreground">Gérez vos candidatures et démarches</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="applications">Candidatures</TabsTrigger>
          <TabsTrigger value="inspection">État des Lieux</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <ApplicationsTab />
        </TabsContent>

        <TabsContent value="inspection" className="mt-6">
          <InspectionTab />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Messagerie avec les propriétaires</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">Aucun message</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
