import React, { useState, useEffect } from 'react';
import RegisterUser from './RegisterUser';
import ManagerCreate from './ManagerCreate';
import StaffShiftView from './StaffShiftView';
import ManagerShiftView from './ManagerShiftView';
import StaffShiftEdit from './StaffShiftEdit';
import ManagerAttendance from './ManagerAttendance';
import StaffWorkHours from './StaffWorkHours';
import ClockInInput from './ClockInInput';
import PasswordReset from './PasswordReset';
import { supabase } from './supabaseClient';

import './App.css';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxRI2c6dCEa4wS8gCJZkNXXY9_4g1IR8mKJs8EYRLquf-yxFz9wZhB3HmfKJBGy-KCU/exec';

const VAPID_PUBLIC_KEY = 'BNE3hcOnLs-ekXFP3EX52HHYAxQgHacGA66A2E6IHRCcSzna-xYwSf4RW33VuXTWtbK_q6oRyUPD966RzYlrDyg';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// SHA-256ハッシュ（crypto.subtle が使えない環境向けのピュアJS実装付き）
const sha256Pure = async (str) => {
  // crypto.subtle が使える場合はそちらを優先
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // フォールバック：ピュアJS SHA-256（LINE/古いWebView向け）
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const r=(n,b)=>(n>>>b)|(n<<(32-b));
  const msg=[...new TextEncoder().encode(str)];
  msg.push(0x80);
  while(msg.length%64!==56) msg.push(0);
  const len=str.length*8;
  for(let i=7;i>=0;i--) msg.push((len/(2**(i*8)))&0xff);
  let [h0,h1,h2,h3,h4,h5,h6,h7]=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  for(let i=0;i<msg.length;i+=64){
    const w=[];
    for(let j=0;j<16;j++) w[j]=(msg[i+j*4]<<24)|(msg[i+j*4+1]<<16)|(msg[i+j*4+2]<<8)|msg[i+j*4+3];
    for(let j=16;j<64;j++) w[j]=(r(w[j-2],17)^r(w[j-2],19)^(w[j-2]>>>10))+w[j-7]+(r(w[j-15],7)^r(w[j-15],18)^(w[j-15]>>>3))+w[j-16]|0;
    let[a,b,c,d,e,f,g,h]=[h0,h1,h2,h3,h4,h5,h6,h7];
    for(let j=0;j<64;j++){
      const t1=h+((r(e,6)^r(e,11)^r(e,25)))+((e&f)^(~e&g))+K[j]+w[j]|0;
      const t2=((r(a,2)^r(a,13)^r(a,22)))+((a&b)^(a&c)^(b&c))|0;
      [h,g,f,e,d,c,b,a]=[g,f,e,d+t1|0,c,b,a,t1+t2|0];
    }
    [h0,h1,h2,h3,h4,h5,h6,h7]=[h0+a|0,h1+b|0,h2+c|0,h3+d|0,h4+e|0,h5+f|0,h6+g|0,h7+h|0];
  }
  return [h0,h1,h2,h3,h4,h5,h6,h7].map(n=>(n>>>0).toString(16).padStart(8,'0')).join('');
};
const hashPassword = sha256Pure;

// ヘルプモーダルコンポーネント（省略 - 元のコードと同じ）
const HelpModal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'sticky',
            top: '1rem',
            left: '100%',
            marginRight: '1rem',
            backgroundColor: '#FF5722',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1,
            fontSize: '24px',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>
        <div style={{ padding: '2rem', paddingTop: '0' }}>
          {content}
        </div>
      </div>
    </div>
  );
};

const getHelpContent = (page, managerNumber = '') => {
  const isManager = managerNumber === '0000';
  const contents = {
  login: (
  <div>
    <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>ログイン画面の使い方</h2>
    <ol style={{ lineHeight: '1.8' }}>
      <li><strong>管理番号</strong>を入力します</li>
      <li><strong>パスワード</strong>を入力します</li>
      <li><strong>ログイン</strong>ボタンをクリックします</li>
    </ol>
    <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
      <strong>💡 ポイント：</strong>
      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
        <li>管理番号は各自に割り当てられた番号です</li>
        <li>パスワードを忘れた場合は「パスワード変更」から変更できます</li>
        <li>パスワード入力欄の右側の目のマークを押すと、入力した文字の表示・非表示を切り替えられます</li>
      </ul>
    </div>
  </div>
),
     clockin: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>勤怠入力の使い方</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>パスワード認証</strong>を行います（パスワードは管理者に確認してください）</li>
          <li><strong>管理番号</strong>を入力して「次へ」ボタンをクリックします</li>
          <li><strong>該当するボタンを長押し</strong>（約0.8秒）して記録します
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>🟢 出勤：勤務開始時に押します</li>
              <li>🔵 退勤：勤務終了時に押します</li>
              <li>🟠 休憩開始：休憩に入る時に押します</li>
              <li>🟣 休憩終了：休憩から戻る時に押します</li>
            </ul>
          </li>
          <li><strong>履歴ボタン</strong>から過去の記録を確認・修正できます</li>
        </ol>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>ボタンは必ず長押しして記録してください（誤操作防止のため）</li>
            <li>記録後は画面下部の「最近の記録」で確認できます</li>
            <li>修正が必要な場合は履歴から該当日を選んで修正申請できます</li>
            <li>修正は承認が必要です（申請中/承認済のステータスで確認できます）</li>
          </ul>
        </div>
      </div>
    ),

   roleSelect: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>役職選択画面の使い方</h2>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>👤 あなたの役職に合ったボタンを選択してください。</p>
        </div>

        <h3 style={{ color: '#1976D2', marginTop: '1rem' }}>各ボタンの説明：</h3>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>アルバイト</strong>：シフトの提出・確認・変更や就労時間の確認ができます</li>
          {isManager && (
            <li><strong>店長</strong>：シフト作成・確認・勤怠管理・新人登録ができます</li>
          )}
          <li><strong>勤怠入力</strong>：出勤・退勤・休憩の打刻ができます</li>
        </ul>

        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
            <li>自分の役職に合ったボタンを選んでください</li>
            {isManager
              ? <li>店長メニューではシフト作成・勤怠管理などが行えます</li>
              : <li>アルバイトメニューからシフト提出・確認ができます</li>
            }
            <li>勤怠入力は出退勤の打刻専用画面です</li>
          </ul>
        </div>
      </div>
    ),

    staffMenu: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>アルバイトメニューの使い方</h2>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>📋 シフトの提出・確認・変更や、就労時間の確認ができます。</p>
        </div>

        <h3 style={{ color: '#1976D2', marginTop: '1rem' }}>各ボタンの説明：</h3>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>📅 シフト関連</strong>：シフトに関するメニューを開きます
            <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.8' }}>
              <li><strong>シフト提出</strong>：希望シフトを新しく提出します</li>
              <li><strong>シフト変更</strong>：提出済みのシフトを修正します</li>
              <li><strong>シフト確認</strong>：店長が作成した確定シフトを確認します</li>
            </ul>
          </li>
          <li><strong>就労時間確認</strong>：自分の勤務時間の実績を確認します</li>
          <li><strong>お問い合わせ</strong>：問題や質問をフォームで送ることができます</li>
        </ul>

        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
            <li>シフト提出は期限までに行ってください</li>
            <li>確定シフトは店長が作成後に「シフト確認」で見られます</li>
            <li>就労時間は確定済みのデータのみ反映されます</li>
          </ul>
        </div>
      </div>
    ),

    shiftPeriod: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>新規提出 - 期間選択の使い方</h2>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>📅 シフトを提出したい期間の開始日と終了日を選びます。</p>
        </div>

        <h3 style={{ color: '#1976D2', marginTop: '1rem' }}>手順：</h3>
        <ol style={{ lineHeight: '2' }}>
          <li><strong>開始日</strong>：シフト提出を始めたい日付を選択します</li>
          <li><strong>終了日</strong>：シフト提出を終わらせたい日付を選択します</li>
          <li><strong>次へ</strong>ボタンをクリックすると、日ごとの時間入力画面に進みます</li>
          <li>または<strong>候補</strong>ボタンを押すと、店長が設定した提出期間の候補から選べます</li>
        </ol>

        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>⚠️ 注意点：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
            <li>終了日は開始日より後の日付にしてください</li>
            <li>店長がすでにシフトを組んだ日付が含まれている場合は提出できません</li>
            <li>提出済みの期間を変更したい場合は「シフト変更」から行ってください</li>
          </ul>
        </div>
      </div>
    ),

managerAuth: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>店長パスワード画面の使い方</h2>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>🔐 店長メニューに入るためのパスワード認証画面です。</p>
        </div>

        <h3 style={{ color: '#1976D2', marginTop: '1rem' }}>手順：</h3>
        <ol style={{ lineHeight: '2' }}>
          <li>パスワード入力欄に<strong>店長パスワード</strong>を入力します</li>
          <li><strong>認証</strong>ボタンをクリックします</li>
          <li>認証が成功すると店長メニューに進みます</li>
        </ol>

        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>⚠️ 注意点：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
            <li>パスワードは店長のみが知っている番号です</li>
            <li>パスワードを忘れた場合はシステム管理者に連絡してください</li>
            <li>誤ったパスワードを入力するとエラーが表示されます</li>
          </ul>
        </div>
      </div>
    ),

    managerMenu: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>店長メニューの使い方</h2>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>🏪 シフト管理・勤怠管理・スタッフ登録などが行えます。</p>
        </div>

        <h3 style={{ color: '#1976D2', marginTop: '1rem' }}>各ボタンの説明：</h3>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>📅 シフト関連</strong>：シフトに関するメニューを開きます
            <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.8' }}>
              <li><strong>シフト期限設定</strong>：スタッフへのシフト提出期限を設定・通知します</li>
              <li><strong>シフト作成</strong>：スタッフの希望をもとにシフトを作成します</li>
              <li><strong>シフト確認</strong>：作成済みのシフトを確認します</li>
              <li><strong>🆘 ヘルプ通知</strong>：緊急連絡やシフト提出のお願いを全員に送信します</li>
            </ul>
          </li>
          <li><strong>勤怠管理</strong>：スタッフの打刻記録の確認・承認・修正ができます</li>
          <li><strong>新人登録</strong>：新しいスタッフの管理番号とパスワードを登録します</li>
          <li><strong>お問い合わせ</strong>：問題や質問をフォームで送ることができます</li>
        </ul>

        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
            <li>シフト作成はスタッフが希望を提出した後に行ってください</li>
            <li>勤怠管理では修正申請の承認・拒否ができます</li>
            <li>新人登録後はスタッフに管理番号とパスワードを伝えてください</li>
          </ul>
        </div>
      </div>
    ),

    shiftInput: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト入力画面の使い方</h2>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>📝 各日付ごとに勤務希望時間を入力します。</p>
        </div>

        <h3 style={{ color: '#1976D2', marginTop: '1rem' }}>入力モードの説明：</h3>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>終日フリー</strong>：その日はいつでも出勤可能な場合に選択します</li>
          <li><strong>終日不可</strong>：その日は出勤できない場合に選択します</li>
          <li><strong>時間指定</strong>：出勤できる開始・終了時間を入力します</li>
        </ul>

        <h3 style={{ color: '#1976D2', marginTop: '1rem' }}>一括設定の使い方：</h3>
        <ol style={{ lineHeight: '2' }}>
          <li>画面上部の曜日ボタン（月〜日・全て）をタップして対象曜日を選びます</li>
          <li>モード（終日フリー／終日不可／時間指定）を選択します</li>
          <li>時間指定の場合は開始・終了時間を入力します</li>
          <li><strong>一括適用</strong>ボタンを押すと選択した曜日にまとめて反映されます</li>
        </ol>

        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
            <li>備考欄に「遅刻予定」「早退希望」などのメモを残せます</li>
            <li>全ての日付を入力したら「送信」ボタンで提出してください</li>
            <li>店長がすでにシフトを組んだ日付が含まれる場合は送信できません</li>
          </ul>
        </div>
      </div>
    ),

  };
  return contents[page] || contents.login;
};

function App() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [managerNumberInput, setManagerNumberInput] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [role, setRole] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [managerNumber, setManagerNumber] = useState('');
  const [loggedInManagerNumber, setLoggedInManagerNumber] = useState(''); // ログインした管理番号を保存
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftTimes, setShiftTimes] = useState([]);
  const [bulkStartHour, setBulkStartHour] = useState('');
  const [bulkStartMin, setBulkStartMin] = useState('');
  const [bulkEndHour, setBulkEndHour] = useState('');
  const [bulkEndMin, setBulkEndMin] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [managerAuth, setManagerAuth] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [managerPass, setManagerPass] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [managerPassError, setManagerPassError] = useState('');
  const [managerStep, setManagerStep] = useState('');
  const [showHelp, setShowHelp] = useState(false);
const [showPassword, setShowPassword] = useState(false);
  const [currentHelpPage, setCurrentHelpPage] = useState('login');
  
  const [navigationHistory, setNavigationHistory] = useState([]);
  // 既存の state の下に追加
// eslint-disable-next-line no-unused-vars
const [showAddUserModal, setShowAddUserModal] = useState(false);
// eslint-disable-next-line no-unused-vars
const [availableUsers, setAvailableUsers] = useState([]); // シフト未提出の人
// eslint-disable-next-line no-unused-vars
const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]); // 追加対象として選択した人
const [bulkMode, setBulkMode] = useState('time'); // 一括設定のモード
const [recruitmentInfo, setRecruitmentInfo] = useState({}); // 募集人数設定
const [submissionCounts, setSubmissionCounts] = useState({}); // 日付ごと提出人数
const [showCandidateModal, setShowCandidateModal] = useState(false);
const [candidates, setCandidates] = useState([]);
const [candidateLoading, setCandidateLoading] = useState(false);
const [candidateError, setCandidateError] = useState('');
const [showDeadlineModal, setShowDeadlineModal] = useState(false);
const [deadlinePeriodStart, setDeadlinePeriodStart] = useState('');
const [deadlinePeriodEnd, setDeadlinePeriodEnd] = useState('');
const [deadlineDate, setDeadlineDate] = useState('');
const [deadlineDaysBefore, setDeadlineDaysBefore] = useState(3);
const [staffNotice, setStaffNotice] = useState(null);
const [noticeDismissed, setNoticeDismissed] = useState(false);
const [showInstallBanner, setShowInstallBanner] = useState(false);
const [installPromptEvent, setInstallPromptEvent] = useState(null);
const [isIOS, setIsIOS] = useState(false);
const [showNotifModal, setShowNotifModal] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
const [loggedInName, setLoggedInName] = useState('');
const [staffShiftSub, setStaffShiftSub] = useState(false);
const [managerShiftSub, setManagerShiftSub] = useState(false);
const [showHelpNotifModal, setShowHelpNotifModal] = useState(false);
const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('notifEnabled') === 'true');
const [showNotifPrompt, setShowNotifPrompt] = useState(false);
const [showPushDebug, setShowPushDebug] = useState(false);
const [showBatteryGuide, setShowBatteryGuide] = useState(false);
const [showHomeScreenPrompt, setShowHomeScreenPrompt] = useState(false);
const [notifToast, setNotifToast] = useState('');
const [notifHistory, setNotifHistory] = useState([]);
const [showNotifList, setShowNotifList] = useState(false);
const [newNotifCount, setNewNotifCount] = useState(0);
  const fetchNotifHistory = async (managerNum) => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('title, body, created_at, target_manager_number')
        .or(`target_manager_number.is.null,target_manager_number.eq.${managerNum}`)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) {
        setNotifHistory(data);
        const lastSeen = localStorage.getItem('lastSeenNotifAt');
        if (!lastSeen) {
          // 初回：既存通知を全て既読扱いにする
          localStorage.setItem('lastSeenNotifAt', new Date().toISOString());
          setNewNotifCount(0);
        } else {
          const unread = data.filter(n => (n.created_at || '') > lastSeen).length;
          setNewNotifCount(unread);
        }
      }
    } catch (e) { console.error('通知履歴取得エラー:', e); }
  };

  // 通知タイトルの色分けヘルパー
  const getNotifStyle = (title = '') => {
    const t = title;
    if (t.includes('緊急') || t.includes('⚠️'))
      return { bg: '#ffebee', border: '#ef9a9a', titleColor: '#c62828' };
    if (t.includes('急募') || t.includes('🆘') || t.includes('ヘルプ'))
      return { bg: '#fce4ec', border: '#f48fb1', titleColor: '#ad1457' };
    if (t.includes('⏰') || t.includes('明日') || t.includes('シフト開始') || t.includes('リマインダー'))
      return { bg: '#e8f5e9', border: '#a5d6a7', titleColor: '#2e7d32' };
    if (t.includes('シフト提出') || t.includes('お願い') || t.includes('期限'))
      return { bg: '#fff3e0', border: '#ffcc80', titleColor: '#e65100' };
    if (t.includes('打刻'))
      return { bg: '#fff8e1', border: '#ffe082', titleColor: '#f57f17' };
    return { bg: '#f5f5f5', border: '#e0e0e0', titleColor: '#555' };
  };

  const showNotifToast = (msg) => {
    setNotifToast(msg);
    setTimeout(() => setNotifToast(''), 3000);
  };

  const saveNotif = async (title, body, targetManagerNumber = null) => {
    try {
      await supabase.from('notifications').insert([{ title, body, target_manager_number: targetManagerNumber }]);
    } catch (e) { console.error('通知保存エラー:', e); }
  };

  const fetchCandidates = async () => {
    setCandidateLoading(true);
    setCandidateError('');
    setCandidates([]);
    try {
      const res = await fetch(`${GAS_URL}?managerNumber=1234`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || '取得に失敗しました');
      const pending = (data.candidates || []).filter(c => !c.isDone);
      if (pending.length === 0) {
        setCandidateError('未処理の候補シフト期間が見つかりませんでした');
      } else {
        setCandidates(pending);
      }
    } catch (e) {
      setCandidateError(e.message || '取得中にエラーが発生しました');
    } finally {
      setCandidateLoading(false);
    }
  };

  const resetAllInputs = () => {
    setManagerNumber('');
    setStartDate('');
    setEndDate('');
    setShiftTimes([]);
    setBulkStartHour('');
    setBulkStartMin('');
    setBulkEndHour('');
    setBulkEndMin('');
    setSelectedDays([]);
    setManagerPass('');
    setManagerPassError('');
  };

  // 自動ログイン（ログイン省略設定）
  useEffect(() => {
    const saved = localStorage.getItem('autoLoginData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.expiresAt > Date.now()) {
          setLoggedInManagerNumber(data.managerNumber);
          setLoggedInName(data.name || '');
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('autoLoginData');
        }
      } catch (e) { localStorage.removeItem('autoLoginData'); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Android Chrome判定（Samsung/UC/LINE等を除く本物のChrome）
  const _isAndroidChrome = (() => {
    const ua = navigator.userAgent;
    return /Android/i.test(ua) && /Chrome\//.test(ua) &&
      !/SamsungBrowser\//.test(ua) && !/UCBrowser\//.test(ua) &&
      !/HuaweiBrowser\//.test(ua) && !/Edg\//.test(ua) &&
      !/OPR\//.test(ua) && !/Line\//i.test(ua);
  })();

  // ホーム画面追加プロンプト（Chrome/Edge）
  useEffect(() => {
    if (window.__pwaInstallEvent) {
      setInstallPromptEvent(window.__pwaInstallEvent);
    }
    const handler = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      window.__pwaInstallEvent = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // beforeinstallpromptが発火したらバナー表示
  useEffect(() => {
    if (!installPromptEvent) return;
    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (isStandalone) return;
    } catch(e) {}
    const dismissedAt = localStorage.getItem('installBannerDismissedAt');
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;
    setShowInstallBanner(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installPromptEvent]);

  // ?install=1 パラメータがあればバナー表示（Android Chrome除外）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('install') === '1') {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(ios);
      window.history.replaceState({}, '', window.location.pathname);
      setShowInstallBanner(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // スタッフログイン後：通知未設定 or PWAで未許可の場合にプロンプトを表示
  useEffect(() => {
    if (!isLoggedIn || role !== 'staff') return;
    const neverSet = localStorage.getItem('notifEnabled') === null;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone;
    const hasPushManager = 'serviceWorker' in navigator && 'PushManager' in window;
    // PWAモード: ブラウザ権限がgrantedでもdeniedでもなければ（= default）プロンプトを表示
    // これにより「後で」を押した人も次回PWA起動時に再表示される
    const standaloneNotGranted = isStandalone
      && hasPushManager
      && 'Notification' in window
      && Notification.permission !== 'granted'
      && Notification.permission !== 'denied';
    if (neverSet || standaloneNotGranted) {
      setShowNotifPrompt(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, role]);

  // ログイン後にホーム画面追加バナーを表示
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone;
      if (isStandalone) return;
    } catch (e) {}
    // 初回ログイン（notifEnabled未設定）はdismissedAtを無視して必ず表示
    const isFirstTime = localStorage.getItem('notifEnabled') === null;
    // Android初回はHomeScreenPromptModalで案内するのでここでは表示しない
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isFirstTime && isAndroid) return;
    if (!isFirstTime) {
      const dismissedAt = localStorage.getItem('installBannerDismissedAt');
      if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    setShowInstallBanner(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (role === 'staff') {
      setNoticeDismissed(false);
      supabase.from('settings').select('value').eq('key', 'shift_deadline_notice').single()
        .then(({ data }) => {
          if (data) {
            const notice = JSON.parse(data.value);
            if (notice.is_active) setStaffNotice(notice);
            else setStaffNotice(null);
          } else {
            setStaffNotice(null);
          }
        });
    }
    if (role && loggedInManagerNumber) {
      fetchNotifHistory(loggedInManagerNumber);
    }
    // push_subscriptions未登録かつ通知ONの場合 → 自動登録を試みる
    // ※ AndroidではuseEffectからNotification.requestPermission()を呼べない（user gesture必須）ため
    //    ボタン押下時のregisterPushSilentに任せる
    if (role && loggedInManagerNumber && notifEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        // registerPushSilent 内でDB照合を行い、エンドポイントが一致する場合は再登録しない
        registerPushSilent(loggedInManagerNumber);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, loggedInManagerNumber]);

  // eslint-disable-next-line no-unused-vars
  const subscribePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('このブラウザはプッシュ通知に対応していません');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('通知が拒否されました。ブラウザの設定から通知を許可してください');
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await supabase.from('push_subscriptions').upsert(
        { manager_number: loggedInManagerNumber, subscription: JSON.stringify(sub.toJSON()) },
        { onConflict: 'manager_number' }
      );
      alert('✅ 通知を受け取る設定が完了しました！');
    } catch (e) {
      alert('設定に失敗しました: ' + e.message);
    }
  };

  // IndexedDB に管理番号を保存（SW の pushsubscriptionchange ハンドラで使用）
  const saveManagerNumToIDB = (managerNum) => {
    try {
      const req = indexedDB.open('shift-app-sw', 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('store');
      req.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction('store', 'readwrite');
        tx.objectStore('store').put(managerNum, 'managerNumber');
      };
    } catch (_) {}
  };

  // プッシュ通知を登録（ボタンON時に呼び出す）
  // ★ 既存サブスクリプションがDBと一致する場合は再登録しない（不要な再登録がバックグラウンド通知を妨げていた）
  const registerPushSilent = async (managerNum) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      showNotifToast('⚠️ このブラウザはプッシュ通知に対応していません');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        showNotifToast('⚠️ ブラウザの設定で通知を許可してください');
        return false;
      }
      if (permission !== 'granted') return false;
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();

      // 既存サブスクリプションのエンドポイントとDB上のものを比較
      let sub = existing;
      if (existing) {
        const { data: dbRow } = await supabase.from('push_subscriptions')
          .select('subscription').eq('manager_number', managerNum).single();
        const dbEndpoint = dbRow ? JSON.parse(dbRow.subscription)?.endpoint : null;
        if (dbEndpoint === existing.endpoint) {
          // DB と一致 → 再登録不要（既存のまま維持）
          saveManagerNumToIDB(managerNum);
          return true;
        }
        // エンドポイントが変わっている → 再登録
        await existing.unsubscribe();
        sub = null;
      }
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }
      const { error: dbErr } = await supabase.from('push_subscriptions').upsert(
        { manager_number: managerNum, subscription: JSON.stringify(sub.toJSON()) },
        { onConflict: 'manager_number' }
      );
      if (dbErr) {
        showNotifToast('❌ DB保存エラー: ' + dbErr.message);
        return false;
      }
      saveManagerNumToIDB(managerNum);
      showNotifToast('✅ プッシュ通知の登録が完了しました');
      return true;
    } catch (e) {
      console.error('プッシュ登録エラー:', e);
      showNotifToast('❌ 登録エラー: ' + (e?.message || String(e)));
      return false;
    }
  };

  const pushToHistory = (state) => {
    setNavigationHistory(prev => [...prev, state]);
  };

  const goBack = () => {
    if (navigationHistory.length === 0) return;

    const previousState = navigationHistory[navigationHistory.length - 1];
    const newHistory = navigationHistory.slice(0, -1);
    
    setNavigationHistory(newHistory);
    setRole(previousState.role || '');
    setCurrentStep(previousState.currentStep || '');
    setManagerAuth(previousState.managerAuth || false);
    setManagerStep(previousState.managerStep || '');
    setIsLoggedIn(previousState.isLoggedIn !== undefined ? previousState.isLoggedIn : true);
    
    resetAllInputs();
  };

  const shouldShowBackButton = () => {
    return navigationHistory.length > 0;
  };

  const [currentHelpManagerNumber, setCurrentHelpManagerNumber] = useState('');

const openHelp = (page, managerNumber = '') => {
  setCurrentHelpPage(page);
  setCurrentHelpManagerNumber(managerNumber);
  setShowHelp(true);
};

 const handleLogin = async (e) => {
  e.preventDefault();
  
  if (!managerNumberInput.trim()) {
    setLoginMessage('管理番号を入力してください');
    return;
  }

  if (!password) {
    setLoginMessage('パスワードを入力してください');
    return;
  }

  if (managerNumberInput === '0000') {
    if (password === '0306') {
      setIsLoggedIn(true);
      setLoggedInManagerNumber('0000');
      setLoggedInName('店長');
      setLoginMessage('');
      setNavigationHistory([]);
      if (rememberMe) {
        localStorage.setItem('autoLoginData', JSON.stringify({ managerNumber: '0000', name: '店長', expiresAt: Date.now() + 30*24*60*60*1000 }));
      }
    } else {
      setLoginMessage('パスワードが違います');
    }
    return;
  }

  try {
    // ✅ is_deleted = false のユーザーのみ取得
    const { data, error } = await supabase
      .from('users')
      .select('manager_number, user_password, is_deleted, name')
      .eq('manager_number', managerNumberInput)
      .eq('is_deleted', false)
      .single();

    if (error || !data) {
      setLoginMessage('管理番号が登録されていません');
      return;
    }

    if (!data.user_password) {
      setLoginMessage('パスワードが設定されていません。管理者に連絡してください');
      return;
    }

    const hashedInputPassword = await hashPassword(password);
    if (hashedInputPassword !== data.user_password) {
      setLoginMessage('パスワードが違います');
      return;
    }

    const name = data?.name || managerNumberInput;
    setIsLoggedIn(true);
    setLoggedInManagerNumber(managerNumberInput);
    setLoggedInName(name);
    setLoginMessage('');
    setNavigationHistory([]);
    if (rememberMe) {
      localStorage.setItem('autoLoginData', JSON.stringify({ managerNumber: managerNumberInput, name, expiresAt: Date.now() + 30*24*60*60*1000 }));
    }
  } catch (err) {
    setLoginMessage('ログイン中にエラーが発生しました');
  }
};

 const selectRole = (selectedRole) => {
  pushToHistory({
    role: '',
    currentStep: '',
    managerAuth: false,
    managerStep: '',
    isLoggedIn: true
  });
  
   if (selectedRole === 'manager') {
    setManagerAuth(true);
    setManagerStep('');
  }
  if (selectedRole === 'staff') setCurrentStep('');
  setRole(selectedRole); // roleは最後にセット
};

  // handleNext, getWeekday, handleTimeChange等の関数は元のコードと同じ
 
const handleNext = async () => {
  // ログイン時の管理番号を使用
  const targetManagerNumber = loggedInManagerNumber || managerNumber;
  
  if (!targetManagerNumber.trim()) {
    alert('管理番号が取得できませんでした');
    return;
  }
  
  if (!startDate || !endDate || startDate > endDate) {
    alert('正しい開始日・終了日を入力してください');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('manager_number')
      .eq('manager_number', targetManagerNumber)
      .single();

    if (error || !data) {
      alert('管理番号が存在しません。');
      return;
    }
  } catch (err) {
    alert('管理番号が存在しません。');
    return;
  }

  // managerNumberを設定（shiftInput画面で使用するため）
  if (!managerNumber) {
    setManagerNumber(targetManagerNumber);
  }

  pushToHistory({
    role: role,
    currentStep: 'shiftPeriod',
    managerAuth: managerAuth,
    managerStep: managerStep,
    isLoggedIn: true
  });

 const dates = [];
const d = new Date(startDate);
while (d <= new Date(endDate)) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  dates.push({ 
    date: `${yyyy}-${mm}-${dd}`, 
    mode: 'time', // 'free', 'unavailable', 'time'
    startHour: '', 
    startMin: '', 
    endHour: '', 
    endMin: '', 
    remarks: '' 
  });
  d.setDate(d.getDate() + 1);
}

  setShiftTimes(dates);

  // 募集設定と提出人数を取得
  const dateStrings = dates.map(d => d.date);
  try {
    const [settingsResult, shiftsResult] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'recruitment_settings').single(),
      supabase.from('shifts').select('date, manager_number').in('date', dateStrings)
    ]);

    // 提出人数（日付ごとのdistinct manager_number数）
    const countMap = {};
    shiftsResult.data?.forEach(s => {
      if (!countMap[s.date]) countMap[s.date] = new Set();
      countMap[s.date].add(s.manager_number);
    });
    const countByDate = {};
    Object.entries(countMap).forEach(([date, set]) => { countByDate[date] = set.size; });
    setSubmissionCounts(countByDate);

    // 募集設定を解析
    if (!settingsResult.error && settingsResult.data) {
      const settings = JSON.parse(settingsResult.data.value);
      const infoByDate = {};
      dateStrings.forEach(dateStr => {
        const specific = settings.byDate?.find(d => d.date === dateStr);
        if (specific) { infoByDate[dateStr] = { count: specific.count, notes: specific.notes }; return; }
        const dow = new Date(dateStr + 'T00:00:00').getDay();
        const dowSetting = settings.byDayOfWeek?.[dow];
        if (dowSetting?.enabled) infoByDate[dateStr] = { count: dowSetting.count, notes: dowSetting.notes };
      });
      setRecruitmentInfo(infoByDate);
    }
  } catch (e) {
    console.error('募集情報の取得に失敗:', e);
  }

  setCurrentStep('shiftInput');
};
  const getWeekday = (dateStr) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const handleTimeChange = (index, field, value) => {
  const updated = [...shiftTimes];
  updated[index][field] = value;
  
  // モードが変更された場合の処理
  if (field === 'mode') {
    if (value === 'free') {
      updated[index].startHour = '';
      updated[index].startMin = '';
      updated[index].endHour = '';
      updated[index].endMin = '';
    } else if (value === 'unavailable') {
      updated[index].startHour = '';
      updated[index].startMin = '';
      updated[index].endHour = '';
      updated[index].endMin = '';
    }
  }
  
  setShiftTimes(updated);
};

const handleBulkApply = () => {
  const updated = shiftTimes.map(item => {
    const day = getWeekday(item.date);
    if (selectedDays.includes('全て') || selectedDays.includes(day)) {
      if (bulkMode === 'free') {
        return { 
          ...item, 
          mode: 'free',
          startHour: '', 
          startMin: '', 
          endHour: '', 
          endMin: '' 
        };
      } else if (bulkMode === 'unavailable') {
        return { 
          ...item, 
          mode: 'unavailable',
          startHour: '', 
          startMin: '', 
          endHour: '', 
          endMin: '' 
        };
      } else {
        return { 
          ...item, 
          mode: 'time',
          startHour: bulkStartHour, 
          startMin: bulkStartMin, 
          endHour: bulkEndHour, 
          endMin: bulkEndMin 
        };
      }
    }
    return item;
  });
  setShiftTimes(updated);
};

  const getColorForDay = (day) => {
    switch (day) {
      case '月': return '#6c5ce7';
      case '火': return '#00b894';
      case '水': return '#fd79a8';
      case '木': return '#e17055';
      case '金': return '#0984e3';
      case '土': return '#fab1a0';
      case '日': return '#d63031';
      case '全て': return '#636e72';
      default: return '#b2bec3';
    }
  };

  const toggleSelectedDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

const handleSubmit = async () => {
  const targetManagerNumber = loggedInManagerNumber || managerNumber;
  
  try {
    const { data: existingFinalShifts, error: checkError } = await supabase
      .from('final_shifts')
      .select('date')
      .eq('manager_number', targetManagerNumber)
      .gte('date', startDate)
      .lte('date', endDate);

    if (checkError) {
      console.error('シフト確認エラー:', checkError);
      alert('シフトの確認中にエラーが発生しました');
      return;
    }

    if (existingFinalShifts && existingFinalShifts.length > 0) {
      const existingDates = existingFinalShifts
        .map(shift => {
          const date = new Date(shift.date);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          return `${month}月${day}日`;
        })
        .sort()
        .join(', ');
      
      alert(
        `❌ 提出できません\n\n以下の日付は既に店長がシフトを組んでいます:\n\n${existingDates}\n\n店長に確認するか、別の期間を選択してください。`
      );
      return;
    }

    for (const shift of shiftTimes) {
      let startTime = '';
      let endTime = '';
      let remarks = shift.remarks || '';
      
     if (shift.mode === 'free') {
  startTime = '';
  endTime = '';
  remarks = remarks ? `終日フリー\n${remarks}` : '終日フリー';
} else if (shift.mode === 'unavailable') {
  startTime = '';
  endTime = '';
  remarks = remarks ? `終日不可\n${remarks}` : '終日不可';
}else {
        startTime = shift.startHour !== '' && shift.startMin !== '' 
          ? `${String(shift.startHour).padStart(2, '0')}:${String(shift.startMin).padStart(2, '0')}` 
          : '';
        endTime = shift.endHour !== '' && shift.endMin !== '' 
          ? `${String(shift.endHour).padStart(2, '0')}:${String(shift.endMin).padStart(2, '0')}` 
          : '';
      }
      
      const { error } = await supabase
        .from('shifts')
        .insert([{
          manager_number: targetManagerNumber,
          date: shift.date,
          start_time: startTime,
          end_time: endTime,
          remarks: remarks,
        }]);
      if (error) throw error;
    }

    alert('シフトを保存しました！');
    setCurrentStep('');
    setRole('staff');
    resetAllInputs();
  } catch (error) {
    alert(`保存中にエラーが発生しました: ${error.message}`);
  }
};

  const BackButton = () => {
    if (!shouldShowBackButton()) return null;
    
    return (
      <button
        onClick={goBack}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: '2px solid #45a049',
          borderRadius: '8px',
          width: '80px',
          height: '40px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#45a049';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#4CAF50';
          e.target.style.transform = 'translateY(0px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }}
        title="前のページに戻る"
      >
        ← 戻る
      </button>
    );
  };

  const HelpButton = ({ page, managerNumber = '' }) => {
  return (
    <button
      onClick={() => openHelp(page, managerNumber)}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: '#FF9800',
          color: 'white',
          border: '2px solid #F57C00',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          fontSize: '28px',
          fontWeight: 'bold'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#F57C00';
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#FF9800';
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }}
        title="使い方を見る"
      >
        ?
      </button>
    );
  };

  // ========== 通知オン促進プロンプト（スタッフ初回ログイン時） ==========
  // ホーム画面追加ボタン共通ハンドラ（"📲 ホーム画面に追加"ボタンおよびNotifPromptModal後に使用）
  const showInstallFlow = () => {
    try {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (isStandalone) return;
    } catch(e) {}
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    if (!isAndroid) {
      // iOS・PC: InstallBannerで対応
      setShowInstallBanner(true);
      return;
    }
    const isChrome = /Chrome\//.test(ua) && !/SamsungBrowser\//.test(ua) && !/UCBrowser\//.test(ua) && !/HuaweiBrowser\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua) && !/Line\//i.test(ua);
    if (isChrome) {
      const ready = !!(installPromptEvent || window.__pwaInstallEvent);
      if (ready) {
        // Chrome + インストールイベントあり: HomeScreenPromptModalでワンタップ追加
        setShowHomeScreenPrompt(true);
      } else {
        // Chrome + インストールイベントなし（インストール済み等）: InstallBannerでメニュー案内
        setShowInstallBanner(true);
      }
      return;
    }
    // 非Chrome Android（Samsung/LINE等）: Chromeへ誘導モーダル
    setShowHomeScreenPrompt(true);
  };
  const maybeShowHomeScreenPrompt = () => showInstallFlow();

  const NotifPromptModal = () => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.8rem 1.6rem', maxWidth: '340px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: '2.8rem', marginBottom: '0.4rem' }}>🔔</div>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#1565C0' }}>シフト通知を受け取りますか？</h3>
        <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.7, margin: '0 0 1.2rem' }}>
          シフトの締め切りやお知らせを<br />プッシュ通知でお届けします。
        </p>
        <button type="button" onClick={async () => {
          setNotifEnabled(true);
          localStorage.setItem('notifEnabled', 'true');
          const ok = await registerPushSilent(loggedInManagerNumber);
          if (ok) {
            setShowNotifPrompt(false);
            // Android: バッテリー最適化ガイドを一度だけ表示
            const isAndroid = /Android/i.test(navigator.userAgent);
            const shown = localStorage.getItem('batteryGuideShown');
            if (isAndroid && !shown) setShowBatteryGuide(true);
          }
          maybeShowHomeScreenPrompt();
        }}
          style={{ width: '100%', padding: '14px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
          はい、受け取る
        </button>
        <button type="button" onClick={() => {
          setShowNotifPrompt(false);
          setNotifEnabled(false);
          localStorage.setItem('notifEnabled', 'false');
          maybeShowHomeScreenPrompt();
        }}
          style={{ width: '100%', padding: '11px', backgroundColor: '#f5f5f5', color: '#777', border: 'none', borderRadius: '14px', fontSize: '14px', cursor: 'pointer' }}>
          後で
        </button>
      </div>
    </div>
  );

  // ========== ホーム画面追加プロンプト（通知プロンプト後・スタッフ初回） ==========
  const HomeScreenPromptModal = () => {
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const isChromeMobile = isAndroid && /Chrome\//.test(ua) && !/SamsungBrowser\//.test(ua) && !/UCBrowser\//.test(ua) && !/HuaweiBrowser\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua) && !/Line\//i.test(ua);
    const [done, setDone] = React.useState(false);

    const doInstall = async () => {
      const event = installPromptEvent || window.__pwaInstallEvent;
      if (!event) return;
      try {
        await event.prompt();
        const { outcome } = await event.userChoice;
        setInstallPromptEvent(null);
        window.__pwaInstallEvent = null;
        if (outcome === 'accepted') setDone(true);
      } catch(e) {}
    };

    const goToChrome = () => {
      const url = window.location.origin + '/?install=1';
      window.location.href = 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end;';
    };

    const dismiss = () => {
      setShowHomeScreenPrompt(false);
      localStorage.setItem('installBannerDismissedAt', String(Date.now()));
    };

    if (done) {
      return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 5500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '2rem 1.6rem', maxWidth: '340px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ margin: '0 0 0.6rem', fontSize: '1.2rem', color: '#2E7D32' }}>ホーム画面に追加しました！</h3>
            <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.7, margin: '0 0 1.2rem' }}>
              アイコンからアプリを開いてください。
            </p>
            <button type="button" onClick={() => setShowHomeScreenPrompt(false)}
              style={{ width: '100%', padding: '14px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              閉じる
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 5500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.8rem 1.6rem', maxWidth: '340px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.3rem' }}>📲</div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#1565C0' }}>ホーム画面に追加しますか？</h3>
          <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.7, margin: '0 0 1.2rem' }}>
            プッシュ通知が届くようになります。<br />アイコンからいつでも起動できます。
          </p>
          <button type="button" onClick={isChromeMobile ? doInstall : goToChrome}
            style={{ width: '100%', padding: '14px', backgroundColor: '#34A853', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 4px 12px rgba(52,168,83,0.4)' }}>
            {isChromeMobile ? '＋ ホーム画面に追加する' : '🌐 Chromeで追加する'}
          </button>
          <button type="button" onClick={dismiss}
            style={{ width: '100%', padding: '11px', backgroundColor: '#f5f5f5', color: '#777', border: 'none', borderRadius: '14px', fontSize: '14px', cursor: 'pointer' }}>
            後で
          </button>
        </div>
      </div>
    );
  };

  // ========== ホーム画面追加モーダル ==========
  const InstallBanner = () => {
    const ua = navigator.userAgent;
    const isLine = /Line\//i.test(ua);
    const isAndroid = /Android/i.test(ua);
    // iOSをローカルで検出（iPadOS対応：navigator.platform=MacIntel + maxTouchPoints）
    const iosDetect = (
      /iphone|ipad|ipod/i.test(ua) ||
      (typeof navigator.platform === 'string' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    ) && !window.MSStream;
    const isLineIOS = isLine && iosDetect;
    const isDesktop = !isAndroid && !iosDetect;
    const [copied, setCopied] = React.useState(false);
    const [installDone, setInstallDone] = React.useState(false);
    // Android Chrome かどうか（Samsung/UC/Huawei/LINE等はChromeのUAを含むが別ブラウザのため除外）
    const isChromeMobile = isAndroid && !isLine && /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua) && !/SamsungBrowser\//.test(ua) && !/UCBrowser\//.test(ua) && !/HuaweiBrowser\//.test(ua);
    // 他のAndroidブラウザ（Chrome以外）
    const isAndroidNonChrome = isAndroid && !isChromeMobile;

    const dismiss = () => {
      localStorage.setItem('installBannerDismissedAt', String(Date.now()));
      setShowInstallBanner(false);
    };

    const handleInstall = async () => {
      const event = installPromptEvent || window.__pwaInstallEvent;
      if (!event) return; // イベント未取得：バナーはそのまま残す（リロードしない）
      try {
        await event.prompt();
        const { outcome } = await event.userChoice;
        setInstallPromptEvent(null);
        window.__pwaInstallEvent = null;
        if (outcome === 'accepted') {
          setInstallDone(true);
        }
      } catch (err) {
        // prompt失敗時もバナーは残す
      }
    };

    const openInChrome = () => {
      const url = window.location.origin + '/?install=1';
      window.location.href = 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end;';
    };

    const installUrl = window.location.origin + '/?install=1';

    if (installDone) {
      return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '2rem 1.6rem', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ margin: '0 0 0.6rem', fontSize: '1.2rem', color: '#2E7D32' }}>ホーム画面に追加しました！</h3>
            <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.7, margin: '0 0 1.2rem' }}>
              ホーム画面にアイコンが追加されました。<br />
              アイコンからアプリを開いてください。
            </p>
            <button type="button" onClick={() => setShowInstallBanner(false)}
              style={{ width: '100%', padding: '14px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              閉じる
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.8rem 1.6rem', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.3rem' }}>📲</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', color: '#1565C0' }}>ホーム画面に追加しよう</h3>
          <p style={{ margin: '0 0 1rem', fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
            プッシュ通知が届くようになります。<br />アイコンからいつでも起動できます。
          </p>

          {/* Android Chrome */}
          {isChromeMobile && (() => {
            const ready = !!(installPromptEvent || window.__pwaInstallEvent);
            if (ready) {
              return (
                <button type="button" onClick={async () => { await handleInstall(); }}
                  style={{ width: '100%', padding: '16px', backgroundColor: '#34A853', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 4px 12px rgba(52,168,83,0.4)' }}>
                  ＋ ホーム画面に追加する
                </button>
              );
            }
            // beforeinstallpromptが発火しない場合（インストール済み等）→ Chromeメニューから直接追加
            return (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ backgroundColor: '#E8F5E9', borderRadius: '12px', padding: '1rem', textAlign: 'left' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#1B5E20', fontWeight: 'bold' }}>Chromeのメニューから追加してください</p>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#333' }}>① 右上の <strong style={{ fontSize: '18px' }}>⋮</strong> をタップ</p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#333' }}>②「<strong>ホーム画面に追加</strong>」をタップ</p>
                </div>
              </div>
            );
          })()}

          {/* Chrome/Edge (PC): installPromptEventがあればボタン1つ */}
          {installPromptEvent && !isChromeMobile && (
            <button type="button" onClick={handleInstall}
              style={{ width: '100%', padding: '16px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 4px 12px rgba(21,101,192,0.4)' }}>
              ＋ ホーム画面に追加する
            </button>
          )}

          {/* installPromptEventなし */}
          {!installPromptEvent && (
            <>
              {/* PC */}
              {isDesktop && (() => {
                const isChromeBrowser = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
                const isEdgeBrowser = /Edg\//.test(ua);
                const isChromiumBased = isChromeBrowser || isEdgeBrowser;

                if (isChromiumBased) {
                  return (
                    <div style={{ backgroundColor: '#E8EAF6', borderRadius: '12px', padding: '1rem', marginBottom: '8px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#283593', marginBottom: '8px' }}>
                        💻 {isChromeBrowser ? 'Chrome' : 'Edge'}のメニューから追加：
                      </div>
                      <div style={{ fontSize: '13px', color: '#333', lineHeight: 2.1 }}>
                        <div>① 右上の <strong style={{ fontSize: '17px' }}>⋮</strong> をクリック</div>
                        <div>② <strong>「その他のツール」</strong> をクリック</div>
                        <div>③ <strong>「ショートカットを作成」</strong> をクリック</div>
                        <div>④ <strong>「ウィンドウとして開く」</strong> にチェック → <strong>「作成」</strong></div>
                      </div>
                      <button type="button" onClick={() => window.location.reload()}
                        style={{ width: '100%', marginTop: '10px', padding: '9px', backgroundColor: '#3949AB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🔄 再読み込み
                      </button>
                    </div>
                  );
                }

                // Firefox・その他ブラウザ → Chrome/Edgeに誘導
                return (
                  <div style={{ backgroundColor: '#F3E5F5', borderRadius: '12px', padding: '1rem', marginBottom: '8px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#4A148C', marginBottom: '10px' }}>💻 ChromeまたはEdgeで開いてください：</div>

                    {/* Edge: protocol link works on Windows */}
                    <a href={`microsoft-edge:${installUrl}`}
                      style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: '#0078D4', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box', marginBottom: '4px' }}>
                      🌐 Edgeで開いてインストール
                    </a>
                    <div style={{ fontSize: '11px', color: '#555', textAlign: 'center', marginBottom: '14px' }}>
                      ↑ ボタンを押すとEdgeが開き、「＋ ホーム画面に追加する」が表示されます
                    </div>

                    {/* Chrome: no protocol on Windows PC → copy URL */}
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#4A148C', marginBottom: '6px' }}>Chromeで開く場合：</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '6px 8px', marginBottom: '6px' }}>
                      <div style={{ flex: 1, fontSize: '11px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{installUrl}</div>
                      <button type="button" onClick={() => { navigator.clipboard.writeText(installUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        style={{ flexShrink: 0, padding: '5px 10px', backgroundColor: copied ? '#34A853' : '#4285F4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {copied ? '✓ コピー済' : 'URLをコピー'}
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '12px' }}>
                      Chromeを開いて、アドレスバーに貼り付けてください
                    </div>

                    <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', width: '100%', padding: '8px', backgroundColor: '#eee', color: '#555', borderRadius: '8px', fontSize: '11px', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
                      Chromeがない場合はこちらからダウンロード
                    </a>
                  </div>
                );
              })()}


              {/* Android Chrome以外 → Chromeを開くよう誘導 */}
              {isAndroidNonChrome && (
                <div style={{ backgroundColor: '#E8F5E9', borderRadius: '12px', padding: '1rem', marginBottom: '8px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1B5E20', marginBottom: '8px' }}>🤖 Androidの方</div>
                  <button type="button" onClick={openInChrome}
                    style={{ width: '100%', padding: '14px', backgroundColor: '#34A853', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '6px' }}>
                    🌐 Chromeで開く
                  </button>
                  <div style={{ fontSize: '11px', color: '#555', textAlign: 'center' }}>Chromeで開くとホーム画面への追加ができます</div>
                </div>
              )}

              {/* iOS LINE / Chrome / Firefox など Safari 以外 */}
              {iosDetect && !isLineIOS && (
                <div style={{ backgroundColor: '#E3F2FD', borderRadius: '12px', padding: '1rem', marginBottom: '8px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0D47A1', marginBottom: '10px' }}>
                    🍎 Safariで開いてからインストールできます
                  </div>
                  {/* URLコピー */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '6px 8px', marginBottom: '6px' }}>
                    <div style={{ flex: 1, fontSize: '11px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{installUrl}</div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(installUrl).catch(()=>{}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      style={{ flexShrink: 0, padding: '5px 10px', backgroundColor: copied ? '#34A853' : '#1565C0', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {copied ? '✓ コピー済' : 'URLをコピー'}
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '10px' }}>
                    ① URLをコピー → ② Safariを開いてアドレスバーに貼り付け
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', backgroundColor: '#EEF2FF', borderRadius: '6px', padding: '6px 8px' }}>
                    Safariが開いたら「ホーム画面に追加する」ボタンが自動表示されます
                  </div>
                </div>
              )}

              {/* iOS LINE */}
              {isLineIOS && (
                <div style={{ backgroundColor: '#E3F2FD', borderRadius: '12px', padding: '1rem', marginBottom: '8px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0D47A1', marginBottom: '10px' }}>🍎 Safariで開いてからインストールできます</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '6px 8px', marginBottom: '6px' }}>
                    <div style={{ flex: 1, fontSize: '11px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{installUrl}</div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(installUrl).catch(()=>{}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      style={{ flexShrink: 0, padding: '5px 10px', backgroundColor: copied ? '#34A853' : '#1565C0', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {copied ? '✓ コピー済' : 'URLをコピー'}
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '10px' }}>
                    ① URLをコピー → ② Safariを開いてアドレスバーに貼り付け
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', backgroundColor: '#EEF2FF', borderRadius: '6px', padding: '6px 8px' }}>
                    Safariが開いたら「ホーム画面に追加する」ボタンが自動表示されます
                  </div>
                </div>
              )}

              {/* iOS Safari */}
              {iosDetect && !isLineIOS && !/CriOS\//.test(ua) && !/FxiOS\//.test(ua) && !/OPiOS\//.test(ua) && (
                <div style={{ backgroundColor: '#E3F2FD', borderRadius: '12px', padding: '1rem', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0D47A1', marginBottom: '10px', textAlign: 'center' }}>🍎 ホーム画面に追加する手順</div>
                  {/* 手順を常に表示 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ flexShrink: 0, width: '28px', height: '28px', backgroundColor: '#1565C0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>1</div>
                      <div style={{ fontSize: '13px', color: '#333' }}>
                        画面下の <strong style={{ fontSize: '18px', color: '#1565C0' }}>□↑</strong> <strong>（共有ボタン）</strong> をタップ
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ flexShrink: 0, width: '28px', height: '28px', backgroundColor: '#1565C0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>2</div>
                      <div style={{ fontSize: '13px', color: '#333' }}>
                        下にスクロールして <strong style={{ color: '#E65100' }}>「ホーム画面に追加」</strong> をタップ
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ flexShrink: 0, width: '28px', height: '28px', backgroundColor: '#1565C0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>3</div>
                      <div style={{ fontSize: '13px', color: '#333' }}>
                        右上の <strong style={{ color: '#1565C0' }}>「追加」</strong> をタップ
                      </div>
                    </div>
                  </div>
                  {typeof navigator.share === 'function' && (
                    <button type="button" onClick={async () => {
                      try { await navigator.share({ title: 'オゾシフ', url: window.location.origin }); } catch(e) {}
                    }}
                      style={{ width: '100%', padding: '13px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                      📤 共有ボタン（手順①）を開く
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          <button type="button" onClick={dismiss}
            style={{ width: '100%', padding: '11px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '12px', fontSize: '14px', marginTop: '4px' }}>
            後で
          </button>
        </div>
      </div>
    );
  };

  // パスワード変更画面
  if (showPasswordChange) {
    return (
      <PasswordReset 
        onBack={() => setShowPasswordChange(false)} 
        onSuccess={() => {
          setShowPasswordChange(false);
          setLoginMessage('パスワードが変更されました。ログインしてください。');
        }}
      />
    );
  }

  // ログイン画面
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        {showInstallBanner && <InstallBanner />}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <HelpButton page="login" />
          <h2>ログイン
          </h2>
          <input
            type="text"
            placeholder="管理番号"
            value={managerNumberInput}
            onChange={e => setManagerNumberInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
          />
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="パスワード"
    value={password}
    onChange={e => setPassword(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
    style={{ flex: 1, marginRight: '-2rem' }}
  />
  <button
    type="button"
    onClick={() => setShowPassword(prev => !prev)}
    style={{
      width: '2rem',
      flexShrink: 0,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      margin: 0,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {showPassword ? (
  // 目に斜線（非表示）
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.03-2.47 2.93-4.51 5.28-5.79"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c5 0 9.27 3.11 11 7-.57 1.37-1.4 2.6-2.43 3.63"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  // 目（表示中）
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)}
  </button>
</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0.5rem 0', justifyContent: 'flex-start' }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>次回からログイン省略</label>
          </div>
          <button
            type="button"
            onClick={handleLogin}
            style={{ backgroundColor: '#2196F3' }}
          >
            ログイン
          </button>
          {loginMessage && <p className="error-msg">{loginMessage}</p>}
          
          {/* パスワード変更リンク */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowPasswordChange(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e53935',
                fontSize: '0.85rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              パスワード変更
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 役職選択以降は元のコードと同じ構造
  if (!role) {
    return (
      <div className="login-wrapper">
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <BackButton />
          <HelpButton page="roleSelect" managerNumber={loggedInManagerNumber} />
          {loggedInName && <div style={{ textAlign: 'center', color: '#1976D2', fontWeight: 'bold', marginBottom: '0.5rem' }}>{loggedInName}さん</div>}
          <h2>メニューを選択してください</h2>
          <div className="button-row" style={{ flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => selectRole('staff')} style={{ backgroundColor: '#1976D2' }}>アルバイト</button>
            {loggedInManagerNumber === '0000' && (
              <button onClick={() => selectRole('manager')} style={{ backgroundColor: '#1565C0' }}>店長</button>
            )}
            <button onClick={() => {
              pushToHistory({
                role: '',
                currentStep: '',
                managerAuth: false,
                managerStep: '',
                isLoggedIn: true
              });
              setRole('clockin');
            }} style={{ backgroundColor: '#00BCD4' }}>勤怠入力</button>
          </div>
        </div>
      </div>
    );
  }

  // 以下、他の画面は元のコードと同じ構造（省略）
  // clockin, manager認証, managerメニュー, staff関連の処理...

  


if (role === 'clockin') {
  return (
    <div style={{ position: 'relative' }}>
      {showInstallBanner && <InstallBanner />}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
      <BackButton />
      <ClockInInput
        onBack={() => setRole('')}
        loggedInManagerNumber={loggedInManagerNumber}
      />
    </div>
  );
}

  // ========== 通知の確認・設定モーダル（全ブラウザ対応） ==========
  const NotifModal = () => {
    const [permStatus, setPermStatus] = React.useState(
      'Notification' in window ? Notification.permission : 'unsupported'
    );
    const [subLoading, setSubLoading] = React.useState(false);
    const [subMsg, setSubMsg] = React.useState('');

    const handleRequestPermission = async () => {
      if (!('Notification' in window)) {
        setSubMsg('このブラウザは通知に対応していません');
        return;
      }
      setSubLoading(true);
      try {
        const perm = await Notification.requestPermission();
        setPermStatus(perm);
        if (perm === 'granted') {
          // プッシュ通知が使えるブラウザはサブスクライブ
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
              const reg = await navigator.serviceWorker.ready;
              // 既存のサブスクリプションを一旦解除してから再登録
              const existing = await reg.pushManager.getSubscription();
              if (existing) await existing.unsubscribe();
              const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
              });
              const subJson = JSON.stringify(sub.toJSON());
              // 既存行を削除してから挿入
              await supabase.from('push_subscriptions').delete().eq('manager_number', loggedInManagerNumber);
              const { error: upsertErr } = await supabase.from('push_subscriptions').insert(
                { manager_number: loggedInManagerNumber, subscription: subJson }
              );
              if (upsertErr) {
                setSubMsg('❌ DB保存エラー: ' + upsertErr.message);
              } else {
                setSubMsg('✅ プッシュ通知を有効にしました (ID:' + loggedInManagerNumber + ')');
              }
            } catch (e) {
              setSubMsg('❌ エラー: ' + (e && e.message ? e.message : String(e)));
            }
          } else {
            setSubMsg('✅ 通知を許可しました');
          }
        } else if (perm === 'denied') {
          setSubMsg('通知が拒否されました。ブラウザ設定から許可してください');
        }
      } catch (e) {
        setSubMsg('通知設定に失敗しました');
      }
      setSubLoading(false);
    };

    const permLabel = permStatus === 'granted' ? '✅ 通知：許可済み'
      : permStatus === 'denied' ? '⛔ 通知：拒否中（ブラウザ設定で変更）'
      : permStatus === 'unsupported' ? '⚠️ このブラウザは通知非対応'
      : '🔔 通知：未設定';
    const permColor = permStatus === 'granted' ? '#2E7D32'
      : permStatus === 'denied' ? '#C62828'
      : '#F57C00';

    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.8rem', maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#333', textAlign: 'center' }}>🔔 通知の確認・設定</h3>

          {/* 現在の通知状態 */}
          <div style={{ backgroundColor: '#F5F5F5', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem', fontSize: '14px', fontWeight: 'bold', color: permColor }}>
            {permLabel}
          </div>

          {/* 通知許可ボタン（未設定のみ） */}
          {permStatus === 'default' && (
            <button type="button" onClick={handleRequestPermission} disabled={subLoading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>
              {subLoading ? '設定中...' : '通知を許可する'}
            </button>
          )}
          {/* 再登録ボタン（許可済みの場合） */}
          {permStatus === 'granted' && (
            <button type="button" onClick={handleRequestPermission} disabled={subLoading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>
              {subLoading ? '登録中...' : '🔄 通知を再登録する'}
            </button>
          )}
          {subMsg && <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', margin: '0 0 0.8rem' }}>{subMsg}</p>}

          {/* 過去のお知らせ */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>📋 最近のシフトお知らせ</div>
            {staffNotice ? (
              <div style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFB300', borderRadius: '10px', padding: '12px', fontSize: '14px', lineHeight: 1.7 }}>
                <div style={{ fontWeight: 'bold', color: '#E65100', marginBottom: '4px' }}>シフト提出のお願い</div>
                <div>期間：{staffNotice.period_start} 〜 {staffNotice.period_end}</div>
                <div>期限：{staffNotice.deadline}</div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '12px' }}>現在お知らせはありません</div>
            )}
          </div>

          <button type="button" onClick={() => setShowNotifModal(false)}
            style={{ width: '100%', padding: '12px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '12px', fontSize: '15px', marginTop: '1rem' }}>
            閉じる
          </button>
        </div>
      </div>
    );
  };

  // ========== 通知一覧モーダル ==========
  const NotifListModal = () => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '400px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 1rem', textAlign: 'center', color: '#333' }}>通知一覧</h3>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifHistory.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>通知はありません</div>
          ) : notifHistory.map((n, i) => {
            const s = getNotifStyle(n.title);
            const lastSeen = localStorage.getItem('lastSeenNotifAt') || '';
            const isNew = (n.created_at || '') > lastSeen;
            return (
              <div key={i} style={{ border: `1px solid ${s.border}`, marginBottom: '8px', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: s.bg, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isNew && <span style={{ backgroundColor: '#f44336', color: 'white', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', padding: '1px 5px', flexShrink: 0 }}>NEW</span>}
                  <span style={{ fontWeight: 'bold', color: s.titleColor, fontSize: '13px' }}>{n.title}</span>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: 'white' }}>
                  <div style={{ fontSize: '13px', color: '#333' }}>{n.body}</div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{n.created_at?.slice(0,16).replace('T',' ')}</div>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setShowNotifList(false)} style={{ marginTop: '1rem', padding: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>閉じる</button>
      </div>
    </div>
  );

  // ========== バッテリー最適化ガイド（Android初回通知登録時） ==========
  const BatteryGuideModal = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 7000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '380px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
        <h3 style={{ margin: '0 0 0.8rem', textAlign: 'center', color: '#E65100', fontSize: '1rem' }}>バックグラウンド通知を有効にする</h3>

        {/* iOS */}
        {(isIOS || !isAndroid) && (
          <div style={{ backgroundColor: '#F3E5F5', border: '1px solid #CE93D8', borderRadius: '10px', padding: '12px', marginBottom: '1rem', fontSize: '13px', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🍎 iPhone / iPad の場合</div>
            <div>Safariでこのページを開き</div>
            <div>①「共有」ボタンをタップ</div>
            <div>②「ホーム画面に追加」をタップ</div>
            <div>③ ホーム画面のアイコンから起動</div>
            <div style={{ color: '#880E4F', fontSize: '12px', marginTop: '4px' }}>※ ホーム画面から起動しないと通知が届きません</div>
          </div>
        )}

        {/* Android */}
        {(isAndroid || !isIOS) && (
          <div style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFB300', borderRadius: '10px', padding: '12px', marginBottom: '1rem', fontSize: '13px', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🤖 Android の場合</div>
            <div>【手順①】ホーム画面に追加する</div>
            <div style={{ paddingLeft: '8px', fontSize: '12px' }}>Chromeメニュー →「ホーム画面に追加」</div>
            <div style={{ marginTop: '6px' }}>【手順②】バッテリー最適化を無効にする</div>
            <div style={{ paddingLeft: '8px', fontSize: '12px' }}>設定 → アプリ → Chrome → バッテリー →「制限なし」</div>
            <div style={{ paddingLeft: '8px', fontSize: '12px', color: '#E65100' }}>※ Samsung: 電池 → バックグラウンド使用制限 → 制限なし</div>
          </div>
        )}

        <div style={{ backgroundColor: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: '10px', padding: '10px', marginBottom: '1rem', fontSize: '12px', color: '#1565C0', lineHeight: 1.6 }}>
          これらの設定をしないとアプリを開いたときだけ通知が届きます
        </div>
        <button onClick={() => { localStorage.setItem('batteryGuideShown', '1'); setShowBatteryGuide(false); }}
          style={{ width: '100%', padding: '12px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
          わかった・設定する
        </button>
      </div>
    </div>
    );
  };

  // ========== ヘルプ通知モーダル ==========
  const HelpNotifModal = () => {
    const [recruitDates, setRecruitDates] = React.useState([]);
    const [dateInput, setDateInput] = React.useState('');
    const [helpMsg, setHelpMsg] = React.useState('');
    const [sending, setSending] = React.useState(false);
    // 緊急通知モード
    const [emergencyMode, setEmergencyMode] = React.useState(false);
    const [emergencyDateType, setEmergencyDateType] = React.useState('today');
    const [emergencyCustomDate, setEmergencyCustomDate] = React.useState('');
    const [emergencyText, setEmergencyText] = React.useState('');
    const [emergencyMsg, setEmergencyMsg] = React.useState('');

    const pad = (n) => String(n).padStart(2, '0');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
    const tomorrowDate = new Date(today); tomorrowDate.setDate(tomorrowDate.getDate()+1);
    const tomorrowStr = `${tomorrowDate.getFullYear()}-${pad(tomorrowDate.getMonth()+1)}-${pad(tomorrowDate.getDate())}`;

    const DOW = ['日','月','火','水','木','金','土'];
    const formatDate = (ds) => {
      const d = new Date(ds);
      return `${d.getMonth()+1}/${d.getDate()}（${DOW[d.getDay()]}）`;
    };

    const addDate = () => {
      if (!dateInput) return;
      if (recruitDates.includes(dateInput)) return;
      setRecruitDates(prev => [...prev, dateInput].sort());
      setDateInput('');
    };

    const removeDate = (ds) => setRecruitDates(prev => prev.filter(d => d !== ds));

    const buildRecruitBody = () => {
      const lines = recruitDates.map(d => `・${formatDate(d)}`).join('\n');
      return `以下の日程でシフトに入れる方を急募しています：\n${lines}\nご都合がつく方はご連絡ください`;
    };

    const sendRecruitNotif = async () => {
      if (recruitDates.length === 0) { setHelpMsg('募集日を追加してください'); return; }
      setSending(true);
      const title = '🆘 急募！人手が必要です';
      const body = buildRecruitBody();
      try {
        await supabase.functions.invoke('send-push-notification', { body: { title, body } });
        await saveNotif(title, body);
        setHelpMsg('✅ 急募通知を送信しました');
      } catch (e) { setHelpMsg('❌ 送信エラー'); }
      setSending(false);
    };

    const sendEmergency = async () => {
      if (!emergencyText) { setEmergencyMsg('通知内容を入力してください'); return; }
      const dateStr = emergencyDateType === 'today' ? todayStr : emergencyDateType === 'tomorrow' ? tomorrowStr : emergencyCustomDate;
      if (!dateStr) { setEmergencyMsg('日付を選択してください'); return; }
      setSending(true);
      try {
        await supabase.functions.invoke('send-push-notification', { body: { title: `⚠️ 緊急連絡（${dateStr}）`, body: emergencyText } });
        await saveNotif(`⚠️ 緊急連絡（${dateStr}）`, emergencyText);
        setEmergencyMsg('✅ 緊急通知を送信しました');
      } catch (e) { setEmergencyMsg('❌ 送信エラー'); }
      setSending(false);
    };

    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 5500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowHelpNotifModal(false)}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
          {!emergencyMode ? (
            <>
              <h3 style={{ margin: '0 0 0.3rem', textAlign: 'center', color: '#E53935' }}>🆘 急募通知</h3>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', margin: '0 0 1rem' }}>人手が必要な日を選んで全員に通知</p>

              {/* 日付追加 */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' }} />
                <button onClick={addDate} style={{ padding: '10px 16px', backgroundColor: '#E53935', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>追加</button>
              </div>

              {/* 選択済み日程 */}
              {recruitDates.length > 0 ? (
                <div style={{ backgroundColor: '#FFF8F8', border: '1px solid #FFCDD2', borderRadius: '10px', padding: '10px', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#C62828', marginBottom: '6px' }}>📅 募集日一覧</div>
                  {recruitDates.map(ds => (
                    <div key={ds} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: 'white', borderRadius: '6px', marginBottom: '4px', border: '1px solid #FFCDD2' }}>
                      <span style={{ fontWeight: 'bold', color: '#B71C1C', fontSize: '14px' }}>{formatDate(ds)}</span>
                      <button onClick={() => removeDate(ds)} style={{ background: 'none', border: 'none', color: '#999', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '14px', textAlign: 'center', color: '#aaa', fontSize: '13px', marginBottom: '1rem' }}>
                  日付を追加してください
                </div>
              )}

              {/* 通知プレビュー */}
              {recruitDates.length > 0 && (
                <div style={{ backgroundColor: '#F3F4F6', borderRadius: '10px', padding: '12px', marginBottom: '1rem', fontSize: '12px', color: '#555', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>📲 通知プレビュー</div>
                  <div style={{ fontWeight: 'bold' }}>🆘 急募！人手が必要です</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{buildRecruitBody()}</div>
                </div>
              )}

              {helpMsg && <div style={{ textAlign: 'center', color: helpMsg.startsWith('✅') ? '#388E3C' : '#D32F2F', fontWeight: 'bold', marginBottom: '8px' }}>{helpMsg}</div>}
              <button onClick={sendRecruitNotif} disabled={sending || recruitDates.length === 0}
                style={{ width: '100%', padding: '12px', backgroundColor: recruitDates.length === 0 ? '#ccc' : '#E53935', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: recruitDates.length === 0 ? 'default' : 'pointer', marginBottom: '8px' }}>
                {sending ? '送信中...' : '🆘 急募通知を全員に送る'}
              </button>
              <button onClick={() => setEmergencyMode(true)} style={{ width: '100%', padding: '12px', backgroundColor: '#B71C1C', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                ⚡ 緊急通知（自由入力）
              </button>
            </>
          ) : (
            <>
              <h3 style={{ margin: '0 0 1rem', textAlign: 'center', color: '#B71C1C' }}>⚡ 緊急通知</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                {[['today','今日'],['tomorrow','明日'],['custom','日付選択']].map(([v,l]) => (
                  <button key={v} onClick={() => setEmergencyDateType(v)} style={{ flex: 1, padding: '10px', backgroundColor: emergencyDateType === v ? '#B71C1C' : '#eee', color: emergencyDateType === v ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{l}</button>
                ))}
              </div>
              {emergencyDateType === 'custom' && (
                <input type="date" value={emergencyCustomDate} onChange={e => setEmergencyCustomDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box', marginBottom: '1rem' }} />
              )}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>通知内容</label>
                <textarea value={emergencyText} onChange={e => setEmergencyText(e.target.value)} rows={4}
                  placeholder="緊急連絡の内容を入力してください"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              {emergencyMsg && <div style={{ textAlign: 'center', color: emergencyMsg.startsWith('✅') ? '#388E3C' : '#D32F2F', fontWeight: 'bold', marginBottom: '8px' }}>{emergencyMsg}</div>}
              <button onClick={sendEmergency} disabled={sending} style={{ width: '100%', padding: '12px', backgroundColor: '#B71C1C', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginBottom: '8px' }}>
                {sending ? '送信中...' : '⚡ 全員に送信'}
              </button>
              <button onClick={() => setEmergencyMode(false)} style={{ width: '100%', padding: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>← 急募通知に戻る</button>
            </>
          )}
          <button onClick={() => { setShowHelpNotifModal(false); setEmergencyMode(false); }} style={{ marginTop: '12px', width: '100%', padding: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>閉じる</button>
        </div>
      </div>
    );
  };

  // ========== 通知診断モーダル ==========
  const PushDebugModal = () => {
    const [subs, setSubs] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [testMsg, setTestMsg] = React.useState('');
    const [mySubStatus, setMySubStatus] = React.useState('');

    React.useEffect(() => {
      const load = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('push_subscriptions').select('manager_number, subscription, created_at');
        setSubs(error ? [] : (data || []));
        setLoading(false);
      };
      load();
      // 自分のSW購読状況確認
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(reg =>
          reg.pushManager.getSubscription().then(sub => {
            if (sub) {
              const ep = sub.endpoint || '';
              const type = ep.includes('fcm.googleapis.com') ? 'Android(FCM)' :
                           ep.includes('push.apple.com') ? 'iOS(Apple)' :
                           ep.includes('mozilla') ? 'Firefox' : 'その他';
              setMySubStatus(`✅ SW購読済み [${type}]`);
            } else {
              setMySubStatus('❌ SW未購読（通知ONボタンを押してください）');
            }
          })
        ).catch(() => setMySubStatus('⚠️ SW確認エラー'));
      } else {
        setMySubStatus('⚠️ PushManager非対応（PWAでない可能性あり）');
      }
    }, []);

    const sendTest = async () => {
      setTestMsg('送信中...');
      try {
        const { data, error } = await supabase.functions.invoke('send-push-notification', {
          body: { title: '📣 テスト通知', body: 'この通知が届いていれば設定成功です！' }
        });
        if (error) { setTestMsg('❌ EFエラー: ' + JSON.stringify(error)); return; }
        let msg = `成功:${data?.sent ?? 0}台 / 失敗:${data?.failed ?? 0}台 / 計:${data?.total ?? 0}台`;
        if (data?.errors?.length > 0) {
          msg += '\n--- エラー詳細 ---\n' + data.errors.map(e => `${e.statusCode}: ${e.body || e.message}`).join('\n');
        }
        if (data?.expired_removed > 0) {
          msg += `\n(期限切れ${data.expired_removed}件を削除)`;
        }
        setTestMsg(msg);
      } catch (e) {
        setTestMsg('❌ エラー: ' + (e?.message || String(e)));
      }
    };

    const reRegister = async () => {
      setTestMsg('再登録中...');
      const ok = await registerPushSilent(loggedInManagerNumber);
      setTestMsg(ok ? '✅ 再登録完了。テスト通知を送ってください' : '❌ 再登録失敗');
      // 購読状況更新
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(reg =>
          reg.pushManager.getSubscription().then(sub => {
            setMySubStatus(sub ? '✅ このデバイスはSW購読済み' : '❌ このデバイスはSW未購読');
          })
        );
      }
    };

    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '400px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1565C0', textAlign: 'center' }}>📊 通知診断</h3>

          <div style={{ backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '12px', marginBottom: '1rem', fontSize: '13px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>このデバイスのSW購読状態</div>
            <div style={{ color: mySubStatus.startsWith('✅') ? '#2e7d32' : '#c62828' }}>{mySubStatus || '確認中...'}</div>
          </div>

          <div style={{ backgroundColor: '#e3f2fd', borderRadius: '10px', padding: '12px', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>DB登録済み購読一覧</div>
            {loading && <div style={{ color: '#666', fontSize: '13px' }}>読み込み中...</div>}
            {!loading && subs !== null && (
              <>
                <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                  <strong>{subs.length}台</strong>が登録済み
                </div>
                {subs.map((s, i) => {
                  let epType = '?';
                  try {
                    const sub = JSON.parse(s.subscription || '{}');
                    const ep = sub.endpoint || '';
                    epType = ep.includes('fcm.googleapis.com') ? 'Android' :
                             ep.includes('push.apple.com') ? 'iOS' :
                             ep.includes('mozilla') ? 'Firefox' : 'Other';
                  } catch {}
                  return (
                    <div key={i} style={{ fontSize: '12px', color: '#555', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>管理番号: {s.manager_number}</span>
                      <span style={{ color: '#888' }}>[{epType}]</span>
                    </div>
                  );
                })}
                {subs.length === 0 && <div style={{ fontSize: '13px', color: '#c62828' }}>⚠️ 登録なし。スタッフが通知を有効にしていません</div>}
              </>
            )}
          </div>

          <button onClick={reRegister} style={{ width: '100%', padding: '11px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}>
            🔄 このデバイスで再登録
          </button>
          <button onClick={sendTest} style={{ width: '100%', padding: '11px', backgroundColor: '#43A047', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}>
            📣 テスト通知を全員に送信（結果表示）
          </button>
          <button onClick={async () => {
            setTestMsg('シフトリマインダー関数を実行中...');
            try {
              const res = await fetch('https://csyjgivzvkypwhococfv.supabase.co/functions/v1/daily-notifications');
              const data = await res.json();
              const sentCount = (data.results || []).filter(r => r.status === 'sent').length;
              const failCount = (data.results || []).filter(r => r.status === 'failed').length;
              const skipCount = (data.results || []).filter(r => r.status === 'skipped_duplicate').length;
              setTestMsg(`✅ 実行完了（現在 ${data.currentHour}時）\n送信:${sentCount} 失敗:${failCount} スキップ:${skipCount}\n※20時=前日通知 / 毎時=1時間前通知`);
            } catch (e) {
              setTestMsg('❌ エラー: ' + (e?.message || String(e)));
            }
          }} style={{ width: '100%', padding: '11px', backgroundColor: '#E65100', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}>
            ⏰ シフトリマインダー手動実行
          </button>
          {testMsg && (
            <div style={{ padding: '10px', backgroundColor: testMsg.startsWith('✅') ? '#e8f5e9' : '#ffebee', borderRadius: '8px', fontSize: '13px', color: '#333', marginBottom: '8px', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
              {testMsg}
            </div>
          )}

          <div style={{ backgroundColor: '#fff9c4', borderRadius: '8px', padding: '10px', marginBottom: '1rem', fontSize: '12px', color: '#555' }}>
            <strong>スタッフへの案内：</strong><br/>
            スタッフのスマホで「ホーム画面に追加」してPWAを開き、アルバイトメニューで「通知OFF（タップでON）」ボタンをタップして通知をオンにするよう伝えてください。
          </div>

          <button onClick={() => setShowPushDebug(false)} style={{ width: '100%', padding: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>閉じる</button>
        </div>
      </div>
    );
  };

  const ShiftDeadlineModal = () => {
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const handleSave = async (sendNotice) => {
      if (!deadlinePeriodStart || !deadlinePeriodEnd || !deadlineDate) {
        setSaveMsg('すべての項目を入力してください');
        return;
      }
      if (deadlinePeriodStart > deadlinePeriodEnd) {
        setSaveMsg('シフト期間の開始日が終了日より後になっています');
        return;
      }
      setSaving(true);
      const noticeValue = {
        period_start: deadlinePeriodStart,
        period_end: deadlinePeriodEnd,
        deadline: deadlineDate,
        days_before: Number(deadlineDaysBefore),
        is_active: sendNotice,
        notified_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('settings').upsert(
        { key: 'shift_deadline_notice', value: JSON.stringify(noticeValue) },
        { onConflict: 'key' }
      );
      if (error) { setSaving(false); setSaveMsg('保存に失敗しました: ' + error.message); return; }

      // shift_periods テーブルに候補として保存（候補モーダルに表示される）
      await supabase.from('shift_periods').upsert(
        { period_start: deadlinePeriodStart, period_end: deadlinePeriodEnd, deadline: deadlineDate, is_done: false },
        { onConflict: 'period_start,period_end' }
      );

      if (sendNotice) {
        const notifBody = `期間：${deadlinePeriodStart}〜${deadlinePeriodEnd}　期限：${deadlineDate}`;
        try {
          await supabase.functions.invoke('send-push-notification', {
            body: { title: 'シフト提出のお願い', body: notifBody },
          });
          await supabase.from('notifications').insert([{ title: 'シフト提出のお願い', body: notifBody }]);
        } catch (e) { console.error('push error', e); }
      }

      setSaving(false);
      setSaveMsg(sendNotice ? '✅ 通知を送信しました！' : '✅ 保存しました');
      setTimeout(() => { setSaveMsg(''); if (sendNotice) setShowDeadlineModal(false); }, 1500);
    };

    const handleStop = async () => {
      const { error } = await supabase.from('settings').upsert(
        { key: 'shift_deadline_notice', value: JSON.stringify({ is_active: false }) },
        { onConflict: 'key' }
      );
      if (!error) { setSaveMsg('✅ 通知を停止しました'); setTimeout(() => { setSaveMsg(''); setShowDeadlineModal(false); }, 1200); }
    };

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowDeadlineModal(false)}>
        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '1.5rem', paddingTop: '3.5rem', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button onClick={() => setShowDeadlineModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold' }}>← 戻る</button>
          <h3 style={{ marginBottom: '1rem', color: '#1565C0', textAlign: 'center' }}>シフト期限設定</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>シフト期間（開始）</label>
            <input type="date" value={deadlinePeriodStart} onChange={e => setDeadlinePeriodStart(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>シフト期間（終了）</label>
            <input type="date" value={deadlinePeriodEnd} onChange={e => setDeadlinePeriodEnd(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>提出期限</label>
            <input type="date" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>自動通知タイミング</label>
            <select value={deadlineDaysBefore} onChange={e => setDeadlineDaysBefore(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box', backgroundColor: 'white' }}>
              {[1,2,3,4,5,6,7].map(d => (
                <option key={d} value={d}>期限の{d}日前に自動通知</option>
              ))}
            </select>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>毎日自動でチェックし、該当日に通知を送信します</div>
          </div>
          {saveMsg && <div style={{ textAlign: 'center', marginBottom: '1rem', color: saveMsg.startsWith('✅') ? '#388E3C' : '#D32F2F', fontWeight: 'bold' }}>{saveMsg}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button onClick={() => handleSave(true)} disabled={saving}
              style={{ backgroundColor: '#1E88E5', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              通知を送信する
            </button>
            <button onClick={() => handleSave(false)} disabled={saving}
              style={{ backgroundColor: '#757575', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '15px', cursor: 'pointer' }}>
              保存のみ（通知しない）
            </button>
            <button onClick={handleStop} disabled={saving}
              style={{ backgroundColor: '#EF5350', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '15px', cursor: 'pointer' }}>
              通知を停止する
            </button>
          </div>
          <button onClick={() => setShowDeadlineModal(false)}
            style={{ marginTop: '1rem', width: '100%', backgroundColor: 'transparent', color: '#999', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', cursor: 'pointer', fontSize: '14px' }}>
            閉じる
          </button>
        </div>
      </div>
    );
  };

  if (role === 'manager' && managerStep === '') {
    return (
      <div className="login-wrapper">
        {showInstallBanner && <InstallBanner />}
        {showDeadlineModal && <ShiftDeadlineModal />}
        {showHelpNotifModal && <HelpNotifModal />}
        {showBatteryGuide && <BatteryGuideModal />}
        {showNotifList && <NotifListModal />}
        {showPushDebug && <PushDebugModal />}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <BackButton />
          <HelpButton page="managerMenu" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <button type="button" onClick={() => {
              const next = !notifEnabled;
              setNotifEnabled(next);
              localStorage.setItem('notifEnabled', String(next));
              if (next) {
                registerPushSilent(loggedInManagerNumber);
                showNotifToast('🔔 通知をオンにしました');
              } else {
                showNotifToast('🔕 通知をオフにしました');
              }
            }}
              style={{ backgroundColor: notifEnabled ? '#FF9800' : '#9E9E9E', color: 'white', border: 'none', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              {notifEnabled ? '🔔 通知ON（タップでOFF）' : '🔕 通知OFF（タップでON）'}
            </button>
            <button type="button" onClick={() => showInstallFlow()}
              style={{ background: 'none', border: '1px solid #1a73e8', color: '#1a73e8', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', cursor: 'pointer' }}>
              📲 ホーム画面に追加
            </button>
            <button type="button" onClick={() => setShowPushDebug(true)}
              style={{ background: 'none', border: '1px solid #555', color: '#555', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', cursor: 'pointer' }}>
              📊 通知診断
            </button>
          </div>
          {notifEnabled && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '0.3rem' }}>
              <button type="button" onClick={async () => {
                showNotifToast('📤 送信中...');
                const r = await supabase.functions.invoke('send-push-notification', { body: { title: '🔔 テスト通知', body: 'プッシュ通知が正常に届いています！', target_manager_numbers: [String(loggedInManagerNumber)] } });
                showNotifToast(r.data?.sent > 0 ? '✅ テスト通知を送信しました' : '⚠️ 送信失敗（端末に届かない場合はガイドを確認）');
              }} style={{ flex: 1, background: 'none', border: '1px solid #43A047', color: '#43A047', borderRadius: '20px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>
                📨 テスト送信
              </button>
              <button type="button" onClick={() => setShowBatteryGuide(true)}
                style={{ flex: 1, background: 'none', border: '1px solid #E65100', color: '#E65100', borderRadius: '20px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>
                ⚙️ 通知が届かない
              </button>
            </div>
          )}
          {notifToast && (
            <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', color: 'white', padding: '12px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: 'bold', zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              {notifToast}
            </div>
          )}
          {loggedInName && <div style={{ textAlign: 'center', color: '#1976D2', fontWeight: 'bold', marginBottom: '0.3rem' }}>{loggedInName}さん</div>}
          <h2 style={{ marginTop: '0.3rem' }}>店長メニュー</h2>
          {notifEnabled && notifHistory.length > 0 && (
            <div style={{ position: 'relative', marginBottom: '1rem', backgroundColor: '#FFF8E1', borderRadius: '10px', padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>📋 お知らせ</span>
                <button type="button" onClick={() => { setShowNotifList(true); setNewNotifCount(0); localStorage.setItem('lastSeenNotifAt', new Date().toISOString()); }}
                  style={{ position: 'relative', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', padding: '2px 7px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' }}>
                  通知一覧
                  {newNotifCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#f44336', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', lineHeight: 1 }}>{newNotifCount > 9 ? '9+' : newNotifCount}</span>}
                </button>
              </div>
              <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                {notifHistory.slice(0, 5).map((n, i) => {
                  const lastSeen = localStorage.getItem('lastSeenNotifAt') || '';
                  const isNew = (n.created_at || '') > lastSeen;
                  return (
                    <div key={i} style={{ backgroundColor: i === 0 ? '#FFF3E0' : '#f9f9f9', borderBottom: '1px solid #eee', padding: '8px 10px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        {isNew && <span style={{ backgroundColor: '#f44336', color: 'white', fontSize: '9px', fontWeight: 'bold', borderRadius: '3px', padding: '1px 4px', flexShrink: 0 }}>NEW</span>}
                        <span style={{ fontWeight: 'bold', color: '#E65100' }}>{n.title}</span>
                      </div>
                      <div style={{ color: '#333', marginTop: '2px' }}>{n.body}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{n.created_at?.slice(0,10)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {!managerShiftSub ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => setManagerShiftSub(true)} style={{ backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', marginTop: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.7rem', minWidth: '2rem', textAlign: 'center' }}>📅</span>
                <span><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>シフト関連</div><div style={{ fontSize: '0.73rem', opacity: 0.9, marginTop: '2px' }}>作成・確認・期限設定・ヘルプ</div></span>
              </button>
              <button onClick={() => { pushToHistory({ role, currentStep, managerAuth, managerStep: '', isLoggedIn: true }); setManagerStep('attendance'); }} style={{ backgroundColor: '#00695C', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', marginTop: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.7rem', minWidth: '2rem', textAlign: 'center' }}>📊</span>
                <span><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>勤怠管理</div><div style={{ fontSize: '0.73rem', opacity: 0.9, marginTop: '2px' }}>出勤・退勤・承認</div></span>
              </button>
              <button onClick={() => { pushToHistory({ role, currentStep, managerAuth, managerStep: '', isLoggedIn: true }); setManagerStep('register'); }} style={{ backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', marginTop: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.7rem', minWidth: '2rem', textAlign: 'center' }}>👤</span>
                <span><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>新人登録</div><div style={{ fontSize: '0.73rem', opacity: 0.9, marginTop: '2px' }}>スタッフの追加・パスワード設定</div></span>
              </button>
              <button onClick={() => { window.open('https://docs.google.com/forms/d/e/1FAIpQLSci0UYQ7BKfXjhVj8x3WBR5ncFxxCo_lsV11kY5TaI15wlKSQ/viewform?usp=header', '_blank'); }} style={{ backgroundColor: '#546E7A', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', marginTop: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.7rem', minWidth: '2rem', textAlign: 'center' }}>💬</span>
                <span><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>お問い合わせ</div><div style={{ fontSize: '0.73rem', opacity: 0.9, marginTop: '2px' }}>不具合・ご要望はこちら</div></span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => setManagerShiftSub(false)} style={{ backgroundColor: '#78909C', color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', marginTop: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                ← 戻る
              </button>
              <button onClick={() => setShowDeadlineModal(true)} style={{ backgroundColor: '#E65100', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', marginTop: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.7rem', minWidth: '2rem', textAlign: 'center' }}>📢</span>
                <span><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>シフト期限設定</div><div style={{ fontSize: '0.73rem', opacity: 0.9, marginTop: '2px' }}>提出期限をスタッフへ通知</div></span>
              </button>
              <button onClick={() => { pushToHistory({ role, currentStep, managerAuth, managerStep: '', isLoggedIn: true }); setManagerStep('create'); }} style={{ backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', marginTop: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.7rem', minWidth: '2rem', textAlign: 'center' }}>✏️</span>
                <span><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>シフト作成</div><div style={{ fontSize: '0.73rem', opacity: 0.9, marginTop: '2px' }}>シフト表を作成・編集する</div></span>
              </button>
              <button onClick={() => { pushToHistory({ role, currentStep, managerAuth, managerStep: '', isLoggedIn: true }); setManagerStep('view'); }} style={{ backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', marginTop: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.7rem', minWidth: '2rem', textAlign: 'center' }}>📋</span>
                <span><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>シフト確認</div><div style={{ fontSize: '0.73rem', opacity: 0.9, marginTop: '2px' }}>作成済みシフトを表示</div></span>
              </button>
              <button onClick={() => setShowHelpNotifModal(true)} style={{ backgroundColor: '#B71C1C', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', marginTop: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.7rem', minWidth: '2rem', textAlign: 'center' }}>🆘</span>
                <span><div style={{ fontSize: '1rem', fontWeight: 'bold' }}>ヘルプ通知</div><div style={{ fontSize: '0.73rem', opacity: 0.9, marginTop: '2px' }}>急な人手不足を全員へ通知</div></span>
              </button>
            </div>
          )}

          <button onClick={() => {
            setRole('');
            setPassword('');
            setManagerNumberInput('');
            setIsLoggedIn(false);
            setManagerAuth(false);
            setManagerShiftSub(false);
            resetAllInputs();
            setNavigationHistory([]);
          }} style={{ backgroundColor: '#B0BEC5', color: '#37474F', border: 'none', borderRadius: '10px', padding: '0.6rem', width: '100%', marginTop: '1rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>ログアウト</button>
        </div>
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === 'register') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)}/>
        <BackButton />
        <RegisterUser onBack={() => setManagerStep('')} />
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === 'create') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)}/>
        <BackButton />
        <ManagerCreate onNavigate={(page) => {
          if (page === 'staff') {
            setManagerStep('');
          }
        }} onBack={() => goBack()} />
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === 'view') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
        <BackButton />
        <ManagerShiftView onBack={() => setManagerStep('')} />
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === 'attendance') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
        <BackButton />
        <ManagerAttendance onBack={() => setManagerStep('')} />
      </div>
    );
  }

 if (role === 'staff' && currentStep === 'shiftView') {
  return (
    <div style={{ position: 'relative' }}>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)}content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
      <BackButton />
      <StaffShiftView onBack={() => setCurrentStep('')} managerNumber={loggedInManagerNumber} />
    </div>
  );
}

  
if (role === 'staff' && currentStep === 'shiftEdit') {
  return (
    <div style={{ position: 'relative' }}>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
      <BackButton />
      <StaffShiftEdit 
        onBack={() => setCurrentStep('')} 
        loggedInManagerNumber={loggedInManagerNumber}  // ← この行を追加
      />
    </div>
  );
  }

 
if (role === 'staff' && currentStep === 'workHours') {
  return (
    <div style={{ position: 'relative' }}>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
      <BackButton />
      <StaffWorkHours 
        onBack={() => setCurrentStep('')} 
        loggedInManagerNumber={loggedInManagerNumber}  // ← この行を追加
      />
    </div>
  );
  }

 
if (role === 'staff' && currentStep === 'shiftPeriod') {
  // ログイン時の管理番号を自動設定
  if (loggedInManagerNumber && !managerNumber) {
    setManagerNumber(loggedInManagerNumber);
  }

  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
      <div className="login-card" style={{ position: 'relative' }}>
        <BackButton />
        <HelpButton page="shiftPeriod" />
        <h2>新規提出</h2>
        <p style={{ 
          fontSize: '0.95rem', 
          color: '#1976D2', 
          marginBottom: '1rem', 
          fontWeight: 'bold' 
        }}>
          管理番号: {loggedInManagerNumber}
        </p>
        <label>開始日:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <label>終了日:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button onClick={handleNext} style={{ backgroundColor: '#1976D2', flex: 1 }}>次へ</button>
          <button
            onClick={() => { setShowCandidateModal(true); fetchCandidates(); }}
            style={{
              flex: 1,
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            📋 候補
          </button>
        </div>

        {/* 候補モーダル */}
        {showCandidateModal && (
          <div
            onClick={() => setShowCandidateModal(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: 'white', borderRadius: '12px',
                maxWidth: '480px', width: '100%', maxHeight: '70vh',
                overflow: 'auto', padding: '1.5rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1976D2' }}>📋 シフト期間の候補</h3>
                <button
                  onClick={() => setShowCandidateModal(false)}
                  style={{ background: '#FF5722', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                >×</button>
              </div>

              {candidateLoading && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>⏳ 読み込み中...</div>
              )}
              {candidateError && (
                <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '8px', color: '#c62828' }}>⚠️ {candidateError}</div>
              )}
              {!candidateLoading && !candidateError && candidates.map((c, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setStartDate(c.start);
                    setEndDate(c.end);
                    setShowCandidateModal(false);
                  }}
                  style={{
                    border: `2px solid ${c.isExpired ? '#ffcdd2' : '#bbdefb'}`,
                    borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem',
                    cursor: 'pointer',
                    backgroundColor: c.isExpired ? '#fff8f8' : '#f8fbff'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = c.isExpired ? '#ffebee' : '#e3f2fd'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = c.isExpired ? '#fff8f8' : '#f8fbff'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#1565C0' }}>{c.start} 〜 {c.end}</span>
                    {c.isExpired && (
                      <span style={{ backgroundColor: '#f44336', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>期限切れ</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: c.isExpired ? '#c62828' : '#555' }}>📅 期限：{c.deadline}</div>
                  <div style={{ fontSize: '0.8rem', color: '#1976D2', marginTop: '0.3rem', fontWeight: 'bold' }}>→ タップしてこの期間を選択</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

  if (role === 'staff' && currentStep === 'shiftInput') {
    return (
      <div className="login-wrapper" style={{ padding: '0.5rem' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
        <div className="login-card shift-input-card" style={{
          position: 'relative',
          maxWidth: '900px',
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.75rem',
          paddingTop: '3rem'
        }}>
          <BackButton />
          <HelpButton page="shiftInput" />
          <h2 style={{ marginBottom: '0.5rem', fontSize: 'clamp(18px, 4vw, 24px)' }}>シフト入力</h2>
          <p style={{ marginBottom: '0.75rem', fontSize: 'clamp(13px, 3vw, 16px)' }}>
            管理番号: <strong>{managerNumber}</strong>
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '0.3rem', 
            paddingBottom: '0.75rem',
            flexWrap: 'nowrap',
            justifyContent: 'space-between'
          }}>
            {['全て', '月', '火', '水', '木', '金', '土', '日'].map((day) => (
              <button
                key={day}
                onClick={() => toggleSelectedDay(day)}
                style={{
                  backgroundColor: selectedDays.includes(day) ? '#95a5a6' : getColorForDay(day),
                  color: 'white', 
                  padding: '0.4rem 0.2rem', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: 'clamp(10px, 2.2vw, 12px)',
                  whiteSpace: 'nowrap',
                  flex: '1',
                  minWidth: 0
                }}>
                {day}
              </button>
            ))}
          </div>

          {selectedDays.length > 0 && (
  <div style={{ 
    marginBottom: '0.75rem', 
    padding: '0.75rem', 
    backgroundColor: '#e3f2fd', 
    borderRadius: '8px',
    border: '2px solid #2196F3'
  }}>
    <div style={{ 
      fontWeight: 'bold', 
      marginBottom: '0.5rem', 
      color: '#1976D2', 
      fontSize: 'clamp(13px, 3vw, 14px)' 
    }}>
      一括設定
    </div>
    
    {/* モード選択ボタン */}
    <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem' }}>
      <button
        onClick={() => setBulkMode('free')}
        style={{
          flex: 1,
          padding: '0.5rem',
          backgroundColor: bulkMode === 'free' ? '#4CAF50' : '#e0e0e0',
          color: bulkMode === 'free' ? 'white' : '#666',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 2.5vw, 13px)',
          fontWeight: 'bold'
        }}
      >
        終日フリー
      </button>
      <button
        onClick={() => setBulkMode('unavailable')}
        style={{
          flex: 1,
          padding: '0.5rem',
          backgroundColor: bulkMode === 'unavailable' ? '#f44336' : '#e0e0e0',
          color: bulkMode === 'unavailable' ? 'white' : '#666',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 2.5vw, 13px)',
          fontWeight: 'bold'
        }}
      >
        終日不可
      </button>
      <button
        onClick={() => setBulkMode('time')}
        style={{
          flex: 1,
          padding: '0.5rem',
          backgroundColor: bulkMode === 'time' ? '#2196F3' : '#e0e0e0',
          color: bulkMode === 'time' ? 'white' : '#666',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 2.5vw, 13px)',
          fontWeight: 'bold'
        }}
      >
        時間指定
      </button>
    </div>

    {/* 時間指定の場合のみ時間入力を表示 */}
    {bulkMode === 'time' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ width: '100%' }}>
          <label style={{ 
            fontSize: 'clamp(12px, 2.5vw, 13px)', 
            display: 'block', 
            marginBottom: '0.25rem' 
          }}>
            開始時間
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <select 
              value={bulkStartHour} 
              onChange={e => setBulkStartHour(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <option value="">時</option>
              {[...Array(37)].map((_, h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>:</span>
            <select 
              value={bulkStartMin} 
              onChange={e => setBulkStartMin(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <option value="">分</option>
              {[...Array(60)].map((_, m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <label style={{ 
            fontSize: 'clamp(12px, 2.5vw, 13px)', 
            display: 'block', 
            marginBottom: '0.25rem' 
          }}>
            終了時間
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <select 
              value={bulkEndHour} 
              onChange={e => setBulkEndHour(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <option value="">時</option>
              {[...Array(37)].map((_, h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>:</span>
            <select 
              value={bulkEndMin} 
              onChange={e => setBulkEndMin(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <option value="">分</option>
              {[...Array(60)].map((_, m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )}
    
    <button 
      onClick={handleBulkApply} 
      style={{ 
        backgroundColor: '#2196F3', 
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '0.6rem 1rem',
        cursor: 'pointer',
        fontSize: 'clamp(13px, 3vw, 14px)',
        fontWeight: 'bold',
        width: '100%',
        marginTop: '0.5rem'
      }}
    >
      一括適用
    </button>
  </div>
)}
          <div style={{ 
            maxHeight: '50vh', 
            overflowY: 'auto', 
            marginBottom: '0.75rem', 
            width: '100%',
            WebkitOverflowScrolling: 'touch'
          }}>
           {shiftTimes.map((item, i) => (
  <div key={item.date} style={{ 
    display: 'flex', 
    flexDirection: 'column',
    gap: '0.5rem', 
    marginBottom: '0.75rem', 
    padding: '0.75rem',
    backgroundColor: '#e8e8e8',
    borderRadius: '8px',
    border: '1px solid #d0d0d0'
  }}>
    <div style={{ marginBottom: '0.4rem' }}>
      {/* 日付 + 募集バッジ 横並び */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
          {item.date}（{getWeekday(item.date)}）
        </span>
        {recruitmentInfo[item.date] && (() => {
          const submitted = submissionCounts[item.date] || 0;
          const required = recruitmentInfo[item.date].count;
          const isFull = submitted >= required;
          return (
            <span style={{
              backgroundColor: isFull ? '#e8f5e9' : '#fff8e1',
              border: `1px solid ${isFull ? '#81c784' : '#ffcc02'}`,
              borderRadius: '12px',
              padding: '0.1rem 0.6rem',
              fontSize: 'clamp(10px, 2.2vw, 12px)',
              fontWeight: 'bold',
              color: isFull ? '#2e7d32' : '#e65100',
              whiteSpace: 'nowrap'
            }}>
              👥 {submitted}/{required}人
            </span>
          );
        })()}
      </div>
      {/* 備考（あれば） */}
      {recruitmentInfo[item.date]?.notes && (
        <div style={{ fontSize: 'clamp(10px, 2vw, 11px)', color: '#795548', marginTop: '0.15rem' }}>
          📝 {recruitmentInfo[item.date].notes}
        </div>
      )}
    </div>

    {/* モード選択ボタン */}
    <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
      <button
        onClick={() => handleTimeChange(i, 'mode', 'free')}
        style={{
          flex: 1,
          padding: '0.4rem',
          backgroundColor: item.mode === 'free' ? '#4CAF50' : '#e0e0e0',
          color: item.mode === 'free' ? 'white' : '#666',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 2.5vw, 12px)',
          fontWeight: 'bold'
        }}
      >
        終日フリー
      </button>
      <button
        onClick={() => handleTimeChange(i, 'mode', 'unavailable')}
        style={{
          flex: 1,
          padding: '0.4rem',
          backgroundColor: item.mode === 'unavailable' ? '#f44336' : '#e0e0e0',
          color: item.mode === 'unavailable' ? 'white' : '#666',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 2.5vw, 12px)',
          fontWeight: 'bold'
        }}
      >
        終日不可
      </button>
      <button
        onClick={() => handleTimeChange(i, 'mode', 'time')}
        style={{
          flex: 1,
          padding: '0.4rem',
          backgroundColor: item.mode === 'time' ? '#2196F3' : '#e0e0e0',
          color: item.mode === 'time' ? 'white' : '#666',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 2.5vw, 12px)',
          fontWeight: 'bold'
        }}
      >
        時間指定
      </button>
    </div>

    {/* 時間指定の場合のみ時間入力を表示 */}
    {item.mode === 'time' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ width: '100%' }}>
          <label style={{ 
            fontSize: 'clamp(12px, 2.5vw, 13px)', 
            display: 'block', 
            marginBottom: '0.25rem' 
          }}>
            開始時間
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <select 
              value={item.startHour} 
              onChange={e => handleTimeChange(i, 'startHour', e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <option value="">時</option>
              {[...Array(37)].map((_, h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>:</span>
            <select 
              value={item.startMin} 
              onChange={e => handleTimeChange(i, 'startMin', e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <option value="">分</option>
              {[...Array(60)].map((_, m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <label style={{ 
            fontSize: 'clamp(12px, 2.5vw, 13px)', 
            display: 'block', 
            marginBottom: '0.25rem' 
          }}>
            終了時間
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <select 
              value={item.endHour} 
              onChange={e => handleTimeChange(i, 'endHour', e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <option value="">時</option>
              {[...Array(37)].map((_, h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>:</span>
            <select 
              value={item.endMin} 
              onChange={e => handleTimeChange(i, 'endMin', e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.5rem', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <option value="">分</option>
              {[...Array(60)].map((_, m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )}
    
    <div>
      <label style={{ 
        fontSize: 'clamp(12px, 2.5vw, 13px)', 
        display: 'block', 
        marginBottom: '0.25rem', 
        fontWeight: 'bold' 
      }}>
        備考
      </label>
      <textarea 
        value={item.remarks} 
        onChange={e => handleTimeChange(i, 'remarks', e.target.value)}
        placeholder="例：朝遅刻予定、早退など"
        style={{ 
          width: '100%', 
          padding: '0.5rem', 
          borderRadius: '4px', 
          border: '2px solid #FF9800',
          fontSize: 'clamp(12px, 3vw, 14px)',
          minHeight: '60px',
          fontFamily: 'inherit',
          backgroundColor: '#FFF9E6',
          boxSizing: 'border-box',
          resize: 'vertical'
        }}
      />
    </div>
  </div>
))}
          </div>
          <button 
            onClick={handleSubmit} 
            style={{ 
              backgroundColor: '#1976D2', 
              width: '100%', 
              fontSize: 'clamp(14px, 3.5vw, 16px)', 
              padding: '0.75rem',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            送信
          </button>
        </div>
      </div>
    );
  }

  if (role === 'staff') {
    return (
      <div className="login-wrapper">
        {showNotifPrompt && <NotifPromptModal />}
        {showHomeScreenPrompt && <HomeScreenPromptModal />}
        {showInstallBanner && <InstallBanner />}
        {showNotifModal && <NotifModal />}
        {showNotifList && <NotifListModal />}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage, currentHelpManagerNumber)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <BackButton />
          <HelpButton page="staffMenu" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <button type="button" onClick={() => {
              const next = !notifEnabled;
              setNotifEnabled(next);
              localStorage.setItem('notifEnabled', String(next));
              if (next) {
                registerPushSilent(loggedInManagerNumber);
                showNotifToast('🔔 通知をオンにしました');
              } else {
                showNotifToast('🔕 通知をオフにしました');
              }
            }}
              style={{ backgroundColor: notifEnabled ? '#FF9800' : '#9E9E9E', color: 'white', border: 'none', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              {notifEnabled ? '🔔 通知ON（タップでOFF）' : '🔕 通知OFF（タップでON）'}
            </button>
            <button type="button" onClick={() => showInstallFlow()}
              style={{ background: 'none', border: '1px solid #1a73e8', color: '#1a73e8', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', cursor: 'pointer' }}>
              📲 ホーム画面に追加
            </button>
          </div>
          {notifEnabled && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '0.3rem' }}>
              <button type="button" onClick={async () => {
                showNotifToast('📤 送信中...');
                const r = await supabase.functions.invoke('send-push-notification', { body: { title: '🔔 テスト通知', body: 'プッシュ通知が正常に届いています！', target_manager_numbers: [String(loggedInManagerNumber)] } });
                showNotifToast(r.data?.sent > 0 ? '✅ テスト通知を送信しました' : '⚠️ 送信失敗（端末に届かない場合はガイドを確認）');
              }} style={{ flex: 1, background: 'none', border: '1px solid #43A047', color: '#43A047', borderRadius: '20px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>
                📨 テスト送信
              </button>
              <button type="button" onClick={() => setShowBatteryGuide(true)}
                style={{ flex: 1, background: 'none', border: '1px solid #E65100', color: '#E65100', borderRadius: '20px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>
                ⚙️ 通知が届かない
              </button>
            </div>
          )}
          {notifToast && (
            <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', color: 'white', padding: '12px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: 'bold', zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              {notifToast}
            </div>
          )}
          {loggedInName && <div style={{ textAlign: 'center', color: '#1976D2', fontWeight: 'bold', marginBottom: '0.3rem' }}>{loggedInName}さん</div>}
          <h2 style={{ marginTop: '0.3rem' }}>アルバイトメニュー</h2>
          {notifEnabled && notifHistory.length > 0 && (
            <div style={{ position: 'relative', marginBottom: '1rem', backgroundColor: '#FFF8E1', borderRadius: '10px', padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>📋 お知らせ</span>
                <button type="button" onClick={() => { setShowNotifList(true); setNewNotifCount(0); localStorage.setItem('lastSeenNotifAt', new Date().toISOString()); }}
                  style={{ position: 'relative', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', padding: '2px 7px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' }}>
                  通知一覧
                  {newNotifCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#f44336', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', lineHeight: 1 }}>{newNotifCount > 9 ? '9+' : newNotifCount}</span>}
                </button>
              </div>
              <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                {notifHistory.slice(0, 5).map((n, i) => {
                  const lastSeen = localStorage.getItem('lastSeenNotifAt') || '';
                  const isNew = (n.created_at || '') > lastSeen;
                  return (
                    <div key={i} style={{ backgroundColor: i === 0 ? '#FFF3E0' : '#f9f9f9', borderBottom: '1px solid #eee', padding: '8px 10px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        {isNew && <span style={{ backgroundColor: '#f44336', color: 'white', fontSize: '9px', fontWeight: 'bold', borderRadius: '3px', padding: '1px 4px', flexShrink: 0 }}>NEW</span>}
                        <span style={{ fontWeight: 'bold', color: '#E65100' }}>{n.title}</span>
                      </div>
                      <div style={{ color: '#333', marginTop: '2px' }}>{n.body}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{n.created_at?.slice(0,10)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {notifEnabled && staffNotice && !noticeDismissed && notifHistory.length === 0 && (
            <div style={{ backgroundColor: '#FFF3E0', border: '2px solid #FB8C00', borderRadius: '10px', padding: '12px 14px', marginBottom: '1rem', position: 'relative' }}>
              <div style={{ fontWeight: 'bold', color: '#E65100', marginBottom: '6px', fontSize: '15px' }}>シフト提出のお知らせ</div>
              <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                シフトを提出してください。<br />
                期間：{staffNotice.period_start} 〜 {staffNotice.period_end}<br />
                期限：{staffNotice.deadline}
              </div>
              <button onClick={() => setNoticeDismissed(true)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
            </div>
          )}
          {!staffShiftSub ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <button onClick={() => setStaffShiftSub(true)} style={{ backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 1.2rem', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', textAlign: 'left', width: '100%' }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📅</span>
                <span><div style={{ fontWeight: 'bold', fontSize: '1rem' }}>シフト関連</div><div style={{ fontSize: '0.73rem', opacity: 0.85, marginTop: '2px' }}>提出・変更・確認</div></span>
              </button>
              <button onClick={() => {
                pushToHistory({ role, currentStep: '', managerAuth, managerStep, isLoggedIn: true });
                setCurrentStep('workHours');
              }} style={{ backgroundColor: '#00695C', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 1.2rem', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', textAlign: 'left', width: '100%' }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⏱</span>
                <span><div style={{ fontWeight: 'bold', fontSize: '1rem' }}>就労時間確認</div><div style={{ fontSize: '0.73rem', opacity: 0.85, marginTop: '2px' }}>今月の勤務時間を確認</div></span>
              </button>
              <button onClick={() => {
                window.open('https://docs.google.com/forms/d/e/1FAIpQLSci0UYQ7BKfXjhVj8x3WBR5ncFxxCo_lsV11kY5TaI15wlKSQ/viewform?usp=header', '_blank');
              }} style={{ backgroundColor: '#546E7A', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 1.2rem', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', textAlign: 'left', width: '100%' }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>💬</span>
                <span><div style={{ fontWeight: 'bold', fontSize: '1rem' }}>お問い合わせ</div><div style={{ fontSize: '0.73rem', opacity: 0.85, marginTop: '2px' }}>不具合・ご要望はこちら</div></span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <button onClick={() => setStaffShiftSub(false)}
                style={{ backgroundColor: '#78909C', color: 'white', border: 'none', borderRadius: '14px', padding: '0.8rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%' }}>
                <span>←</span><span style={{ fontWeight: 'bold' }}>戻る</span>
              </button>
              <button onClick={() => {
                pushToHistory({ role, currentStep: '', managerAuth, managerStep, isLoggedIn: true });
                setCurrentStep('shiftPeriod');
              }} style={{ backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 1.2rem', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', textAlign: 'left', width: '100%' }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📝</span>
                <span><div style={{ fontWeight: 'bold', fontSize: '1rem' }}>シフト提出</div><div style={{ fontSize: '0.73rem', opacity: 0.85, marginTop: '2px' }}>シフト希望を提出する</div></span>
              </button>
              <button onClick={() => {
                pushToHistory({ role, currentStep: '', managerAuth, managerStep, isLoggedIn: true });
                setCurrentStep('shiftEdit');
              }} style={{ backgroundColor: '#E65100', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 1.2rem', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', textAlign: 'left', width: '100%' }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>✏️</span>
                <span><div style={{ fontWeight: 'bold', fontSize: '1rem' }}>シフト変更</div><div style={{ fontSize: '0.73rem', opacity: 0.85, marginTop: '2px' }}>提出済みのシフトを変更</div></span>
              </button>
              <button onClick={() => {
                pushToHistory({ role, currentStep: '', managerAuth, managerStep, isLoggedIn: true });
                setCurrentStep('shiftView');
              }} style={{ backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 1.2rem', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', textAlign: 'left', width: '100%' }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📋</span>
                <span><div style={{ fontWeight: 'bold', fontSize: '1rem' }}>シフト確認</div><div style={{ fontSize: '0.73rem', opacity: 0.85, marginTop: '2px' }}>確定シフトを確認する</div></span>
              </button>
            </div>
          )}
          <button onClick={() => {
            setRole('');
            setPassword('');
            setManagerNumberInput('');
            setIsLoggedIn(false);
            setCurrentStep('');
            setStaffShiftSub(false);
            resetAllInputs();
            setNavigationHistory([]);
          }} style={{ backgroundColor: '#B0BEC5', color: '#37474F', border: 'none', borderRadius: '14px', padding: '0.75rem 1.2rem', fontSize: '0.9rem', cursor: 'pointer', marginTop: '1rem', width: '100%', fontWeight: 'bold' }}>ログアウト</button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;