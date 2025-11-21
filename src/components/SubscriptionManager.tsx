import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  icon: any;
  popular?: boolean;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    currency: "EUR",
    interval: "month",
    icon: Building2,
    features: SUBSCRIPTION_TIERS.basic.features,
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    currency: "EUR",
    interval: "month",
    icon: Zap,
    popular: true,
    features: SUBSCRIPTION_TIERS.pro.features,
  },
  {
    id: "premium",
    name: "Premium",
    price: 149,
    currency: "EUR",
    interval: "month",
    icon: Crown,
    features: SUBSCRIPTION_TIERS.premium.features,
  },
];

export const SubscriptionManager = () => {
  const { user, role } = useAuth();
  const { tier, subscribed, loading: subLoading, refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    if (role !== "landlord") {
      toast.error("Subscriptions are only available for landlords");
      return;
    }

    setLoading(true);
    try {
      const tierConfig = SUBSCRIPTION_TIERS[planId as keyof typeof SUBSCRIPTION_TIERS];
      if (!tierConfig) throw new Error("Invalid plan");

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: tierConfig.price_id },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    } catch (error: any) {
      console.error("Error subscribing:", error);
      toast.error(error.message || "Failed to process subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Opening subscription management...");
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      toast.error(error.message || "Failed to access subscription management");
    } finally {
      setLoading(false);
    }
  };

  if (role !== "landlord") {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Subscriptions are only available for landlords
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Scale your property management business with the right plan
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = tier === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : ""
              } ${isCurrentPlan ? "border-success" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-success">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? "Free" : `€${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">
                        /{plan.interval}
                      </span>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                    disabled={loading}
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {loading ? "Processing..." : "Subscribe"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">💳 Payment & Billing</p>
            <ul className="space-y-1 ml-4">
              <li>• All plans include secure Stripe payment processing</li>
              <li>• Cancel anytime with no long-term commitment</li>
              <li>• Prices exclude applicable VAT</li>
              <li>• Enterprise plan includes custom pricing for 50+ properties</li>
              <li>• Transaction fees apply to rent payments processed through the platform</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
