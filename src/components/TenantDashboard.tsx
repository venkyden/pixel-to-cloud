import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { RentReceipt } from "./RentReceipt";
import { EndOfLeaseDocument } from "./EndOfLeaseDocument";

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
  const { t } = useLanguage();
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
      toast.error(t("tenantDashboard.loading"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: "outline", icon: Clock, label: t("tenantDashboard.status.pending") },
      approved: { variant: "default", icon: CheckCircle2, label: t("tenantDashboard.status.approved") },
      rejected: { variant: "destructive", icon: AlertCircle, label: t("tenantDashboard.status.rejected") }
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
    <Card className="mb-6 glass-effect border-border/50 shadow-elegant overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          {t("tenantDashboard.quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="outline" className="justify-start h-auto py-3 glass-effect border-border/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 shadow-md" onClick={() => setActiveTab("search")}>
            <Search className="w-4 h-4 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium text-sm">{t("tenantDashboard.search")}</p>
              <p className="text-xs text-muted-foreground">{t("tenantDashboard.newProperties")}</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-3 glass-effect border-border/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 shadow-md" onClick={() => setActiveTab("applications")}>
            <FileText className="w-4 h-4 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium text-sm">{t("tenantDashboard.applications")}</p>
              <p className="text-xs text-muted-foreground">{applications.length} {t("tenantDashboard.inProgress")}</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-3 glass-effect border-border/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 shadow-md" onClick={() => setActiveTab("messages")}>
            <MessageSquare className="w-4 h-4 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium text-sm">{t("tenantDashboard.messages")}</p>
              <p className="text-xs text-muted-foreground">0 {t("tenantDashboard.newMessages")}</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-3 glass-effect border-border/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 shadow-md" onClick={() => setActiveTab("inspection")}>
            <Upload className="w-4 h-4 mr-2 text-primary" />
            <div className="text-left">
              <p className="font-medium text-sm">{t("tenantDashboard.inspection")}</p>
              <p className="text-xs text-muted-foreground">{t("tenantDashboard.photosRequired")}</p>
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
                    {t("tenantDashboard.pendingApplications")}
                  </CardTitle>
                  <CardDescription>{t("tenantDashboard.responseTime")}</CardDescription>
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
                      <p className="text-sm font-medium text-primary mt-1">{app.property.price}€{t("tenantDashboard.perMonth")}</p>
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
                    {t("tenantDashboard.applicationAccepted")}
                  </CardTitle>
                  <CardDescription>{t("tenantDashboard.nextSteps")}</CardDescription>
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
                        <p className="text-sm font-medium text-primary mt-1">{app.property.price}€{t("tenantDashboard.perMonth")}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Euro className="w-4 h-4 mr-2" />
                        {t("tenantDashboard.payDeposit")}
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setActiveTab("inspection")}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {t("tenantDashboard.inspection")}
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
              <h3 className="text-lg font-semibold mb-2">{t("tenantDashboard.noApplications")}</h3>
              <p className="text-muted-foreground mb-4">{t("tenantDashboard.startSearching")}</p>
              <Button onClick={() => setActiveTab("search")}>
                <Search className="w-4 h-4 mr-2" />
                {t("tenantDashboard.searchProperty")}
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
        <CardTitle>{t("tenantDashboard.myApplications")}</CardTitle>
        <CardDescription>{t("tenantDashboard.applicationHistory")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">{t("tenantDashboard.loading")}</p>
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
                  <p className="font-medium text-primary">{app.property.price}€{t("tenantDashboard.perMonth")}</p>
                  <p className="text-muted-foreground">
                    {new Date(app.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">{t("tenantDashboard.noApplications")}</p>
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
            <h3 className="text-lg font-semibold mb-2">{t("tenantDashboard.noAcceptedProperty")}</h3>
            <p className="text-muted-foreground">
              {t("tenantDashboard.inspectionAvailable")}
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
          <h2 className="text-3xl font-bold text-foreground">{t("tenantDashboard.title")}</h2>
          <p className="text-muted-foreground">{t("tenantDashboard.subtitle")}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t("tenantDashboard.overview")}</TabsTrigger>
          <TabsTrigger value="applications">{t("tenantDashboard.applications")}</TabsTrigger>
          <TabsTrigger value="inspection">{t("tenantDashboard.inspection")}</TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            {t("documents.title")}
          </TabsTrigger>
          <TabsTrigger value="messages">{t("tenantDashboard.messages")}</TabsTrigger>
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

        <TabsContent value="documents" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <RentReceipt />
            <EndOfLeaseDocument />
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("tenantDashboard.messages")}</CardTitle>
              <CardDescription>{t("tenantDashboard.applicationHistory")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">{t("tenantDashboard.noApplications")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
