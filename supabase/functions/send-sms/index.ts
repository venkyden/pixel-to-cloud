import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const smsSchema = z.object({
  to: z.string().regex(/^\+33[1-9]\d{8}$/, "Invalid French phone number"),
  message: z.string().min(1).max(1600),
  priority: z.enum(["urgent", "normal"]).default("normal"),
});

const logStep = (step: string, details?: Record<string, unknown> | unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SMS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Validate input
    const body = await req.json();
    const validatedData = smsSchema.parse(body);
    logStep("Input validated", { to: validatedData.to, priority: validatedData.priority });

    // Get Twilio credentials
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioSid || !twilioToken || !twilioPhone) {
      throw new Error("Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER secrets.");
    }

    logStep("Twilio credentials found");

    // Send SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const auth = btoa(`${twilioSid}:${twilioToken}`);

    const formData = new URLSearchParams();
    formData.append("From", twilioPhone);
    formData.append("To", validatedData.to);
    formData.append("Body", validatedData.message);

    logStep("Sending SMS via Twilio");

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      logStep("Twilio error", result);
      throw new Error(`Twilio API error: ${result.message || "Unknown error"}`);
    }

    logStep("SMS sent successfully", { sid: result.sid, status: result.status });

    // Log SMS in audit table
    await supabaseClient.from("audit_logs").insert({
      user_id: user.id,
      action: "SMS_SENT",
      table_name: "sms_notifications",
      record_id: result.sid,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    });

    return new Response(JSON.stringify({
      success: true,
      message_sid: result.sid,
      status: result.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});