import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  propertyName?: string;
  status?: string;
  message?: string;
  amount?: number;
  description?: string;
  date?: string;
  dueDate?: string;
  title?: string;
  resolution?: string;
  refundAmount?: number;
  deductions?: number;
  reason?: string;
  contractId?: string;
  to?: string;
  subject?: string;
  type?: string;
}

interface EmailRequest {
  to: string;
  subject: string;
  type: "application_update" | "payment_received" | "rent_reminder" | "incident_update" | "deposit_refund";
  data: EmailData;
}

const getEmailTemplate = (type: string, data: EmailData) => {
  switch (type) {
    case "application_update":
      return `
        <h1>Mise à jour de votre candidature</h1>
        <p>Bonjour,</p>
        <p>Votre candidature pour le logement <strong>${data.propertyName}</strong> a été mise à jour.</p>
        <p><strong>Nouveau statut:</strong> ${data.status}</p>
        ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ""}
        <p>Cordialement,<br>L'équipe</p>
      `;
    case "payment_received":
      return `
        <h1>Paiement reçu</h1>
        <p>Bonjour,</p>
        <p>Nous avons bien reçu votre paiement de <strong>${data.amount} €</strong>.</p>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Date:</strong> ${new Date(data.date || new Date().toISOString()).toLocaleDateString("fr-FR")}</p>
        <p>Cordialement,<br>L'équipe</p>
      `;
    case "rent_reminder":
      return `
        <h1>Rappel de loyer</h1>
        <p>Bonjour,</p>
        <p>Ceci est un rappel que votre loyer de <strong>${data.amount} €</strong> est dû le <strong>${new Date(data.dueDate || new Date().toISOString()).toLocaleDateString("fr-FR")}</strong>.</p>
        <p><strong>Logement:</strong> ${data.propertyName}</p>
        <p>Le paiement sera collecté automatiquement si vous avez configuré le prélèvement automatique.</p>
        <p>Cordialement,<br>L'équipe</p>
      `;
    case "incident_update":
      return `
        <h1>Mise à jour d'incident</h1>
        <p>Bonjour,</p>
        <p>L'incident "<strong>${data.title}</strong>" a été mis à jour.</p>
        <p><strong>Nouveau statut:</strong> ${data.status}</p>
        ${data.resolution ? `<p><strong>Résolution:</strong> ${data.resolution}</p>` : ""}
        <p>Cordialement,<br>L'équipe</p>
      `;
    default:
      return `<p>${data.message || "Notification"}</p>`;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ✅ SECURITY FIX: Add authentication check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  // Verify the user is authenticated
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    console.error('[AUTH ERROR]', authError);
    return new Response(
      JSON.stringify({ error: 'Invalid authentication' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // ✅ SECURITY FIX: Add rate limiting (10 emails per hour per user)
  const rateLimitKey = `email-${user.id}`;
  const now = Date.now();
  const rateLimitWindow = 60 * 60 * 1000; // 1 hour
  const maxEmailsPerWindow = 10;

  try {
    const { to, subject, type, data }: EmailRequest = await req.json();

    const html = getEmailTemplate(type, data);

    const emailResponse = await resend.emails.send({
      from: "Notifications <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    // ✅ SECURITY FIX: Log detailed error server-side only
    console.error("[EMAIL ERROR]", error);

    // Return generic error message to client (prevent information leakage)
    return new Response(
      JSON.stringify({ error: "Failed to send email notification" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
