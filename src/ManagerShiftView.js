import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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

// ヘルプコンテンツ
const getHelpContent = (page) => {
  const contents = {
    calendar: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト確認カレンダーの使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='350'%3E%3Crect width='400' height='350' fill='%23f5f5f5'/%3E%3Crect x='30' y='30' width='340' height='290' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='60' text-anchor='middle' font-size='16' font-weight='bold'%3E2025年 1月%3C/text%3E%3Crect x='50' y='75' width='300' height='200' rx='8' fill='%23f9f9f9' stroke='%23ddd'/%3E%3Ctext x='65' y='95' font-size='11' fill='%23666'%3E日 月 火 水 木 金 土%3C/text%3E%3Crect x='60' y='105' width='35' height='30' rx='4' fill='%23E3F2FD' stroke='%232196F3'/%3E%3Ctext x='77' y='125' text-anchor='middle' font-size='12' fill='%23000'%3E15%3C/text%3E%3Crect x='100' y='105' width='35' height='30' rx='4' fill='white' stroke='%23ddd'/%3E%3Ctext x='117' y='125' text-anchor='middle' font-size='12' fill='%23999'%3E16%3C/text%3E%3Crect x='140' y='105' width='35' height='30' rx='4' fill='%23E3F2FD' stroke='%232196F3'/%3E%3Ctext x='157' y='125' text-anchor='middle' font-size='12' fill='%23000'%3E17%3C/text%3E%3Crect x='130' y='285' width='140' height='25' rx='6' fill='%23607D8B'/%3E%3Ctext x='200' y='302' text-anchor='middle' font-size='12' fill='white'%3Eメニューに戻る%3C/text%3E%3C/svg%3E" alt="カレンダー" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>基本操作：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>◀ ▶ボタン</strong>で月を切り替え</li>
          <li><strong>青色の日付</strong>をクリックしてシフトを確認</li>
          <li>灰色の日付はシフトが登録されていません</li>
        </ol>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>色の意味：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><span style={{backgroundColor: '#E3F2FD', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid #2196F3'}}>青色</span>：シフトあり（クリック可能）</li>
          <li><span style={{backgroundColor: 'white', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid #ddd'}}>白色</span>：シフトなし（当月）</li>
          <li><span style={{backgroundColor: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid #ddd', opacity: 0.5}}>灰色</span>：他の月の日付</li>
        </ul>
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ヒント：</strong> カレンダー下部にシフトが登録されている日数が表示されます
        </div>
      </div>
    ),
    shiftView: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト確認・編集の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='450'%3E%3Crect width='400' height='450' fill='%23f5f5f5'/%3E%3Crect x='20' y='20' width='360' height='410' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='50' text-anchor='middle' font-size='16' font-weight='bold'%3E2025-01-15（水）%3C/text%3E%3Crect x='30' y='70' width='80' height='30' rx='6' fill='%234CAF50'/%3E%3Ctext x='70' y='91' text-anchor='middle' font-size='11' fill='white'%3E変更モード%3C/text%3E%3Crect x='120' y='70' width='80' height='30' rx='6' fill='%23673AB7'/%3E%3Ctext x='160' y='91' text-anchor='middle' font-size='11' fill='white'%3Eタイムライン%3C/text%3E%3Crect x='210' y='70' width='80' height='30' rx='6' fill='%232196F3'/%3E%3Ctext x='250' y='91' text-anchor='middle' font-size='11' fill='white'%3E更新%3C/text%3E%3Crect x='300' y='70' width='70' height='30' rx='6' fill='%23607D8B'/%3E%3Ctext x='335' y='91' text-anchor='middle' font-size='11' fill='white'%3Eカレンダー%3C/text%3E%3Crect x='30' y='120' width='340' height='280' rx='8' fill='%23f9f9f9' stroke='%23ddd'/%3E%3Ctext x='50' y='145' font-size='11' font-weight='bold'%3E名前%3C/text%3E%3Ctext x='150' y='145' font-size='11' font-weight='bold'%3E店舗%3C/text%3E%3Ctext x='220' y='145' font-size='11' font-weight='bold'%3E勤務時間%3C/text%3E%3Ctext x='320' y='145' font-size='11' font-weight='bold'%3E状態%3C/text%3E%3Crect x='40' y='160' width='320' height='35' rx='4' fill='white' stroke='%23ddd'/%3E%3Ctext x='50' y='182' font-size='10'%3E田中太郎%3C/text%3E%3Ctext x='150' y='182' font-size='10' fill='%231976D2' font-weight='bold'%3EA店舗%3C/text%3E%3Ctext x='220' y='182' font-size='10' font-weight='bold'%3E9:00 - 17:00%3C/text%3E%3Crect x='305' y='168' width='45' height='20' rx='10' fill='%234CAF50'/%3E%3Ctext x='327' y='182' text-anchor='middle' font-size='9' fill='white'%3E出勤%3C/text%3E%3C/svg%3E" alt="シフト確認" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>ボタンの説明：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong style={{color: '#4CAF50'}}>変更モード</strong>：シフトの編集を開始（オレンジ色でキャンセル可能）</li>
          <li><strong style={{color: '#673AB7'}}>タイムライン</strong>：時間軸表示に切り替え（編集モード時のみ）</li>
          <li><strong style={{color: '#2196F3'}}>更新</strong>：変更内容を保存（編集モード時のみ）</li>
          <li><strong style={{color: '#607D8B'}}>カレンダー</strong>：カレンダー画面に戻る</li>
        </ul>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>日付移動：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>◀ボタン</strong>：前の日のシフトを表示</li>
          <li><strong>▶ボタン</strong>：次の日のシフトを表示</li>
        </ul>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ヒント：</strong> 日付をクリックすると、その日付が表示されます
        </div>
      </div>
    ),
    shiftEdit: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト編集の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f5f5f5'/%3E%3Crect x='20' y='20' width='360' height='260' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='50' text-anchor='middle' font-size='14' font-weight='bold'%3E編集モード%3C/text%3E%3Crect x='40' y='70' width='320' height='180' rx='8' fill='%23f9f9f9' stroke='%23ddd'/%3E%3Ctext x='50' y='90' font-size='10' fill='%23666'%3E名前%3C/text%3E%3Ctext x='130' y='90' font-size='10' fill='%23666'%3E店舗変更%3C/text%3E%3Ctext x='210' y='90' font-size='10' fill='%23666'%3E開始%3C/text%3E%3Ctext x='280' y='90' font-size='10' fill='%23666'%3E終了%3C/text%3E%3Ctext x='340' y='90' font-size='10' fill='%23666'%3E休%3C/text%3E%3Crect x='50' y='100' width='60' height='25' rx='4' fill='white' stroke='%23ddd'/%3E%3Ctext x='80' y='117' text-anchor='middle' font-size='9'%3E田中%3C/text%3E%3Crect x='120' y='100' width='70' height='25' rx='4' fill='white' stroke='%23ddd'/%3E%3Ctext x='155' y='117' text-anchor='middle' font-size='9'%3EA%3C/text%3E%3Crect x='200' y='100' width='60' height='25' rx='4' fill='white' stroke='%23ddd'/%3E%3Ctext x='230' y='117' text-anchor='middle' font-size='9'%3E9:00%3C/text%3E%3Crect x='270' y='100' width='60' height='25' rx='4' fill='white' stroke='%23ddd'/%3E%3Ctext x='300' y='117' text-anchor='middle' font-size='9'%3E17:00%3C/text%3E%3Crect x='337' y='105' width='15' height='15' rx='2' fill='white' stroke='%23999'/%3E%3Ctext x='50' y='150' font-size='11' fill='%23666'%3E✓ 店舗名を入力%3C/text%3E%3Ctext x='50' y='170' font-size='11' fill='%23666'%3E✓ 開始・終了時刻を選択%3C/text%3E%3Ctext x='50' y='190' font-size='11' fill='%23666'%3E✓ 休みの場合はチェック%3C/text%3E%3Ctext x='50' y='210' font-size='11' fill='%23666'%3E✓ 更新ボタンで保存%3C/text%3E%3C/svg%3E" alt="編集モード" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>編集手順：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>変更モード</strong>ボタンをクリックして編集を開始</li>
          <li><strong>店舗変更</strong>欄に店舗名を入力（A、B、Cなど）</li>
          <li><strong>開始・終了時刻</strong>をドロップダウンから選択</li>
          <li>休みの場合は<strong>休みチェックボックス</strong>にチェック</li>
          <li><strong>更新</strong>ボタンをクリックして保存</li>
        </ol>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>タイムライン表示：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><span style={{backgroundColor: '#90EE90', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>緑色</span>：勤務時間帯</li>
          <li><span style={{backgroundColor: '#e0e0e0', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>灰色</span>：休み</li>
          <li>横軸が時間、縦軸がスタッフ名で表示されます</li>
        </ul>
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>📱 推奨：</strong> タイムライン表示は横向き画面での使用を推奨します
        </div>
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>⚠️ 注意：</strong> 店舗名が未入力の場合は保存できません。必ず店舗名を入力してください
        </div>
      </div>
    )
  };

  return contents[page] || contents.calendar;
};

// ヘルプボタンコンポーネント
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

// 日付文字列を正確に取得する関数（タイムゾーン対応）
const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function ManagerShiftView({ onBack }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [shiftData, setShiftData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [currentView, setCurrentView] = useState('calendar');
  const [isEditing, setIsEditing] = useState(false);
  const [editingShifts, setEditingShifts] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [showHelp, setShowHelp] = useState(false);
  const [currentHelpPage, setCurrentHelpPage] = useState('calendar');
const [selectingTimeFor, setSelectingTimeFor] = useState(null); // {shiftId: string, firstSlot: string | null}

// 既存のuseStateの後に追加
const [shiftSettings, setShiftSettings] = useState(() => {
  const saved = localStorage.getItem('shiftSettings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('設定の読み込みに失敗:', e);
    }
  }
  return {
    stores: ['A', 'B'],
    roles: ['社員', 'アルバイト'],
    defaultStore: 'A',
    defaultRole: '社員'
  };
});


  useEffect(() => {
    fetchUsers();
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 200);
    });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const fetchAvailableDates = async () => {
    try {
      const { data: finalShifts, error } = await supabase
        .from('final_shifts')
        .select('date')
        .order('date');

      if (error) {
        console.error('日付取得エラー:', error);
        return;
      }

      const uniqueDates = finalShifts ? [...new Set(finalShifts.map(item => item.date))].sort() : [];
      setAvailableDates(uniqueDates);
    } catch (error) {
      console.error('日付取得エラー:', error);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error(error);
      return;
    }

    const userMapTemp = {};
    if (data) {
      data.forEach(user => {
        userMapTemp[user.manager_number] = user.name;
        userMapTemp[String(user.manager_number)] = user.name;
        userMapTemp[Number(user.manager_number)] = user.name;
      });
    }
    setUserMap(userMapTemp);
  };

  const fetchShiftData = async (date) => {
    if (!date) return;

    setLoading(true);
    
    const { data: finalShifts, error: finalError } = await supabase
      .from('final_shifts')
      .select('*')
      .eq('date', date)
      .order('manager_number');

    if (finalError) {
      alert('データ取得に失敗しました');
      setShiftData([]);
    } else {
      setShiftData(finalShifts || []);
    }

    setCurrentView('shift');
    setLoading(false);
  };

  const getUserName = (managerNumber) => {
    return userMap[managerNumber] || '(不明)';
  };

  const handleDateSelect = (date) => {
    if (!availableDates.includes(date)) return;
    setSelectedDate(date);
    fetchShiftData(date);
    setCurrentHelpPage('shiftView');
  };

  const handleBackToCalendar = () => {
    setCurrentView('calendar');
    setSelectedDate('');
    setShiftData([]);
    setIsEditing(false);
    setShowTimeline(false);
    setCurrentHelpPage('calendar');
  };

  const changeDate = (delta) => {
    if (!selectedDate || availableDates.length === 0) return;
    const idx = availableDates.indexOf(selectedDate);
    const newIdx = idx + delta;
    if (newIdx >= 0 && newIdx < availableDates.length) {
      const newDate = availableDates[newIdx];
      setSelectedDate(newDate);
      fetchShiftData(newDate);
      setIsEditing(false);
      setEditingShifts([]);
      setShowTimeline(false);
    }
  };

  const parseTime36 = (timeStr) => {
    if (!timeStr) return { hour: 9, min: 0 };
    const parts = timeStr.split(':');
    const hour = parseInt(parts[0], 10);
    const min = parseInt(parts[1], 10);
    return { hour, min };
  };

  const formatTime36 = (hour, min) => {
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

 const handleEditToggle = () => {
  if (!isEditing) {
    setEditingShifts(shiftData.map(shift => {
      const startTime = parseTime36(shift.start_time);
      const endTime = parseTime36(shift.end_time);
      
      return {
        ...shift,
        startHour: startTime.hour,
        startMin: startTime.min,
        endHour: endTime.hour,
        endMin: endTime.min,
        store: shift.store || shiftSettings.defaultStore,  // ← 変更
        role: shift.role || shiftSettings.defaultRole,      // ← 追加
        is_off: shift.is_off || isOffDay(shift)
      };
    }));
    setShowTimeline(false);
    setCurrentHelpPage('shiftEdit');
  } else {
    setShowTimeline(false);
    setCurrentHelpPage('shiftView');
  }
  setIsEditing(!isEditing);
};

 const toggleTimeline = () => {
  if (!showTimeline && !isEditing) {
    // タイムライン表示に切り替える際、編集モードでなければ編集用データを準備
    setEditingShifts(shiftData.map(shift => {
      const startTime = parseTime36(shift.start_time);
      const endTime = parseTime36(shift.end_time);
      
      return {
        ...shift,
        startHour: startTime.hour,
        startMin: startTime.min,
        endHour: endTime.hour,
        endMin: endTime.min,
        store: shift.store || shiftSettings.defaultStore,
        role: shift.role || shiftSettings.defaultRole,
        is_off: shift.is_off || isOffDay(shift)
      };
    }));
  }
  setShowTimeline(!showTimeline);
};

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 36; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  };

  const handleShiftChange = (shiftId, field, value) => {
    const updated = editingShifts.map(shift => {
      if (shift.id === shiftId || 
          (shift.manager_number === shiftId && !shift.id)) {
        const updatedShift = { ...shift, [field]: value };
        
        if (field === 'is_off') {
          if (value) {
            updatedShift.startHour = 0;
            updatedShift.startMin = 0;
            updatedShift.endHour = 0;
            updatedShift.endMin = 0;
          } else {
            updatedShift.startHour = updatedShift.startHour || 9;
            updatedShift.startMin = updatedShift.startMin || 0;
            updatedShift.endHour = updatedShift.endHour || 17;
            updatedShift.endMin = updatedShift.endMin || 0;
          }
        }
        
        return updatedShift;
      }
      return shift;
    });
    
    setEditingShifts(updated);
  };

 const handleUpdate = async () => {
  try {
    setLoading(true);
    
    for (const shift of editingShifts) {
      const storeValue = shift.store;
      const roleValue = shift.role;  // ← 追加
      
      if (!storeValue || storeValue.trim() === '') {
        alert(`${getUserName(shift.manager_number)}の店舗を選択または入力してください`);
        setLoading(false);
        return;
      }

      if (!roleValue || roleValue.trim() === '') {  // ← 追加
        alert(`${getUserName(shift.manager_number)}の役割を選択してください`);
        setLoading(false);
        return;
      }

      const startTime = shift.is_off 
        ? null 
        : `${String(shift.startHour).padStart(2, '0')}:${String(shift.startMin).padStart(2, '0')}:00`;
      const endTime = shift.is_off 
        ? null 
        : `${String(shift.endHour).padStart(2, '0')}:${String(shift.endMin).padStart(2, '0')}:00`;

      const updateData = {
        date: shift.date,
        manager_number: shift.manager_number,
        start_time: startTime,
        end_time: endTime,
        store: storeValue,
        role: roleValue,  // ← 追加
        is_off: shift.is_off
      };

      const { error } = await supabase
        .from('final_shifts')
        .upsert(updateData, {
          onConflict: 'date,manager_number'
        });

      if (error) {
        console.error(`${getUserName(shift.manager_number)} の保存エラー:`, error);
        alert(`${getUserName(shift.manager_number)} の保存に失敗しました: ${error.message}`);
        setLoading(false);
        return;
      }
    }

    alert('シフトを更新しました');
    setIsEditing(false);
    setShowTimeline(false);
    setCurrentHelpPage('shiftView');
    fetchShiftData(selectedDate);
    
  } catch (error) {
    alert(`エラーが発生しました: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

const handleTimeSlotClick = (shiftId, slotTime) => {
  if (!isEditing) return;
  
  const shift = editingShifts.find(s => s.id === shiftId || s.manager_number === shiftId);
  if (!shift || shift.is_off) return;

  const [slotHour, slotMin] = slotTime.split(':').map(num => parseInt(num, 10));

  if (!selectingTimeFor || selectingTimeFor.shiftId !== shiftId) {
    setSelectingTimeFor({
      shiftId: shiftId,
      firstSlot: slotTime
    });

    const updated = editingShifts.map(s => {
      if (s.id === shiftId || s.manager_number === shiftId) {
        return {
          ...s,
          startHour: slotHour,
          startMin: slotMin
        };
      }
      return s;
    });
    setEditingShifts(updated);

  } else if (selectingTimeFor.shiftId === shiftId) {
    const [firstHour, firstMin] = selectingTimeFor.firstSlot.split(':').map(num => parseInt(num, 10));
    
    let startHour, startMin, endHour, endMin;
    
    if (firstHour < slotHour || (firstHour === slotHour && firstMin < slotMin)) {
      startHour = firstHour;
      startMin = firstMin;
      endHour = slotHour;
      endMin = slotMin;
    } else {
      startHour = slotHour;
      startMin = slotMin;
      endHour = firstHour;
      endMin = firstMin;
    }

    const updated = editingShifts.map(s => {
      if (s.id === shiftId || s.manager_number === shiftId) {
        return {
          ...s,
          startHour: startHour,
          startMin: startMin,
          endHour: endHour,
          endMin: endMin
        };
      }
      return s;
    });
    setEditingShifts(updated);
    setSelectingTimeFor(null);
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const timeParts = timeStr.split(':');
    return `${timeParts[0]}:${timeParts[1]}`;
  };

  const getWeekday = (dateStr) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
  };

  const isOffDay = (shift) => {
    return shift.is_off === true ||
           !shift.start_time ||
           !shift.end_time ||
           shift.start_time === '' ||
           shift.end_time === '' ||
           (shift.start_time === '00:00' && shift.end_time === '00:00') ||
           (shift.start_time === '00:00:00' && shift.end_time === '00:00:00');
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const timeSlots = generateTimeSlots();

  const sortedShiftData = [...(isEditing ? editingShifts : shiftData)].sort((a, b) => {
    const aOff = isOffDay(a) ? 1 : 0;
    const bOff = isOffDay(b) ? 1 : 0;
    return aOff - bOff;
  });

  if (currentView === 'calendar') {
    return (
      <div className="login-wrapper" style={{ padding: '0.5rem', boxSizing: 'border-box' }}>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
        <div className="login-card" style={{ position: 'relative', width: '600px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', padding: '1rem' }}>
          <HelpButton onClick={() => {
            setCurrentHelpPage('calendar');
            setShowHelp(true);
          }} />
          <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)' }}>シフト確認（店長）</h2>

          <div style={{
            marginTop: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              gap: '0.5rem'
            }}>
              <button onClick={() => changeMonth(-1)} style={{
                backgroundColor: '#607D8B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem',
                cursor: 'pointer',
                minWidth: '40px'
              }}>
                ◀
              </button>
              <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 4vw, 1.2rem)', textAlign: 'center', flex: 1 }}>
                {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
              </h3>
              <button onClick={() => changeMonth(1)} style={{
                backgroundColor: '#607D8B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem',
                cursor: 'pointer',
                minWidth: '40px'
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
                  backgroundColor: '#e0e0e0',
                  fontSize: 'clamp(0.7rem, 3vw, 0.9rem)'
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
                  onClick={() => dayInfo.hasShift && handleDateSelect(dayInfo.dateStr)}
                  disabled={!dayInfo.hasShift}
                  style={{
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: dayInfo.hasShift ? 'pointer' : 'not-allowed',
                    backgroundColor: dayInfo.hasShift ? '#E3F2FD' :
                                   dayInfo.isCurrentMonth ? 'white' : '#f0f0f0',
                    color: !dayInfo.hasShift ? '#999' :
                           dayInfo.isCurrentMonth ? 'black' : '#666',
                    fontWeight: dayInfo.hasShift ? 'bold' : 'normal',
                    opacity: dayInfo.isCurrentMonth ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    fontSize: 'clamp(0.7rem, 3vw, 0.9rem)',
                    minHeight: '40px'
                  }}
                  onMouseEnter={(e) => {
                    if (dayInfo.hasShift) {
                      e.target.style.backgroundColor = '#BBDEFB';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (dayInfo.hasShift) {
                      e.target.style.backgroundColor = '#E3F2FD';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {dayInfo.day}
                </button>
              ))}
            </div>

            <div style={{
              marginTop: '0.5rem',
              fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
              color: '#666',
              textAlign: 'center'
            }}>
              青色: シフトあり ({availableDates.length}日) | 灰色: シフトなし
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button onClick={onBack} style={{
              backgroundColor: '#607D8B',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: 'clamp(0.9rem, 3.5vw, 1rem)',
              width: '100%',
              maxWidth: '300px'
            }}>
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fullscreen-table" style={{ padding: '0.5rem', boxSizing: 'border-box', overflow: 'hidden' }}>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
      {isPortrait && isEditing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem', animation: 'rotate 2s ease-in-out infinite' }}>
            📱→📱
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>画面を横向きにしてください</h2>
          <p style={{ fontSize: '1rem', color: '#ccc' }}>シフト編集画面は横向きでの使用を推奨します</p>
          <style>{`
            @keyframes rotate {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(90deg); }
            }
          `}</style>
        </div>
      )}
      <div className="login-card" style={{ position: 'relative', width: '100%', height: '100%', boxSizing: 'border-box', padding: '1rem' }}>
        <HelpButton onClick={() => {
          setShowHelp(true);
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem' }}>
          <button onClick={() => changeDate(-1)} style={{ minWidth: '40px', padding: '0.5rem', backgroundColor: '#607D8B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>◀</button>
          <h2 style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', margin: 0, textAlign: 'center', flex: 1 }}>
            {selectedDate} ({getWeekday(selectedDate)})
          </h2>
          <button onClick={() => changeDate(1)} style={{ minWidth: '40px', padding: '0.5rem', backgroundColor: '#607D8B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>▶</button>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.3rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
  <button
    onClick={handleEditToggle}
    style={{
      padding: '0.4rem 0.6rem',
      backgroundColor: isEditing ? '#FF9800' : '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
      flex: '1 1 0',
      minWidth: '0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}
  >
    {isEditing ? 'キャンセル' : '変更'}
  </button>
 <button
  onClick={toggleTimeline}
  style={{
    padding: '0.4rem 0.6rem',
    backgroundColor: showTimeline ? '#9C27B0' : '#673AB7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
    flex: '1 1 0',
    minWidth: '0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }}
>
  {showTimeline ? 'タイムライン' : 'タイムライン'}
</button>
  <button
    onClick={handleUpdate}
    disabled={loading || !isEditing}
    style={{
      padding: '0.4rem 0.6rem',
      backgroundColor: (!isEditing || loading) ? '#ccc' : '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: (loading || !isEditing) ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
      opacity: (!isEditing || loading) ? 0.6 : 1,
      flex: '1 1 0',
      minWidth: '0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}
  >
    {loading ? '更新中' : '更新'}
  </button>
  <button
    onClick={handleBackToCalendar}
    style={{
      padding: '0.4rem 0.6rem',
      backgroundColor: '#607D8B',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
      flex: '1 1 0',
      minWidth: '0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}
  >
    カレンダー
  </button>
</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            読み込み中...
          </div>
        ) : sortedShiftData.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#666',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
          }}>
            この日のシフトはありません
          </div>
        ) : showTimeline ? (
  <div style={{ overflowX: 'auto', overflowY: 'auto', marginTop: '1rem', width: '100%', maxHeight: 'calc(100vh - 200px)', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '1200px' }}>
              <thead>
  <tr>
    <th style={{ minWidth: '50px', width: '50px', position: 'sticky', left: 0, zIndex: 3, backgroundColor: '#FFB6C1', border: '1px solid #ddd', padding: '0.2rem', fontSize: '0.65rem', color: '#000' }}>名前</th>
    <th style={{ minWidth: '60px', width: '60px', position: 'sticky', left: '50px', zIndex: 3, backgroundColor: '#ADD8E6', border: '1px solid #ddd', padding: '0.2rem', fontSize: '0.65rem', color: '#000' }}>店舗</th>
    <th style={{ minWidth: '60px', width: '60px', position: 'sticky', left: '110px', zIndex: 3, backgroundColor: '#DDA0DD', border: '1px solid #ddd', padding: '0.2rem', fontSize: '0.65rem', color: '#000' }}>役割</th>
    <th style={{ minWidth: '25px', width: '25px', position: 'sticky', left: '170px', zIndex: 3, backgroundColor: '#E6E6FA', border: '1px solid #ddd', padding: '0.2rem', fontSize: '0.65rem', color: '#000' }}>休</th>
    <th style={{ minWidth: '85px', width: '85px', position: 'sticky', left: '195px', zIndex: 3, backgroundColor: '#98FB98', border: '1px solid #ddd', padding: '0.2rem', fontSize: '0.65rem', color: '#000' }}>開始</th>
    <th style={{ minWidth: '85px', width: '85px', position: 'sticky', left: '280px', zIndex: 3, backgroundColor: '#FFE4B5', border: '1px solid #ddd', padding: '0.2rem', fontSize: '0.65rem', color: '#000' }}>終了</th>
    {timeSlots.map((slot, i) => (
      <th key={i} style={{ minWidth: '28px', width: '28px', backgroundColor: '#F0E68C', border: '1px solid #ddd', fontSize: '0.6rem', padding: '0.1rem', color: '#000' }}>
        {slot}
      </th>
    ))}
  </tr>
</thead>
             <tbody>
  {sortedShiftData.map((shift, index) => {
    const editingShift = editingShifts.find(es => es.id === shift.id || 
                                                    (es.manager_number === shift.manager_number && !shift.id)) || shift;
    
    const startTimeStr = formatTime36(editingShift.startHour || 0, editingShift.startMin || 0);
    const endTimeStr = formatTime36(editingShift.endHour || 0, editingShift.endMin || 0);
    
    return (
      <tr key={shift.id || shift.manager_number || index} className={editingShift.is_off ? 'off-row' : ''}>
        <td style={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'white', border: '1px solid #ddd', padding: '0.2rem', fontSize: '0.65rem', color: '#000', minWidth: '50px', width: '50px' }}>
          {getUserName(shift.manager_number)}
        </td>
        <td style={{ position: 'sticky', left: '50px', zIndex: 2, backgroundColor: 'white', border: '1px solid #ddd', padding: '0.1rem', minWidth: '60px', width: '60px' }}>
          <select
            value={editingShift.store || shiftSettings.defaultStore}
            onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'store', e.target.value)}
            style={{
              padding: '0.1rem',
              border: '1px solid #ddd',
              borderRadius: '2px',
              width: '100%',
              boxSizing: 'border-box',
              fontSize: '0.65rem',
              color: '#000'
            }}
          >
            {shiftSettings.stores.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>
        </td>
        <td style={{ position: 'sticky', left: '110px', zIndex: 2, backgroundColor: 'white', border: '1px solid #ddd', padding: '0.1rem', minWidth: '60px', width: '60px' }}>
          <select
            value={editingShift.role || shiftSettings.defaultRole}
            onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'role', e.target.value)}
            style={{
              padding: '0.1rem',
              border: '1px solid #ddd',
              borderRadius: '2px',
              width: '100%',
              boxSizing: 'border-box',
              fontSize: '0.65rem',
              color: '#000'
            }}
          >
            {shiftSettings.roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </td>
        <td style={{ position: 'sticky', left: '170px', zIndex: 2, backgroundColor: 'white', border: '1px solid #ddd', padding: '0.1rem', textAlign: 'center', minWidth: '25px', width: '25px' }}>
          <input
            type="checkbox"
            checked={editingShift.is_off || false}
            onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'is_off', e.target.checked)}
            style={{ transform: 'scale(1)', cursor: 'pointer' }}
          />
        </td>
        <td style={{ position: 'sticky', left: '195px', zIndex: 2, backgroundColor: 'white', border: '1px solid #ddd', padding: '0.1rem', minWidth: '85px', width: '85px' }}>
          <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
            <select
              value={editingShift.startHour || 0}
              onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'startHour', parseInt(e.target.value))}
              disabled={editingShift.is_off}
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.1rem', backgroundColor: editingShift.is_off ? '#f5f5f5' : 'white', color: '#000' }}
            >
              {[...Array(37)].map((_, h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.65rem', color: '#000' }}>:</span>
            <select
              value={editingShift.startMin || 0}
              onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'startMin', parseInt(e.target.value))}
              disabled={editingShift.is_off}
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.1rem', backgroundColor: editingShift.is_off ? '#f5f5f5' : 'white', color: '#000' }}
            >
              {[...Array(60)].map((_, m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </td>
        <td style={{ position: 'sticky', left: '280px', zIndex: 2, backgroundColor: 'white', border: '1px solid #ddd', padding: '0.1rem', minWidth: '85px', width: '85px' }}>
          <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
            <select
              value={editingShift.endHour || 0}
              onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'endHour', parseInt(e.target.value))}
              disabled={editingShift.is_off}
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.1rem', backgroundColor: editingShift.is_off ? '#f5f5f5' : 'white', color: '#000' }}
            >
              {[...Array(37)].map((_, h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.65rem', color: '#000' }}>:</span>
            <select
              value={editingShift.endMin || 0}
              onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'endMin', parseInt(e.target.value))}
              disabled={editingShift.is_off}
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.1rem', backgroundColor: editingShift.is_off ? '#f5f5f5' : 'white', color: '#000' }}
            >
              {[...Array(60)].map((_, m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </td>
        {timeSlots.map((slot, colIndex) => {
          const inShift = !editingShift.is_off && 
                         slot >= startTimeStr && 
                         slot < endTimeStr;
          
         let bgColor = 'transparent';
const isFirstClick = isEditing && 
                     selectingTimeFor?.shiftId === (shift.id || shift.manager_number) && 
                     selectingTimeFor?.firstSlot === slot;

if (editingShift.is_off) {
  bgColor = '#e0e0e0';
} else if (inShift) {
  bgColor = '#90EE90';
}

if (isFirstClick) {
  bgColor = '#000000';
}
          
          return (
          <td 
  key={colIndex} 
  onClick={() => isEditing && handleTimeSlotClick(shift.id || shift.manager_number, slot)}
  style={{ 
    backgroundColor: bgColor, 
    minWidth: '28px', 
    width: '28px', 
    border: '1px solid #ddd',
    padding: 0,
    cursor: isEditing ? 'pointer' : 'default'
  }} 
/>
          );
        })}
      </tr>
    );
  })}
</tbody>
            </table>
          </div>
        ) : (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isEditing ? '1000px' : '500px' }}>
             <thead>
  <tr style={{ backgroundColor: '#f5f5f5' }}>
    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
      名前
    </th>
    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
      店舗
    </th>
    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
      役割
    </th>  {/* ← 追加 */}
    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
      勤務時間
    </th>
    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
      状態
    </th>
    {isEditing && (
      <>
        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
          店舗変更
        </th>
        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
          役割変更
        </th>  {/* ← 追加 */}
        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
          開始
        </th>
        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
          終了
        </th>
        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
          休み
        </th>
      </>
    )}
  </tr>
</thead>
              <tbody>
                {sortedShiftData.map((shift, displayIndex) => {
                  const editingShift = isEditing ? 
                    editingShifts.find(es => es.id === shift.id || 
                                              (es.manager_number === shift.manager_number && !shift.id)) || shift 
                    : shift;
                  
                  return (
                    <tr key={shift.id || shift.manager_number || displayIndex} style={{
                      backgroundColor: displayIndex % 2 === 0 ? 'white' : '#f9f9f9'
                    }}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
                        <strong>{getUserName(shift.manager_number)}</strong>
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid #eee',
                        fontWeight: 'bold',
                        color: '#1976D2',
                        fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                        whiteSpace: 'nowrap'
                      }}>
                        {(isEditing ? editingShift.store : shift.store) ? `${isEditing ? editingShift.store : shift.store}店舗` : '-'}
                      </td>

<td style={{
  padding: '0.75rem',
  textAlign: 'center',
  borderBottom: '1px solid #eee',
  fontWeight: 'bold',
  color: '#9C27B0',
  fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
  whiteSpace: 'nowrap'
}}>
  {(isEditing ? editingShift.role : shift.role) || shiftSettings.defaultRole}
</td>

                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid #eee',
                        fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
                        whiteSpace: 'nowrap'
                      }}>
                        {!isEditing ? (
                          isOffDay(shift) ? (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>休み</span>
                          ) : (
                            <span style={{ fontWeight: 'bold' }}>
                              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                            </span>
                          )
                        ) : (
                          editingShift.is_off ? (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>休み</span>
                          ) : (
                            <span style={{ fontWeight: 'bold' }}>
                              {formatTime36(editingShift.startHour || 0, editingShift.startMin || 0)} - {formatTime36(editingShift.endHour || 0, editingShift.endMin || 0)}
                            </span>
                          )
                        )}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                          backgroundColor: (isEditing ? editingShift.is_off : isOffDay(shift)) ? '#f44336' : '#4CAF50',
                          color: 'white',
                          whiteSpace: 'nowrap'
                        }}>
                          {(isEditing ? editingShift.is_off : isOffDay(shift)) ? '休み' : '出勤'}
                        </span>
                      </td>
                     {isEditing && (
  <>
    <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
      <select
        value={editingShift.store || shiftSettings.defaultStore}
        onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'store', e.target.value)}
        style={{
          padding: '0.5rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          width: '100px',
          textAlign: 'center',
          fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
          boxSizing: 'border-box'
        }}
      >
        {shiftSettings.stores.map(store => (
          <option key={store} value={store}>{store}</option>
        ))}
      </select>
    </td>
    <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
      <select
        value={editingShift.role || shiftSettings.defaultRole}
        onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'role', e.target.value)}
        style={{
          padding: '0.5rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          width: '100px',
          textAlign: 'center',
          fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
          boxSizing: 'border-box'
        }}
      >
        {shiftSettings.roles.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
    </td>
    <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
        <select
          value={editingShift.startHour || 0}
          onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'startHour', parseInt(e.target.value))}
          disabled={editingShift.is_off}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            opacity: editingShift.is_off ? 0.5 : 1,
            width: '60px',
            backgroundColor: editingShift.is_off ? '#f5f5f5' : 'white',
            fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
            boxSizing: 'border-box'
          }}
        >
          {[...Array(37)].map((_, h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)' }}>:</span>
        <select
          value={editingShift.startMin || 0}
          onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'startMin', parseInt(e.target.value))}
          disabled={editingShift.is_off}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            opacity: editingShift.is_off ? 0.5 : 1,
            width: '60px',
            backgroundColor: editingShift.is_off ? '#f5f5f5' : 'white',
            fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
            boxSizing: 'border-box'
          }}
        >
          {[...Array(60)].map((_, m) => (
            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
          ))}
        </select>
      </div>
    </td>
    <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
        <select
          value={editingShift.endHour || 0}
          onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'endHour', parseInt(e.target.value))}
          disabled={editingShift.is_off}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            opacity: editingShift.is_off ? 0.5 : 1,
            width: '60px',
            backgroundColor: editingShift.is_off ? '#f5f5f5' : 'white',
            fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
            boxSizing: 'border-box'
          }}
        >
          {[...Array(37)].map((_, h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)' }}>:</span>
        <select
          value={editingShift.endMin || 0}
          onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'endMin', parseInt(e.target.value))}
          disabled={editingShift.is_off}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            opacity: editingShift.is_off ? 0.5 : 1,
            width: '60px',
            backgroundColor: editingShift.is_off ? '#f5f5f5' : 'white',
            fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
            boxSizing: 'border-box'
          }}
        >
          {[...Array(60)].map((_, m) => (
            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
          ))}
        </select>
      </div>
    </td>
    <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
      <input
        type="checkbox"
        checked={editingShift.is_off || false}
        onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'is_off', e.target.checked)}
        style={{ 
          transform: 'scale(1.2)',
          cursor: 'pointer'
        }}
      />
    </td>
  </>
)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerShiftView;