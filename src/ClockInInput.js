import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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
  
  // 長押し処理
  const [isLongPressing, setIsLongPressing] = useState(null);
  const [pressTimer, setPressTimer] = useState(null);
  
  // 履歴・カレンダー
  const [historyDates, setHistoryDates] = useState([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 編集モード
  const [editMode, setEditMode] = useState(false);
 
  const [dayLogs, setDayLogs] = useState([]);

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

  // 長押し処理
  const handlePressStart = (actionType) => {
    const timer = setTimeout(() => {
      handleAction(actionType);
    }, 800); // 800ミリ秒長押し
    setPressTimer(timer);
    setIsLongPressing(actionType);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setIsLongPressing(null);
  };

  // アクション実行
  const handleAction = async (actionType) => {
    const currentTime = getCurrentTimeString();
    const todayDate = getTodayDateString();
    
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .insert([{
          manager_number: selectedManagerNumber,
          action_type: actionType,
          action_time: currentTime,
          action_date: todayDate,
          is_modified: false,
          approval_status: 'approved'
        }])
        .select();

      if (error) throw error;

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
      setMessage('エラーが発生しました');
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
  }
};

  // 時間修正の申請
 const handleEditSubmit = async () => {
  try {
    const date = selectedHistoryDate;
    
    // 既存のログを削除
    await supabase
      .from('attendance_logs')
      .delete()
      .eq('manager_number', selectedManagerNumber)
      .eq('action_date', date);

    // 更新されたログを挿入
    const logsToInsert = dayLogs
      .filter(log => log.action_time && log.action_time.trim() !== '')
      .map(log => ({
        manager_number: selectedManagerNumber,
        action_type: log.action_type,
        action_time: log.action_time,
        action_date: date,
        is_modified: true,
        approval_status: 'pending'
      }));

    if (logsToInsert.length > 0) {
      const { error } = await supabase
        .from('attendance_logs')
        .insert(logsToInsert);

      if (error) throw error;
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
    setMessage('エラーが発生しました');
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
        <div className="login-card">
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
        <div className="login-card" style={{ width: '500px', maxWidth: '95vw' }}>
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
        <div className="login-card" style={{ width: '500px', maxWidth: '95vw' }}>
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
      backgroundColor: '#FF9800',
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
  marginBottom: '1.5rem',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: '#333'
}}>
  {currentDateTime}
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
      onMouseDown={() => handlePressStart(type)}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={() => handlePressStart(type)}
      onTouchEnd={handlePressEnd}
      style={{
        padding: '2rem 1rem',
        backgroundColor: isLongPressing === type ? '#FF5722' : color,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isLongPressing === type ? 'scale(0.95)' : 'scale(1)',
        userSelect: 'none'
      }}
    >
      {label}
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
          case 'clock_in': return '#E8F5E9';      // 緑系（出勤）
          case 'clock_out': return '#E3F2FD';     // 青系（退勤）
          case 'break_start': return '#FFF3E0';   // オレンジ系（休憩開始）
          case 'break_end': return '#F3E5F5';     // 紫系（休憩終了）
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
        <div className="login-card" style={{ width: '600px', maxWidth: '95vw' }}>
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
                    if (dayInfo.hasHistory) {
                      setSelectedHistoryDate(dayInfo.dateStr);
                      fetchDayLogs(dayInfo.dateStr);
                      setStep('edit');
                    }
                  }}
                  disabled={!dayInfo.hasHistory}
                  style={{
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: dayInfo.hasHistory ? 'pointer' : 'not-allowed',
                    backgroundColor: dayInfo.hasHistory ? '#E3F2FD' :
                                   dayInfo.isCurrentMonth ? 'white' : '#f0f0f0',
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
      <div className="login-card" style={{ width: '600px', maxWidth: '95vw' }}>
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
  <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#FF6F00', marginBottom: '0.5rem' }}>✏️ 時間の修正</h3>
  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
    修正後「申請」ボタンを押してください
  </p>

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
      padding: '0.3rem 0.6rem',
      backgroundColor: '#F44336',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.75rem',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >
    🗑️ 削除
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
  }

  return null;
}

export default ClockInInput;