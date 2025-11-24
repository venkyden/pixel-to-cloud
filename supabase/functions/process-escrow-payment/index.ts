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

  const rateLimit = checkRateLimit(req, { maxRequests: 5, windowMs: 60000, message: 'Too many escrow payment requests' });
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

    const escrowSchema = z.object({
      applicationId: z.string().uuid("Invalid application ID"),
      amount: z.number()
        .positive("Amount must be positive")
        .max(50000, "Amount exceeds maximum (€50,000)")
        .finite("Amount must be a valid number"),
      depositAmount: z.number()
        .positive("Deposit must be positive")
        .max(50000, "Deposit exceeds maximum (€50,000)")
        .finite("Deposit must be a valid number")
    });

    const body = await req.json();
    const validation = escrowSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { applicationId, amount, depositAmount } = validation.data;
    const totalAmount = amount + depositAmount;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }

    // Get application and property details
    const { data: application, error: appError } = await supabaseClient
      .from("tenant_applications")
      .select("property_id")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    const { data: property, error: propError } = await supabaseClient
      .from("properties")
      .select("owner_id, name")
      .eq("id", application.property_id)
      .single();

    if (propError || !property) {
      throw new Error("Property not found");
    }

    // Create checkout session for escrow
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Paiement de séquestre - ${property.name}`,
              description: `Premier mois de loyer (${amount}€) + Dépôt de garantie (${depositAmount}€)`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/tenant?payment=success`,
      cancel_url: `${req.headers.get("origin")}/tenant?payment=cancelled`,
      metadata: {
        applicationId,
        type: "escrow",
        amount: amount.toString(),
        depositAmount: depositAmount.toString(),
      },
    });

    // Create escrow payment record
    await supabaseClient.from("escrow_payments").insert({
      application_id: applicationId,
      tenant_id: user.id,
      landlord_id: property.owner_id,
      property_id: application.property_id,
      amount,
      deposit_amount: depositAmount,
      stripe_payment_intent_id: session.id,
      status: "pending",
    });

    return new Response(
      JSON.stringify({
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return handleError(error, 'PROCESS-ESCROW-PAYMENT');
  }
});
