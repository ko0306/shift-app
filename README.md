# オゾシフ（OzoShift）

スマホ完結型のシフト・勤怠管理PWAアプリです。
飲食・小売・サービス業の中小店舗向けに設計されています。

---

## 主な機能

| 機能 | 説明 |
|------|------|
| シフト希望提出 | スタッフがスマホから希望日・希望時間を提出 |
| シフト作成 | オーナーがスタッフの希望を見ながらシフトを確定 |
| 勤怠入力（打刻） | 出勤・退勤・休憩のダブルクリック打刻 |
| 打刻履歴・修正申請 | スタッフが履歴確認・修正申請、オーナーが承認 |
| 就労時間集計 | オーナーが月次の就労時間を確定・確認 |
| プッシュ通知 | シフトリマインダー・打刻不備アラートなど |

---

## 技術スタック

- **フロントエンド**: React（Create React App）/ PWA
- **バックエンド**: Supabase（PostgreSQL + REST API + Edge Functions）
- **デプロイ**: Cloudflare Pages
- **プッシュ通知**: Web Push API（VAPID）

---

## 新店舗へのセットアップ手順

### 1. このリポジトリをクローン

```bash
git clone https://github.com/joudencompany/ozoshift.git
cd ozoshift
npm install
```

### 2. Supabase プロジェクトを作成

1. [https://supabase.com](https://supabase.com) でプロジェクト作成
2. Settings → API から以下を取得：
   - Project URL
   - anon / public キー

### 3. 接続情報を設定

`src/supabaseClient.js` を編集：

```js
const supabaseUrl = 'https://xxxxxxxxxx.supabase.co';  // ← 書き換え
const supabaseAnonKey = 'eyJ...';                        // ← 書き換え
```

`public/service-worker.js` の3〜4行目も同様に書き換え：

```js
const SUPABASE_URL = 'https://xxxxxxxxxx.supabase.co';  // ← 書き換え
const SUPABASE_ANON_KEY = 'eyJ...';                      // ← 書き換え
```

### 4. GitHub にプッシュして Cloudflare Pages でデプロイ

```bash
git remote set-url origin https://github.com/{ユーザー名}/{リポジトリ名}.git
git push -u origin main
```

Cloudflare Pages の設定：
- Framework preset: `Create React App`
- Build command: `npm run build`
- Build output directory: `build`

---

## 開発環境での起動

```bash
npm install
npm start
# → http://localhost:3000
```

---

## ディレクトリ構成

```
src/
├── App.js               # メインアプリ・ルーティング
├── supabaseClient.js    # Supabase接続設定 ★要書き換え
├── RegisterUser.jsx     # 新人登録・スタッフ管理（オーナー）
├── ManagerCreate.jsx    # シフト作成（オーナー）
├── ManagerAttendance.js # 勤怠管理・承認（オーナー）
├── StaffShiftView.js    # シフト確認（スタッフ）
├── StaffShiftEdit.js    # シフト変更（スタッフ）
├── StaffWorkHours.js    # 就労時間確認（スタッフ）
├── ClockInInput.js      # 勤怠打刻
├── PasswordReset.js     # パスワード変更
└── ShiftAnalysis.js     # シフト分析
public/
├── service-worker.js    # PWA・プッシュ通知 ★要書き換え
├── manifest.json        # PWA設定
└── _redirects           # SPAルーティング（Cloudflare Pages用）
```

---

© OZNONIX. All rights reserved.

---

## Original CRA Info

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
