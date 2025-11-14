import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

interface PaymentStatusTrackerProps {
  paymentId: string;
  type: "payment" | "escrow";
}

export function PaymentStatusTracker({ paymentId, type }: PaymentStatusTrackerProps) {
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`payment-${paymentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: type === "escrow" ? "escrow_payments" : "payments",
          filter: `id=eq.${paymentId}`,
        },
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId, type]);

  const fetchPaymentStatus = async () => {
    try {
      const table = type === "escrow" ? "escrow_payments" : "payments";
      const { data, error } = await supabase
        .from(table)
        .select("status")
        .eq("id", paymentId)
        .single();

      if (error) throw error;
      setStatus(data.status);
    } catch (error) {
      console.error("Error fetching payment status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
      case "succeeded":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "refunded":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProgress = () => {
    switch (status) {
      case "completed":
      case "succeeded":
        return 100;
      case "pending":
        return 50;
      case "failed":
      case "refunded":
        return 0;
      default:
        return 0;
    }
  };

  const getStatusBadge = () => {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Status:</span>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {status === "pending" && (
          <p className="text-sm text-muted-foreground">
            Your payment is being processed. This usually takes a few moments.
          </p>
        )}
        
        {status === "failed" && (
          <p className="text-sm text-destructive">
            Payment failed. Please try again or contact support.
          </p>
        )}
        
        {(status === "completed" || status === "succeeded") && (
          <p className="text-sm text-green-600">
            Payment completed successfully!
          </p>
        )}
        
        {status === "refunded" && (
          <p className="text-sm text-blue-600">
            This payment has been refunded.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
