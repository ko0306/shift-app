import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// ClockInInput.jsの冒頭、import文の後に追加
const HelpButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
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

const getClockInHelpContent = (page) => {
  const contents = {
    password: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>パスワード認証</h2>
        <p style={{ lineHeight: '1.8' }}>
          勤怠入力を行うには、まずパスワード認証が必要です。
        </p>
        <ol style={{ lineHeight: '1.8', marginTop: '1rem' }}>
          <li>管理者から指定されたパスワードを入力してください</li>
          <li>「認証」ボタンをクリックします</li>
        </ol>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>パスワードが分からない場合は管理者に確認してください</li>
            <li>このパスワードは全員共通です</li>
          </ul>
        </div>
      </div>
    ),
    number: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>管理番号入力</h2>
        <p style={{ lineHeight: '1.8' }}>
          あなたの管理番号を入力して、勤怠記録を開始します。
        </p>
        <ol style={{ lineHeight: '1.8', marginTop: '1rem' }}>
          <li>あなたに割り当てられた<strong>管理番号</strong>を入力します</li>
          <li>「次へ」ボタンをクリックします</li>
        </ol>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>管理番号は各自に割り当てられた固有の番号です</li>
            <li>管理番号が分からない場合は管理者に確認してください</li>
          </ul>
        </div>
      </div>
    ),
   buttons: (
  <div>
    <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>勤怠記録</h2>
    <p style={{ lineHeight: '1.8' }}>
      該当するボタンを<strong>ダブルクリック</strong>（素早く2回クリック）して記録します。
    </p>
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ color: '#2E7D32', marginBottom: '0.5rem' }}>🟢 出勤</h3>
          <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>勤務を開始する時に押します。</p>
          
          <h3 style={{ color: '#1565C0', marginBottom: '0.5rem' }}>🔵 退勤</h3>
          <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>勤務を終了する時に押します。</p>
          
          <h3 style={{ color: '#E65100', marginBottom: '0.5rem' }}>🟠 休憩開始</h3>
          <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>休憩に入る時に押します。</p>
          
          <h3 style={{ color: '#6A1B9A', marginBottom: '0.5rem' }}>🟣 休憩終了</h3>
          <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>休憩から戻る時に押します。</p>
        </div>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
         <strong>💡 ポイント:</strong>
<ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
  <li>誤操作防止のため、ボタンは必ず<strong>ダブルクリック</strong>してください</li>
  <li>1回目のクリック後、ボタンがオレンジ色に変わります</li>
  <li>出勤前に退勤、休憩開始前に休憩終了を押すと警告が表示されます</li>
  <li>記録後は画面下部の「最近の記録」で確認できます</li>
  <li>「履歴」ボタンから過去の記録を確認・修正できます</li>
</ul>
        </div>
      </div>
    ),
    calendar: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>履歴カレンダー</h2>
        <p style={{ lineHeight: '1.8' }}>
          過去の勤怠記録を確認・修正できます。
        </p>
        <ol style={{ lineHeight: '1.8', marginTop: '1rem' }}>
          <li>カレンダーで<strong>青色で表示されている日付</strong>は記録がある日です</li>
          <li>記録がある日付をクリックすると、その日の詳細が表示されます</li>
          <li>◀ ▶ ボタンで月を切り替えられます</li>
        </ol>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>青色の日付のみクリックできます（記録がある日）</li>
            <li>灰色の日付は記録がない日です</li>
            <li>薄い表示は前月・翌月の日付です</li>
          </ul>
        </div>
      </div>
    ),
    edit: (
  <div>
    <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>記録の確認と修正</h2>
    <p style={{ lineHeight: '1.8' }}>
      選択した日の勤怠記録を確認し、必要に応じて修正申請ができます。
    </p>
    
    <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>📋 記録の確認</h3>
    <p style={{ lineHeight: '1.6' }}>
      その日の出勤、休憩開始、休憩終了、退勤の記録が色分けされて表示されます。
    </p>
    
    <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>✏️ 修正モード</h3>
    <ol style={{ lineHeight: '1.8', marginTop: '0.5rem' }}>
      <li>「修正モード」ボタンをクリックします</li>
      <li>修正したい時間を変更します</li>
      <li><strong>「➕ 追加」ボタンで新しい記録を追加できます</strong></li>
      <li>不要な記録は「削除🗑️」ボタンで削除できます</li>
      <li>「📤 申請」ボタンで修正を申請します</li>
    </ol>
    
    <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>➕ 記録の追加方法</h3>
    <ol style={{ lineHeight: '1.8', marginTop: '0.5rem' }}>
      <li>「➕ 追加」ボタンをクリック</li>
      <li>種類（出勤/退勤/休憩開始/休憩終了）を選択</li>
      <li>時刻を入力</li>
      <li>「✓ 確認」ボタンで追加</li>
    </ol>
    
    <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
      <strong>💡 ポイント：</strong>
      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
        <li><strong>時間を変更した記録のみ</strong>が申請されます（変更なしの記録は申請されません）</li>
        <li>新規追加した記録は即座に承認されます</li>
        <li>既存の記録を修正した場合は管理者の承認が必要です</li>
        <li>「申請中」と表示されている記録は承認待ちです</li>
        <li>「承認済」と表示されている記録は承認されています</li>
        <li>修正をキャンセルする場合は「❌ キャンセル」ボタンを押してください</li>
      </ul>
    </div>
  </div>
),
  };
  return contents[page] || contents.password;
};
function ClockInInput({ onBack }) {
  // 認証とパスワード
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // ステップ管理
  const [step, setStep] = useState('number'); // 'number', 'buttons', 'calendar', 'edit'
  const [managerNumber, setManagerNumber] = useState('');
  const [selectedManagerNumber, setSelectedManagerNumber] = useState('');
  
  // メッセージ
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  // データ
  const [userMap, setUserMap] = useState({});
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [actionLogs, setActionLogs] = useState([]);
  
  // ダブルクリック処理
const [lastClickTime, setLastClickTime] = useState({});
const [clickCount, setClickCount] = useState({});
 
  
  // 履歴・カレンダー
  const [historyDates, setHistoryDates] = useState([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 編集モード
  const [editMode, setEditMode] = useState(false);
 
  const [dayLogs, setDayLogs] = useState([]);
   const [showHelp, setShowHelp] = useState(false);
  const [currentHelpPage, setCurrentHelpPage] = useState('password');
const [selectedStore, setSelectedStore] = useState('A');
const [showAddForm, setShowAddForm] = useState(false);
const [newLog, setNewLog] = useState({ action_type: 'clock_in', action_time: '09:00' });
  // 初期表示時に日時を設定
  useEffect(() => {
    updateDateTime();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(updateDateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const updateDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    setCurrentDateTime(`${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`);
  };

  const fetchUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.error('ユーザー取得エラー:', error);
        return;
      }

      const userMapTemp = {};
      if (users && users.length > 0) {
        users.forEach(user => {
          const mn = user.manager_number;
          if (mn !== null && mn !== undefined) {
            userMapTemp[String(mn)] = user.name || `ユーザー${mn}`;
          }
        });
      }
      setUserMap(userMapTemp);
    } catch (error) {
      console.error('予期しないエラー:', error);
    }
  };
  const fetchLastStore = async (managerNumber) => {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('store')
        .eq('manager_number', managerNumber)
        .not('store', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0 && data[0].store) {
        setSelectedStore(data[0].store);
      } else {
        setSelectedStore('A');
      }
    } catch (error) {
      console.error('店舗情報取得エラー:', error);
      setSelectedStore('A');
    }
  };

  const handlePasswordSubmit = () => {
    if (password === '0306') {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('パスワードが違います');
    }
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

 // ダブルクリック処理
const handleButtonClick = (actionType) => {
  const now = Date.now();
  const lastClick = lastClickTime[actionType] || 0;
  const timeDiff = now - lastClick;

  if (timeDiff < 500) { // 500ms以内の2回目のクリック
    // ダブルクリック成功
    checkAndHandleAction(actionType);
    setClickCount({ ...clickCount, [actionType]: 0 });
    setLastClickTime({ ...lastClickTime, [actionType]: 0 });
  } else {
    // 1回目のクリック
    setClickCount({ ...clickCount, [actionType]: 1 });
    setLastClickTime({ ...lastClickTime, [actionType]: now });
    
    // 500ms後にリセット
    setTimeout(() => {
      setClickCount(prev => ({ ...prev, [actionType]: 0 }));
    }, 500);
  }
};
// アクションの妥当性チェック
const checkAndHandleAction = (actionType) => {
  // 今日のログを取得
  const todayLogs = actionLogs.filter(log => log.action_date === getTodayDateString());
  
  let warningMessage = '';
  
  if (actionType === 'clock_out') {
    // 退勤: 出勤が記録されているか確認
    const hasClockIn = todayLogs.some(log => log.action_type === 'clock_in');
    if (!hasClockIn) {
      warningMessage = '出勤が記録されていませんが、退勤を記録しますか?';
    }
  } else if (actionType === 'break_end') {
    // 休憩終了: 休憩開始が記録されているか確認
    const hasBreakStart = todayLogs.some(log => log.action_type === 'break_start');
    if (!hasBreakStart) {
      warningMessage = '休憩開始が記録されていませんが、休憩終了を記録しますか?';
    }
  }
  
  if (warningMessage) {
    if (window.confirm(warningMessage)) {
      handleAction(actionType);
    }
  } else {
    handleAction(actionType);
  }
};

  // アクション実行
  const handleAction = async (actionType) => {
  const currentTime = getCurrentTimeString();
  const todayDate = getTodayDateString();
  
  try {
    const logData = {
      manager_number: selectedManagerNumber,
      action_type: actionType,
      action_time: currentTime,
      action_date: todayDate,
      is_modified: false,
      approval_status: 'approved'
    };
    
    // 店舗情報が設定されている場合のみ追加
    if (selectedStore) {
      logData.store = selectedStore;
    }
    
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert([logData])
      .select();

    if (error) {
      console.error('記録エラー詳細:', error);
      throw error;
    }

    setMessage(`${actionType === 'clock_in' ? '出勤' : 
                actionType === 'break_start' ? '休憩開始' :
                actionType === 'break_end' ? '休憩終了' : '退勤'}を記録しました`);
    setMessageType('success');
    
    fetchActionLogs(selectedManagerNumber);
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  } catch (error) {
    console.error('記録エラー:', error);
    setMessage('エラーが発生しました: ' + (error.message || '不明なエラー'));
    setMessageType('error');
  }
};

  // 履歴取得
  const fetchActionLogs = async (managerNumber) => {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('manager_number', managerNumber)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    setActionLogs(data || []);
  } catch (error) {
    console.error('履歴取得エラー:', error);
  }
};

  // 履歴の日付一覧を取得
  const fetchHistoryDates = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('action_date')
        .eq('manager_number', selectedManagerNumber)
        .order('action_date', { ascending: false });

      if (error) throw error;
      
      const uniqueDates = [...new Set(data.map(item => item.action_date))];
      setHistoryDates(uniqueDates);
    } catch (error) {
      console.error('日付取得エラー:', error);
    }
  };

  // 特定日の履歴を取得
  const fetchDayLogs = async (date) => {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('manager_number', selectedManagerNumber)
      .eq('action_date', date)
      .order('action_time', { ascending: true });

    if (error) throw error;
setDayLogs(data || []);
} catch (error) {
  console.error('日別履歴取得エラー:', error);
  setDayLogs([]);
}
};

  // 時間修正の申請
const handleEditSubmit = async () => {
  try {
    const date = selectedHistoryDate;

    // ✅ 元のデータを取得
    const { data: originalLogs, error: fetchError } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('manager_number', selectedManagerNumber)
      .eq('action_date', date);

    if (fetchError) throw fetchError;

    // ✅ 元のデータをマップに保存（時刻を"HH:MM"形式に統一）
    const originalMapById = {};
    
    if (originalLogs) {
      originalLogs.forEach(log => {
        // 時刻を"HH:MM"形式に統一
        const timeStr = log.action_time ? log.action_time.substring(0, 5) : '';
        originalMapById[log.id] = {
          action_time: timeStr,
          action_type: log.action_type
        };
      });
    }
    
    // 既存のログを削除
    await supabase
      .from('attendance_logs')
      .delete()
      .eq('manager_number', selectedManagerNumber)
      .eq('action_date', date);

    // ✅ 更新されたログを挿入（変更があったものだけis_modified: true）
    const logsToInsert = dayLogs
      .filter(log => log.action_time && log.action_time.trim() !== '')
      .map(log => {
        const isNewLog = !log.id || log.id.toString().startsWith('temp-');
        
        if (isNewLog) {
          // 新規追加の場合は即承認
          return {
            manager_number: selectedManagerNumber,
            action_type: log.action_type,
            action_time: log.action_time,
            action_date: date,
            original_time: null,
            is_modified: false,
            approval_status: 'approved'
          };
        } else {
          // 既存データの場合、変更があったかチェック
          const originalData = originalMapById[log.id];
          const currentTime = log.action_time ? log.action_time.substring(0, 5) : '';
          const timeChanged = originalData && originalData.action_time !== currentTime;
          
          return {
            manager_number: selectedManagerNumber,
            action_type: log.action_type,
            action_time: log.action_time,
            action_date: date,
            original_time: timeChanged ? originalData.action_time : null,
            is_modified: timeChanged,  // ✅ 変更があった場合のみtrue
            approval_status: timeChanged ? 'pending' : 'approved'
          };
        }
      });

    if (logsToInsert.length > 0) {
      const { error } = await supabase
        .from('attendance_logs')
        .insert(logsToInsert);

      if (error) {
        console.error('挿入エラー詳細:', error);
        throw error;
      }
    }

    setMessage('修正を申請しました');
    setMessageType('success');
    setEditMode(false);
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
      setStep('buttons');
    }, 2000);
    
  } catch (error) {
    console.error('申請エラー:', error);
    setMessage('エラーが発生しました: ' + (error.message || '不明なエラー'));
    setMessageType('error');
  }
};

    

  // ログ削除
  const handleDeleteLog = async (logId) => {
    if (!window.confirm('このログを削除しますか？')) return;
    
    try {
      const { error } = await supabase
        .from('attendance_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      
      fetchDayLogs(selectedHistoryDate);
      setMessage('削除しました');
      setMessageType('success');
      
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 2000);
    } catch (error) {
      console.error('削除エラー:', error);
      setMessage('エラーが発生しました');
      setMessageType('error');
    }
  };

  // カレンダー生成
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
      const hasHistory = historyDates.includes(dateStr);

      days.push({
        date: new Date(currentDate),
        dateStr: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        hasHistory
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
  };

  // ============================================================
  // 画面レンダリング
  // ============================================================

  // パスワード認証画面
  if (!isAuthenticated) {
  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getClockInHelpContent(currentHelpPage)} />
      <div className="login-card" style={{ position: 'relative' }}>
        <HelpButton onClick={() => { setCurrentHelpPage('password'); setShowHelp(true); }} />
        <h2>勤怠入力</h2>
          <p style={{ marginBottom: '1rem', color: '#666' }}>パスワードを入力してください</p>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePasswordSubmit();
              }
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #ddd',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}
          />
          <button
            onClick={handlePasswordSubmit}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}
          >
            認証
          </button>
          {passwordError && (
            <p style={{ color: '#F44336', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {passwordError}
            </p>
          )}
          <button
            onClick={onBack}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  // 管理番号入力画面
 if (step === 'number') {
  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getClockInHelpContent(currentHelpPage)} />
      <div className="login-card" style={{ width: '500px', maxWidth: '95vw', position: 'relative' }}>
        <HelpButton onClick={() => { setCurrentHelpPage('number'); setShowHelp(true); }} />
        <h2>勤怠入力</h2>
          
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            {currentDateTime}
          </div>
          

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              管理番号
            </label>
            <input
              type="text"
              value={managerNumber}
              onChange={(e) => setManagerNumber(e.target.value)}
             onKeyPress={(e) => {
  if (e.key === 'Enter') {
    if (!managerNumber.trim()) {
      setMessage('管理番号を入力してください');
      setMessageType('error');
      return;
    }
    if (!userMap[String(managerNumber)]) {
      setMessage('番号が間違っています');
      setMessageType('error');
      return;
    }
    setSelectedManagerNumber(managerNumber);
    fetchActionLogs(managerNumber);
    fetchLastStore(managerNumber);  // ← この行を追加
    setStep('buttons');
    setMessage('');
  }
}}
              placeholder="管理番号を入力"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1.2rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center'
              }}
            />
          </div>

          <button
            onClick={() => {
  if (!managerNumber.trim()) {
    setMessage('管理番号を入力してください');
    setMessageType('error');
    return;
  }
  if (!userMap[String(managerNumber)]) {
    setMessage('番号が間違っています');
    setMessageType('error');
    return;
  }
  setSelectedManagerNumber(managerNumber);
  fetchActionLogs(managerNumber);
  fetchLastStore(managerNumber); // ← この行を追加
  setStep('buttons');
  setMessage('');
}}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            次へ
          </button>

          {message && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: messageType === 'error' ? '#FFEBEE' : '#E8F5E9',
              color: messageType === 'error' ? '#C62828' : '#2E7D32',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <button onClick={onBack} style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            メニューに戻る
          </button>
        </div>
      </div>
    );
  }

  // 4つのボタン画面
 if (step === 'buttons') {
  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getClockInHelpContent(currentHelpPage)} />
      <div className="login-card" style={{ width: '500px', maxWidth: '95vw', position: 'relative' }}>
        <HelpButton onClick={() => { setCurrentHelpPage('buttons'); setShowHelp(true); }} />
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', position: 'relative' }}>
          <h2 style={{ margin: 0 }}>勤怠入力</h2>
          <button
            onClick={() => {
              fetchHistoryDates();
              setStep('calendar');
            }}
            style={{
              position: 'absolute',
              right: 0,
              padding: '0.3rem 0.4rem',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              maxWidth: '70px'
            }}
          >
            履歴
          </button>
        </div>
 
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666', fontSize: '1.1rem' }}>
          {userMap[selectedManagerNumber]} さん
        </p>

  <div style={{
  textAlign: 'center',
  padding: '1.5rem',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  marginBottom: '1rem',  // ← 1.5remから1remに変更
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: '#333'
}}>
  {currentDateTime}
</div>

{/* ↓↓↓ 店舗選択プルダウンをここに追加 ↓↓↓ */}
<div style={{ marginBottom: '1.5rem' }}>
  <label style={{ 
    display: 'block', 
    marginBottom: '0.5rem', 
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#333',
    textAlign: 'center'
  }}>
    店舗
  </label>
  <select
    value={selectedStore}
    onChange={(e) => setSelectedStore(e.target.value)}
    style={{
      width: '100%',
      padding: '0.75rem',
      fontSize: '1.1rem',
      border: '2px solid #2196F3',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      textAlign: 'center'
    }}
  >
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
  </select>
</div>
{/* 操作説明 */}
<div style={{
  textAlign: 'center',
  padding: '0.75rem',
  backgroundColor: '#FFF9C4',
  borderRadius: '8px',
  marginBottom: '1rem',
  border: '2px solid #FBC02D'
}}>
  <p style={{
    margin: 0,
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#F57F17'
  }}>
    💡 ボタンを<span style={{ fontSize: '1.1rem', color: '#E65100' }}>ダブルクリック</span>して記録してください
  </p>
</div>

<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  marginBottom: '2rem'
}}>

{[
  { type: 'clock_in', label: '出勤', color: '#4CAF50' },
  { type: 'clock_out', label: '退勤', color: '#2196F3' },
  { type: 'break_start', label: '休憩開始', color: '#FF9800' },
  { type: 'break_end', label: '休憩終了', color: '#9C27B0' }
].map(({ type, label, color }) => (
  <button
    key={type}
    onClick={() => handleButtonClick(type)}
    style={{
      padding: '2rem 1rem',
      backgroundColor: clickCount[type] === 1 ? '#FF5722' : color,
      color: 'white',
      border: clickCount[type] === 1 ? '3px solid #FFD54F' : 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      transform: clickCount[type] === 1 ? 'scale(1.05)' : 'scale(1)',
      userSelect: 'none',
      boxShadow: clickCount[type] === 1 ? '0 4px 12px rgba(255,87,34,0.4)' : 'none'
    }}
  >
    {label}
    {clickCount[type] === 1 && (
      <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
        もう一度クリック!
      </div>
    )}
  </button>
))}
</div>

        {message && (
          <div style={{
            padding: '1rem',
            backgroundColor: messageType === 'success' ? '#E8F5E9' : '#FFEBEE',
            color: messageType === 'success' ? '#2E7D32' : '#C62828',
            borderRadius: '4px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}

        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1rem',
          backgroundColor: '#fafafa',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: '0.5rem' }}>最近の記録</h3>
          {actionLogs.length > 0 ? (
            <div>
              {actionLogs.map((log, index) => {
                const getLogColor = (type) => {
                  switch(type) {
                    case 'clock_in': return '#E8F5E9';
                    case 'clock_out': return '#E3F2FD';
                    case 'break_start': return '#FFF3E0';
                    case 'break_end': return '#F3E5F5';
                    default: return '#f9f9f9';
                  }
                };
                
                return (
                  <div key={index} style={{
                    padding: '0.5rem',
                    borderBottom: index < actionLogs.length - 1 ? '1px solid #eee' : 'none',
                    fontSize: '0.9rem',
                    backgroundColor: getLogColor(log.action_type),
                    marginBottom: '2px',
                    borderRadius: '4px'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>
                      {log.action_type === 'clock_in' ? '出勤' :
                       log.action_type === 'clock_out' ? '退勤' :
                       log.action_type === 'break_start' ? '休憩開始' : '休憩終了'}
                    </span>
                    {' '}
                    <span style={{ color: '#666' }}>
                      {log.action_date} {log.action_time}
                    </span>
                    {log.is_modified && (
                      <span style={{ 
                        marginLeft: '0.5rem',
                        padding: '0.2rem 0.4rem',
                        backgroundColor: log.approval_status === 'pending' ? '#FFF3E0' : '#E8F5E9',
                        color: log.approval_status === 'pending' ? '#FF6F00' : '#2E7D32',
                        fontSize: '0.75rem',
                        borderRadius: '3px'
                      }}>
                        {log.approval_status === 'pending' ? '申請中' : '承認済'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>記録がありません</p>
          )}
        </div>

        <button
          onClick={() => {
            setStep('number');
            setManagerNumber('');
            setSelectedManagerNumber('');
          }}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          戻る
        </button>
      </div>
    </div>
  );
}

  // カレンダー画面
  if (step === 'calendar') {
    const calendarDays = generateCalendarDays();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getClockInHelpContent(currentHelpPage)} />
      <div className="login-card" style={{ width: '600px', maxWidth: '95vw', position: 'relative' }}>
        <HelpButton onClick={() => { setCurrentHelpPage('calendar'); setShowHelp(true); }} />
        <h2>履歴の確認・変更</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '1rem' }}>
            {userMap[selectedManagerNumber]} さん
          </p>

          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <button onClick={() => changeMonth(-1)} style={{
                backgroundColor: '#607D8B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem',
                cursor: 'pointer'
              }}>
                ◀
              </button>
              <h3 style={{ margin: 0 }}>
                {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
              </h3>
              <button onClick={() => changeMonth(1)} style={{
                backgroundColor: '#607D8B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem',
                cursor: 'pointer'
              }}>
                ▶
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              marginBottom: '0.5rem'
            }}>
              {weekdays.map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '0.5rem',
                  backgroundColor: '#e0e0e0'
                }}>
                  {day}
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px'
            }}>
              {calendarDays.map((dayInfo, index) => (
                <button
                  key={index}
                  onClick={() => {
  setSelectedHistoryDate(dayInfo.dateStr);
  fetchDayLogs(dayInfo.dateStr);
  setStep('edit');
}}
style={{
  padding: '0.5rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: dayInfo.hasHistory ? '#E3F2FD' :
                 dayInfo.isCurrentMonth ? '#FFEBEE' : '#f0f0f0',
                    color: !dayInfo.hasHistory ? '#999' :
                           dayInfo.isCurrentMonth ? 'black' : '#666',
                    fontWeight: dayInfo.hasHistory ? 'bold' : 'normal',
                    opacity: dayInfo.isCurrentMonth ? 1 : 0.5,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {dayInfo.day}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep('buttons')}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  // 編集画面
 // 編集画面
if (step === 'edit') {
  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getClockInHelpContent(currentHelpPage)} />
      <div className="login-card" style={{ width: '600px', maxWidth: '95vw', position: 'relative' }}>
        <HelpButton onClick={() => { setCurrentHelpPage('edit'); setShowHelp(true); }} />
        <h2>{selectedHistoryDate}の記録</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1rem' }}>
          {userMap[selectedManagerNumber]} さん
        </p>

        {!editMode ? (
          <>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#fafafa',
              marginBottom: '1rem'
            }}>
              <h3 style={{ marginTop: 0, fontSize: '1rem' }}>記録一覧</h3>
            {dayLogs.length > 0 ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {dayLogs.map((log, index) => {
      const getLogStyle = (type) => {
        const styles = {
          'clock_in': { 
            bg: '#E8F5E9', 
            border: '#4CAF50', 
            label: '🟢 出勤',
            color: '#2E7D32'
          },
          'clock_out': { 
            bg: '#E3F2FD', 
            border: '#2196F3', 
            label: '🔵 退勤',
            color: '#1565C0'
          },
          'break_start': { 
            bg: '#FFF3E0', 
            border: '#FF9800', 
            label: '🟠 休憩開始',
            color: '#E65100'
          },
          'break_end': { 
            bg: '#F3E5F5', 
            border: '#9C27B0', 
            label: '🟣 休憩終了',
            color: '#6A1B9A'
          }
        };
        return styles[type] || { bg: '#f9f9f9', border: '#ccc', label: type, color: '#666' };
      };
      
      const style = getLogStyle(log.action_type);
      
      return (
        <div key={index} style={{
          padding: '1rem',
          backgroundColor: style.bg,
          borderLeft: `4px solid ${style.border}`,
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '1rem',
              color: style.color,
              marginBottom: '0.25rem'
            }}>
              {style.label}
            </div>
            <div style={{ 
              fontSize: '1.3rem', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              {log.action_time}
            </div>
          </div>
        {log.is_modified && (
          <span style={{ 
            marginLeft: '0.5rem',
            padding: '0.2rem 0.4rem',
            backgroundColor: log.approval_status === 'pending' ? '#FFF3E0' : '#E8F5E9',
            color: log.approval_status === 'pending' ? '#FF6F00' : '#2E7D32',
            fontSize: '0.75rem',
            borderRadius: '3px'
          }}>
            {log.approval_status === 'pending' ? '申請中' : '承認済'}
          </span>
        )}
      </div>
    );
  })}
  </div>  // ← この行を追加
) : (
  <p style={{ color: '#999', margin: 0 }}>記録がありません</p>
)}
            </div>

            <button
              onClick={() => setEditMode(true)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              修正モード
            </button>
          </>
        ) : (
          <>
           <div style={{
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '1rem',
  backgroundColor: '#FFF3E0',
  marginBottom: '1rem'
}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
    <h3 style={{ margin: 0, fontSize: '1rem', color: '#FF6F00' }}>✏️ 時間の修正</h3>
    <button
  onClick={() => setShowAddForm(!showAddForm)}
  style={{
    padding: '0.3rem 0.5rem',  // ← 左右のpaddingを0.8remから0.5remに変更
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1.0rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    minWidth: 'auto',  // ← この行を追加
    whiteSpace: 'nowrap' ,
     maxWidth: '140px', 
  }}
>
  {showAddForm ? '閉じる' : '➕ 追加'}
</button>
  </div>
  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
    修正後「申請」ボタンを押してください
  </p>
  {showAddForm && (
  <div style={{
    padding: '1rem',
    backgroundColor: '#E8F5E9',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '2px solid #4CAF50'
  }}>
    <h4 style={{ margin: '0 0 0.75rem 0', color: '#2E7D32', fontSize: '0.95rem' }}>新しい記録を追加</h4>
    
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
        種類
      </label>
      <select
        value={newLog.action_type}
        onChange={(e) => setNewLog({ ...newLog, action_type: e.target.value })}
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '1rem',
          border: '2px solid #4CAF50',
          borderRadius: '4px'
        }}
      >
        <option value="clock_in">🟢 出勤</option>
        <option value="clock_out">🔵 退勤</option>
        <option value="break_start">🟠 休憩開始</option>
        <option value="break_end">🟣 休憩終了</option>
      </select>
    </div>
    
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
        時刻
      </label>
      <input
        type="time"
        value={newLog.action_time}
        onChange={(e) => setNewLog({ ...newLog, action_time: e.target.value })}
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '1rem',
          border: '2px solid #4CAF50',
          borderRadius: '4px',
          textAlign: 'center'
        }}
        step="60"
      />
    </div>
    
    <button
      onClick={() => {
        setDayLogs([...dayLogs, {
          id: `temp-${Date.now()}`,
          manager_number: selectedManagerNumber,
          action_type: newLog.action_type,
          action_time: newLog.action_time,
          action_date: selectedHistoryDate,
          is_modified: true,
          approval_status: 'pending'
        }]);
        setShowAddForm(false);
        setNewLog({ action_type: 'clock_in', action_time: '09:00' });
      }}
      style={{
        width: '100%',
        padding: '0.6rem',
        backgroundColor: '#2E7D32',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      ✓ 確認
    </button>
  </div>
)}

            {dayLogs.map((log, index) => {
  const getLogStyle = (type) => {
    const styles = {
      'clock_in': { 
        bg: '#E8F5E9', 
        border: '#4CAF50', 
        label: '🟢 出勤時間',
        color: '#2E7D32'
      },
      'clock_out': { 
        bg: '#E3F2FD', 
        border: '#2196F3', 
        label: '🔵 退勤時間',
        color: '#1565C0'
      },
      'break_start': { 
        bg: '#FFF3E0', 
        border: '#FF9800', 
        label: '🟠 休憩開始',
        color: '#E65100'
      },
      'break_end': { 
        bg: '#F3E5F5', 
        border: '#9C27B0', 
        label: '🟣 休憩終了',
        color: '#6A1B9A'
      }
    };
    return styles[type] || { bg: '#f9f9f9', border: '#ccc', label: type, color: '#666' };
  };
  
  const style = getLogStyle(log.action_type);
  
  return (
  <div key={log.id || index} style={{ 
    padding: '0.75rem',
    marginBottom: '0.75rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: `2px solid ${style.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '0.5rem' 
    }}>
      <label style={{
        fontWeight: 'bold',
        fontSize: '0.9rem',
        color: style.color
      }}>
        {style.label}
      </label>
      <button
        onClick={() => handleDeleteLog(log.id)}
        style={{
          padding: '0.2rem 0.4rem',
          backgroundColor: '#F44336',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          fontSize: '0.65rem',
          cursor: 'pointer',
          fontWeight: 'normal',
          maxWidth: '50px',
          minWidth: '70px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        
              
            
        }}
      >
        削除🗑️
      </button>
    </div>
    <input
      type="time"
      value={log.action_time}
      onChange={(e) => {
        const updatedLogs = [...dayLogs];
        updatedLogs[index] = { ...log, action_time: e.target.value };
        setDayLogs(updatedLogs);
      }}
      style={{
        width: '100%',
        padding: '0.6rem',
        fontSize: '1.1rem',
        border: `2px solid ${style.border}`,
        borderRadius: '6px',
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: style.bg
      }}
      step="60"
    />
  </div>
);  
})} 
          </div>  
          
           <div style={{ display: 'flex', gap: '0.5rem' }}>
  <button
    onClick={handleEditSubmit}
    style={{
      flex: 1,
      padding: '0.6rem',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.95rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    }}
  >
    📤 申請
  </button>

  <button
    onClick={() => {
      setEditMode(false);
      fetchDayLogs(selectedHistoryDate);
    }}
    style={{
      flex: 1,
      padding: '0.6rem',
      backgroundColor: '#9E9E9E',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.95rem',
      cursor: 'pointer'
    }}
  >
    ❌ キャンセル
  </button>
</div>
          </>
        )}

          {message && (
            <div style={{
              padding: '1rem',
              backgroundColor: messageType === 'success' ? '#E8F5E9' : '#FFEBEE',
              color: messageType === 'success' ? '#2E7D32' : '#C62828',
              borderRadius: '4px',
              marginBottom: '1rem',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          )}

          <button
            onClick={() => setStep('calendar')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            カレンダーに戻る
           </button>
        </div>
      </div>
    );
  }  // ← この行はそのまま

  return null;
}  // ← ClockInInput関数の閉じ括弧


export default ClockInInput;