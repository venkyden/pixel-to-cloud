import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Home,
  Users,
  Wrench,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Euro
} from "lucide-react";
import { format } from "date-fns";
import { RentReceipt } from "./RentReceipt";
import { EndOfLeaseDocument } from "./EndOfLeaseDocument";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  rooms: number;
  images: string[];
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  user_id: string;
  property_id: string;
  income: number | null;
  profession: string | null;
  move_in_date: string | null;
  match_score: number | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  properties: {
    name: string;
    price: number;
  } | null;
}

interface Incident {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  property_id: string;
  properties: {
    name: string;
  } | null;
}

export const LandlordDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user?.id);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Fetch applications for landlord's properties
      const propertyIds = propertiesData?.map((p) => p.id) || [];
      if (propertyIds.length > 0) {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("tenant_applications")
          .select("*")
          .in("property_id", propertyIds)
          .order("created_at", { ascending: false });

        if (applicationsError) throw applicationsError;

        // Fetch property and profile data for each application
        const enrichedApplications = await Promise.all(
          (applicationsData || []).map(async (app) => {
            const [profileRes, propertyRes] = await Promise.all([
              supabase.from("profiles").select("first_name, last_name, email").eq("id", app.user_id).single(),
              supabase.from("properties").select("name, price").eq("id", app.property_id).single()
            ]);

            return {
              ...app,
              profiles: profileRes.data,
              properties: propertyRes.data
            };
          })
        );

        setApplications(enrichedApplications);

        // Fetch incidents
        const { data: incidentsData, error: incidentsError } = await supabase
          .from("incidents")
          .select("*")
          .in("property_id", propertyIds)
          .order("created_at", { ascending: false })
          .limit(10);

        if (incidentsError) throw incidentsError;

        // Fetch property data for incidents
        const enrichedIncidents = await Promise.all(
          (incidentsData || []).map(async (incident) => {
            const { data: propertyData } = await supabase
              .from("properties")
              .select("name")
              .eq("id", incident.property_id)
              .single();

            return {
              ...incident,
              properties: propertyData
            };
          })
        );

        setIncidents(enrichedIncidents);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from("tenant_applications")
        .update({ status: "approved" })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success("Application approved!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Failed to approve application");
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from("tenant_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success("Application rejected");
      fetchDashboardData();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "expired":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const stats = {
    totalProperties: properties.length,
    pendingApplications: applications.filter((a) => a.status === "pending").length,
    openIncidents: incidents.filter((i) => i.status === "open").length,
    monthlyRevenue: properties.reduce((sum, p) => sum + Number(p.price), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Properties</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalProperties}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Applications</p>
              <p className="text-2xl font-bold text-foreground">{stats.pendingApplications}</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Incidents</p>
              <p className="text-2xl font-bold text-foreground">{stats.openIncidents}</p>
            </div>
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <Wrench className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold text-foreground">€{stats.monthlyRevenue}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Euro className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">
            <Users className="mr-2 h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="properties">
            <Home className="mr-2 h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="mr-2 h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No applications yet</p>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {application.profiles?.first_name || "Unknown"} {application.profiles?.last_name || ""}
                      </h3>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                      {application.match_score && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {application.match_score}% Match
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Property: {application.properties?.name || "Unknown"} (€{application.properties?.price || 0}/month)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {application.profession || "Unknown"} • €{application.income || 0}/month
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Applied: {format(new Date(application.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                  {application.expires_at && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Expires: {format(new Date(application.expires_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                  {application.move_in_date && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Move-in: {format(new Date(application.move_in_date), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                {application.status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproveApplication(application.id)}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectApplication(application.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => navigate(`/messages?user=${application.user_id}`)}
                      variant="outline"
                    >
                      Message
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          {properties.length === 0 ? (
            <Card className="p-12 text-center">
              <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No properties listed yet</p>
              <Button onClick={() => navigate("/landlord")}>
                Add First Property
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  {property.images?.[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{property.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">€{property.price}/month</span>
                      <span className="text-sm text-muted-foreground">{property.rooms} rooms</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          {incidents.length === 0 ? (
            <Card className="p-12 text-center">
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No maintenance requests</p>
            </Card>
          ) : (
            incidents.map((incident) => (
              <Card key={incident.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{incident.title}</h3>
                      <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Property: {incident.properties?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reported: {format(new Date(incident.created_at), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <Button onClick={() => navigate(`/incidents?id=${incident.id}`)}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <RentReceipt />
            <EndOfLeaseDocument />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
