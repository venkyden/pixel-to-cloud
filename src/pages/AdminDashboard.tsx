import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Home,
  FileText,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Shield,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLandlords: 0,
    totalTenants: 0,
    totalProperties: 0,
    totalApplications: 0,
    activeContracts: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    incidents: 0,
    averageRating: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role !== "admin") {
        navigate("/");
        return;
      }

      await fetchDashboardData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch user counts
      const { data: landlords } = await supabase
        .from("user_roles")
        .select("user_id", { count: "exact" })
        .eq("role", "landlord");

      const { data: tenants } = await supabase
        .from("user_roles")
        .select("user_id", { count: "exact" })
        .eq("role", "tenant");

      // Fetch properties
      const { data: properties } = await supabase
        .from("properties")
        .select("id", { count: "exact" });

      // Fetch applications
      const { data: applications } = await supabase
        .from("tenant_applications")
        .select("id", { count: "exact" });

      // Fetch active contracts
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id", { count: "exact" })
        .eq("status", "active");

      // Fetch pending verifications
      const { data: verifications } = await supabase
        .from("landlord_verifications")
        .select("id", { count: "exact" })
        .eq("status", "pending");

      // Fetch incidents
      const { data: incidents } = await supabase
        .from("incidents")
        .select("id", { count: "exact" })
        .in("status", ["open", "investigating"]);

      // Fetch average rating
      const { data: ratings } = await supabase.from("ratings").select("rating");
      const avgRating =
        ratings && ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      // Fetch recent audit logs
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setStats({
        totalUsers: (landlords?.length || 0) + (tenants?.length || 0),
        totalLandlords: landlords?.length || 0,
        totalTenants: tenants?.length || 0,
        totalProperties: properties?.length || 0,
        totalApplications: applications?.length || 0,
        activeContracts: contracts?.length || 0,
        totalRevenue: 0, // Calculate from payments
        pendingVerifications: verifications?.length || 0,
        incidents: incidents?.length || 0,
        averageRating: avgRating,
      });

      setRecentActivities(logs || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2">
            Admin Dashboard
          </Badge>
          <h1 className="text-4xl font-bold mb-2">Platform Overview</h1>
          <p className="text-muted-foreground">
            Monitor and manage the Roomivo platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalLandlords} landlords, {stats.totalTenants} tenants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">Listed properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalApplications} applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}★
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.incidents} open incidents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="verifications">
              <Shield className="w-4 h-4 mr-2" />
              Verifications
              {stats.pendingVerifications > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingVerifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Incidents
              {stats.incidents > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.incidents}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="verifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
                <CardDescription>
                  Review and approve landlord verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {stats.pendingVerifications} verifications awaiting review
                </p>
                <Button className="mt-4" onClick={() => navigate("/landlord")}>
                  Review Verifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Incidents</CardTitle>
                <CardDescription>
                  Active incidents requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {stats.incidents} incidents currently open
                </p>
                <Button className="mt-4" onClick={() => navigate("/incidents")}>
                  View All Incidents
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All-time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Transaction Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€0.00</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Active subscriptions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest audit logs from the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.table_name} • {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{activity.user_id ? "User" : "System"}</Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
