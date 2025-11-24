import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
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

  // ✅ SECURITY FIX: Rate limiting (5 requests/minute for admin operation)
  const rateLimit = checkRateLimit(req, {
    maxRequests: 5,
    windowMs: 60000,
    message: 'Too many rent collection requests',
  });

  if (!rateLimit.allowed) {
    return rateLimit.response!;
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has admin role
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get all active rent schedules due today
    const today = new Date();
    const { data: schedules, error } = await supabaseClient
      .from("rent_schedules")
      .select("*")
      .eq("active", true)
      .lte("next_collection_date", today.toISOString());

    if (error) throw error;

    console.log(`Found ${schedules?.length || 0} rent schedules to process`);

    const results = [];

    for (const schedule of schedules || []) {
      try {
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(schedule.amount * 100),
          currency: schedule.currency.toLowerCase(),
          customer: schedule.stripe_customer_id,
          payment_method: schedule.stripe_payment_method_id,
          off_session: true,
          confirm: true,
          metadata: {
            scheduleId: schedule.id,
            propertyId: schedule.property_id,
            tenantId: schedule.tenant_id,
          },
        });

        // Record payment
        await supabaseClient.from("payments").insert({
          property_id: schedule.property_id,
          tenant_id: schedule.tenant_id,
          amount: schedule.amount,
          currency: schedule.currency,
          status: "completed",
          payment_date: new Date().toISOString(),
          description: `Loyer automatique - ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
          stripe_payment_intent_id: paymentIntent.id,
          auto_collect: true,
        });

        // Calculate next collection date
        const nextDate = new Date(today);
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(schedule.day_of_month);

        // Update schedule
        await supabaseClient
          .from("rent_schedules")
          .update({
            last_collection_date: today.toISOString(),
            next_collection_date: nextDate.toISOString(),
          })
          .eq("id", schedule.id);

        // Send notification
        const { data: profiles } = await supabaseClient
          .from("profiles")
          .select("email")
          .eq("id", schedule.tenant_id)
          .single();

        if (profiles?.email) {
          await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              to: profiles.email,
              subject: "Paiement de loyer effectué",
              type: "payment_received",
              data: {
                amount: schedule.amount,
                description: `Loyer automatique - ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
                date: today.toISOString(),
              },
            }),
          });
        }

        results.push({ scheduleId: schedule.id, status: "success" });
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({ scheduleId: schedule.id, status: "error", error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // ✅ SECURITY FIX: Use generic error handler
    return handleError(error, 'COLLECT-RENT');
  }
});

