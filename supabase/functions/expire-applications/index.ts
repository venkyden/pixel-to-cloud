import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running application expiration check...');

    // Call the expire_old_applications function
    const { error } = await supabase.rpc('expire_old_applications');

    if (error) {
      console.error('Error expiring applications:', error);
      throw error;
    }

    // Notify landlords about expired applications
    const { data: expiredApplications } = await supabase
      .from('tenant_applications')
      .select(`
        id,
        properties!inner(owner_id, name)
      `)
      .eq('status', 'expired');

    if (expiredApplications && expiredApplications.length > 0) {
      const notifications = expiredApplications.map((app: any) => ({
        user_id: app.properties.owner_id,
        title: 'Application Expired',
        message: `An application for ${app.properties.name} has expired`,
        type: 'warning',
        link: '/dashboard'
      }));

      await supabase.from('notifications').insert(notifications);
      console.log(`Sent ${notifications.length} expiration notifications`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_count: expiredApplications?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
