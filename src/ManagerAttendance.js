import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

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

const getManagerHelpContent = (page) => {
  const contents = {
    calendar: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>カレンダー画面</h2>
        <p style={{ lineHeight: '1.8' }}>
          勤怠データがある日付をクリックして、その日の勤怠を確認・確定できます。
        </p>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>📌 カレンダーの色の意味</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong style={{ color: '#4CAF50' }}>薄い緑</strong>：確定済み（集計対象）</li>
          <li><strong style={{ color: '#9C27B0' }}>紫</strong>：シフトと勤怠入力の両方あり</li>
          <li><strong style={{ color: '#2196F3' }}>薄い青</strong>：シフトのみ</li>
          <li><strong style={{ color: '#F44336' }}>薄い赤</strong>：勤怠入力のみ</li>
        </ul>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>🔔 申請通知</h3>
        <p style={{ lineHeight: '1.6' }}>
          画面右上の「📬申請」ボタンをクリックすると、従業員からの修正申請を確認できます。
          申請がある場合は赤い数字バッジが表示されます。
        </p>
        
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>色付きの日付のみクリックできます</li>
            <li>確定済み（薄い緑）の日付は集計に反映されています</li>
            <li>◀ ▶ ボタンで月を切り替えられます</li>
          </ul>
        </div>
      </div>
    ),
    attendance: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>勤怠確定画面</h2>
        <p style={{ lineHeight: '1.8' }}>
          選択した日付の勤怠データを確認し、確定時間を入力して勤怠を確定します。
        </p>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>📋 表の見方</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>シフト</strong>：予定されていた勤務時間</li>
          <li><strong>勤怠</strong>：実際に打刻された時間</li>
          <li><strong>⏰ 確定時間</strong>（黄色い行）：集計に使用される最終的な時間</li>
        </ul>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>✏️ 確定時間の入力</h3>
        <ol style={{ lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li>各従業員の黄色い行で「⏰ 確定開始」「⏰ 確定終了」「⏰ 確定休憩」を入力します</li>
          <li>労働時間が自動計算されます</li>
          <li>「勤怠を確定」ボタンをクリックして確定します</li>
        </ol>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>⚠️ 重要な注意点</h3>
        <p style={{ lineHeight: '1.6', color: '#D32F2F', fontWeight: 'bold' }}>
          確定後は集計に反映されます。確定前に必ず内容を確認してください。
        </p>
        
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>確定時間は通常、シフト時間または勤怠打刻時間が自動入力されています</li>
            <li>必要に応じて手動で修正できます</li>
            <li>名前や店舗も編集可能です</li>
            <li>◀ ▶ ボタンで前後の日付に移動できます</li>
          </ul>
        </div>
      </div>
    ),
    summary: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>勤務時間集計画面</h2>
        <p style={{ lineHeight: '1.8' }}>
          確定済みの勤怠データを集計して表示します。
        </p>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>🔍 フィルター機能</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>従業員選択</strong>：特定の従業員のみ表示</li>
          <li><strong>店舗選択</strong>：特定の店舗のみ表示</li>
          <li><strong>期間単位</strong>：年別/月別/日別で集計</li>
          <li><strong>対象期間</strong>：集計する期間を選択</li>
        </ul>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>⏱️ 時間帯の編集</h3>
        <p style={{ lineHeight: '1.6' }}>
          「時間帯の編集」ボタンをクリックすると、集計する時間帯を編集できます。
        </p>
        <ol style={{ lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li>既存の時間帯のラベル名や時間を変更できます</li>
          <li>「追加」ボタンで新しい時間帯を追加できます（例：深夜時間）</li>
          <li>「削除」ボタンで不要な時間帯を削除できます</li>
        </ol>
        
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>集計されるのは「確定済み」の勤怠データのみです</li>
            <li>表は総勤務時間の多い順に並びます</li>
            <li>時間帯が重複している場合、両方にカウントされます</li>
          </ul>
        </div>
      </div>
    ),
    notifications: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>修正申請の確認</h2>
        <p style={{ lineHeight: '1.8' }}>
          従業員から提出された勤怠の修正申請を確認・承認します。
        </p>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>📬 申請の確認方法</h3>
        <ol style={{ lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li>カレンダー画面右上の「📬申請」ボタンをクリック</li>
          <li>申請がある場合、赤い数字バッジが表示されます</li>
          <li>申請一覧が表示されます</li>
        </ol>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>✅ 承認方法</h3>
        <ol style={{ lineHeight: '1.8', marginTop: '0.5rem' }}>
          <li>各申請カードで変更内容を確認します</li>
          <li>「変更前」と「変更後」の時刻が表示されます</li>
          <li>問題なければ「✓ 承認して確定」ボタンをクリック</li>
        </ol>
        
        <h3 style={{ color: '#FF6F00', marginTop: '1.5rem', marginBottom: '0.5rem' }}>🔴 複数の変更がある場合</h3>
        <p style={{ lineHeight: '1.6' }}>
          同じ従業員が同じ日に複数の時刻を修正している場合、すべての変更が1つのカードにまとめて表示されます。
        </p>
        
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>承認すると即座に勤怠データに反映されます</li>
            <li>承認後、該当日を確認・確定してください</li>
            <li>申請は日付の新しい順に表示されます</li>
          </ul>
        </div>
      </div>
    )
  };
  return contents[page] || contents.calendar;
};

// 日付文字列を正確に取得する関数（タイムゾーン対応）
const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ----------------------------------------------------------------------
// 共通ヘルパー関数
// ----------------------------------------------------------------------
const timeToMinutes = (time) => {
    if (!time) return 0;
    const parts = time.split(':').map(Number);
    return parts[0] * 60 + parts[1]; 
};

const calculateWorkMinutes = (start, end, breakMinutes) => {
  if (!start || !end) return 0;
  
  let startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);
  let breakMins = breakMinutes || 0;

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; 
  }

  const workMinutes = endMinutes - startMinutes;
  
  return Math.max(0, workMinutes - breakMins);
};

const calculateWorkMinutesInPeriod = (actualStart, actualEnd, breakMinutes, periodStartMinutes, periodEndMinutes) => {
    if (!actualStart || !actualEnd) return 0;

    let start = timeToMinutes(actualStart);
    let end = timeToMinutes(actualEnd);

    if (end < start) {
        end += 24 * 60;
    }
    
    const overlapStart = Math.max(start, periodStartMinutes);
    const overlapEnd = Math.min(end, periodEndMinutes);

    if (overlapEnd <= overlapStart) {
        return 0;
    }

    let workInPeriod = overlapEnd - overlapStart;
    const totalWorkDuration = end - start;

    if (totalWorkDuration > 0 && breakMinutes > 0) {
        const breakRatio = breakMinutes / totalWorkDuration;
        const breakDeduction = workInPeriod * breakRatio;
        workInPeriod -= breakDeduction;
    }

    return Math.max(0, Math.round(workInPeriod));
};

const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (totalMinutes < 0) return '0時間0分'; 
    return `${hours}時間${minutes}分`;
};

// 時刻を24時以降の形式で表示（例: 25:00, 26:30）
const formatExtendedTime = (timeStr, workDate) => {
  if (!timeStr || !workDate) return timeStr;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  const workDateObj = new Date(workDate + 'T00:00:00');
  const currentDate = new Date();
  currentDate.setHours(hours, minutes, 0, 0);
  
  // 勤務開始日から何日経過しているか
  const daysDiff = Math.floor((currentDate - workDateObj) / (1000 * 60 * 60 * 24));
  
  // 日をまたいでいる場合（深夜帯）は時間に24を加算
  if (hours < 12 && daysDiff >= 0) { 
    const extendedHours = hours + 24;
    return `${extendedHours}:${String(minutes).padStart(2, '0')}`;
  }
  
  return timeStr;
};

// ----------------------------------------------------------------------
// TimePeriodEditor (集計時間帯設定コンポーネント)
// ----------------------------------------------------------------------
const TimePeriodEditor = ({ timePeriods, setTimePeriods, onClose }) => {
    const [currentPeriods, setCurrentPeriods] = useState(timePeriods);
    const [newPeriod, setNewPeriod] = useState({ label: '', start: '00:00', end: '00:00' });
    const [nextId, setNextId] = useState(Math.max(0, ...timePeriods.map(p => p.id)) + 1);
const [pendingModifications, setPendingModifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
    const handleUpdate = (id, field, value) => {
        setCurrentPeriods(prev => {
            const updated = prev.map(p => 
                p.id === id ? { ...p, [field]: value } : p
            );
            return [...updated];
        });
    };

    const handleDelete = (id) => {
        setCurrentPeriods(prev => prev.filter(p => p.id !== id));
    };

    const handleAdd = () => {
        if (!newPeriod.label || !newPeriod.start || !newPeriod.end) {
            alert("ラベル、開始時刻、終了時刻をすべて入力してください。");
            return;
        }

        const newKey = `period${nextId}`; 

        const periodToAdd = {
            id: nextId,
            key: newKey, 
            label: newPeriod.label,
            start: newPeriod.start,
            end: newPeriod.end,
        };
        
        setCurrentPeriods(prev => [...prev, periodToAdd]);
        setNextId(nextId + 1);
        setNewPeriod({ label: '', start: '00:00', end: '00:00' });
    };


    const handleSave = () => {
        currentPeriods.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
        setTimePeriods(currentPeriods);
        onClose();
    };

    return (
        <div style={{ padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>集計時間帯の編集</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                {currentPeriods.map((p) => (
                    <div key={p.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', padding: '0.75rem', borderBottom: '2px solid #ddd', backgroundColor: '#fff' }}>
                        <div style={{ flex: 5, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>ラベル名</label>
                            <input
                                type="text"
                                value={p.label || ''}
                                onChange={(e) => handleUpdate(p.id, 'label', e.target.value)}
                                placeholder="例: 午前時間"
                                style={{ 
                                    padding: '0.5rem', 
                                    fontSize: '1rem',
                                    border: '2px solid #2196F3',
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                }}
                            />
                        </div>
                        <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: '#666' }}>開始</label>
                                <input
                                    type="time"
                                    value={p.start}
                                    onChange={(e) => handleUpdate(p.id, 'start', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                                    step="60"
                                />
                            </div>
                            <span style={{ marginTop: '1.2rem', fontSize: '0.8rem' }}>〜</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: '#666' }}>終了</label>
                                <input
                                    type="time"
                                    value={p.end}
                                    onChange={(e) => handleUpdate(p.id, 'end', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                                    step="60"
                                />
                            </div>
                        </div>
                        <button onClick={() => handleDelete(p.id)} style={{ padding: '0.4rem', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px', marginTop: '1.2rem', cursor: 'pointer', width: '45px', fontSize: '0.85rem' }}>
                            削除
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem', borderTop: '2px solid #4CAF50', paddingTop: '1rem', backgroundColor: '#f0f8f0', padding: '1rem', borderRadius: '4px' }}>
                <div style={{ flex: 5, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#4CAF50', fontWeight: 'bold' }}>新しいラベル名</label>
                    <input
                        type="text"
                        value={newPeriod.label}
                        onChange={(e) => setNewPeriod({ ...newPeriod, label: e.target.value })}
                        placeholder="例: 深夜時間"
                        style={{ 
                            padding: '0.5rem', 
                            fontSize: '1rem',
                            border: '2px solid #4CAF50',
                            borderRadius: '4px'
                        }}
                    />
                </div>
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: '#666' }}>開始</label>
                        <input
                            type="time"
                            value={newPeriod.start}
                            onChange={(e) => setNewPeriod({ ...newPeriod, start: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                            step="60"
                        />
                    </div>
                    <span style={{ marginTop: '1.2rem', fontSize: '0.8rem' }}>〜</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: '#666' }}>終了</label>
                        <input
                            type="time"
                            value={newPeriod.end}
                            onChange={(e) => setNewPeriod({ ...newPeriod, end: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                            step="60"
                        />
                    </div>
                </div>
                <button onClick={handleAdd} style={{ padding: '0.4rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '45px', fontSize: '0.85rem', marginTop: '1.2rem' }}>
                    追加
                </button>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{ padding: '0.5rem 1rem', backgroundColor: '#9E9E9E', color: 'white', border: 'none', borderRadius: '4px' }}>
                    キャンセル
                </button>
                <button onClick={handleSave} style={{ padding: '0.5rem 1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}>
                    設定を保存
                </button>
            </div>
        </div>
    );
};


// ----------------------------------------------------------------------
// SummaryView (勤務時間集計モードのサブコンポーネント)
// ----------------------------------------------------------------------

const SummaryView = ({ userMap, availableDates, onBackToCalendar }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filter, setFilter] = useState('monthly'); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedPeriod, setSelectedPeriod] = useState(getDateString(new Date()).substring(0, 7)); 
  const [selectedUser, setSelectedUser] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [isEditingPeriods, setIsEditingPeriods] = useState(false);
 const [selectedStore, setSelectedStore] = useState('');
 const [showHelp, setShowHelp] = useState(false);

  const [timePeriods, setTimePeriods] = useState(() => ([
      { id: 1, key: 'period1', label: '午前時間', start: '00:00', end: '12:00' },
      { id: 2, key: 'period2', label: '午後時間', start: '12:00', end: '18:00' },
      { id: 3, key: 'period3', label: '夜間時間', start: '18:00', end: '00:00' },
  ]));

  useEffect(() => {
    fetchAllAttendanceRecords();
  }, []);

  const userList = useMemo(() => {
    const users = Object.entries(userMap).map(([manager_number, name]) => ({ manager_number: String(manager_number), name }));
    users.sort((a, b) => a.name.localeCompare(b.name));
    return [{ manager_number: '', name: '全従業員' }, ...users];
  }, [userMap]);
  
  
const storeList = useMemo(() => {
  const stores = new Set();
  attendanceRecords.forEach(record => {
    if (record.store && record.store.trim() !== '') {
      stores.add(record.store);
    }
  });
  const sortedStores = Array.from(stores).sort();
  return [{ value: '', label: '全店舗' }, ...sortedStores.map(s => ({ value: s, label: s }))];
}, [attendanceRecords]);

  const availableYears = useMemo(() => {
    const years = new Set(availableDates.map(d => new Date(d + 'T00:00:00').getFullYear().toString()));
    const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));
    
    const currentYear = new Date().getFullYear().toString();
    if (!years.has(currentYear)) {
        sortedYears.unshift(currentYear);
    }

    return sortedYears;
  }, [availableDates]);


  const filteredAvailablePeriods = useMemo(() => {
    const yearPrefix = selectedYear;

    if (filter === 'monthly') {
        const months = new Set();
        availableDates.forEach(d => {
            if (d.startsWith(yearPrefix)) {
                months.add(d.substring(0, 7));
            }
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    } else if (filter === 'daily') {
        const days = availableDates.filter(d => d.startsWith(yearPrefix));
        return days.sort((a, b) => b.localeCompare(a));
    }else if (filter === 'yearly') {  
    return [yearPrefix];  
  }
    return [];
  }, [availableDates, selectedYear, filter]);


  useEffect(() => {
    if (filteredAvailablePeriods.length > 0) {
        setSelectedPeriod(filteredAvailablePeriods[0]);
    } else {
        setSelectedPeriod('');
    }
  }, [selectedYear, filter, filteredAvailablePeriods]);


 
const fetchAllAttendanceRecords = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .not('work_minutes', 'is', null)
      .eq('is_confirmed', true)  // ✅ この行を追加：確定済みのみ
      .order('date', { ascending: false });

      if (error) {
        console.error('集計データ取得エラー:', error);
        return;
      }
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregatedData = useMemo(() => {
    let recordsToAggregate = attendanceRecords.filter(record => record.work_minutes > 0);

    recordsToAggregate = recordsToAggregate.filter(record => {
      const dateStr = record.date;
      
      if (filter === 'monthly') {
          return dateStr.startsWith(selectedPeriod);
      } else if (filter === 'daily') {
          return dateStr === selectedPeriod;
      } else if (filter === 'yearly') {  
      return dateStr.startsWith(selectedYear);
    }
      return false; 
    });

    if (selectedUser) {
        recordsToAggregate = recordsToAggregate.filter(record => 
            String(record.manager_number) === String(selectedUser)
        );
    }

   
  if (selectedStore) {
    recordsToAggregate = recordsToAggregate.filter(record => 
      record.store === selectedStore
    );
  }

    const calculatedTimePeriods = timePeriods.map(p => {
        const startMinutes = timeToMinutes(p.start);
        let endMinutes = timeToMinutes(p.end);
        
        if (endMinutes <= startMinutes) { 
             endMinutes += 24 * 60;
        }
        
        return {
            ...p,
            startMinutes: startMinutes,
            endMinutes: endMinutes
        };
    });


    const totals = {};
    
    recordsToAggregate.forEach(record => {
      const managerNumber = record.manager_number;
      
      if (!totals[managerNumber]) {
        totals[managerNumber] = { 
          manager_number: managerNumber,
          name: userMap[managerNumber] || `管理番号: ${managerNumber}`,
          totalMinutes: 0,
        };
        calculatedTimePeriods.forEach(p => {
            totals[managerNumber][p.key] = 0;
        });
      }
      
      totals[managerNumber].totalMinutes += record.work_minutes;

      calculatedTimePeriods.forEach(period => {
          const minutesInPeriod = calculateWorkMinutesInPeriod(
              record.actual_start,
              record.actual_end,
              record.break_minutes,
              period.startMinutes,
              period.endMinutes
          );
          totals[managerNumber][period.key] += minutesInPeriod;
      });
      
    });

    return Object.values(totals).sort((a, b) => b.totalMinutes - a.totalMinutes);

  }, [attendanceRecords, selectedPeriod, selectedUser, userMap, timePeriods, filter]);

  
  const renderPeriodSelector = () => {

     
  if (filter === 'yearly') {
    return null;
  }
    
    if (filteredAvailablePeriods.length === 0) {
        return <span style={{ padding: '0.5rem', color: '#999' }}>データがありません</span>;
    }

    return (
      <select 
        value={selectedPeriod} 
        onChange={(e) => setSelectedPeriod(e.target.value)} 
        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
      >
        {filteredAvailablePeriods.map(period => (
          <option key={period} value={period}>
            {filter === 'monthly' ? period.substring(5) + '月' : period}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="login-card" style={{ width: '1100px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        勤務時間集計
        <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
        >
            {availableYears.map(year => (
                <option key={year} value={year}>{year}年度</option>
            ))}
        </select>
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>従業員選択:</label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            {userList.map(user => (
              <option key={user.manager_number} value={user.manager_number}>{user.name}</option>
            ))}
          </select>
        </div>
        
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>店舗選択:</label>
  <select 
    value={selectedStore} 
    onChange={(e) => setSelectedStore(e.target.value)} 
    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
  >
    {storeList.map(store => (
      <option key={store.value} value={store.value}>{store.label}</option>
    ))}
  </select>
</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>期間単位:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="yearly">年別集計</option>
            <option value="monthly">月別集計</option>
            <option value="daily">日別集計</option>
          </select>
        </div>
        
        {filter !== 'yearly' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>対象期間:</label>
    {renderPeriodSelector()}
  </div>
)}

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
             <button 
                onClick={() => setIsEditingPeriods(true)}
                style={{
                    backgroundColor: '#00BCD4',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                時間帯の編集
            </button>
        </div>
      </div>

      {isEditingPeriods && (
        <TimePeriodEditor 
            timePeriods={timePeriods} 
            setTimePeriods={setTimePeriods} 
            onClose={() => setIsEditingPeriods(false)} 
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</div>
      ) : (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflowX: 'auto', 
          maxHeight: '400px'
        }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '0.75rem', borderBottom: '1px solid #ddd', textAlign: 'left', minWidth: '150px' }}>名前</th>
                <th style={{ padding: '0.75rem', borderBottom: '1px solid #ddd', textAlign: 'right', minWidth: '120px' }}>総勤務時間</th>
                {timePeriods.map(p => (
                    <th key={p.key} style={{ padding: '0.75rem', borderBottom: '1px solid #ddd', textAlign: 'right', minWidth: '150px' }}>
                        {p.label}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aggregatedData.length > 0 ? (
                aggregatedData.map((data, index) => (
                  <tr key={data.manager_number} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                      {data.name}
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatMinutes(data.totalMinutes)}
                    </td>
                    {timePeriods.map(p => (
                        <td key={p.key} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                            {formatMinutes(data[p.key] || 0)}
                        </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2 + timePeriods.length} style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                    選択した条件に一致するデータがありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button onClick={onBackToCalendar} style={{
          backgroundColor: '#607D8B',
          color: 'white',
          padding: '0.75rem 2rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          カレンダーに戻る
        </button>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// ManagerAttendance (メインコンポーネント)
// ----------------------------------------------------------------------
function ManagerAttendance({ onBack }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [currentView, setCurrentView] = useState('calendar');
  const [pendingModifications, setPendingModifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentHelpPage, setCurrentHelpPage] = useState('calendar');
  // ✅ ここに追加
  
const [dateStatus, setDateStatus] = useState({});
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [confirmedTimes, setConfirmedTimes] = useState({});
const [confirmedDates, setConfirmedDates] = useState({}); // 確定済み日付を管理
const [lastConfirmedAt, setLastConfirmedAt] = useState(null); // 最後の確定日時
  useEffect(() => {
    fetchAvailableDates();
    fetchUsers();
  }, []);
  useEffect(() => {
  if (currentView === 'calendar') {
    fetchPendingModifications();
    const interval = setInterval(fetchPendingModifications, 30000); // 30秒ごとに更新
    return () => clearInterval(interval);
  }
}, [currentView]);

  const fetchAvailableDates = async () => {
  try {
    // シフトデータを取得
    const { data: finalShifts, error: shiftError } = await supabase
      .from('final_shifts')
      .select('date')
      .order('date');

    if (shiftError) {
      console.error('シフトデータ取得エラー:', shiftError);
      return;
    }

    // 勤怠入力データを取得
    const { data: attendanceLogs, error: logsError } = await supabase
      .from('attendance_logs')
      .select('action_date')
      .eq('approval_status', 'approved');

    if (logsError) {
      console.error('勤怠ログ取得エラー:', logsError);
    }

    // ✅ 確定済み勤怠データを取得
    const { data: confirmedAttendance, error: confirmedError } = await supabase
      .from('attendance')
      .select('date, is_confirmed, confirmed_at')
      .eq('is_confirmed', true);

    if (confirmedError) {
      console.error('確定データ取得エラー:', confirmedError);
    }

    // シフトの日付
    const shiftDates = finalShifts ? finalShifts.map(item => item.date) : [];
    
    // 勤怠入力の日付
    const attendanceDates = attendanceLogs ? [...new Set(attendanceLogs.map(item => item.action_date))] : [];
    
    // 両方を結合してユニークな日付リストを作成
    const allDates = [...new Set([...shiftDates, ...attendanceDates])].sort();
    
    setAvailableDates(allDates);

    // ✅ 確定済み日付を保存
    const confirmedDatesMap = {};
    if (confirmedAttendance) {
      confirmedAttendance.forEach(att => {
        if (!confirmedDatesMap[att.date]) {
          confirmedDatesMap[att.date] = att.confirmed_at;
        } else {
          // 同じ日付で複数の確定がある場合は最新を採用
          if (new Date(att.confirmed_at) > new Date(confirmedDatesMap[att.date])) {
            confirmedDatesMap[att.date] = att.confirmed_at;
          }
        }
      });
    }
    setConfirmedDates(confirmedDatesMap);

    // 各日付の状態を保存（シフトのみ/勤怠のみ/両方/確定済み）
    const dateStatus = {};
    allDates.forEach(date => {
      const hasShift = shiftDates.includes(date);
      const hasAttendance = attendanceDates.includes(date);
      const isConfirmed = !!confirmedDatesMap[date]; // ✅ 確定済みフラグ
      
      dateStatus[date] = {
        hasShift,
        hasAttendance,
        isConfirmed, // ✅ 追加
        type: hasShift && hasAttendance ? 'both' : hasShift ? 'shift' : 'attendance'
      };
    });
    setDateStatus(dateStatus);
    
  } catch (error) {
    console.error('日付取得エラー:', error);
  }
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
          const managerNumber = user.manager_number;
          if (managerNumber !== null && managerNumber !== undefined) {
            userMapTemp[String(managerNumber)] = user.name || `ユーザー${managerNumber}`;
            userMapTemp[Number(managerNumber)] = user.name || `ユーザー${managerNumber}`;
          }
        });
      }
      setUserMap(userMapTemp);
    } catch (error) {
      console.error('予期しないエラー:', error);
    }
  };
  const fetchPendingModifications = async () => {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('is_modified', true)
      .eq('approval_status', 'pending');

    if (error) throw error;
    setPendingModifications(data || []);
  } catch (error) {
    console.error('申請取得エラー:', error);
  }
};

// 現在のfetchAttendanceData関数（630行目付近）を以下のロジックで拡張:

const fetchAttendanceData = async (date) => {
  if (!date) return;
  setLoading(true);
  try {
    // シフトデータを取得
    const { data: finalShifts, error: shiftError } = await supabase
      .from('final_shifts')
      .select('*')
      .eq('date', date)
      .order('manager_number');

    if (shiftError) {
      console.error('シフトデータ取得エラー:', shiftError);
    }

    // 勤怠ログを取得
    const { data: attendanceLogs, error: logsError } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('action_date', date)
      .eq('approval_status', 'approved')
      .order('action_time', { ascending: true });

    if (logsError) {
      console.error('勤怠ログ取得エラー:', logsError);
    }

    // 既存のattendanceデータを取得
    const { data: existingAttendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date);

    if (attendanceError) {
      console.error('勤怠データ取得エラー:', attendanceError);
    }

    // ✅ この日付の最後の確定日時を取得
    const confirmedRecords = existingAttendance?.filter(att => att.is_confirmed && att.confirmed_at);
    if (confirmedRecords && confirmedRecords.length > 0) {
      const latestConfirmed = confirmedRecords.reduce((latest, current) => {
        return new Date(current.confirmed_at) > new Date(latest.confirmed_at) ? current : latest;
      });
      setLastConfirmedAt(latestConfirmed.confirmed_at);
    } else {
      setLastConfirmedAt(null);
    }


    const attendanceMap = {};
    if (existingAttendance) {
      existingAttendance.forEach(att => {
        attendanceMap[att.manager_number] = att;
      });
    }

    // attendance_logsからデータを構築
   // attendance_logsからデータを構築
const logsMap = {};
if (attendanceLogs) {
  attendanceLogs.forEach(log => {
    if (!logsMap[log.manager_number]) {
      logsMap[log.manager_number] = {
        clock_in: null,
        clock_out: null,
        break_starts: [],
        break_ends: [],
        store: log.store || '' // ← この行を追加
      };
    }
        
        const timeStr = log.action_time ? log.action_time.substring(0, 5) : null;

        if (log.action_type === 'clock_in' && timeStr) {
  logsMap[log.manager_number].clock_in = timeStr;
  if (log.store) logsMap[log.manager_number].store = log.store; // ← この行を追加
} else if (log.action_type === 'clock_out' && timeStr) {
          logsMap[log.manager_number].clock_out = timeStr;
        } else if (log.action_type === 'break_start' && timeStr) {
          logsMap[log.manager_number].break_starts.push(timeStr);
        } else if (log.action_type === 'break_end' && timeStr) {
          logsMap[log.manager_number].break_ends.push(timeStr);
        }
      });
    }

    // 勤怠ログから管理番号のリストを取得
    const managerNumbersFromLogs = attendanceLogs 
      ? [...new Set(attendanceLogs.map(log => log.manager_number))]
      : [];

    // シフトにない人も含めて全員のリストを作成
    const allManagerNumbers = new Set([
      ...(finalShifts || []).map(shift => shift.manager_number),
      ...managerNumbersFromLogs
    ]);

    const trimTime = (time) => time ? time.substring(0, 5) : '';

    // データを構築（シフトがない人も含める）
    const data = Array.from(allManagerNumbers).map(managerNumber => {
      const shift = finalShifts?.find(s => s.manager_number === managerNumber);
      const logs = logsMap[managerNumber];
      const existing = attendanceMap[managerNumber];
      const isOff = shift?.is_off || (!shift?.start_time && !shift?.end_time);
      
      // attendance_logsのデータを優先、なければexistingAttendanceから
      const actualStart = logs?.clock_in || (existing?.actual_start ? trimTime(existing.actual_start) : '');
      const actualEnd = logs?.clock_out || (existing?.actual_end ? trimTime(existing.actual_end) : '');
      
      // 休憩時間を計算（複数の休憩に対応）
      let breakMinutes = 0;
      const breakPeriods = [];
      if (logs?.break_starts && logs?.break_ends) {
        const minLength = Math.min(logs.break_starts.length, logs.break_ends.length);
        for (let i = 0; i < minLength; i++) {
          const breakStart = logs.break_starts[i];
          const breakEnd = logs.break_ends[i];
          const breakDuration = calculateWorkMinutes(breakStart, breakEnd, 0);
          breakMinutes += breakDuration;
          breakPeriods.push({
            start: breakStart,
            end: breakEnd,
            duration: breakDuration
          });
        }
      } else if (existing?.break_minutes) {
        breakMinutes = existing.break_minutes;
      }
      
    return {
  manager_number: managerNumber,
  name: userMap[managerNumber] || `管理番号: ${managerNumber}`,
  scheduled_start: shift ? trimTime(shift.start_time) : '',
  scheduled_end: shift ? trimTime(shift.end_time) : '',
  actual_start: actualStart,
  actual_end: actualEnd,
  confirmed_start: shift ? trimTime(shift.start_time) : actualStart || '',
  confirmed_end: shift ? trimTime(shift.end_time) : actualEnd || '',
  confirmed_break: breakMinutes,
  break_minutes: breakMinutes,
  break_periods: breakPeriods,
  store: existing?.store || logs?.store || shift?.store || '',
is_off: isOff,
  attendance_id: existing?.id || null,
  work_date: date
};
    });

    // 確定時間の初期状態を保存
    const initialConfirmedTimes = {};
    data.forEach(record => {
      initialConfirmedTimes[record.manager_number] = {
        start: record.confirmed_start,
        end: record.confirmed_end,
        break: record.confirmed_break
      };
    });
    setConfirmedTimes(initialConfirmedTimes);
    setHasUnsavedChanges(false);

    const sortedData = data.sort((a, b) => {
      return a.is_off === b.is_off ? 0 : a.is_off ? 1 : -1;
    });

    setAttendanceData(sortedData);
    setCurrentView('attendance');
  } catch (error) {
    console.error('データ取得エラー:', error);
  } finally {
    setLoading(false);
  }
};

  const handleTimeChange = (index, field, value) => {
    const cleanValue = value ? value.substring(0, 5) : '';
    
    const updated = [...attendanceData];
    updated[index][field] = (field === 'break_minutes') ? Number(value) : cleanValue;
    
    setAttendanceData(updated); 
  };

 // ❌ 削除: 既存の handleSave 関数全体を削除

// ✅ 追加: 新しい handleConfirm 関数
const handleConfirm = async () => {
  if (!window.confirm('この日付の勤怠を確定しますか？確定後は集計に反映されます。')) {
    return;
  }

  setLoading(true);
  try {
    const now = new Date().toISOString();
    
    for (const record of attendanceData) {
      const actualStart = record.confirmed_start && record.confirmed_start !== '' ? record.confirmed_start : null;
      const actualEnd = record.confirmed_end && record.confirmed_end !== '' ? record.confirmed_end : null;
      
      if (!actualStart && !actualEnd) {
        continue;
      }
      
      const workMinutes = calculateWorkMinutes(
        actualStart, 
        actualEnd, 
        record.confirmed_break || 0
      );

      const attendanceRecord = {
        date: selectedDate,
        manager_number: record.manager_number,
        actual_start: actualStart, 
        actual_end: actualEnd,     
        break_minutes: record.confirmed_break || 0,
        work_minutes: workMinutes, 
        store: record.store || '',
        is_confirmed: true, // ✅ 確定フラグを追加
        confirmed_at: now   // ✅ 確定日時を追加
      };

      if (record.attendance_id) {
        const { error } = await supabase
          .from('attendance')
          .update(attendanceRecord)
          .eq('id', record.attendance_id);

        if (error) {
          console.error('更新エラー:', error);
          alert(`${record.name} の更新に失敗しました: ${error.message}`);
          setLoading(false);
          return;
        }
        
        const { error: userError } = await supabase
          .from('users')
          .update({ name: record.name })
          .eq('manager_number', record.manager_number);
          
        if (userError) {
          console.error('ユーザー名更新エラー:', userError);
        }
        
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert([attendanceRecord]);

        if (error) {
          console.error('挿入エラー:', error);
          alert(`${record.name} の保存に失敗しました: ${error.message}`);
          setLoading(false);
          return;
        }
      }
    }

    alert('勤怠を確定しました');
    setHasUnsavedChanges(false);
    setLastConfirmedAt(now);
    
    // ✅ カレンダーの状態を更新
    await fetchAvailableDates();
    await fetchAttendanceData(selectedDate);
    
  } catch (error) {
    console.error('確定エラー:', error);
    alert('確定中にエラーが発生しました');
  } finally {
    setLoading(false);
  }
};
  const handleDateSelect = (date) => {
    if (!availableDates.includes(date)) return;
    setSelectedDate(date);
    fetchAttendanceData(date);
  };

 const handleBackToCalendar = () => {
  if (hasUnsavedChanges) {
    if (!window.confirm('確定時間が保存されていません。カレンダーに戻りますか?')) {
      return;
    }
  }
  setCurrentView('calendar');
  setSelectedDate('');
  setAttendanceData([]);
  setHasUnsavedChanges(false);
};

const changeDate = (delta) => {
  if (hasUnsavedChanges) {
    if (!window.confirm('確定時間が保存されていません。日付を変更しますか?')) {
      return;
    }
  }
  
  if (!selectedDate || availableDates.length === 0) return;
  const idx = availableDates.indexOf(selectedDate);
  const newIdx = idx + delta;
  if (newIdx >= 0 && newIdx < availableDates.length) {
    const newDate = availableDates[newIdx];
    setSelectedDate(newDate);
    fetchAttendanceData(newDate);
  }
};

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = getDateString(currentDate);
      const isCurrentMonth = currentDate.getMonth() === month;
      const hasShift = availableDates.includes(dateStr);

      days.push({
        date: new Date(currentDate),
        dateStr: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        hasShift
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

  const getWeekday = (dateStr) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];


// ----------------------------------------------------------------------
// View Rendering
// ----------------------------------------------------------------------

  if (currentView === 'summary') {
    return (
      <div className="login-wrapper">
        <SummaryView 
          userMap={userMap} 
          availableDates={availableDates} 
          onBackToCalendar={handleBackToCalendar}
        />
      </div>
    );
  }

  if (currentView === 'calendar') {
  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getManagerHelpContent(currentHelpPage)} />
      <div className="login-card" style={{ width: '600px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <HelpButton onClick={() => { setCurrentHelpPage('calendar'); setShowHelp(true); }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>勤怠管理</h2>
          {/* 既存のコード... */}
 <button
  onClick={() => setShowNotifications(!showNotifications)}
  style={{
    position: 'relative',
    padding: '0.5rem 0.3rem',
    backgroundColor: '#FF5722',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    width: '80px'
  }}
>
  📬申請
  {pendingModifications.length > 0 && (
    <span style={{
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: 'bold'
    }}>
      {pendingModifications.length}
    </span>
  )}
</button>
</div>

<div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
  <button
    onClick={() => setCurrentView('calendar')}
    style={{
      padding: '0.75rem 2rem',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'not-allowed'
    }}
    disabled
  >
    退勤管理モード
  </button>
            
    
            <button
              onClick={() => setCurrentView('summary')}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              勤務時間集計モード
            </button>
          </div>
          
{showNotifications && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem'
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '16px',
      maxWidth: '800px',
      width: '95vw',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '3px solid #FF5722'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#FF5722' }}>📬 修正申請一覧</h2>
        <button
          onClick={() => setShowNotifications(false)}
          style={{
            backgroundColor: '#FF5722',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          ✕
        </button>
      </div>

      {pendingModifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pendingModifications
            .sort((a, b) => new Date(b.action_date) - new Date(a.action_date))
            .map((mod, index) => {
              const groupedLogs = pendingModifications.filter(
                m => m.manager_number === mod.manager_number && m.action_date === mod.action_date
              );
              
              if (index > 0 && 
                  mod.manager_number === pendingModifications[index - 1].manager_number &&
                  mod.action_date === pendingModifications[index - 1].action_date) {
                return null;
              }

              return (
                <div key={`${mod.manager_number}-${mod.action_date}`} style={{
                  backgroundColor: '#FFF9E6',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #FFB74D',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid #FFE0B2'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: '#E65100'
                      }}>
                        {userMap[mod.manager_number]}
                      </div>
                      <div style={{ 
                        fontSize: '1.1rem', 
                        color: '#666',
                        fontWeight: '500'
                      }}>
                        📅 {mod.action_date}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px solid #E0E0E0'
                  }}>
                    {groupedLogs.map((log, idx) => (
                      <div key={idx} style={{
                        marginBottom: idx < groupedLogs.length - 1 ? '1.5rem' : 0,
                        paddingBottom: idx < groupedLogs.length - 1 ? '1.5rem' : 0,
                        borderBottom: idx < groupedLogs.length - 1 ? '2px dashed #E0E0E0' : 'none'
                      }}>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          marginBottom: '0.8rem',
                          color: '#1976D2',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {log.action_type === 'clock_in' ? '🟢 出勤' :
                           log.action_type === 'clock_out' ? '🔵 退勤' :
                           log.action_type === 'break_start' ? '🟠 休憩開始' : '🟣 休憩終了'}
                        </div>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto 1fr',
                          gap: '1rem',
                          alignItems: 'center',
                          backgroundColor: '#F5F5F5',
                          padding: '1rem',
                          borderRadius: '8px'
                        }}>
                          <div style={{ textAlign: 'center' }}>
  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.3rem' }}>変更前</div>
  <div style={{ 
    fontSize: '1.3rem', 
    fontWeight: 'bold',
    color: '#E53935',
    textDecoration: 'line-through'
  }}>
    {log.original_time ? 
      (log.original_time.length > 5 ? log.original_time.substring(0, 5) : log.original_time) 
      : '未記録'}
  </div>
</div>
                          
                          <div style={{ 
                            fontSize: '2rem',
                            color: '#4CAF50',
                            fontWeight: 'bold'
                          }}>
                            →
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.3rem' }}>変更後</div>
                            <div style={{ 
                              fontSize: '1.3rem', 
                              fontWeight: 'bold',
                              color: '#4CAF50'
                            }}>
                              {log.action_time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        for (const log of groupedLogs) {
                          const { error } = await supabase
                            .from('attendance_logs')
                            .update({ approval_status: 'approved' })
                            .eq('id', log.id);
                          
                          if (error) throw error;
                        }
                        
                        await fetchPendingModifications();
                        alert('承認しました');
                      } catch (error) {
                        console.error('承認エラー:', error);
                        alert('承認に失敗しました');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#45a049';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#4CAF50';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                    }}
                  >
                    ✓ 承認して確定
                  </button>
                </div>
              );
            }).filter(Boolean)}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          color: '#999'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📋</div>
          <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '500' }}>申請はありません</p>
        </div>
      )}
    </div>
  </div>
)}
       <div style={{
            marginTop: '1rem',
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
                // 現在のコード（ManagerAttendance.js の 894-912行目付近）
<button
  key={index}
  onClick={() => {
    const status = dateStatus[dayInfo.dateStr];
    if (status && (status.hasShift || status.hasAttendance)) {
      handleDateSelect(dayInfo.dateStr);
    }
  }}
  disabled={!dateStatus[dayInfo.dateStr]}
  style={{
    padding: '0.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: dateStatus[dayInfo.dateStr] ? 'pointer' : 'not-allowed',
   // 変更前
backgroundColor: (() => {
  const status = dateStatus[dayInfo.dateStr];
  if (!status) return dayInfo.isCurrentMonth ? 'white' : '#f0f0f0';
  if (status.type === 'both') return '#F3E5F5'; // 紫（両方）
  if (status.type === 'shift') return '#E3F2FD'; // 薄い青（シフトのみ）
  if (status.type === 'attendance') return '#FFEBEE'; // 薄い赤（勤怠のみ）
  return dayInfo.isCurrentMonth ? 'white' : '#f0f0f0';
})(),

// ✅ 変更後
backgroundColor: (() => {
  const status = dateStatus[dayInfo.dateStr];
  if (!status) return dayInfo.isCurrentMonth ? 'white' : '#f0f0f0';
  
  // ✅ 確定済みは薄い緑（最優先）
  if (status.isConfirmed) return '#C8E6C9';
  
  if (status.type === 'both') return '#F3E5F5';
  if (status.type === 'shift') return '#E3F2FD';
  if (status.type === 'attendance') return '#FFEBEE';
  return dayInfo.isCurrentMonth ? 'white' : '#f0f0f0';
})(),
    color: !dateStatus[dayInfo.dateStr] ? '#999' :
           dayInfo.isCurrentMonth ? 'black' : '#666',
    fontWeight: dateStatus[dayInfo.dateStr] ? 'bold' : 'normal',
    opacity: dayInfo.isCurrentMonth ? 1 : 0.5,
    transition: 'all 0.3s ease'
  }}
>
  {dayInfo.day}
</button>
              ))}
            </div>
          </div>
           <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#666' }}>📌 カレンダーの見方</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#C8E6C9', border: '1px solid #999', borderRadius: '3px' }}></div>
                <span>確定済み（集計対象）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#F3E5F5', border: '1px solid #999', borderRadius: '3px' }}></div>
                <span>シフト+勤怠あり</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#E3F2FD', border: '1px solid #999', borderRadius: '3px' }}></div>
                <span>シフトのみ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#FFEBEE', border: '1px solid #999', borderRadius: '3px' }}></div>
                <span>勤怠入力のみ</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button onClick={onBack} style={{
              backgroundColor: '#607D8B',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Attendance View (日別勤怠入力)
  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getManagerHelpContent(currentHelpPage)} />
      <div className="login-card" style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <HelpButton onClick={() => { setCurrentHelpPage('attendance'); setShowHelp(true); }} />
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={() => changeDate(-1)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>◀</button>
          {selectedDate} ({getWeekday(selectedDate)})
          <button onClick={() => changeDate(1)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>▶</button>
        </h2>
       
        <p style={{ textAlign: 'center', color: '#666' }}>
          モード: <strong>退勤管理</strong>
          {lastConfirmedAt && (
            <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#4CAF50' }}>
              最終確定: {new Date(lastConfirmedAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </p>

        {/* 以下既存のコード（テーブルなど）が続きます... */}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</div>
        ) : (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '500px'
          }}>
           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  
<thead style={{ position: 'sticky', top: 0, backgroundColor: '#E8EAF6' }}>
  <tr>
    <th style={{ padding: '0.5rem', border: '1px solid #ddd', backgroundColor: '#E8EAF6', width: '100px', minWidth: '80px' }} rowSpan="2">名前</th>
    <th style={{ padding: '0.5rem', border: '1px solid #ddd', backgroundColor: '#E8EAF6', width: '60px', minWidth: '50px' }} rowSpan="2">店舗</th>
    <th style={{ padding: '0.75rem', border: '1px solid #ddd', backgroundColor: '#E8EAF6' }} colSpan="2">開始時刻</th>
    <th style={{ padding: '0.75rem', border: '1px solid #ddd', backgroundColor: '#E8EAF6' }} colSpan="2">終了時刻</th>
    <th style={{ padding: '0.75rem', border: '1px solid #ddd', backgroundColor: '#E8EAF6' }} rowSpan="2">休憩時間</th>
    <th style={{ padding: '0.75rem', border: '1px solid #ddd', backgroundColor: '#E8EAF6' }} rowSpan="2">労働時間</th>
  </tr>
  <tr>
    <th style={{ padding: '0.5rem', border: '1px solid #ddd', fontSize: '0.85rem', backgroundColor: '#E8EAF6' }}>シフト</th>
    <th style={{ padding: '0.5rem', border: '1px solid #ddd', fontSize: '0.85rem', backgroundColor: '#E8EAF6' }}>勤怠</th>
    <th style={{ padding: '0.5rem', border: '1px solid #ddd', fontSize: '0.85rem', backgroundColor: '#E8EAF6' }}>シフト</th>
    <th style={{ padding: '0.5rem', border: '1px solid #ddd', fontSize: '0.85rem', backgroundColor: '#E8EAF6' }}>勤怠</th>
  </tr>
</thead>
  <tbody>
    {attendanceData.map((record, index) => {
      // リアルタイムで労働時間を計算
      const workMinutes = calculateWorkMinutes(
        record.confirmed_start || '',
        record.confirmed_end || '',
        record.confirmed_break || 0
      );
      
      const rowBackgroundColor = record.is_off 
        ? '#f0f0f0' 
        : (index % 2 === 0 ? 'white' : '#e8f5e9');

      return (
        <React.Fragment key={index}>
          {/* データ行 */}
          <tr style={{ backgroundColor: rowBackgroundColor }}>
          <td style={{ padding: '0.75rem', border: '1px solid #ddd' }} rowSpan="2">
  <input
    type="text"
    value={record.name}
    onChange={(e) => {
      const updated = [...attendanceData];
      updated[index].name = e.target.value;
      setAttendanceData(updated);
      setHasUnsavedChanges(true);
    }}
    style={{
      width: '100%',
      padding: '0.4rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1rem'
    }}
  />
</td>
           <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }} rowSpan="2">
  <input
    type="text"
    value={record.store}
    onChange={(e) => {
      const updated = [...attendanceData];
      updated[index].store = e.target.value;
      setAttendanceData(updated);
      setHasUnsavedChanges(true);
    }}
    style={{
      width: '100%',
      padding: '0.4rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      textAlign: 'center',
      fontSize: '1rem'
    }}
  />
</td>
            {/* シフト予定開始 */}
           <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', backgroundColor: '#F5F5F5' }}>
              {record.is_off ? <span style={{ color: '#999' }}>休み</span> : record.scheduled_start || '-'}
            </td>
            {/* 勤怠入力開始 */}
            <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', backgroundColor: '#FFEBEE' }}>
              {record.actual_start || '-'}
            </td>
            {/* シフト予定終了 */}
           <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', backgroundColor: '#E3F2FD' }}>
              {record.is_off ? <span style={{ color: '#999' }}>休み</span> : record.scheduled_end || '-'}
            </td>
            {/* 勤怠入力終了 */}
            <td style={{ padding: '0.5rem', borderBottom: '1px dotted #ddd', textAlign: 'center', backgroundColor: record.actual_end ? '#FFEBEE' : 'transparent' }}>
              {record.actual_end || '-'}
            </td>
           <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
  {record.break_periods && record.break_periods.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {record.break_periods.map((period, idx) => (
                    <div key={idx} style={{ 
                      fontSize: '0.85rem', 
                      padding: '0.25rem', 
                      backgroundColor: '#FFF3E0', 
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {period.start} 〜 {period.end}
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        ({formatMinutes(period.duration)})
                      </div>
                    </div>
                  ))}
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginTop: '0.25rem',
                    padding: '0.25rem',
                    backgroundColor: '#FFE0B2',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}>
                    合計: {formatMinutes(record.break_minutes)}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999' }}>-</div>
              )}
            </td>
            <td style={{ 
              padding: '0.75rem', 
              borderBottom: '1px solid #eee', 
              textAlign: 'center', 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: workMinutes > 0 ? '#1976D2' : '#999'
            }} rowSpan="2">
              {workMinutes > 0 ? formatMinutes(workMinutes) : '-'}
            </td>
          </tr>
          
          {/* 確定時間行 */}
          <tr style={{ backgroundColor: '#FFF9C4' }}>
  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }} colSpan="2">
    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem', fontWeight: 'bold' }}>
      ⏰ 確定開始
    </div>
              <input
                type="time"
                value={record.confirmed_start || ''}
                onChange={(e) => {
                  const updated = [...attendanceData];
                  updated[index].confirmed_start = e.target.value;
                  setAttendanceData(updated);
                  setHasUnsavedChanges(true);
                }}
                style={{
                  width: '90%',
                  padding: '0.4rem',
                  border: '2px solid #FFC107',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              />
            </td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }} colSpan="2">
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                ⏰ 確定終了
              </div>
              <input
                type="time"
                value={record.confirmed_end || ''}
                onChange={(e) => {
                  const updated = [...attendanceData];
                  updated[index].confirmed_end = e.target.value;
                  setAttendanceData(updated);
                  setHasUnsavedChanges(true);
                }}
                style={{
                  width: '90%',
                  padding: '0.4rem',
                  border: '2px solid #FFC107',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              />
            </td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                ⏰ 確定休憩
              </div>
              <input
                type="number"
                value={record.confirmed_break || 0}
                onChange={(e) => {
                  const updated = [...attendanceData];
                  updated[index].confirmed_break = parseInt(e.target.value) || 0;
                  setAttendanceData(updated);
                  setHasUnsavedChanges(true);
                }}
                min="0"
                step="5"
                style={{
                  width: '90%',
                  padding: '0.4rem',
                  border: '2px solid #FF9800',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              />
              <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem' }}>
                分
              </div>
            </td>
          </tr>
        </React.Fragment>
      );
    })}
  </tbody>

</table>
          </div>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
         
<button
  onClick={handleConfirm}  // ✅ 変更
  disabled={loading}
  style={{
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1
  }}
>
  {loading ? '確定中...' : '勤怠を確定'}  {/* ✅ 変更 */}
</button>
          <button onClick={handleBackToCalendar} style={{
            backgroundColor: '#607D8B',
            color: 'white',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            カレンダーに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerAttendance;