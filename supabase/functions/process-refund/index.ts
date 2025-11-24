import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { handleError } from "../_shared/errorHandler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rateLimit = checkRateLimit(req, { maxRequests: 5, windowMs: 60000, message: 'Too many refund requests' });
  if (!rateLimit.allowed) return rateLimit.response!;

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const refundSchema = z.object({
      paymentId: z.string().uuid("Invalid payment ID"),
      amount: z.number()
        .positive("Refund amount must be positive")
        .finite("Refund amount must be a valid number")
        .optional(),
      reason: z.enum(["duplicate", "fraudulent", "requested_by_customer"])
        .optional()
    });

    const body = await req.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { paymentId, amount, reason } = validation.data;

    // Verify user is landlord or admin
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasPermission = roles?.some(r => r.role === "landlord" || r.role === "admin");
    if (!hasPermission) {
      throw new Error("Unauthorized: Only landlords can process refunds");
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from("escrow_payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found");
    }

    // Verify landlord owns the property
    if (payment.landlord_id !== user.id && !roles?.some(r => r.role === "admin")) {
      throw new Error("Unauthorized: You don't own this property");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Verify refund amount doesn't exceed original payment
    const maxRefund = payment.amount + payment.deposit_amount;
    if (amount && amount > maxRefund) {
      throw new Error(`Refund amount (€${amount}) exceeds original payment (€${maxRefund})`);
    }

    // Process refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || "requested_by_customer",
    });

    // Update payment status
    await supabaseClient
      .from("escrow_payments")
      .update({ status: "refunded" })
      .eq("id", paymentId);

    // Notify tenant
    await supabaseClient.functions.invoke("create-notification", {
      body: {
        user_id: payment.tenant_id,
        title: "Refund Processed",
        message: `A refund of ${amount || payment.amount + payment.deposit_amount}€ has been processed`,
        type: "success",
        link: "/tenant",
      },
    });

    return new Response(
      JSON.stringify({ success: true, refund }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return handleError(error, 'PROCESS-REFUND');
  }
});
