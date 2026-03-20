const PptxGenJS = require('./node_modules/pptxgenjs/dist/pptxgen.cjs.js');
const fs = require('fs');
const path = require('path');

const pptx = new PptxGenJS();
const SSDIR = 'C:/Users/kouki/my-app/screenshots';
const OUT = 'C:/Users/kouki/OneDrive/ドキュメント/オゾシフ/オゾシフ使い方説明書改訂版.pptx';

pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inch

// ==================== カラー定義 ====================
const C_BG      = '1565C0';
const C_ACCENT  = '2E7D32';
const C_LIGHT   = 'E8F0FE';
const C_TEXT    = '1A1A1A';
const C_SUB     = '546E7A';
const C_WHITE   = 'FFFFFF';
const C_RED     = 'C62828';
const C_PURPLE  = '6A1B9A';
const C_TEAL    = '00695C';
const C_ORANGE  = 'E65100';

// ==================== ヘルパー ====================
function imgPath(name) { return path.join(SSDIR, name); }
function exists(name) { return fs.existsSync(path.join(SSDIR, name)); }

function addHeader(slide, title, color = C_BG) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.82, fill: { color } });
  slide.addText(title, {
    x: 0.25, y: 0, w: 13.0, h: 0.82,
    fontSize: 29, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', valign: 'middle'
  });
}

function addPhoneImg(slide, filename, x, y, h) {
  const w = h * (420 / 780);
  if (!exists(filename)) return w;
  slide.addImage({ path: imgPath(filename), x, y, w, h, sizing: { type: 'contain', w, h } });
  return w;
}

// テキストブロック（フォント大きめ）
function addBody(slide, items, x, y, w) {
  let cy = y;
  for (const item of items) {
    if (typeof item === 'string') {
      slide.addText(item, {
        x, y: cy, w, h: 0.46,
        fontSize: 17, color: C_TEXT, fontFace: 'Meiryo UI'
      });
      cy += 0.48;
    } else if (item.type === 'title') {
      slide.addText(item.text, {
        x, y: cy, w, h: 0.56,
        fontSize: 21, bold: true, color: item.color || C_BG, fontFace: 'Meiryo UI'
      });
      cy += 0.60;
    } else if (item.type === 'bullet') {
      const color = item.color || C_BG;
      slide.addText([
        { text: '▶ ', options: { color, bold: true } },
        { text: item.text, options: { color: C_TEXT } }
      ], {
        x, y: cy, w, h: 0.48,
        fontSize: 17, fontFace: 'Meiryo UI'
      });
      cy += 0.52;
    } else if (item.type === 'step') {
      slide.addShape(pptx.ShapeType.rect, {
        x, y: cy, w: 0.48, h: 0.48, fill: { color: item.color || C_BG }
      });
      slide.addText(String(item.num), {
        x, y: cy, w: 0.48, h: 0.48,
        fontSize: 18, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', align: 'center', valign: 'middle'
      });
      slide.addText(item.text, {
        x: x + 0.56, y: cy, w: w - 0.61, h: 0.48,
        fontSize: 16.5, color: C_TEXT, fontFace: 'Meiryo UI', valign: 'middle'
      });
      cy += 0.56;
    } else if (item.type === 'point') {
      slide.addShape(pptx.ShapeType.rect, {
        x, y: cy, w, h: 0.54, fill: { color: C_LIGHT }, line: { color: C_BG, width: 1 }
      });
      slide.addText('💡 ' + item.text, {
        x: x + 0.12, y: cy, w: w - 0.18, h: 0.54,
        fontSize: 16, fontFace: 'Meiryo UI', valign: 'middle', color: C_TEXT
      });
      cy += 0.62;
    } else if (item.type === 'warn') {
      slide.addShape(pptx.ShapeType.rect, {
        x, y: cy, w, h: 0.54, fill: { color: 'FFF8E1' }, line: { color: 'F57F17', width: 1 }
      });
      slide.addText('⚠️ ' + item.text, {
        x: x + 0.12, y: cy, w: w - 0.18, h: 0.54,
        fontSize: 16, fontFace: 'Meiryo UI', valign: 'middle', color: '4E342E'
      });
      cy += 0.62;
    } else if (item.type === 'space') {
      cy += item.h || 0.15;
    } else if (item.type === 'badge') {
      slide.addShape(pptx.ShapeType.rect, {
        x, y: cy, w, h: 0.46, fill: { color: item.bg || C_BG }
      });
      slide.addText(item.text, {
        x: x + 0.12, y: cy, w: w - 0.18, h: 0.46,
        fontSize: 16, color: C_WHITE, fontFace: 'Meiryo UI', valign: 'middle', bold: true
      });
      cy += 0.54;
    } else if (item.type === 'sub') {
      slide.addText(item.text, {
        x: x + 0.2, y: cy, w: w - 0.2, h: 0.44,
        fontSize: 15.5, color: C_SUB, fontFace: 'Meiryo UI', italic: item.italic
      });
      cy += 0.46;
    }
  }
  return cy;
}

function standardSlide(title, color, imgFile, bodyItems) {
  const s = pptx.addSlide();
  s.background = { color: 'F8F9FA' };
  addHeader(s, title, color);
  const imgH = 6.55;
  const imgW = addPhoneImg(s, imgFile, 0.18, 0.83, imgH);
  const tx = imgW + 0.36;
  const tw = 13.33 - tx - 0.15;
  addBody(s, bodyItems, tx, 0.88, tw);
  return s;
}

// ==================== スライド 1：表紙 ====================
{
  const s = pptx.addSlide();
  s.background = { color: '0A2E6E' };
  // メイングラデーション
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { type: 'gradient', stops: [{ position: 0, color: '0D3A8E' }, { position: 100, color: '1565C0' }] }
  });
  // 左側アクセントバー（細いティール）
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: '100%', fill: { color: '00BCD4' } });
  // 下部アクセントライン
  s.addShape(pptx.ShapeType.rect, { x: 0.18, y: 6.9, w: 9.0, h: 0.06, fill: { color: '00BCD4' } });
  // 上部薄い帯（装飾）
  s.addShape(pptx.ShapeType.rect, { x: 0.18, y: 0, w: 9.0, h: 0.55, fill: { color: 'FFFFFF', transparency: 88 } });

  // ブランドタグ「OZOSHIFT」
  s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 0.12, w: 2.1, h: 0.35, fill: { color: '00BCD4' } });
  s.addText('OZOSHIFT', {
    x: 0.45, y: 0.12, w: 2.1, h: 0.35,
    fontSize: 14, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', align: 'center', valign: 'middle',
    charSpacing: 3
  });

  // メインタイトル
  s.addText('シフト勤怠管理アプリ', {
    x: 0.45, y: 0.85, w: 8.6, h: 1.15,
    fontSize: 42, bold: true, color: C_WHITE, fontFace: 'Meiryo UI'
  });
  // サブタイトル
  s.addText('オゾシフ　使い方説明書', {
    x: 0.45, y: 2.1, w: 8.6, h: 0.85,
    fontSize: 30, color: '7FD8F0', fontFace: 'Meiryo UI'
  });

  // セパレーター
  s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 3.1, w: 6.5, h: 0.05, fill: { color: 'FFFFFF', transparency: 40 } });

  // バッジ：共通マニュアル
  s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 3.28, w: 5.2, h: 0.52, fill: { color: 'FFFFFF', transparency: 88 }, line: { color: 'FFFFFF', width: 0.8 } });
  s.addText('スタッフ・店長（オーナー）様　共通マニュアル', {
    x: 0.45, y: 3.28, w: 5.2, h: 0.52,
    fontSize: 19, color: 'E3F2FD', fontFace: 'Meiryo UI', align: 'center', valign: 'middle'
  });

  // 改訂版バッジ
  s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 4.05, w: 1.5, h: 0.44, fill: { color: 'FFD54F' } });
  s.addText('改 訂 版', {
    x: 0.45, y: 4.05, w: 1.5, h: 0.44,
    fontSize: 17, bold: true, color: '1A1A1A', fontFace: 'Meiryo UI', align: 'center', valign: 'middle'
  });

  if (exists('01_login.png')) addPhoneImg(s, '01_login.png', 9.3, 0.3, 7.0);
}

// ==================== スライド 2：目次 ====================
{
  const s = pptx.addSlide();
  s.background = { color: 'F5F5F5' };
  addHeader(s, '📋  目次');

  const sections = [
    { num: '1', title: 'ログイン・パスワード変更', color: C_BG },
    { num: '2', title: 'メニュー選択', color: C_BG },
    { num: '3', title: 'アルバイト様メニュー一覧', color: '1976D2' },
    { num: '4', title: '新規シフト提出', color: C_ACCENT },
    { num: '5', title: 'シフト変更', color: C_PURPLE },
    { num: '6', title: 'シフト確認', color: C_TEAL },
    { num: '7', title: '就労時間の確認', color: C_ORANGE },
    { num: '8', title: '勤怠入力（打刻・履歴）', color: '00838F' },
    { num: '9', title: '修正申請のやり方', color: '006064' },
    { num: '10', title: '店長（オーナー）様メニュー一覧', color: C_RED },
    { num: '11', title: 'シフト作成（店長（オーナー）様）', color: '4527A0' },
    { num: '12', title: 'シフト確認（店長（オーナー）様）', color: '00695C' },
    { num: '13', title: '勤怠管理・承認（店長（オーナー）様）', color: 'BF360C' },
    { num: '14', title: '新人登録（店長（オーナー）様）', color: '37474F' },
    { num: '15', title: 'よくある質問 ①〜⑤（20ページ）', color: C_SUB },
  ];

  sections.forEach((item, i) => {
    const x = 0.25;
    const y = 0.90 + i * 0.43;
    s.addShape(pptx.ShapeType.rect, { x, y, w: 12.80, h: 0.39, fill: { color: C_LIGHT }, line: { color: item.color, width: 1.5 } });
    s.addShape(pptx.ShapeType.rect, { x, y, w: 0.44, h: 0.39, fill: { color: item.color } });
    s.addText(item.num, { x, y, w: 0.44, h: 0.39, fontSize: 15, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', align: 'center', valign: 'middle' });
    s.addText(item.title, { x: x + 0.54, y, w: 12.10, h: 0.39, fontSize: 15, bold: true, color: C_TEXT, fontFace: 'Meiryo UI', valign: 'middle' });
  });
}

// ==================== スライド 3：ログイン ====================
standardSlide('1.  ログイン方法', C_BG, '01_login.png', [
  { type: 'title', text: 'ログイン手順' },
  { type: 'step', num: 1, text: '管理番号を入力（各自に配布された番号）' },
  { type: 'space' },
  { type: 'step', num: 2, text: 'パスワードを入力（👁 で表示切替）' },
  { type: 'space' },
  { type: 'step', num: 3, text: '「ログイン」ボタンをタップ' },
  { type: 'space', h: 0.2 },
  { type: 'point', text: 'パスワードを忘れた場合は「パスワード変更」から変更できます' },
  { type: 'space' },
  { type: 'warn', text: '管理番号・パスワードは他の人に教えないでください' },
  { type: 'space', h: 0.2 },
  { type: 'title', text: 'エラーメッセージの意味' },
  { type: 'bullet', text: '管理番号が登録されていません → 番号を確認' },
  { type: 'bullet', text: 'パスワードが違います → パスワードを確認' },
]);

// ==================== スライド 4：パスワード変更 ====================
standardSlide('2.  パスワード変更', '37474F', '03_password_change.png', [
  { type: 'title', text: 'パスワード変更の手順', color: '37474F' },
  { type: 'step', num: 1, text: 'ログイン画面の「パスワード変更」をタップ', color: '37474F' },
  { type: 'space' },
  { type: 'step', num: 2, text: '管理番号を入力', color: '37474F' },
  { type: 'space' },
  { type: 'step', num: 3, text: '新しいパスワードを入力（6文字以上）', color: '37474F' },
  { type: 'space' },
  { type: 'step', num: 4, text: '確認用に同じパスワードを再入力', color: '37474F' },
  { type: 'space' },
  { type: 'step', num: 5, text: '「変更する」をタップして完了', color: '37474F' },
  { type: 'space', h: 0.2 },
  { type: 'warn', text: 'パスワードは6文字以上で設定してください' },
  { type: 'space' },
  { type: 'point', text: '変更後は新しいパスワードでログインしてください' },
]);

// ==================== スライド 5：メニュー選択 ====================
standardSlide('3.  メニューの選択', '1976D2', '04_menu.png', [
  { type: 'title', text: 'ログイン後に表示されるメニュー' },
  { type: 'space' },
  { type: 'badge', text: '👤 アルバイト様', bg: '1976D2' },
  { type: 'sub', text: 'シフト提出・確認・変更・就労時間確認' },
  { type: 'space' },
  { type: 'badge', text: '👔 店長（オーナー）様', bg: C_RED },
  { type: 'sub', text: 'シフト作成・勤怠管理・新人登録（要パスワード）' },
  { type: 'space' },
  { type: 'badge', text: '⏰ 勤怠入力', bg: '00838F' },
  { type: 'sub', text: '出退勤・休憩の打刻専用画面' },
  { type: 'space', h: 0.25 },
  { type: 'point', text: '自分の担当に合ったメニューを選んでください' },
  { type: 'space' },
  { type: 'warn', text: '店長（オーナー）様メニューには専用パスワードが必要です' },
]);

// ==================== スライド 6：アルバイト様メニュー ====================
standardSlide('4.  アルバイト様メニュー', '1976D2', '05_staff_menu.png', [
  { type: 'title', text: 'メニュー一覧', color: '1976D2' },
  { type: 'space' },
  { type: 'bullet', text: '新規提出　→　シフト希望を新しく提出する', color: '1976D2' },
  { type: 'space', h: 0.05 },
  { type: 'bullet', text: 'シフト変更　→　提出済みシフトを修正する', color: '1976D2' },
  { type: 'space', h: 0.05 },
  { type: 'bullet', text: 'シフト確認　→　確定したシフトをカレンダーで確認', color: '1976D2' },
  { type: 'space', h: 0.05 },
  { type: 'bullet', text: '就労時間　→　自分の勤務実績を確認する', color: '1976D2' },
  { type: 'space', h: 0.25 },
  { type: 'point', text: '「← 戻る」でいつでも前の画面に戻れます' },
]);

// ==================== スライド 7：新規提出①期間選択 ====================
standardSlide('5.  新規シフト提出 ①　期間を選ぶ', C_ACCENT, '06_new_submit.png', [
  { type: 'title', text: '期間の入力方法', color: C_ACCENT },
  { type: 'step', num: 1, text: '「開始日」をタップしてシフト開始日を選択', color: C_ACCENT },
  { type: 'space' },
  { type: 'step', num: 2, text: '「終了日」をタップしてシフト終了日を選択', color: C_ACCENT },
  { type: 'space' },
  { type: 'step', num: 3, text: '「次へ」をタップして希望時間の入力へ進む', color: C_ACCENT },
  { type: 'space', h: 0.2 },
  { type: 'title', text: '💡 候補ボタンとは', color: C_ACCENT },
  '「候補」ボタンを押すと店長（オーナー）様が設定した',
  'シフト募集期間が一覧表示されます。',
  'タップするだけで日付が自動入力されます。',
  { type: 'space', h: 0.1 },
  { type: 'warn', text: '期限切れの期間は赤バッジで表示されます' },
]);

// ==================== スライド 8：新規提出②希望時間 ====================
standardSlide('5.  新規シフト提出 ②　希望時間を入力する', C_ACCENT, '07_new_submit_dates.png', [
  { type: 'title', text: '希望時間の入力手順', color: C_ACCENT },
  { type: 'step', num: 1, text: '曜日ボタン（全/月〜日）で一括設定する曜日を選択', color: C_ACCENT },
  { type: 'space' },
  { type: 'step', num: 2, text: '「終日フリー」「終日不可」「時間指定」から選択', color: C_ACCENT },
  { type: 'space' },
  { type: 'step', num: 3, text: '時間指定の場合は開始・終了時間を選んで「一括適用」', color: C_ACCENT },
  { type: 'space' },
  { type: 'step', num: 4, text: '各日付を個別に調整することもできます', color: C_ACCENT },
  { type: 'space' },
  { type: 'step', num: 5, text: '「送信」ボタンをタップして提出完了', color: C_ACCENT },
  { type: 'space', h: 0.15 },
  { type: 'point', text: '曜日一括設定で全日程をまとめて入力できます' },
  { type: 'space' },
  { type: 'warn', text: '送信後の取り消しはできません。確認してから送信を' },
]);

// ==================== スライド 9：シフト変更 ====================
standardSlide('6.  シフト変更', C_PURPLE, '10_shift_edit.png', [
  { type: 'title', text: '変更の手順', color: C_PURPLE },
  { type: 'step', num: 1, text: '「シフト変更」をタップ', color: C_PURPLE },
  { type: 'space' },
  { type: 'step', num: 2, text: '各自の管理番号とパスワードを入力して認証', color: C_PURPLE },
  { type: 'space' },
  { type: 'step', num: 3, text: '提出済みシフトが一覧で表示される', color: C_PURPLE },
  { type: 'space' },
  { type: 'step', num: 4, text: '変更したい日付の時間帯を修正する', color: C_PURPLE },
  { type: 'space' },
  { type: 'step', num: 5, text: '「保存」をタップして完了', color: C_PURPLE },
  { type: 'space', h: 0.1 },
  { type: 'warn', text: 'シフト確定後は変更できません。確定前に早めに修正を！' },
]);

// ==================== スライド 10：シフト確認（スタッフ）====================
standardSlide('7.  シフト確認', C_TEAL, '11_shift_view.png', [
  { type: 'title', text: 'カレンダーの見方', color: C_TEAL },
  { type: 'bullet', text: '🔵 青色　→　シフトが登録されている日', color: C_TEAL },
  { type: 'bullet', text: '🔴 赤色　→　スタッフ募集中の日', color: C_TEAL },
  { type: 'bullet', text: '⬜ 灰色　→　シフトが登録されていない日', color: C_TEAL },
  { type: 'space', h: 0.2 },
  { type: 'title', text: '操作方法', color: C_TEAL },
  { type: 'step', num: 1, text: '「◀ / ▶」で月を切り替える', color: C_TEAL },
  { type: 'space' },
  { type: 'step', num: 2, text: '青い日付をタップして詳細を表示', color: C_TEAL },
  { type: 'space' },
  { type: 'step', num: 3, text: '「リスト」「タイムライン」で表示を切り替え', color: C_TEAL },
  { type: 'space', h: 0.15 },
  { type: 'point', text: 'タイムライン表示で全スタッフの勤務時間を一目確認' },
]);

// ==================== スライド 11：就労時間 ====================
standardSlide('8.  就労時間の確認', C_ORANGE, '12_work_hours.png', [
  { type: 'title', text: '就労時間確認でわかること', color: C_ORANGE },
  { type: 'bullet', text: '自分の勤務時間実績を月別・年別で確認', color: C_ORANGE },
  { type: 'bullet', text: '確定済みの勤怠データのみ反映される', color: C_ORANGE },
  { type: 'space', h: 0.2 },
  { type: 'title', text: '操作方法', color: C_ORANGE },
  { type: 'step', num: 1, text: '「就労時間」をタップ', color: C_ORANGE },
  { type: 'space' },
  { type: 'step', num: 2, text: '月・年を切り替えて確認したい期間を選択', color: C_ORANGE },
  { type: 'space' },
  { type: 'step', num: 3, text: '日別・月別の勤務時間合計が表示される', color: C_ORANGE },
  { type: 'space', h: 0.2 },
  { type: 'point', text: '店長（オーナー）様が勤怠を「確定」するまでは反映されません' },
  { type: 'space' },
  { type: 'warn', text: '勤務時間に疑問がある場合は店長（オーナー）様に確認してください' },
]);

// ==================== スライド 12：勤怠入力（打刻）====================
standardSlide('9.  勤怠入力（打刻）', '00838F', '15_clockin_auth.png', [
  { type: 'title', text: '打刻の流れ', color: '00838F' },
  { type: 'step', num: 1, text: 'メニューから「勤怠入力」を選択', color: '00838F' },
  { type: 'space' },
  { type: 'step', num: 2, text: '各自の管理番号・パスワードを入力して「認証」', color: '00838F' },
  { type: 'space' },
  { type: 'step', num: 3, text: '自分の管理番号（個人番号）を入力', color: '00838F' },
  { type: 'space' },
  { type: 'step', num: 4, text: '該当するボタンを長押し（0.8秒）で打刻', color: '00838F' },
  { type: 'space', h: 0.1 },
  { type: 'badge', text: '🟢 出勤（Clock In）', bg: '2E7D32' },
  { type: 'badge', text: '🔵 退勤（Clock Out）', bg: '1565C0' },
  { type: 'badge', text: '🟠 休憩開始（Break Start）', bg: 'E65100' },
  { type: 'badge', text: '🟣 休憩終了（Break End）', bg: '6A1B9A' },
  { type: 'point', text: '誤操作防止のため長押し（0.8秒）が必要です' },
]);

// ==================== スライド 13：打刻履歴・修正申請 ====================
standardSlide('9.  勤怠入力　②　打刻履歴の見方と修正申請', '006064', '17b_clockin_history.png', [
  { type: 'title', text: '打刻履歴の開き方', color: '006064' },
  { type: 'step', num: 1, text: '勤怠入力画面で管理番号・パスワードを入力して認証', color: '006064' },
  { type: 'space' },
  { type: 'step', num: 2, text: '画面下の「履歴」ボタンをタップ', color: '006064' },
  { type: 'space' },
  { type: 'step', num: 3, text: '自分の管理番号を入力 → 過去の打刻一覧が表示される', color: '006064' },
  { type: 'space', h: 0.1 },
  { type: 'bullet', text: '表示内容：日付 / 出勤時刻 / 退勤時刻 / 休憩時間', color: '006064' },
  { type: 'bullet', text: '「−−:−−」は打刻されていない状態（打ち忘れ）', color: '006064' },
  { type: 'space', h: 0.15 },
  { type: 'title', text: '修正申請の手順', color: '006064' },
  { type: 'step', num: 4, text: '履歴から修正したい日付の行をタップ', color: '006064' },
  { type: 'space' },
  { type: 'step', num: 5, text: '「修正申請」をタップ → 正しい時間と理由を入力', color: '006064' },
  { type: 'space' },
  { type: 'step', num: 6, text: '「申請する」→ 店長（オーナー）様に申請が送信される', color: '006064' },
  { type: 'space', h: 0.1 },
  { type: 'warn', text: '申請しただけでは反映されません。店長（オーナー）様の「承認」が必要です' },
]);

// ==================== スライド 13b：修正申請フォームの書き方 ====================
{
  const s = pptx.addSlide();
  s.background = { color: 'F8F9FA' };
  addHeader(s, '9.  勤怠入力　③　修正申請フォームの書き方', '004D40');

  // 左：フォームのイメージ図（手書き風）
  const fx = 0.22, fy = 0.90, fw = 5.6;
  s.addShape(pptx.ShapeType.rect, { x: fx, y: fy, w: fw, h: 6.3, fill: { color: 'FFFFFF' }, line: { color: 'CCCCCC', width: 1 } });
  s.addShape(pptx.ShapeType.rect, { x: fx, y: fy, w: fw, h: 0.50, fill: { color: '004D40' } });
  s.addText('修正申請フォーム', { x: fx, y: fy, w: fw, h: 0.50, fontSize: 18, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', align: 'center', valign: 'middle' });

  const fields = [
    { label: '申請する日付', note: '修正したい日が自動で入る', y: fy + 0.62 },
    { label: '元の出勤時刻', note: '現在記録されている時刻（変更不可）', y: fy + 1.34 },
    { label: '元の退勤時刻', note: '現在記録されている時刻（変更不可）', y: fy + 2.06 },
    { label: '修正後の出勤時刻', note: '正しい出勤時刻を入力 ★', y: fy + 2.78 },
    { label: '修正後の退勤時刻', note: '正しい退勤時刻を入力 ★', y: fy + 3.50 },
    { label: '申請理由', note: '打ち忘れ・ミスなど理由を具体的に ★', y: fy + 4.22 },
  ];
  fields.forEach(f => {
    s.addShape(pptx.ShapeType.rect, { x: fx + 0.15, y: f.y, w: fw - 0.30, h: 0.60, fill: { color: 'F1F8F7' }, line: { color: '004D40', width: 0.5 } });
    s.addText(f.label, { x: fx + 0.22, y: f.y + 0.02, w: fw - 0.44, h: 0.28, fontSize: 14, bold: true, color: '004D40', fontFace: 'Meiryo UI' });
    s.addText(f.note, { x: fx + 0.22, y: f.y + 0.30, w: fw - 0.44, h: 0.24, fontSize: 12.5, color: C_SUB, fontFace: 'Meiryo UI' });
  });
  s.addShape(pptx.ShapeType.rect, { x: fx + 0.6, y: fy + 5.50, w: fw - 1.20, h: 0.52, fill: { color: '004D40' } });
  s.addText('申請する', { x: fx + 0.6, y: fy + 5.50, w: fw - 1.20, h: 0.52, fontSize: 17, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', align: 'center', valign: 'middle' });

  // 右：説明テキスト
  const tx = fx + fw + 0.30, tw = 13.33 - tx - 0.15;
  addBody(s, [
    { type: 'title', text: '入力のポイント', color: '004D40' },
    { type: 'bullet', text: '★のついた項目が自分で入力する箇所', color: '004D40' },
    { type: 'space', h: 0.05 },
    { type: 'bullet', text: '「元の時刻」は変更できません（参考表示）', color: '004D40' },
    { type: 'space', h: 0.15 },
    { type: 'title', text: '申請理由の書き方例', color: '004D40' },
    '📝 出勤打刻を忘れました',
    '📝 退勤後に打刻できませんでした',
    '📝 打刻時に間違えて押しました',
    { type: 'space', h: 0.15 },
    { type: 'point', text: '理由は具体的に書くと承認されやすいです' },
    { type: 'space' },
    { type: 'warn', text: '申請後は店長（オーナー）様の「承認」が必要です。自動反映はされません' },
  ], tx, 0.96, tw);
}

// ==================== スライド 13c：承認状況の確認（スタッフ向け）====================
{
  const s = pptx.addSlide();
  s.background = { color: 'F8F9FA' };
  addHeader(s, '9.  勤怠入力　④　承認状況の確認方法（スタッフ向け）', '1A237E');

  const imgW = addPhoneImg(s, '12_work_hours.png', 0.18, 0.86, 6.55);
  const tx = imgW + 0.36, tw = 13.33 - tx - 0.15;

  addBody(s, [
    { type: 'title', text: '承認されたか確認する方法', color: '1A237E' },
    { type: 'step', num: 1, text: 'アルバイト様メニューの「就労時間」を開く', color: '1A237E' },
    { type: 'space' },
    { type: 'step', num: 2, text: '申請した日の勤務時間が正しい時間に変わっているか確認', color: '1A237E' },
    { type: 'space' },
    { type: 'step', num: 3, text: '時間が正しければ → 承認済み ✅', color: '1A237E' },
    { type: 'space' },
    { type: 'step', num: 4, text: '変わっていなければ → まだ未承認（店長（オーナー）様に確認）', color: '1A237E' },
    { type: 'space', h: 0.15 },
    { type: 'title', text: '未承認だった場合', color: '1A237E' },
    { type: 'bullet', text: '店長（オーナー）様に「勤怠管理の申請ボタンを見てください」と伝える', color: '1A237E' },
    { type: 'bullet', text: '却下された場合は、内容を確認して再申請する', color: '1A237E' },
    { type: 'space', h: 0.1 },
    { type: 'warn', text: 'スタッフ側に承認通知は届きません。就労時間で必ず確認を' },
  ], tx, 0.92, tw);
}

// ==================== スライド 14：店長（オーナー）様メニュー ====================
standardSlide('10.  店長（オーナー）様メニュー', C_RED, '18_manager_menu.png', [
  { type: 'title', text: 'メニュー一覧', color: C_RED },
  { type: 'bullet', text: 'シフト作成　→　スタッフのシフト表を作成', color: C_RED },
  { type: 'bullet', text: 'シフト確認　→　確定済みシフトを確認・編集', color: C_RED },
  { type: 'bullet', text: '勤怠管理　→　出退勤の確定・集計・承認', color: C_RED },
  { type: 'bullet', text: '新人登録　→　スタッフの追加・削除・PW管理', color: C_RED },
  { type: 'space', h: 0.25 },
  { type: 'warn', text: '店長（オーナー）様メニューにはパスワード認証が必要です' },
  { type: 'space' },
  { type: 'point', text: '使用後は必ずログアウトして不正アクセスを防いでください' },
]);

// ==================== スライド 15：シフト作成 ====================
standardSlide('11.  シフト作成（店長（オーナー）様）', '4527A0', '19_manager_create.png', [
  { type: 'title', text: 'シフト作成の流れ', color: '4527A0' },
  { type: 'step', num: 1, text: '「候補」または手動で開始日・終了日を設定', color: '4527A0' },
  { type: 'space' },
  { type: 'step', num: 2, text: '「次へ」をタップするとスタッフの希望が自動表示', color: '4527A0' },
  { type: 'space' },
  { type: 'step', num: 3, text: 'セルをタップして勤務時間・店舗・役割を設定', color: '4527A0' },
  { type: 'space' },
  { type: 'step', num: 4, text: '募集行（追加スタッフ）の人数も設定可能', color: '4527A0' },
  { type: 'space' },
  { type: 'step', num: 5, text: '「確定・保存」でシフトを確定する', color: '4527A0' },
  { type: 'space', h: 0.15 },
  { type: 'point', text: 'スタッフ希望が自動反映されるため効率的に作成できます' },
  { type: 'space' },
  { type: 'warn', text: 'シフト確定後はスタッフ側の「シフト確認」に表示されます' },
]);

// ==================== スライド 16：シフト確認（店長（オーナー）様）====================
standardSlide('12.  シフト確認（店長（オーナー）様）', '00695C', '21_manager_shift_view.png', [
  { type: 'title', text: '確認・編集できること', color: '00695C' },
  { type: 'bullet', text: 'カレンダーで日付を選んでシフト表を表示', color: '00695C' },
  { type: 'bullet', text: 'タイムラインビューで勤務時間帯を可視化', color: '00695C' },
  { type: 'bullet', text: 'リストビューでスタッフ×時間を一覧表示', color: '00695C' },
  { type: 'bullet', text: '編集モードでセルをタップして直接修正可能', color: '00695C' },
  { type: 'bullet', text: '募集行（空きシフト）の表示・編集', color: '00695C' },
  { type: 'space', h: 0.2 },
  { type: 'title', text: '表示の切り替え', color: '00695C' },
  { type: 'step', num: 1, text: '「◀ / ▶」で月を切り替える', color: '00695C' },
  { type: 'space' },
  { type: 'step', num: 2, text: '日付をタップしてその日のシフトを表示', color: '00695C' },
  { type: 'space' },
  { type: 'step', num: 3, text: '「リスト」「タイムライン」で表示切替', color: '00695C' },
]);

// ==================== スライド 17：勤怠管理 ====================
standardSlide('13.  勤怠管理（店長（オーナー）様）①　勤怠確定', 'BF360C', '22_manager_attendance.png', [
  { type: 'title', text: 'カレンダー画面の色の意味', color: 'BF360C' },
  { type: 'bullet', text: '🟩 薄緑　：確定済みの日', color: 'BF360C' },
  { type: 'bullet', text: '🟪 紫　　：シフト＋勤怠あり（未確定）', color: 'BF360C' },
  { type: 'bullet', text: '🟦 薄青　：シフトのみ（勤怠なし）', color: 'BF360C' },
  { type: 'bullet', text: '🟥 薄赤　：勤怠のみ（シフトなし）', color: 'BF360C' },
  { type: 'space', h: 0.15 },
  { type: 'title', text: '勤怠確定の手順', color: 'BF360C' },
  { type: 'step', num: 1, text: 'カレンダーから確定したい日付をタップ', color: 'BF360C' },
  { type: 'space' },
  { type: 'step', num: 2, text: 'スタッフごとの出退勤時間を確認・修正', color: 'BF360C' },
  { type: 'space' },
  { type: 'step', num: 3, text: '「確定」ボタンをタップして確定する', color: 'BF360C' },
  { type: 'space', h: 0.1 },
  { type: 'warn', text: '「確定」しないと就労時間・集計に反映されません' },
]);

// ==================== スライド 18：修正申請の承認 ====================
standardSlide('13.  勤怠管理（店長（オーナー）様）②　修正申請の承認方法', 'AD1457', '22b_manager_approval.png', [
  { type: 'title', text: '申請の確認方法', color: 'AD1457' },
  { type: 'step', num: 1, text: '店長（オーナー）様メニュー →「勤怠管理」をタップ', color: 'AD1457' },
  { type: 'space' },
  { type: 'step', num: 2, text: '「申請」ボタンに赤いバッジ（件数）が表示されたら申請あり', color: 'AD1457' },
  { type: 'sub', text: '📌 バッジがない場合は申請が届いていません' },
  { type: 'space' },
  { type: 'step', num: 3, text: '「申請」をタップ → 申請一覧が表示される', color: 'AD1457' },
  { type: 'space' },
  { type: 'step', num: 4, text: '申請をタップして内容を確認（修正前 vs 修正後 / 理由）', color: 'AD1457' },
  { type: 'space' },
  { type: 'step', num: 5, text: '「承認」→ 勤怠データに即反映　/　「却下」→ 却下通知', color: 'AD1457' },
  { type: 'space', h: 0.1 },
  { type: 'title', text: '承認できる申請の種類', color: 'AD1457' },
  { type: 'bullet', text: '打刻修正申請（出退勤・休憩時間の訂正）', color: 'AD1457' },
  { type: 'bullet', text: '交通費手当申請', color: 'AD1457' },
  { type: 'bullet', text: '応援交通費手当申請', color: 'AD1457' },
  { type: 'warn', text: '承認前は就労時間に反映されません。早めに確認を！' },
]);

// ==================== スライド 18b：申請詳細の見方（店長（オーナー）様）====================
standardSlide('13.  勤怠管理（店長（オーナー）様）③　修正申請の確認と承認', 'AD1457', '22b_manager_approval.png', [
  { type: 'title', text: '申請一覧の開き方', color: 'AD1457' },
  { type: 'step', num: 1, text: '店長（オーナー）様メニュー →「勤怠管理」をタップ', color: 'AD1457' },
  { type: 'space' },
  { type: 'step', num: 2, text: '画面右上の「📬 申請」ボタンをタップ', color: 'AD1457' },
  { type: 'space' },
  { type: 'step', num: 3, text: '修正申請一覧が表示される（申請がなければ空欄）', color: 'AD1457' },
  { type: 'space', h: 0.1 },
  { type: 'title', text: '承認・却下の手順', color: 'AD1457' },
  { type: 'step', num: 4, text: '申請をタップ → 修正前・修正後の時刻と理由を確認', color: 'AD1457' },
  { type: 'space' },
  { type: 'step', num: 5, text: '「承認」→ 勤怠データに即反映　/　「却下」→ 却下通知', color: 'AD1457' },
  { type: 'space', h: 0.15 },
  { type: 'point', text: '申請ボタンの赤いバッジ（数字）が申請件数を示します' },
  { type: 'space' },
  { type: 'warn', text: '承認は取り消せません。内容をよく確認してから承認してください' },
]);

// ==================== スライド 19：新人登録 ====================
standardSlide('14.  新人登録（店長（オーナー）様）', '37474F', '23_register_user.png', [
  { type: 'title', text: 'できること', color: '37474F' },
  { type: 'bullet', text: '新規スタッフの登録（名前・管理番号・PW）', color: '37474F' },
  { type: 'bullet', text: '登録済みスタッフの一覧確認', color: '37474F' },
  { type: 'bullet', text: 'スタッフのパスワード変更', color: '37474F' },
  { type: 'bullet', text: 'スタッフの削除', color: '37474F' },
  { type: 'space', h: 0.2 },
  { type: 'title', text: '新規登録の手順', color: '37474F' },
  { type: 'step', num: 1, text: '「新人登録」をタップ', color: '37474F' },
  { type: 'space' },
  { type: 'step', num: 2, text: '名前・管理番号・パスワードを入力', color: '37474F' },
  { type: 'space' },
  { type: 'step', num: 3, text: '「登録する」をタップして完了', color: '37474F' },
  { type: 'space', h: 0.15 },
  { type: 'warn', text: '管理番号・パスワードは必ず本人に直接伝えてください' },
]);

// ==================== スライド 20：よくある質問 ====================
{
  const s = pptx.addSlide();
  s.background = { color: 'F8F9FA' };
  addHeader(s, '15.  よくある質問 ①', C_SUB);

  const faqs = [
    {
      q: 'ログインできない',
      a: '① 管理番号が正しいか確認してください\n② パスワードが間違っていないか確認してください\n③ 解決しない場合は店長（オーナー）様に管理番号とパスワードのリセットを依頼してください'
    },
    {
      q: 'パスワードを忘れた',
      a: 'ログイン画面下の「パスワード変更」をタップして管理番号を入力し、新しいパスワードを設定してください。それでも解決しない場合は店長（オーナー）様に相談してください。'
    },
    {
      q: 'シフトを間違えて送信してしまった',
      a: 'シフト確定前であれば「シフト変更」から修正できます。店長（オーナー）様がシフトを確定した後は変更できないため、早めに店長（オーナー）様に連絡してください。'
    },
    {
      q: '確定シフトが表示されない',
      a: '店長（オーナー）様がシフトを「確定・保存」するまで「シフト確認」画面には表示されません。シフト作成が完了したか店長（オーナー）様に確認してください。'
    },
  ];

  faqs.forEach((faq, i) => {
    const y = 0.90 + i * 1.62;
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y, w: 12.7, h: 0.50, fill: { color: C_BG } });
    s.addText('Q  ' + faq.q, {
      x: 0.45, y, w: 12.5, h: 0.50,
      fontSize: 18, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', valign: 'middle'
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.3, y: y + 0.50, w: 12.7, h: 1.02,
      fill: { color: C_LIGHT }, line: { color: C_BG, width: 0.5 }
    });
    s.addText('A  ' + faq.a, {
      x: 0.45, y: y + 0.54, w: 12.5, h: 0.96,
      fontSize: 16, color: C_TEXT, fontFace: 'Meiryo UI', valign: 'top'
    });
  });
}

// ==================== スライド 21：よくある質問② ====================
{
  const s = pptx.addSlide();
  s.background = { color: 'F8F9FA' };
  addHeader(s, '15.  よくある質問 ②', C_SUB);

  const faqs = [
    {
      q: '勤怠打刻を間違えた（打ち忘れ・時間ミス）',
      a: '勤怠入力の「履歴」から該当の日をタップ →「修正申請」→ 正しい時間と理由を入力して「申請する」をタップ。店長（オーナー）様が承認すると勤怠データに修正が反映されます。'
    },
    {
      q: '修正申請したのに反映されない',
      a: '修正申請は店長（オーナー）様の「承認」が必要です。承認前は勤怠データに反映されません。店長（オーナー）様に「勤怠管理 → 申請ボタンを確認してください」と直接伝えてください。'
    },
    {
      q: '就労時間が表示されない・少ない',
      a: '店長（オーナー）様が勤怠を「確定」処理するまで就労時間には反映されません。確定後に再度確認してください。それでも合わない場合は店長（オーナー）様に相談してください。'
    },
    {
      q: 'シフト変更ができない・画面に入れない',
      a: 'シフト変更画面には各自の管理番号とパスワードが必要です。また、店長（オーナー）様がシフトを確定した後は変更できません。確定後の変更は店長（オーナー）様に直接相談してください。'
    },
  ];

  faqs.forEach((faq, i) => {
    const y = 0.90 + i * 1.62;
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y, w: 12.7, h: 0.50, fill: { color: C_SUB } });
    s.addText('Q  ' + faq.q, {
      x: 0.45, y, w: 12.5, h: 0.50,
      fontSize: 18, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', valign: 'middle'
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.3, y: y + 0.50, w: 12.7, h: 1.02,
      fill: { color: 'ECEFF1' }, line: { color: C_SUB, width: 0.5 }
    });
    s.addText('A  ' + faq.a, {
      x: 0.45, y: y + 0.54, w: 12.5, h: 0.96,
      fontSize: 16, color: C_TEXT, fontFace: 'Meiryo UI', valign: 'top'
    });
  });
}

// ==================== スライド 22：よくある質問③（店長（オーナー）様向け）====================
{
  const s = pptx.addSlide();
  s.background = { color: 'F8F9FA' };
  addHeader(s, '15.  よくある質問 ③（店長（オーナー）様向け）', C_RED);

  const faqs = [
    {
      q: 'スタッフを追加・削除したい',
      a: '店長（オーナー）様メニューの「新人登録」から追加できます。削除は「番号確認」タブからスタッフを選んで「削除」をタップしてください（データは残ります）。'
    },
    {
      q: 'スタッフのパスワードを変更したい',
      a: '店長（オーナー）様メニューの「新人登録」→「番号確認」タブからスタッフを選択し「パスワード変更」をタップして新しいパスワードを設定してください。'
    },
    {
      q: '勤怠確定はいつすればいい？',
      a: '勤務が終わったら随時確定するか、月末にまとめて確定してください。確定しないとスタッフの就労時間に反映されないため、給与計算前までに必ず確定してください。'
    },
    {
      q: '修正申請の通知はどこで確認できる？',
      a: '店長（オーナー）様メニューの「勤怠管理」に入ると、申請ボタンに赤いバッジで件数が表示されます。タップすると申請一覧が確認でき、承認・却下が行えます。承認後は自動で勤怠データに反映されます。'
    },
  ];

  faqs.forEach((faq, i) => {
    const y = 0.90 + i * 1.62;
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y, w: 12.7, h: 0.50, fill: { color: C_RED } });
    s.addText('Q  ' + faq.q, {
      x: 0.45, y, w: 12.5, h: 0.50,
      fontSize: 18, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', valign: 'middle'
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.3, y: y + 0.50, w: 12.7, h: 1.02,
      fill: { color: 'FBE9E7' }, line: { color: C_RED, width: 0.5 }
    });
    s.addText('A  ' + faq.a, {
      x: 0.45, y: y + 0.54, w: 12.5, h: 0.96,
      fontSize: 16, color: C_TEXT, fontFace: 'Meiryo UI', valign: 'top'
    });
  });
}

// ==================== スライド 23（新）：よくある質問④（打刻・履歴・承認）====================
{
  const s = pptx.addSlide();
  s.background = { color: 'F8F9FA' };
  addHeader(s, '15.  よくある質問 ④（打刻・履歴・承認について）', '006064');

  const faqs = [
    {
      q: '打刻履歴はどこで確認できる？',
      a: '勤怠入力画面で認証後、画面下の「履歴」をタップ → 自分の管理番号を入力すると過去の打刻一覧が表示されます。出勤・退勤・休憩の打刻時刻を日別に確認できます。'
    },
    {
      q: '出勤打刻を忘れた・退勤打刻できなかった',
      a: '打刻履歴から該当日をタップ →「修正申請」から正しい時刻と理由を入力して申請してください。打刻していない項目は「−−:−−」と表示されます。'
    },
    {
      q: '承認されたかどうか確認したい',
      a: 'スタッフ側からは承認確認画面はありません。就労時間の画面で時間が反映されていれば承認済みです。心配な場合は直接店長（オーナー）様に確認してください。'
    },
    {
      q: '勤怠入力の認証番号・パスワードを忘れた',
      a: '勤怠入力・シフト変更の画面では各自に配布された管理番号とパスワードを使用します。わからない場合は店長（オーナー）様に確認してください。'
    },
  ];

  faqs.forEach((faq, i) => {
    const y = 0.90 + i * 1.62;
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y, w: 12.7, h: 0.50, fill: { color: '006064' } });
    s.addText('Q  ' + faq.q, {
      x: 0.45, y, w: 12.5, h: 0.50,
      fontSize: 18, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', valign: 'middle'
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.3, y: y + 0.50, w: 12.7, h: 1.02,
      fill: { color: 'E0F2F1' }, line: { color: '006064', width: 0.5 }
    });
    s.addText('A  ' + faq.a, {
      x: 0.45, y: y + 0.54, w: 12.5, h: 0.96,
      fontSize: 16, color: C_TEXT, fontFace: 'Meiryo UI', valign: 'top'
    });
  });
}

// ==================== スライド（新）：よくある質問⑤（操作・その他）====================
{
  const s = pptx.addSlide();
  s.background = { color: 'F8F9FA' };
  addHeader(s, '15.  よくある質問 ⑤（操作・その他）', '4527A0');

  const faqs = [
    {
      q: '修正申請フォームに何を入力すればいい？',
      a: '「修正後の出勤時刻」「修正後の退勤時刻」と「申請理由」の3つを入力します。理由は「出勤打刻を忘れました」など具体的に書いてください。元の時刻は変更できません。'
    },
    {
      q: '申請したのに就労時間に変化がない',
      a: '修正申請は店長（オーナー）様の承認が完了してはじめて反映されます。店長（オーナー）様に「勤怠管理 → 申請ボタンを確認してください」と伝えてください。却下された場合は再度申請が必要です。'
    },
    {
      q: '店長（オーナー）様に申請が届いているか確認したい（店長（オーナー）様向け）',
      a: '勤怠管理画面の「申請」ボタンに赤いバッジ（数字）が表示されると新しい申請があります。バッジがない場合は申請がないか、すでに対応済みです。'
    },
    {
      q: 'アプリが表示されない・画面が真っ白になった',
      a: 'ブラウザのページを更新（リロード）してください。それでも直らない場合はブラウザを閉じて再度URLを開いてください。問題が続く場合は店長（オーナー）様に連絡してください。'
    },
  ];

  faqs.forEach((faq, i) => {
    const y = 0.90 + i * 1.62;
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y, w: 12.7, h: 0.50, fill: { color: '4527A0' } });
    s.addText('Q  ' + faq.q, {
      x: 0.45, y, w: 12.5, h: 0.50,
      fontSize: 18, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', valign: 'middle'
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.3, y: y + 0.50, w: 12.7, h: 1.02,
      fill: { color: 'EDE7F6' }, line: { color: '4527A0', width: 0.5 }
    });
    s.addText('A  ' + faq.a, {
      x: 0.45, y: y + 0.54, w: 12.5, h: 0.96,
      fontSize: 16, color: C_TEXT, fontFace: 'Meiryo UI', valign: 'top'
    });
  });
}

// ==================== スライド 23：おわり ====================
{
  const s = pptx.addSlide();
  s.background = { color: '0D47A1' };
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { type: 'gradient', stops: [{ position: 0, color: '0D47A1' }, { position: 100, color: '1976D2' }] }
  });
  s.addText('ご不明な点は店長（オーナー）様にご相談ください', {
    x: 0.5, y: 2.0, w: 12.3, h: 1.0,
    fontSize: 34, bold: true, color: C_WHITE, fontFace: 'Meiryo UI', align: 'center'
  });
  s.addText('打刻・修正申請・シフト変更などお気軽にお問い合わせください', {
    x: 0.5, y: 3.2, w: 12.3, h: 0.7,
    fontSize: 22, color: 'B3E5FC', fontFace: 'Meiryo UI', align: 'center'
  });
  s.addShape(pptx.ShapeType.rect, { x: 3.5, y: 4.1, w: 6.3, h: 0.04, fill: { color: C_WHITE } });
  s.addText('オゾシフ　シフト勤怠管理アプリ', {
    x: 0.5, y: 4.25, w: 12.3, h: 0.6,
    fontSize: 20, color: 'E3F2FD', fontFace: 'Meiryo UI', align: 'center'
  });
}

// ==================== 保存 ====================
pptx.writeFile({ fileName: OUT })
  .then(() => console.log('✅ PowerPoint作成完了:\n' + OUT))
  .catch(e => console.error('❌ エラー:', e));
