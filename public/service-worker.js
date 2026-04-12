// ── 定数（サブスクリプション自動更新用） ──
const VAPID_PUBLIC_KEY = 'BNE3hcOnLs-ekXFP3EX52HHYAxQgHacGA66A2E6IHRCcSzna-xYwSf4RW33VuXTWtbK_q6oRyUPD966RzYlrDyg';
const SUPABASE_URL = 'https://csyjgivzvkypwhococfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeWpnaXZ6dmt5cHdob2NvY2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzA1MjIsImV4cCI6MjA2NjY0NjUyMn0.z4VP9e98Mg6_tipaV_TPgznb01iHSg_cXynKtj27HuU';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

// ── IndexedDB ヘルパー（管理番号を永続保存→SW内で使用） ──
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('shift-app-sw', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('store');
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}
function getFromDB(db, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('store', 'readonly').objectStore('store').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function putToDB(db, key, value) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('store', 'readwrite').objectStore('store').put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── ライフサイクル ──
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// ── フェッチ（PWA要件） ──
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(cached =>
        cached || new Response('Network error', { status: 503, headers: { 'Content-Type': 'text/plain' } })
      )
    )
  );
});

// ── プッシュ受信（アプリを閉じていても動作） ──
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'シフトのお知らせ';
  const options = {
    body: data.body || 'シフトを確認してください',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // tag を指定しないことで通知が積み重なって届く（前の通知が消えない）
    requireInteraction: false,
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── 通知タップ ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const url = event.notification.data?.url || '/';
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── アプリ起動時のキャッチアップ（バッテリー最適化対策） ──
// アプリ側から postMessage で呼ばれ、見逃したプッシュ通知をDBから取得して表示する
self.addEventListener('message', event => {
  if (event.data?.type !== 'CATCHUP') return;
  const managerNum = event.data.managerNumber;
  if (!managerNum) return;

  event.waitUntil((async () => {
    try {
      const db = await openDB();
      const shownIds = (await getFromDB(db, 'shownNotifIds')) || [];

      // 過去2時間の自分宛て通知を取得
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const url = `${SUPABASE_URL}/rest/v1/notifications`
        + `?select=id,title,body,created_at`
        + `&or=(target_manager_number.is.null,target_manager_number.eq.${managerNum})`
        + `&created_at=gte.${twoHoursAgo}`
        + `&order=created_at.desc&limit=10`;

      const res = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (!res.ok) return;
      const notifications = await res.json();

      const newShownIds = [...shownIds];
      for (const notif of notifications) {
        if (newShownIds.includes(notif.id)) continue; // 既に表示済み
        await self.registration.showNotification(notif.title || 'シフトのお知らせ', {
          body: notif.body || '',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: { url: '/' },
        });
        newShownIds.push(notif.id);
      }
      // 最新50件だけ保持
      await putToDB(db, 'shownNotifIds', newShownIds.slice(-50));
    } catch (_) {}
  })());
});

// ── サブスクリプション期限切れ時の自動更新 ──
// ブラウザがサブスクリプションを自動失効させた場合にここで再取得→Supabase更新
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil((async () => {
    try {
      const newSub = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      // IndexedDB から管理番号を取得
      const db = await openDB();
      const managerNum = await getFromDB(db, 'managerNumber');
      if (!managerNum) return;
      // Supabase の push_subscriptions テーブルを更新
      await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          manager_number: managerNum,
          subscription: JSON.stringify(newSub.toJSON()),
        }),
      });
    } catch (_) {}
  })());
});
