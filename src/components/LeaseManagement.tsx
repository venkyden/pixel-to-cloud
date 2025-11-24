import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Calendar,
  Euro,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Home,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, differenceInDays, addMonths } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface LeaseManagementProps {
  userRole: "landlord" | "tenant";
}

interface Lease {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  monthly_rent: number;
  tenant_id: string;
  property_id: string;
  duration_months: number;
  [key: string]: unknown;
}

export const LeaseManagement = ({ userRole }: LeaseManagementProps) => {
  const { user } = useAuth();
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeases();
  }, [user, userRole]);

  const fetchLeases = async () => {
    if (!user) return;

    try {
      const query = supabase
        .from("contracts")
        .select(
          `
          *,
          property:properties(name, location),
          landlord:profiles!landlord_id(first_name, last_name),
          tenant:profiles!tenant_id(first_name, last_name)
        `
        )
        .eq("status", "active");

      if (userRole === "landlord") {
        query.eq("landlord_id", user.id);
      } else {
        query.eq("tenant_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeases(data || []);
    } catch (error) {
      console.error("Error fetching leases:", error);
      toast.error("Failed to load leases");
    } finally {
      setLoading(false);
    }
  };

  const getLeaseStatus = (lease: Lease) => {
    const startDate = new Date(lease.start_date);
    const endDate = lease.end_date ? new Date(lease.end_date) : null;
    const today = new Date();

    if (today < startDate) {
      return { status: "upcoming", color: "bg-blue-500", label: "Upcoming" };
    }

    if (!endDate) {
      return { status: "active", color: "bg-green-500", label: "Active" };
    }

    const daysRemaining = differenceInDays(endDate, today);

    if (daysRemaining < 0) {
      return { status: "expired", color: "bg-red-500", label: "Expired" };
    }

    if (daysRemaining <= 30) {
      return { status: "expiring", color: "bg-yellow-500", label: "Expiring Soon" };
    }

    return { status: "active", color: "bg-green-500", label: "Active" };
  };

  const calculateProgress = (lease: Lease) => {
    const startDate = new Date(lease.start_date);
    const endDate = lease.end_date
      ? new Date(lease.end_date)
      : addMonths(startDate, lease.duration_months || 12);
    const today = new Date();

    const totalDays = differenceInDays(endDate, startDate);
    const elapsedDays = differenceInDays(today, startDate);

    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading leases...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Leases</CardTitle>
          <CardDescription>
            {userRole === "landlord"
              ? "Manage your active rental agreements"
              : "Your current rental agreements"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Home className="h-4 w-4" />
            <AlertDescription>
              No active leases found. {userRole === "landlord" ? "Start by listing a property." : "Apply for properties to get started."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Leases</h2>
          <p className="text-muted-foreground">
            {leases.length} active {leases.length === 1 ? "lease" : "leases"}
          </p>
        </div>
      </div>

      {leases.map((lease) => {
        const status = getLeaseStatus(lease);
        const progress = calculateProgress(lease);
        const startDate = new Date(lease.start_date);
        const endDate = lease.end_date ? new Date(lease.end_date) : null;
        const daysRemaining = endDate ? differenceInDays(endDate, new Date()) : null;

        return (
          <Card key={lease.id} className="shadow-elegant">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    {lease.property?.name || "Property"}
                  </CardTitle>
                  <CardDescription>{lease.property?.location}</CardDescription>
                </div>
                <Badge className={`${status.color} text-white`}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lease Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Lease Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">
                      {format(startDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium">
                      {endDate ? format(endDate, "MMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Euro className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Rent</p>
                    <p className="text-sm font-medium">€{lease.monthly_rent}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Euro className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deposit</p>
                    <p className="text-sm font-medium">€{lease.deposit_amount}</p>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {userRole === "landlord" ? "Tenant" : "Landlord"}
                    </p>
                    <p className="text-sm font-medium">
                      {userRole === "landlord"
                        ? `${lease.tenant?.first_name} ${lease.tenant?.last_name}`
                        : `${lease.landlord?.first_name} ${lease.landlord?.last_name}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contract Type</p>
                    <p className="text-sm font-medium capitalize">{lease.contract_type}</p>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  {lease.landlord_signed_at ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Clock className="w-4 h-4 text-warning" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Landlord Signature</p>
                    <p className="text-sm font-medium">
                      {lease.landlord_signed_at
                        ? format(new Date(lease.landlord_signed_at), "MMM d, yyyy")
                        : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lease.tenant_signed_at ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Clock className="w-4 h-4 text-warning" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Tenant Signature</p>
                    <p className="text-sm font-medium">
                      {lease.tenant_signed_at
                        ? format(new Date(lease.tenant_signed_at), "MMM d, yyyy")
                        : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Lease expiring in {daysRemaining} days!</strong>
                    <br />
                    Contact {userRole === "landlord" ? "your tenant" : "your landlord"} to discuss renewal or termination.
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  View Contract
                </Button>
                {userRole === "landlord" && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Inspection
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
