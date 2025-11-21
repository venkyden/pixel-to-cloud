import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Subscription tiers with product IDs and features
export const SUBSCRIPTION_TIERS = {
  basic: {
    name: "Basic",
    price: 29,
    product_id: "prod_TSrR6CidrQfCNy",
    price_id: "price_1SVvj0B8rX2tcYNp6VGYNHcr",
    features: [
      "1-3 properties",
      "Core features",
      "Property listings",
      "Tenant applications",
      "Contracts & signatures",
      "Basic support",
    ],
    propertyLimit: 3,
  },
  pro: {
    name: "Pro",
    price: 79,
    product_id: "prod_TSrSQNvOxn2SEK",
    price_id: "price_1SVvjHB8rX2tcYNpKVadPZVO",
    features: [
      "4-10 properties",
      "All Basic features",
      "Priority support",
      "Advanced analytics",
      "Automated rent collection",
      "Mediation system",
    ],
    propertyLimit: 10,
  },
  premium: {
    name: "Premium",
    price: 149,
    product_id: "prod_TSrSzVgerwAWqr",
    price_id: "price_1SVvjbB8rX2tcYNp4Rf5XIed",
    features: [
      "Unlimited properties",
      "All Pro features",
      "White-glove support",
      "SMS notifications",
      "Custom integrations",
      "API access",
      "Dedicated account manager",
    ],
    propertyLimit: null,
  },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

interface SubscriptionContextType {
  subscribed: boolean;
  tier: SubscriptionTier | null;
  subscriptionEnd: string | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  canAddProperty: (currentCount: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscribed: false,
  tier: null,
  subscriptionEnd: null,
  loading: true,
  refreshSubscription: async () => {},
  hasFeature: () => false,
  canAddProperty: () => false,
});

export const useSubscription = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user || role !== "landlord") {
      setSubscribed(false);
      setTier(null);
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      setSubscribed(data.subscribed || false);
      setSubscriptionEnd(data.subscription_end || null);

      // Determine tier from product_id
      if (data.product_id) {
        const foundTier = Object.entries(SUBSCRIPTION_TIERS).find(
          ([_, config]) => config.product_id === data.product_id
        );
        setTier(foundTier ? (foundTier[0] as SubscriptionTier) : null);
      } else {
        setTier(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscribed(false);
      setTier(null);
      setSubscriptionEnd(null);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!tier) return false;
    
    // Premium has all features
    if (tier === "premium") return true;
    
    // Pro has mediation and analytics
    if (tier === "pro" && ["mediation", "analytics", "auto_rent"].includes(feature)) {
      return true;
    }
    
    // Basic has core features only
    return false;
  };

  const canAddProperty = (currentCount: number): boolean => {
    if (!tier) return currentCount < 1; // Free tier: 0 properties allowed
    
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    if (tierConfig.propertyLimit === null) return true; // Unlimited
    
    return currentCount < tierConfig.propertyLimit;
  };

  useEffect(() => {
    checkSubscription();

    // Refresh every 60 seconds
    const interval = setInterval(checkSubscription, 60000);

    return () => clearInterval(interval);
  }, [user, role]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscribed,
        tier,
        subscriptionEnd,
        loading,
        refreshSubscription: checkSubscription,
        hasFeature,
        canAddProperty,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}