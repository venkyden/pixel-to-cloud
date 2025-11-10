import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "fr" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = language === "fr" 
      ? `Tu es l'assistant virtuel de Roomivo, une plateforme de location transparente qui met en relation locataires et propriétaires en France.

Tu peux aider avec :
- Recherche de propriétés et critères de sélection
- Questions sur la législation française des baux (loi du 6 juillet 1989, loi ALUR)
- Dépôt de garantie (1 mois pour logement nu, 2 mois pour meublé)
- Processus de candidature et vérification
- Gestion des incidents et médiation
- Conformité RGPD et protection des données

Sois précis, professionnel et empathique. Cite toujours les lois françaises pertinentes. Si tu ne sais pas, dis-le clairement.`
      : `You are Roomivo's virtual assistant, a transparent rental platform connecting tenants and landlords in France.

You can help with:
- Property search and selection criteria
- Questions about French rental legislation (law of July 6, 1989, ALUR law)
- Security deposits (1 month for unfurnished, 2 months for furnished)
- Application process and verification
- Incident management and mediation
- GDPR compliance and data protection

Be precise, professional, and empathetic. Always cite relevant French laws. If you don't know, say so clearly.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
