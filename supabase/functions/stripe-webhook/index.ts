import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { handleError } from "../_shared/errorHandler.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No signature provided");
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === "escrow") {
          const { data: escrowPayment } = await supabaseClient
            .from("escrow_payments")
            .update({
              status: "completed",
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("application_id", session.metadata.applicationId)
            .select()
            .single();

          if (escrowPayment) {
            // Create notification for tenant
            await supabaseClient.functions.invoke("create-notification", {
              body: {
                user_id: escrowPayment.tenant_id,
                title: "Payment Successful",
                message: "Your escrow payment has been processed successfully",
                type: "success",
                link: "/tenant",
              },
            });

            // Create notification for landlord
            await supabaseClient.functions.invoke("create-notification", {
              body: {
                user_id: escrowPayment.landlord_id,
                title: "Payment Received",
                message: "Escrow payment has been received for your property",
                type: "success",
                link: "/landlord",
              },
            });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update payment status
        await supabaseClient
          .from("payments")
          .update({ status: "succeeded" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        console.log(`Payment intent ${paymentIntent.id} succeeded`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update payment status
        const { data: payment } = await supabaseClient
          .from("payments")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .select()
          .single();

        if (payment) {
          // Notify tenant of failed payment
          await supabaseClient.functions.invoke("create-notification", {
            body: {
              user_id: payment.tenant_id,
              title: "Payment Failed",
              message: "Your rent payment could not be processed. Please update your payment method.",
              type: "error",
              link: "/tenant",
            },
          });
        }

        console.log(`Payment intent ${paymentIntent.id} failed`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        // Update escrow payment status if refunded
        await supabaseClient
          .from("escrow_payments")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", charge.payment_intent as string);

        console.log(`Charge ${charge.id} refunded`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleError(error, 'STRIPE-WEBHOOK');
  }
});
```
