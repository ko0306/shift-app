import React, { useState } from 'react';
import RegisterUser from './RegisterUser';
import ManagerCreate from './ManagerCreate';
import StaffShiftView from './StaffShiftView';
import ManagerShiftView from './ManagerShiftView';
import StaffShiftEdit from './StaffShiftEdit';
import ManagerAttendance from './ManagerAttendance';
import StaffWorkHours from './StaffWorkHours';
import ClockInInput from './ClockInInput';
import { supabase } from './supabaseClient';

import './App.css';

// ヘルプモーダルコンポーネント
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


// 使い方ガイドの内容
const getHelpContent = (page) => {
  const contents = {
    login: (
  <div>
    <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>ログイン画面の使い方</h2>
    <div style={{ marginBottom: '1.5rem' }}>
      <img src="data:image/svg+xml,%3Csvg..." />
    </div>
    <ol style={{ lineHeight: '1.8' }}>
      <li><strong>ログインID</strong>を入力します</li>
      <li><strong>パスワード</strong>を入力します</li>
      <li><strong>管理番号</strong>を入力します（新人登録で登録された番号）</li>  {/* ← この行を追加 */}
      <li><strong>ログイン</strong>ボタンをクリックします</li>
    </ol>
    <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
      <strong>💡 ポイント：</strong>
      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
        <li>管理番号は店長が新人登録時に設定した番号です</li>
        <li>ID、パスワード、管理番号のいずれかが間違っている場合、エラーメッセージが表示されます</li>
      </ul>
    </div>
  </div>
),
    roleSelect: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>役職選択画面の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='350'%3E%3Crect width='400' height='350' fill='%23f5f5f5'/%3E%3Crect x='50' y='30' width='300' height='290' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='70' text-anchor='middle' font-size='18' font-weight='bold'%3E役職を選択してください%3C/text%3E%3Crect x='80' y='100' width='240' height='45' rx='8' fill='%231976D2'/%3E%3Ctext x='200' y='130' text-anchor='middle' font-size='16' fill='white'%3Eアルバイト%3C/text%3E%3Crect x='80' y='160' width='240' height='45' rx='8' fill='%231565C0'/%3E%3Ctext x='200' y='190' text-anchor='middle' font-size='16' fill='white'%3E店長%3C/text%3E%3Crect x='80' y='220' width='240' height='45' rx='8' fill='%2300BCD4'/%3E%3Ctext x='200' y='250' text-anchor='middle' font-size='16' fill='white'%3E勤怠入力%3C/text%3E%3C/svg%3E" alt="役職選択画面" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>各ボタンの説明：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>アルバイト</strong>：シフト提出・確認・変更ができます</li>
          <li><strong>店長</strong>：シフト作成・管理・勤怠管理ができます</li>
          <li><strong>勤怠入力</strong>：出勤・退勤時刻を入力できます</li>
        </ul>
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>🔙 戻るボタン：</strong> 左上の「戻る」ボタンで前の画面に戻れます
        </div>
      </div>
    ),
    staffMenu: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>アルバイトメニューの使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f5f5f5'/%3E%3Crect x='50' y='30' width='300' height='340' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='70' text-anchor='middle' font-size='18' font-weight='bold'%3Eアルバイトメニュー%3C/text%3E%3Crect x='80' y='90' width='240' height='40' rx='8' fill='%231E88E5'/%3E%3Ctext x='200' y='117' text-anchor='middle' font-size='14' fill='white'%3E新規提出%3C/text%3E%3Crect x='80' y='140' width='240' height='40' rx='8' fill='%231976D2'/%3E%3Ctext x='200' y='167' text-anchor='middle' font-size='14' fill='white'%3Eシフト変更%3C/text%3E%3Crect x='80' y='190' width='240' height='40' rx='8' fill='%231565C0'/%3E%3Ctext x='200' y='217' text-anchor='middle' font-size='14' fill='white'%3Eシフト確認%3C/text%3E%3Crect x='80' y='240' width='240' height='40' rx='8' fill='%230D47A1'/%3E%3Ctext x='200' y='267' text-anchor='middle' font-size='14' fill='white'%3E就労時間%3C/text%3E%3Crect x='80' y='290' width='240' height='40' rx='8' fill='%23FF5722'/%3E%3Ctext x='200' y='317' text-anchor='middle' font-size='14' fill='white'%3Eログアウト%3C/text%3E%3C/svg%3E" alt="アルバイトメニュー" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>各機能の説明：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>新規提出</strong>：新しい期間のシフト希望を提出します</li>
          <li><strong>シフト変更</strong>：既に提出したシフトを変更します</li>
          <li><strong>シフト確認</strong>：確定したシフトを確認します</li>
          <li><strong>就労時間</strong>：月ごとの就労時間を確認します</li>
          <li><strong>お問い合わせ</strong>：質問や問題を報告できます</li>
          <li><strong>ログアウト</strong>：アプリからログアウトします</li>
        </ul>
      </div>
    ),
    shiftInput: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト入力画面の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect width='400' height='500' fill='%23f5f5f5'/%3E%3Crect x='30' y='20' width='340' height='460' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='50' text-anchor='middle' font-size='18' font-weight='bold'%3Eシフト入力%3C/text%3E%3Ctext x='50' y='75' font-size='12'%3E管理番号: 12345%3C/text%3E%3Crect x='50' y='90' width='40' height='25' rx='4' fill='%236c5ce7'/%3E%3Ctext x='70' y='107' text-anchor='middle' font-size='11' fill='white'%3E月%3C/text%3E%3Crect x='95' y='90' width='40' height='25' rx='4' fill='%2300b894'/%3E%3Ctext x='115' y='107' text-anchor='middle' font-size='11' fill='white'%3E火%3C/text%3E%3Crect x='140' y='90' width='40' height='25' rx='4' fill='%23fd79a8'/%3E%3Ctext x='160' y='107' text-anchor='middle' font-size='11' fill='white'%3E水%3C/text%3E%3Crect x='50' y='130' width='300' height='80' rx='8' fill='%23e3f2fd' stroke='%232196F3' stroke-width='2'/%3E%3Ctext x='60' y='150' font-size='12' font-weight='bold' fill='%231976D2'%3E一括設定%3C/text%3E%3Crect x='60' y='160' width='130' height='20' rx='4' fill='white' stroke='%23ccc'/%3E%3Ctext x='70' y='174' font-size='10' fill='%23666'%3E開始時間%3C/text%3E%3Crect x='200' y='160' width='130' height='20' rx='4' fill='white' stroke='%23ccc'/%3E%3Ctext x='210' y='174' font-size='10' fill='%23666'%3E終了時間%3C/text%3E%3Crect x='60' y='185' width='270' height='18' rx='4' fill='%232196F3'/%3E%3Ctext x='195' y='198' text-anchor='middle' font-size='11' fill='white'%3E一括適用%3C/text%3E%3Crect x='50' y='230' width='300' height='100' rx='8' fill='%23e8e8e8' stroke='%23d0d0d0'/%3E%3Ctext x='60' y='250' font-size='13' font-weight='bold'%3E2025-01-15（水）%3C/text%3E%3Crect x='60' y='260' width='130' height='20' rx='4' fill='white' stroke='%23ccc'/%3E%3Ctext x='70' y='274' font-size='10' fill='%23666'%3E開始時間%3C/text%3E%3Crect x='200' y='260' width='130' height='20' rx='4' fill='white' stroke='%23ccc'/%3E%3Ctext x='210' y='274' font-size='10' fill='%23666'%3E終了時間%3C/text%3E%3Crect x='60' y='290' width='270' height='30' rx='4' fill='%23FFF9E6' stroke='%23FF9800' stroke-width='2'/%3E%3Ctext x='70' y='310' font-size='10' fill='%23666'%3E備考：朝遅刻予定%3C/text%3E%3Crect x='80' y='440' width='240' height='30' rx='6' fill='%231976D2'/%3E%3Ctext x='200' y='461' text-anchor='middle' font-size='14' fill='white'%3E送信%3C/text%3E%3C/svg%3E" alt="シフト入力画面" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>入力手順：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>曜日ボタン</strong>をタップして、一括設定する曜日を選択</li>
          <li><strong>一括設定</strong>で開始時間・終了時間を入力</li>
          <li><strong>一括適用</strong>ボタンで選択した曜日に時間を反映</li>
          <li>各日付ごとに<strong>個別調整</strong>や<strong>備考</strong>を入力</li>
          <li>最後に<strong>送信</strong>ボタンでシフトを提出</li>
        </ol>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 便利な機能：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>「全て」ボタンで全曜日を一括選択できます</li>
            <li>備考欄に遅刻・早退などの予定を記入できます</li>
            <li>時間を空欄にすると「休み」として扱われます</li>
          </ul>
        </div>
      </div>
    ),
    managerMenu: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>店長メニューの使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='420'%3E%3Crect width='400' height='420' fill='%23f5f5f5'/%3E%3Crect x='50' y='30' width='300' height='360' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='70' text-anchor='middle' font-size='18' font-weight='bold'%3E店長メニュー%3C/text%3E%3Crect x='80' y='90' width='240' height='40' rx='8' fill='%231E88E5'/%3E%3Ctext x='200' y='117' text-anchor='middle' font-size='14' fill='white'%3Eシフト作成%3C/text%3E%3Crect x='80' y='140' width='240' height='40' rx='8' fill='%231976D2'/%3E%3Ctext x='200' y='167' text-anchor='middle' font-size='14' fill='white'%3Eシフト確認%3C/text%3E%3Crect x='80' y='190' width='240' height='40' rx='8' fill='%230D47A1'/%3E%3Ctext x='200' y='217' text-anchor='middle' font-size='14' fill='white'%3E勤怠管理%3C/text%3E%3Crect x='80' y='240' width='240' height='40' rx='8' fill='%231554A5'/%3E%3Ctext x='200' y='267' text-anchor='middle' font-size='14' fill='white'%3E新人登録%3C/text%3E%3Crect x='80' y='290' width='240' height='40' rx='8' fill='%231565C0'/%3E%3Ctext x='200' y='317' text-anchor='middle' font-size='14' fill='white'%3Eお問い合わせ%3C/text%3E%3Crect x='80' y='340' width='240' height='35' rx='8' fill='%23FF5722'/%3E%3Ctext x='200' y='364' text-anchor='middle' font-size='14' fill='white'%3Eログアウト%3C/text%3E%3C/svg%3E" alt="店長メニュー" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>各機能の説明：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>シフト作成</strong>：スタッフのシフト希望を確認してシフトを作成</li>
          <li><strong>シフト確認</strong>：作成済みのシフトを確認・印刷</li>
          <li><strong>勤怠管理</strong>：スタッフの出勤・退勤時刻を管理</li>
          <li><strong>新人登録</strong>：新しいスタッフを登録</li>
          <li><strong>お問い合わせ</strong>：質問や問題を報告</li>
          <li><strong>ログアウト</strong>：アプリからログアウト</li>
        </ul>
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>🔒 セキュリティ：</strong> 店長メニューにアクセスするには店長パスワードの入力が必要です
        </div>
      </div>
    ),
    clockin: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>勤怠入力画面の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='350'%3E%3Crect width='400' height='350' fill='%23f5f5f5'/%3E%3Crect x='50' y='40' width='300' height='270' rx='10' fill='white' stroke='%2300BCD4' stroke-width='2'/%3E%3Ctext x='200' y='80' text-anchor='middle' font-size='18' font-weight='bold'%3E勤怠入力%3C/text%3E%3Crect x='80' y='100' width='240' height='35' rx='5' fill='%23e3f2fd' stroke='%231976D2'/%3E%3Ctext x='90' y='123' font-size='14' fill='%23666'%3E管理番号を入力%3C/text%3E%3Crect x='80' y='150' width='240' height='35' rx='5' fill='%23e3f2fd' stroke='%231976D2'/%3E%3Ctext x='90' y='173' font-size='14' fill='%23666'%3E日付を選択%3C/text%3E%3Crect x='80' y='200' width='110' height='30' rx='6' fill='%234CAF50'/%3E%3Ctext x='135' y='221' text-anchor='middle' font-size='13' fill='white'%3E出勤打刻%3C/text%3E%3Crect x='210' y='200' width='110' height='30' rx='6' fill='%23FF9800'/%3E%3Ctext x='265' y='221' text-anchor='middle' font-size='13' fill='white'%3E退勤打刻%3C/text%3E%3Crect x='130' y='250' width='140' height='30' rx='6' fill='%232196F3'/%3E%3Ctext x='200' y='271' text-anchor='middle' font-size='13' fill='white'%3E記録を保存%3C/text%3E%3C/svg%3E" alt="勤怠入力画面" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>使用手順：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>管理番号</strong>を入力します</li>
          <li><strong>日付</strong>を選択します（通常は本日）</li>
          <li>出勤時は<strong>出勤打刻</strong>ボタンをタップ</li>
          <li>退勤時は<strong>退勤打刻</strong>ボタンをタップ</li>
          <li><strong>記録を保存</strong>ボタンで確定します</li>
        </ol>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>⚠️ 注意：</strong> 打刻ボタンを押すと現在時刻が自動的に記録されます。必ず出勤・退勤時にタップしてください。
        </div>
      </div>
    ),
  
    shiftPeriod: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト期間設定の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f5f5f5'/%3E%3Crect x='50' y='40' width='300' height='320' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='80' text-anchor='middle' font-size='18' font-weight='bold'%3E新規提出%3C/text%3E%3Ctext x='80' y='110' font-size='14' font-weight='bold'%3E管理番号:%3C/text%3E%3Crect x='80' y='120' width='240' height='35' rx='5' fill='%23e3f2fd' stroke='%231976D2'/%3E%3Ctext x='90' y='143' font-size='13' fill='%23666'%3E例: 12345%3C/text%3E%3Ctext x='80' y='175' font-size='14' font-weight='bold'%3E開始日:%3C/text%3E%3Crect x='80' y='185' width='240' height='35' rx='5' fill='%23e3f2fd' stroke='%231976D2'/%3E%3Ctext x='90' y='208' font-size='13' fill='%23666'%3E2025-01-15%3C/text%3E%3Ctext x='80' y='240' font-size='14' font-weight='bold'%3E終了日:%3C/text%3E%3Crect x='80' y='250' width='240' height='35' rx='5' fill='%23e3f2fd' stroke='%231976D2'/%3E%3Ctext x='90' y='273' font-size='13' fill='%23666'%3E2025-01-31%3C/text%3E%3Crect x='130' y='310' width='140' height='35' rx='6' fill='%231976D2'/%3E%3Ctext x='200' y='334' text-anchor='middle' font-size='14' fill='white'%3E次へ%3C/text%3E%3C/svg%3E" alt="期間設定画面" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>入力手順：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>管理番号</strong>を入力します（例：12345）</li>
          <li><strong>開始日</strong>をカレンダーから選択します</li>
          <li><strong>終了日</strong>をカレンダーから選択します</li>
          <li><strong>次へ</strong>ボタンをクリックして、シフト入力画面に進みます</li>
        </ol>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>⚠️ 注意：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>管理番号は登録時に割り当てられた番号です</li>
            <li>終了日は開始日より後の日付を選択してください</li>
            <li>期間は通常、1週間〜1ヶ月程度で設定します</li>
          </ul>
        </div>
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong> この画面では期間だけを設定します。具体的なシフト時間は次の画面で入力できます。
        </div>
      </div>
    ),
  };

  return contents[page] || contents.login;
};

function App() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [managerNumberInput, setManagerNumberInput] = useState(''); 
  const [loginMessage, setLoginMessage] = useState('');
  const [role, setRole] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [managerNumber, setManagerNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftTimes, setShiftTimes] = useState([]);
  const [bulkStartHour, setBulkStartHour] = useState('');
  const [bulkStartMin, setBulkStartMin] = useState('');
  const [bulkEndHour, setBulkEndHour] = useState('');
  const [bulkEndMin, setBulkEndMin] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [managerAuth, setManagerAuth] = useState(false);
  const [managerPass, setManagerPass] = useState('');
  const [managerPassError, setManagerPassError] = useState('');
  const [managerStep, setManagerStep] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [currentHelpPage, setCurrentHelpPage] = useState('login');
  
  const [navigationHistory, setNavigationHistory] = useState([]);

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

  const openHelp = (page) => {
    setCurrentHelpPage(page);
    setShowHelp(true);
  };

  const handleLogin = async (e) => {  // ← async を追加
  e.preventDefault();
  
  // IDとパスワードのチェック
  if (id !== 'kouki' || password !== '0306') {
    setLoginMessage('IDまたはパスワードが違います');
    return;
  }

  // 管理番号のチェック
  if (!managerNumberInput.trim()) {
    setLoginMessage('管理番号を入力してください');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('manager_number')
      .eq('manager_number', managerNumberInput)
      .eq('is_deleted', false)
      .single();

    if (error || !data) {
      setLoginMessage('管理番号が登録されていません');
      return;
    }

    // すべてのチェックが通った場合
    setIsLoggedIn(true);
    setLoginMessage('');
    setNavigationHistory([]);
  } catch (err) {
    setLoginMessage('管理番号が登録されていません');
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
    
    setRole(selectedRole);
    if (selectedRole === 'staff') setCurrentStep('');
  };

  const handleNext = async () => {
    if (!managerNumber.trim()) {
      alert('管理番号を入力してください');
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
        .eq('manager_number', managerNumber)
        .single();

      if (error || !data) {
        alert('管理番号が存在しません。');
        return;
      }
    } catch (err) {
      alert('管理番号が存在しません。');
      return;
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
        startHour: '', 
        startMin: '', 
        endHour: '', 
        endMin: '', 
        remarks: '' 
      });
      d.setDate(d.getDate() + 1);
    }

    setShiftTimes(dates);
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
    setShiftTimes(updated);
  };

  const handleBulkApply = () => {
    const updated = shiftTimes.map(item => {
      const day = getWeekday(item.date);
      if (selectedDays.includes('全て') || selectedDays.includes(day)) {
        return { 
          ...item, 
          startHour: bulkStartHour, 
          startMin: bulkStartMin, 
          endHour: bulkEndHour, 
          endMin: bulkEndMin 
        };
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
    try {
      for (const shift of shiftTimes) {
        const startTime = shift.startHour !== '' && shift.startMin !== '' 
          ? `${String(shift.startHour).padStart(2, '0')}:${String(shift.startMin).padStart(2, '0')}` 
          : '';
        const endTime = shift.endHour !== '' && shift.endMin !== '' 
          ? `${String(shift.endHour).padStart(2, '0')}:${String(shift.endMin).padStart(2, '0')}` 
          : '';
        
        const { error } = await supabase
          .from('shifts')
          .insert([{
            manager_number: managerNumber,
            date: shift.date,
            start_time: startTime,
            end_time: endTime,
            remarks: shift.remarks,
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

  const HelpButton = ({ page }) => {
    return (
      <button
        onClick={() => openHelp(page)}
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

 if (!isLoggedIn) {
  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
      <form className="login-card" onSubmit={handleLogin} style={{ position: 'relative' }}>
        <HelpButton page="login" />
        <h2>ログイン</h2>
        <input type="text" placeholder="ログインID" value={id} onChange={e => setId(e.target.value)} required />
        <input type="password" placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="text" placeholder="管理番号" value={managerNumberInput} onChange={e => setManagerNumberInput(e.target.value)} required />  {/* ← この1行を追加 */}
        <button type="submit" style={{ backgroundColor: '#2196F3' }}>ログイン</button>
        {loginMessage && <p className="error-msg">{loginMessage}</p>}
      </form>
    </div>
  );
}

  if (!role) {
    return (
      <div className="login-wrapper">
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <BackButton />
          <HelpButton page="roleSelect" />
          <h2>役職を選択してください</h2>
          <div className="button-row" style={{ flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => selectRole('staff')} style={{ backgroundColor: '#1976D2' }}>アルバイト</button>
            <button onClick={() => selectRole('manager')} style={{ backgroundColor: '#1565C0' }}>店長</button>
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

  if (role === 'clockin') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <BackButton />
        <HelpButton page="clockin" />
        <ClockInInput onBack={() => setRole('')} />
      </div>
    );
  }

  if (role === 'manager' && !managerAuth) {
    return (
      <div className="login-wrapper">
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <BackButton />
          <HelpButton page="managerMenu" />
          <h2>店長パスワード</h2>
          <input type="password" placeholder="パスワードを入力" value={managerPass} onChange={(e) => setManagerPass(e.target.value)} />
          <button onClick={() => {
            if (managerPass === '0306') {
              pushToHistory({
                role: role,
                currentStep: currentStep,
                managerAuth: false,
                managerStep: managerStep,
                isLoggedIn: true
              });
              setManagerAuth(true);
              setManagerPassError('');
            } else {
              setManagerPassError('パスワードが違います');
            }
          }} style={{ backgroundColor: '#1554A5' }}>認証</button>
          {managerPassError && <p className="error-msg">{managerPassError}</p>}
        </div>
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === '') {
    return (
      <div className="login-wrapper">
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <BackButton />
          <HelpButton page="managerMenu" />
          <h2>店長メニュー</h2>
          <div className="button-row" style={{ flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => {
              pushToHistory({
                role: role,
                currentStep: currentStep,
                managerAuth: managerAuth,
                managerStep: '',
                isLoggedIn: true
              });
              setManagerStep('create');
            }} style={{ backgroundColor: '#1E88E5' }}>シフト作成</button>
            <button onClick={() => {
              pushToHistory({
                role: role,
                currentStep: currentStep,
                managerAuth: managerAuth,
                managerStep: '',
                isLoggedIn: true
              });
              setManagerStep('view');
            }} style={{ backgroundColor: '#1976D2' }}>シフト確認</button>
            <button onClick={() => {
              pushToHistory({
                role: role,
                currentStep: currentStep,
                managerAuth: managerAuth,
                managerStep: '',
                isLoggedIn: true
              });
              setManagerStep('attendance');
            }} style={{ backgroundColor: '#0D47A1' }}>勤怠管理</button>
            <button onClick={() => {
              pushToHistory({
                role: role,
                currentStep: currentStep,
                managerAuth: managerAuth,
                managerStep: '',
                isLoggedIn: true
              });
              setManagerStep('register');
            }} style={{ backgroundColor: '#1554A5' }}>新人登録</button>
            <button onClick={() => {
              window.open('https://docs.google.com/forms/d/e/1FAIpQLSci0UYQ7BKfXjhVj8x3WBR5ncFxxCo_lsV11kY5TaI15wlKSQ/viewform?usp=header', '_blank');
            }} style={{ backgroundColor: '#1565C0' }}>お問い合わせ</button>
          </div>
          <button onClick={() => {
            setRole('');
            setId('');
            setPassword('');
            setManagerNumberInput(''); 
            setIsLoggedIn(false);
            setManagerAuth(false);
            resetAllInputs();
            setNavigationHistory([]);
          }} style={{ backgroundColor: '#FF5722' }}>ログアウト</button>
        </div>
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === 'register') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <BackButton />
        <RegisterUser onBack={() => setManagerStep('')} />
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === 'create') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <BackButton />
        <ManagerCreate onNavigate={(page) => {
          if (page === 'staff') {
            setManagerStep('');
          }
        }} />
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === 'view') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <BackButton />
        <ManagerShiftView onBack={() => setManagerStep('')} />
      </div>
    );
  }

  if (role === 'manager' && managerAuth && managerStep === 'attendance') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <BackButton />
        <ManagerAttendance onBack={() => setManagerStep('')} />
      </div>
    );
  }

  if (role === 'staff' && currentStep === 'shiftView') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <BackButton />
        <StaffShiftView onBack={() => setCurrentStep('')} />
      </div>
    );
  }

  if (role === 'staff' && currentStep === 'shiftEdit') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <BackButton />
        <StaffShiftEdit onBack={() => setCurrentStep('')} />
      </div>
    );
  }

  if (role === 'staff' && currentStep === 'workHours') {
    return (
      <div style={{ position: 'relative' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <BackButton />
        <StaffWorkHours onBack={() => setCurrentStep('')} />
      </div>
    );
  }

  if (role === 'staff' && currentStep === 'shiftPeriod') {
    return (
      <div className="login-wrapper">
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <BackButton />
          <HelpButton page="shiftPeriod" />
          <h2>新規提出</h2>
          <label>管理番号:</label>
          <input type="text" value={managerNumber} onChange={e => setManagerNumber(e.target.value)} />
          <label>開始日:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label>終了日:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button onClick={handleNext} style={{ backgroundColor: '#1976D2' }}>次へ</button>
        </div>
      </div>
    );
  }

  if (role === 'staff' && currentStep === 'shiftInput') {
    return (
      <div className="login-wrapper" style={{ padding: '0.5rem' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <div className="login-card shift-input-card" style={{ 
          position: 'relative',
          maxWidth: '100%',
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
                    width: '100%'
                  }}
                >
                  一括適用
                </button>
              </div>
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
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: 'clamp(14px, 3.5vw, 16px)', 
                  marginBottom: '0.25rem' 
                }}>
                  {item.date}（{getWeekday(item.date)}）
                </div>
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
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <div className="login-card" style={{ position: 'relative' }}>
          <BackButton />
          <HelpButton page="staffMenu" />
          <h2>アルバイトメニュー</h2>
          <div className="button-row" style={{ flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => {
              pushToHistory({
                role: role,
                currentStep: '',
                managerAuth: managerAuth,
                managerStep: managerStep,
                isLoggedIn: true
              });
              setCurrentStep('shiftPeriod');
            }} style={{ backgroundColor: '#1E88E5' }}>新規提出</button>
            <button onClick={() => {
              pushToHistory({
                role: role,
                currentStep: '',
                managerAuth: managerAuth,
                managerStep: managerStep,
                isLoggedIn: true
              });
              setCurrentStep('shiftEdit');
            }} style={{ backgroundColor: '#1976D2' }}>シフト変更</button>
            <button onClick={() => {
              pushToHistory({
                role: role,
                currentStep: '',
                managerAuth: managerAuth,
                managerStep: managerStep,
                isLoggedIn: true
              });
              setCurrentStep('shiftView');
            }} style={{ backgroundColor: '#1565C0' }}>シフト確認</button>
            <button onClick={() => {
              pushToHistory({
                role: role,
                currentStep: '',
                managerAuth: managerAuth,
                managerStep: managerStep,
                isLoggedIn: true
              });
              setCurrentStep('workHours');
            }} style={{ backgroundColor: '#0D47A1' }}>就労時間</button>
            <button onClick={() => {
              window.open('https://docs.google.com/forms/d/e/1FAIpQLSci0UYQ7BKfXjhVj8x3WBR5ncFxxCo_lsV11kY5TaI15wlKSQ/viewform?usp=header', '_blank');
            }} style={{ backgroundColor: '#1554A5' }}>お問い合わせ</button>
          </div>
          <button onClick={() => {
            setRole('');
            setId('');
            setPassword('');
            setManagerNumberInput('');
            setIsLoggedIn(false);
            setCurrentStep('');
            resetAllInputs();
            setNavigationHistory([]);
          }} style={{ backgroundColor: '#FF5722' }}>ログアウト</button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;