import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  deposit_amount?: number;
  status: string;
  created_at: string;
  payment_date?: string;
  description?: string;
  currency: string;
  property?: {
    name: string;
    location: string;
  };
}

export default function PaymentHistory() {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user, role]);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Fetch regular payments
      const paymentsQuery = supabase
        .from("payments")
        .select(`
          *,
          property:properties(name, location)
        `)
        .order("created_at", { ascending: false });

      if (role === "tenant") {
        paymentsQuery.eq("tenant_id", user?.id);
      } else if (role === "landlord") {
        paymentsQuery.eq("property.owner_id", user?.id);
      }

      const { data: paymentsData, error: paymentsError } = await paymentsQuery;

      // Fetch escrow payments
      const escrowQuery = supabase
        .from("escrow_payments")
        .select(`
          *,
          property:properties(name, location)
        `)
        .order("created_at", { ascending: false });

      if (role === "tenant") {
        escrowQuery.eq("tenant_id", user?.id);
      } else if (role === "landlord") {
        escrowQuery.eq("landlord_id", user?.id);
      }

      const { data: escrowData, error: escrowError } = await escrowQuery;

      if (paymentsError) throw paymentsError;
      if (escrowError) throw escrowError;

      const allPayments = [
        ...(paymentsData || []).map(p => ({
          ...p,
          type: "rent"
        })),
        ...(escrowData || []).map(p => ({
          ...p,
          type: "escrow",
          description: "Escrow Payment (First Month + Deposit)"
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPayments(allPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string, amount: number) => {
    if (!confirm(`Are you sure you want to refund ${amount}€?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke("process-refund", {
        body: { paymentId, amount },
      });

      if (error) throw error;

      toast.success("Refund processed successfully");
      fetchPayments();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      succeeded: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.property?.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("payment_history")}</h1>
              <p className="text-muted-foreground">View all your payment transactions</p>
            </div>
            <Button onClick={fetchPayments} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by property..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No payments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <Card key={payment.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{payment.property?.name}</h3>
                              {getStatusBadge(payment.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payment.property?.location}
                            </p>
                            {payment.description && (
                              <p className="text-sm text-muted-foreground">{payment.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.created_at), "PPP")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {payment.amount + (payment.deposit_amount || 0)} {payment.currency}
                              </p>
                              {payment.deposit_amount && (
                                <p className="text-sm text-muted-foreground">
                                  Rent: {payment.amount}€ + Deposit: {payment.deposit_amount}€
                                </p>
                              )}
                            </div>
                            {role === "landlord" && payment.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRefund(payment.id, payment.amount + (payment.deposit_amount || 0))}
                              >
                                Process Refund
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
