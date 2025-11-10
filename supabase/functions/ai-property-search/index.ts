import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, properties, language } = await req.json();
    
    // Input validation
    const MAX_QUERY_LENGTH = 1000;
    const MAX_PROPERTIES = 100;
    const MAX_PROPERTIES_JSON_SIZE = 500000; // 500KB

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid query format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Query too long. Maximum 1,000 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!properties || !Array.isArray(properties)) {
      return new Response(
        JSON.stringify({ error: 'Invalid properties format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (properties.length > MAX_PROPERTIES) {
      return new Response(
        JSON.stringify({ error: 'Too many properties. Maximum 100 properties allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const propertiesJson = JSON.stringify(properties);
    if (propertiesJson.length > MAX_PROPERTIES_JSON_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Properties data too large. Maximum 500KB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = language === 'fr'
      ? `Tu es un assistant expert en recherche immobilière. Analyse la requête de l'utilisateur et identifie les propriétés qui correspondent le mieux à leurs besoins. Pour chaque propriété correspondante, fournis un score de correspondance (0-100) et une brève explication du pourquoi. Réponds en JSON avec ce format:
{
  "matches": [
    {
      "id": number,
      "score": number,
      "reason": string
    }
  ]
}`
      : `You are an expert property search assistant. Analyze the user's query and identify which properties best match their needs. For each matching property, provide a match score (0-100) and a brief explanation of why it matches. Respond in JSON with this format:
{
  "matches": [
    {
      "id": number,
      "score": number,
      "reason": string
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `User query: "${query}"\n\nAvailable properties:\n${JSON.stringify(properties, null, 2)}\n\nAnalyze and return matching properties with scores and reasons.` 
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'rate_limit' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'credits_exhausted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from the response (handle cases where AI wraps JSON in markdown)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('AI property search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
