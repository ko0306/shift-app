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
      const title = '明日の出勤リマインダー';
      const body = `明日(${tomorrowStr})の出勤時間：${timeInfo}`;
      const payload = JSON.stringify({ title, body });
      try {
        await webpush.sendNotification(JSON.parse(sub.subscription), payload);
        // 個人向け通知を保存
        await supabase.from('notifications').insert([{
          title,
          body,
          target_manager_number: String(sub.manager_number)
        }]);
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
        const title = 'シフト提出のお願い';
        const body = `期間：${setting.period_start}〜${setting.period_end}　期限：${setting.deadline}`;
        const payload = JSON.stringify({ title, body });
        let sent = 0;
        for (const row of (allSubs ?? [])) {
          try {
            await webpush.sendNotification(JSON.parse(row.subscription), payload);
            sent++;
            results.push({ type: 'deadline_auto', status: 'sent' });
          } catch (e: unknown) {
            const err = e as { message?: string };
            results.push({ type: 'deadline_auto', status: 'failed', error: err.message });
          }
        }
        if (sent > 0) {
          // 全員向け通知を保存
          await supabase.from('notifications').insert([{ title, body, target_manager_number: null }]);
        }
      }
    }
  }

  // === 3. 前日の打刻不完全警告 ===
  const yesterdayJST = new Date(nowJST);
  yesterdayJST.setDate(yesterdayJST.getDate() - 1);
  const yesterdayStr = `${yesterdayJST.getFullYear()}-${pad(yesterdayJST.getMonth()+1)}-${pad(yesterdayJST.getDate())}`;

  const { data: yesterdayLogs } = await supabase
    .from('attendance_logs')
    .select('manager_number, action_type')
    .eq('action_date', yesterdayStr)
    .eq('is_modified', false);

  if (yesterdayLogs && yesterdayLogs.length > 0) {
    const byStaff: Record<string, string[]> = {};
    for (const log of (yesterdayLogs as { manager_number: string; action_type: string }[])) {
      const mn = String(log.manager_number);
      if (!byStaff[mn]) byStaff[mn] = [];
      byStaff[mn].push(log.action_type);
    }

    for (const [mn, types] of Object.entries(byStaff)) {
      const missing: string[] = [];
      if (types.includes('clock_in') && !types.includes('clock_out')) missing.push('退勤打刻');
      if (!types.includes('clock_in') && types.includes('clock_out')) missing.push('出勤打刻');
      if (types.includes('break_start') && !types.includes('break_end')) missing.push('休憩終了打刻');
      if (!types.includes('break_start') && types.includes('break_end')) missing.push('休憩開始打刻');
      if (missing.length === 0) continue;

      const warnTitle = '⚠️ 昨日の打刻に不備があります';
      const warnBody = `${yesterdayStr} 不足している打刻：${missing.join('、')}`;
      const { data: staffSubs } = await supabase
        .from('push_subscriptions').select('subscription').eq('manager_number', mn);
      for (const sub of (staffSubs ?? [])) {
        try {
          await webpush.sendNotification(JSON.parse((sub as { subscription: string }).subscription), JSON.stringify({ title: warnTitle, body: warnBody }));
          results.push({ type: 'punch_warning', manager_number: mn, status: 'sent' });
        } catch (e: unknown) {
          const err = e as { message?: string };
          results.push({ type: 'punch_warning', manager_number: mn, status: 'failed', error: err.message });
        }
      }
      try {
        await supabase.from('notifications').insert([{ title: warnTitle, body: warnBody, target_manager_number: mn }]);
      } catch(e) {}
    }
  }

  return new Response(
    JSON.stringify({ today: todayStr, tomorrow: tomorrowStr, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
