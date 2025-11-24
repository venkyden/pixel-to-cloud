import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const refundSchema = z.object({
  contractId: z.string().uuid("Invalid contract ID"),
  deductions: z.number()
    .min(0, "Deductions cannot be negative")
    .max(10000, "Deductions exceed maximum")
    .finite("Deductions must be a valid number")
    .optional()
    .default(0),
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Validate input
    const body = await req.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { contractId, deductions, reason } = validation.data;

    // Verify user is landlord
    const { data: contract, error: contractError } = await supabaseClient
      .from("contracts")
      .select("*, escrow:escrow_payments!application_id(*)")
      .eq("id", contractId)
      .eq("landlord_id", user.id)
      .single();

    if (contractError || !contract) {
      throw new Error("Contract not found or access denied");
    }

    if (contract.status !== "active") {
      throw new Error("Contract must be active to process refund");
    }

    // Find the escrow payment
    const escrow = Array.isArray(contract.escrow) ? contract.escrow[0] : null;
    if (!escrow || escrow.status !== "held") {
      throw new Error("No escrow payment found or already released");
    }

    // Calculate refund amount
    const depositAmount = contract.deposit_amount;
    const refundAmount = Math.max(0, depositAmount - deductions);

    console.log(`Processing deposit refund: €${refundAmount} (deductions: €${deductions})`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get the payment intent from escrow
    if (!escrow.stripe_payment_intent_id) {
      throw new Error("No payment intent found for escrow");
    }

    // Process refund if amount > 0
    let refund = null;
    if (refundAmount > 0) {
      refund = await stripe.refunds.create({
        payment_intent: escrow.stripe_payment_intent_id,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: "requested_by_customer",
      });

      console.log("Refund created:", refund.id);
    }

    // Update escrow status
    const { error: updateError } = await supabaseClient
      .from("escrow_payments")
      .update({
        status: "released",
        escrow_released_at: new Date().toISOString(),
      })
      .eq("id", escrow.id);

    if (updateError) throw updateError;

    // Update contract status
    await supabaseClient
      .from("contracts")
      .update({ status: "completed" })
      .eq("id", contractId);

    // Create audit log
    await supabaseClient.from("audit_logs").insert({
      user_id: user.id,
      action: "deposit_refund_processed",
      table_name: "escrow_payments",
      record_id: escrow.id,
    });

    // Notify tenant
    await supabaseClient.from("notifications").insert({
      user_id: contract.tenant_id,
      title: "Deposit Refund Processed",
      message: `Your deposit refund of €${refundAmount.toFixed(2)} has been processed. ${deductions > 0 ? `Deductions: €${deductions.toFixed(2)}. Reason: ${reason}` : ""
        }`,
      type: deductions > 0 ? "warning" : "success",
    });

    // Send email notification
    try {
      await supabaseClient.functions.invoke("send-notification-email", {
        body: {
          to: user.email,
          subject: "Deposit Refund Processed - Roomivo",
          type: "deposit_refund",
          data: {
            refundAmount,
            deductions,
            reason,
            contractId,
          },
        },
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Don't fail the whole operation if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        refundAmount,
        deductions,
        stripeRefundId: refund?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error processing deposit refund:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
