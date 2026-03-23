import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const VAPID_PUBLIC_KEY = 'BNE3hcOnLs-ekXFP3EX52HHYAxQgHacGA66A2E6IHRCcSzna-xYwSf4RW33VuXTWtbK_q6oRyUPD966RzYlrDyg';
  const VAPID_PRIVATE_KEY = 'UcNrflGcM1cLOPXeqtz0Tq1e4XKgBfojZeL15HqZKBk';
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

  webpush.setVapidDetails('mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { title, body, target_manager_numbers, exclude_manager_numbers } = await req.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase.from('push_subscriptions').select('manager_number, subscription');

  // target_manager_numbers が指定されている場合は対象のみ
  if (target_manager_numbers && target_manager_numbers.length > 0) {
    query = query.in('manager_number', target_manager_numbers);
  }
  // exclude_manager_numbers が指定されている場合は除外
  else if (exclude_manager_numbers && exclude_manager_numbers.length > 0) {
    query = query.not('manager_number', 'in', `(${exclude_manager_numbers.join(',')})`);
  }

  const { data: subs, error } = await query;

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

  const payload = JSON.stringify({ title, body });
  const results = await Promise.allSettled(
    (subs ?? []).map((row: { subscription: string }) =>
      webpush.sendNotification(JSON.parse(row.subscription), payload)
    )
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  const sent = results.length - failed;
  const errors = results
    .filter(r => r.status === 'rejected')
    .map(r => {
      const e = (r as PromiseRejectedResult).reason;
      return { message: e?.message, statusCode: e?.statusCode, body: e?.body };
    });
  return new Response(
    JSON.stringify({ sent, failed, total: subs?.length ?? 0, errors }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
