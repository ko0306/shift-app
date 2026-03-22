import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const VAPID_PUBLIC_KEY = 'BPzmH2up1tiRRNEPM48zlukHy2Ox8APa9vOZexbZXIJ3hW6AK_XDNTINYTagZ4u9zaYAkpTYRmdZSY_bb9n1mhs';
  const VAPID_PRIVATE_KEY = '6GTFrj_5wDwfJyChtXEsqaP34klVnipv9lcqmrfySnA';
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

  webpush.setVapidDetails('mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { title, body } = await req.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: subs, error } = await supabase.from('push_subscriptions').select('subscription');

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

  const payload = JSON.stringify({ title, body });
  const results = await Promise.allSettled(
    (subs ?? []).map((row: { subscription: string }) =>
      webpush.sendNotification(JSON.parse(row.subscription), payload)
    )
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  return new Response(
    JSON.stringify({ sent: results.length - failed, failed }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
