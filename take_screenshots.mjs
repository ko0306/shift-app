import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const DIR = 'C:/Users/kouki/my-app/screenshots';
fs.mkdirSync(DIR, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  protocolTimeout: 60000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
});

const page = await browser.newPage();
await page.setViewport({ width: 420, height: 780, deviceScaleFactor: 2 });

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function shot(name) {
  await wait(1800);
  await page.screenshot({ path: path.join(DIR, name), fullPage: false, type: 'png' });
  console.log('📸 ' + name);
}

async function clickText(text, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const btns = await page.$$('button');
    for (const btn of btns) {
      try {
        const t = await btn.evaluate(el => el.textContent.trim());
        if (t.includes(text)) { await btn.click(); return true; }
      } catch(e) {}
    }
    await wait(300);
  }
  return false;
}

async function login(id, pw) {
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
  await wait(800);
  const inputs = await page.$$('input');
  await inputs[0].click({ clickCount: 3 });
  await inputs[0].type(id);
  await inputs[1].click({ clickCount: 3 });
  await inputs[1].type(pw);
  await clickText('ログイン');
  await wait(2000);
}

// ===== 1. ログイン画面（空） =====
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
await shot('01_login.png');

// ===== 2. ログイン入力中 =====
{
  const inputs = await page.$$('input');
  await inputs[0].type('0306');
  await inputs[1].type('236811');
}
await shot('02_login_filled.png');

// ===== 3. パスワード変更画面 =====
await clickText('パスワード変更');
await wait(1000);
await shot('03_password_change.png');

// ===== 4. ログイン → メニュー選択 =====
await login('0306', '236811');
await shot('04_menu.png');

// ===== 5. アルバイトメニュー =====
await clickText('アルバイト');
await wait(1200);
await shot('05_staff_menu.png');

// ===== 6. 新規提出：期間選択 =====
await clickText('新規提出');
await wait(1200);
await shot('06_new_submit.png');

// ===== 7. 新規提出：日付入力済み =====
await page.evaluate(() => {
  const di = document.querySelectorAll('input[type="date"]');
  if (di[0]) { di[0].value = '2026-04-01'; di[0].dispatchEvent(new Event('change', {bubbles:true})); }
  if (di[1]) { di[1].value = '2026-04-30'; di[1].dispatchEvent(new Event('change', {bubbles:true})); }
});
await wait(800);
await shot('07_new_submit_dates.png');

// ===== 8. 戻る → シフト変更（0306でログイン済み）=====
await clickText('戻る');
await wait(800);
await clickText('シフト変更');
await wait(3000);
await shot('10_shift_edit.png');

// ===== 9. シフト確認 =====
await clickText('戻る');
await wait(800);
await clickText('シフト確認');
await wait(2500);
await shot('11_shift_view.png');

// ===== 10. 就労時間 =====
await clickText('戻る');
await wait(800);
await clickText('就労時間');
await wait(2500);
await shot('12_work_hours.png');

// ===== 11. ログアウト → 勤怠入力 =====
await clickText('戻る');
await wait(800);
await clickText('ログアウト');
await wait(800);

// 再ログイン（0306）
{
  const inputs = await page.$$('input');
  await inputs[0].type('0306');
  await inputs[1].type('236811');
}
await clickText('ログイン');
await wait(2000);

// 勤怠入力を選択
await clickText('勤怠入力');
await wait(1500);
await shot('15_clockin_auth.png');

// 共通パスワード入力
{
  const inputs = await page.$$('input');
  if (inputs.length > 0) {
    await inputs[0].type('0306');
    await wait(500);
    const clicked = await clickText('認証', 3000);
    if (!clicked) await clickText('確認', 3000);
    await wait(2000);
    await shot('16_clockin_id.png');
  }
}

// 管理番号入力して打刻画面へ
{
  const inputs = await page.$$('input');
  if (inputs.length > 0) {
    await inputs[0].type('0306');
    await wait(500);
    // 確認・次へボタン探す
    const btns = await page.$$('button');
    for (const btn of btns) {
      try {
        const t = await btn.evaluate(el => el.textContent.trim());
        if (t.includes('確認') || t.includes('次へ') || t.includes('打刻')) {
          await btn.click(); break;
        }
      } catch(e) {}
    }
    await wait(2500);
    await shot('17_clockin_buttons.png');
  }
}

// 打刻履歴ボタンを探してタップ
{
  const clicked = await clickText('履歴', 3000);
  if (clicked) {
    await wait(2000);
    await shot('17b_clockin_history.png');
  }
}

// ===== ログアウト → 店長へ =====
await login('0000', '0306');

// ===== 18. 店長メニュー =====
await clickText('店長');
await wait(2000);
await shot('18_manager_menu.png');

// ===== 19. シフト作成（期間選択）=====
await clickText('シフト作成');
await wait(2000);
await shot('19_manager_create.png');

// ===== 20. 戻る → シフト確認（店長版）=====
await clickText('戻る');
await wait(1000);
await clickText('シフト確認');
await wait(2500);
await shot('21_manager_shift_view.png');

// ===== 21. 戻る → 勤怠管理 =====
await clickText('戻る');
await wait(1000);
await clickText('勤怠管理');
await wait(2500);
await shot('22_manager_attendance.png');

// 勤怠管理内の申請ボタンを探す
{
  const clicked = await clickText('申請', 3000);
  if (clicked) {
    await wait(2000);
    await shot('22b_manager_approval.png');
    // モーダルの✕ボタンを閉じる
    const btns = await page.$$('button');
    for (const btn of btns) {
      try {
        const t = await btn.evaluate(el => el.textContent.trim());
        if (t === '✕' || t === '×' || t === 'X') { await btn.click(); break; }
      } catch(e) {}
    }
    await wait(1200);
  }
}

// ===== 22. 戻る → 新人登録 =====
await clickText('戻る');
await wait(1000);
await clickText('新人登録');
await wait(2500);
await shot('23_register_user.png');

await browser.close();
console.log('\n✅ 全スクリーンショット完了！');
