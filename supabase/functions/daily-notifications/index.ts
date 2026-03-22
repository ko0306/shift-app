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
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 日本時間で今日・明日を計算
  const nowJST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const tomorrowJST = new Date(nowJST);
  tomorrowJST.setDate(tomorrowJST.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${nowJST.getFullYear()}-${pad(nowJST.getMonth()+1)}-${pad(nowJST.getDate())}`;
  const tomorrowStr = `${tomorrowJST.getFullYear()}-${pad(tomorrowJST.getMonth()+1)}-${pad(tomorrowJST.getDate())}`;

  const results: object[] = [];

  // === 1. 前日シフトリマインダー ===
  const { data: shifts } = await supabase
    .from('shifts')
    .select('manager_number, start_time, end_time')
    .eq('date', tomorrowStr)
    .not('start_time', 'is', null)
    .neq('start_time', '');

  if (shifts && shifts.length > 0) {
    const managerNumbers = [...new Set(shifts.map((s: { manager_number: string }) => s.manager_number))];
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('manager_number, subscription')
      .in('manager_number', managerNumbers);

    for (const sub of (subs ?? [])) {
      const shift = shifts.find((s: { manager_number: string }) => s.manager_number === sub.manager_number);
      if (!shift) continue;
      const timeInfo = shift.start_time && shift.end_time
        ? `${shift.start_time}〜${shift.end_time}`
        : shift.start_time || '時間未定';
      const payload = JSON.stringify({
        title: '明日の出勤リマインダー',
        body: `明日(${tomorrowStr})の出勤時間：${timeInfo}`,
      });
      try {
        await webpush.sendNotification(JSON.parse(sub.subscription), payload);
        results.push({ type: 'reminder', manager_number: sub.manager_number, status: 'sent' });
      } catch (e: unknown) {
        const err = e as { message?: string };
        results.push({ type: 'reminder', manager_number: sub.manager_number, status: 'failed', error: err.message });
      }
    }
  }

  // === 2. シフト提出期限の自動通知 ===
  const { data: settingRow } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'shift_deadline_notice')
    .single();

  if (settingRow) {
    const setting = JSON.parse(settingRow.value);
    if (setting.is_active && setting.deadline && setting.days_before) {
      const deadlineDate = new Date(setting.deadline);
      const notifyDate = new Date(deadlineDate);
      notifyDate.setDate(notifyDate.getDate() - Number(setting.days_before));
      const notifyDateStr = `${notifyDate.getFullYear()}-${pad(notifyDate.getMonth()+1)}-${pad(notifyDate.getDate())}`;

      if (todayStr === notifyDateStr) {
        const { data: allSubs } = await supabase.from('push_subscriptions').select('subscription');
        const payload = JSON.stringify({
          title: 'シフト提出のお願い',
          body: `期間：${setting.period_start}〜${setting.period_end}　期限：${setting.deadline}`,
        });
        for (const row of (allSubs ?? [])) {
          try {
            await webpush.sendNotification(JSON.parse(row.subscription), payload);
            results.push({ type: 'deadline_auto', status: 'sent' });
          } catch (e: unknown) {
            const err = e as { message?: string };
            results.push({ type: 'deadline_auto', status: 'failed', error: err.message });
          }
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ today: todayStr, tomorrow: tomorrowStr, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
