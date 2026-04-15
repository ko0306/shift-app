import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const MANAGER_NUMBER = '1234'; // ← 管理番号をここに入力
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxRI2c6dCEa4wS8gCJZkNXXY9_4g1IR8mKJs8EYRLquf-yxFz9wZhB3HmfKJBGy-KCU/exec'; // ← デプロイしたURLに置き換え

// ローカル日付文字列を返すヘルパー（toISOString()はUTC変換でJSTでは1日ずれるため使わない）
const localDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

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
// ヘルプコンテンツ
const getHelpContent = (page) => {
  const contents = {
    shiftCreate: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト作成の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f5f5f5'/%3E%3Crect x='50' y='40' width='300' height='220' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='75' text-anchor='middle' font-size='18' font-weight='bold'%3Eシフト作成%3C/text%3E%3Ctext x='70' y='100' font-size='12'%3E開始日:%3C/text%3E%3Crect x='70' y='110' width='260' height='30' rx='5' fill='%23e3f2fd' stroke='%231976D2'/%3E%3Ctext x='85' y='131' font-size='12' fill='%23666'%3E2025-01-15%3C/text%3E%3Ctext x='70' y='155' font-size='12'%3E終了日:%3C/text%3E%3Crect x='70' y='165' width='260' height='30' rx='5' fill='%23e3f2fd' stroke='%231976D2'/%3E%3Ctext x='85' y='186' font-size='12' fill='%23666'%3E2025-01-31%3C/text%3E%3Crect x='130' y='215' width='140' height='30' rx='6' fill='%231976D2'/%3E%3Ctext x='200' y='236' text-anchor='middle' font-size='14' fill='white'%3E次へ%3C/text%3E%3C/svg%3E" alt="シフト作成" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>⚙️ 設定機能について：</h3>
        <div style={{ backgroundColor: '#fff9e6', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.5rem' }}><strong>シフト作成画面の右上にある「⚙️ 設定」ボタン</strong>から、以下の項目をカスタマイズできます：</p>
          <ul style={{ lineHeight: '1.8', marginLeft: '1rem' }}>
            <li><strong>店舗：</strong>勤務店舗を自由に追加・削除できます（例：A店、B店、本店、支店など）</li>
            <li><strong>役割：</strong>スタッフの役割を自由に追加・削除できます（例：社員、アルバイト、パート、店長など）</li>
            <li><strong>デフォルト設定：</strong>シフト作成時に最初に選択される店舗と役割を指定できます</li>
          </ul>
          <p style={{ marginTop: '0.5rem', color: '#d84315' }}><strong>💾 設定は自動的に保存</strong>され、次回以降も引き継がれます</p>
        </div>

        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>基本的な流れ：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>設定ボタン（⚙️）</strong>をクリックして、店舗と役割をカスタマイズ（初回のみ推奨）</li>
          <li><strong>開始日と終了日を選択</strong>してシフト期間を指定</li>
          <li><strong>次へ</strong>をクリックしてシフト表を表示</li>
          <li><strong>作成</strong>ボタンでシフト編集画面に移動</li>
        </ol>
        
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>💡 ポイント：</strong> シフト作成時に1年半前の古いデータは自動的に削除されます
        </div>
      </div>
    ),
    shiftEdit: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト編集画面の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f5f5f5'/%3E%3Crect x='20' y='20' width='360' height='360' rx='10' fill='white' stroke='%231976D2' stroke-width='2'/%3E%3Ctext x='200' y='50' text-anchor='middle' font-size='16' font-weight='bold'%3E2025-01-15（水）のシフト入力%3C/text%3E%3Crect x='40' y='70' width='320' height='250' rx='8' fill='%23f9f9f9' stroke='%23ddd'/%3E%3Crect x='50' y='80' width='50' height='25' rx='4' fill='%23FFB6C1'/%3E%3Ctext x='75' y='97' text-anchor='middle' font-size='10' fill='black'%3E名前%3C/text%3E%3Crect x='105' y='80' width='40' height='25' rx='4' fill='%23ADD8E6'/%3E%3Ctext x='125' y='97' text-anchor='middle' font-size='10' fill='black'%3E店舗%3C/text%3E%3Crect x='150' y='80' width='40' height='25' rx='4' fill='%23E6E6FA'/%3E%3Ctext x='170' y='97' text-anchor='middle' font-size='10' fill='black'%3E休%3C/text%3E%3Crect x='195' y='80' width='70' height='25' rx='4' fill='%2398FB98'/%3E%3Ctext x='230' y='97' text-anchor='middle' font-size='10' fill='black'%3E開始%3C/text%3E%3Crect x='270' y='80' width='70' height='25' rx='4' fill='%23FFE4B5'/%3E%3Ctext x='305' y='97' text-anchor='middle' font-size='10' fill='black'%3E終了%3C/text%3E%3Crect x='50' y='110' width='50' height='20' rx='3' fill='white' stroke='%23ddd'/%3E%3Ctext x='75' y='124' text-anchor='middle' font-size='9'%3E田中%3C/text%3E%3Crect x='105' y='110' width='40' height='20' rx='3' fill='white' stroke='%23ddd'/%3E%3Ctext x='125' y='124' text-anchor='middle' font-size='9'%3EA%3C/text%3E%3Crect x='195' y='110' width='70' height='20' rx='3' fill='white' stroke='%23ddd'/%3E%3Ctext x='230' y='124' text-anchor='middle' font-size='9'%3E9:00%3C/text%3E%3Crect x='270' y='110' width='70' height='20' rx='3' fill='white' stroke='%23ddd'/%3E%3Ctext x='305' y='124' text-anchor='middle' font-size='9'%3E17:00%3C/text%3E%3Crect x='130' y='340' width='140' height='30' rx='6' fill='%231976D2'/%3E%3Ctext x='200' y='361' text-anchor='middle' font-size='14' fill='white'%3E確定%3C/text%3E%3C/svg%3E" alt="シフト編集" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
        </div>
        
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>各列の説明：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong style={{color: '#FFB6C1'}}>名前</strong>：スタッフの名前</li>
          <li><strong style={{color: '#ADD8E6'}}>店舗</strong>：勤務店舗をクリックして編集（設定で追加した店舗から選択、または直接入力）</li>
          <li><strong style={{color: '#DDA0DD'}}>役割</strong>：スタッフの役割をクリックして選択（設定で追加した役割から選択）</li>
          <li><strong style={{color: '#FFDAB9'}}>備考</strong>：スタッフが入力した備考を表示</li>
          <li><strong style={{color: '#E6E6FA'}}>休</strong>：休みの場合にチェック</li>
          <li><strong style={{color: '#98FB98'}}>開始</strong>：勤務開始時刻を選択</li>
          <li><strong style={{color: '#FFE4B5'}}>終了</strong>：勤務終了時刻を選択</li>
          <li><strong style={{color: '#F0E68C'}}>タイムライン</strong>：横のセルで時間帯を視覚的に確認・クリックで時刻設定</li>
        </ul>
        
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>色の意味：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><span style={{backgroundColor: '#ffff99', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>黄色</span>：スタッフの希望時間</li>
          <li><span style={{backgroundColor: '#90EE90', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>緑色</span>：確定シフト（希望と一致）</li>
          <li><span style={{backgroundColor: '#ff9999', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>赤色</span>：確定シフト（希望外）</li>
          <li><span style={{backgroundColor: '#e0e0e0', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>灰色</span>：休み</li>
          <li><span style={{backgroundColor: '#000000', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>黒色</span>：タイムライン選択中（1回目クリック）</li>
        </ul>
        
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>操作方法：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>日付タイトルをクリックしてドロップダウンから別の日を選択可能</li>
          <li><strong>店舗欄</strong>をクリックして店舗を入力・変更（設定した店舗が候補に）</li>
          <li><strong>役割欄</strong>をクリックして役割を選択（設定した役割から選択）</li>
          <li><strong>タイムライン</strong>をクリックして時刻設定：
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.3rem' }}>
              <li>1回目クリック：開始時刻を設定（セルが黒色に）</li>
              <li>2回目クリック：終了時刻を設定（自動的に開始〜終了が決定）</li>
            </ul>
          </li>
          <li>または開始・終了時刻をドロップダウンから直接選択</li>
          <li>休みの場合は「休」にチェック</li>
          <li><strong>追加</strong>ボタンで当日のシフトにスタッフを追加</li>
          <li><strong>前の日</strong>/<strong>次の日</strong>ボタンで日付を移動（自動保存）</li>
          <li><strong>確定</strong>ボタンで保存して終了</li>
        </ol>
        
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>📱 推奨：</strong> シフト編集は横向き画面での使用を推奨します。縦向きの場合、画面回転を促すメッセージが表示されます。
        </div>
        
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>⚠️ 注意：</strong> 日付を移動する際は自動的に保存されます。店舗・役割が未入力の場合は保存できません。
        </div>

        <div style={{ backgroundColor: '#f3e5f5', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>🎯 時短テクニック：</strong>
          <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            <li>タイムラインを2回クリックで素早く時刻設定</li>
            <li>設定機能で店舗・役割を事前登録しておくと入力が楽</li>
            <li>同じ時間帯のスタッフが多い場合、1人設定してから他のスタッフを追加すると効率的</li>
          </ul>
        </div>
      </div>
    )
  };

  return contents[page] || contents.shiftCreate;
};

// ヘルプボタンコンポーネント
const HelpButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
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
        zIndex: 1500,
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
const StaffAddModal = ({ isOpen, onClose, availableStaff, onAdd }) => {
  const [selectedStaff, setSelectedStaff] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!selectedStaff) {
      alert('スタッフを選択してください');
      return;
    }
    onAdd(selectedStaff);
    setSelectedStaff('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#1976D2', marginBottom: '1rem' }}>スタッフを追加</h3>
        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="">スタッフを選択してください</option>
          {availableStaff.map(staff => (
            <option key={staff.manager_number} value={staff.manager_number}>
              {staff.name}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleAdd}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976D2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            シフト表に追加
          </button>
        </div>
      </div>
    </div>
  );
};

// 募集人数設定モーダル
const RecruitmentSettingsModal = ({ isOpen, onClose }) => {
  const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
  const [weeklySettings, setWeeklySettings] = useState({
    0: { enabled: false, count: 1, notes: '' },
    1: { enabled: false, count: 1, notes: '' },
    2: { enabled: false, count: 1, notes: '' },
    3: { enabled: false, count: 1, notes: '' },
    4: { enabled: false, count: 1, notes: '' },
    5: { enabled: false, count: 1, notes: '' },
    6: { enabled: false, count: 1, notes: '' },
  });
  const [specificDates, setSpecificDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newDateCount, setNewDateCount] = useState(1);
  const [newDateNotes, setNewDateNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) loadSettings();
  }, [isOpen]);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'recruitment_settings')
      .single();
    if (!error && data) {
      try {
        const parsed = JSON.parse(data.value);
        if (parsed.byDayOfWeek) {
          setWeeklySettings(prev => {
            const next = { ...prev };
            Object.entries(parsed.byDayOfWeek).forEach(([dow, s]) => {
              next[parseInt(dow)] = s;
            });
            return next;
          });
        }
        if (parsed.byDate) setSpecificDates(parsed.byDate);
      } catch (e) {}
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const value = JSON.stringify({ byDayOfWeek: weeklySettings, byDate: specificDates });
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'recruitment_settings', value }, { onConflict: 'key' });
    setSaving(false);
    if (error) { alert('保存に失敗しました: ' + error.message); return; }
    alert('募集人数設定を保存しました');
    onClose();
  };

  const addSpecificDate = () => {
    if (!newDate) { alert('日付を選択してください'); return; }
    if (specificDates.some(d => d.date === newDate)) { alert('この日付はすでに登録されています'); return; }
    setSpecificDates(prev => [...prev, { date: newDate, count: newDateCount, notes: newDateNotes }]);
    setNewDate(''); setNewDateCount(1); setNewDateNotes('');
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', overflowY: 'auto'
  };
  const cardStyle = {
    backgroundColor: 'white', borderRadius: '12px', maxWidth: '540px', width: '100%',
    maxHeight: '90vh', overflow: 'auto', padding: '2rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ color: '#1976D2', marginBottom: '1.5rem' }}>募集人数設定</h2>

        <h3 style={{ color: '#1976D2', fontSize: '1rem', marginBottom: '0.75rem' }}>📅 曜日ごとの設定</h3>
        {DAY_NAMES.map((name, dow) => {
          const s = weeklySettings[dow];
          return (
            <div key={dow} style={{
              marginBottom: '0.6rem', border: '1px solid #ddd', borderRadius: '8px',
              padding: '0.7rem', backgroundColor: s.enabled ? '#e8f5e9' : '#f9f9f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: s.enabled ? '0.5rem' : 0 }}>
                <input type="checkbox" id={`dow-${dow}`} checked={s.enabled}
                  onChange={e => setWeeklySettings(prev => ({ ...prev, [dow]: { ...prev[dow], enabled: e.target.checked } }))} />
                <label htmlFor={`dow-${dow}`} style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                  {name}曜日
                </label>
              </div>
              {s.enabled && (
                <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>募集人数:</span>
                    <input type="number" min="1" max="50" value={s.count}
                      onChange={e => setWeeklySettings(prev => ({ ...prev, [dow]: { ...prev[dow], count: Math.max(1, parseInt(e.target.value) || 1) } }))}
                      style={{ width: '60px', padding: '0.3rem', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }} />
                    <span style={{ fontSize: '0.9rem' }}>人</span>
                  </div>
                  <input type="text" placeholder="備考（例：祭りあり・繁忙期など）" value={s.notes}
                    onChange={e => setWeeklySettings(prev => ({ ...prev, [dow]: { ...prev[dow], notes: e.target.value } }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
                </div>
              )}
            </div>
          );
        })}

        <h3 style={{ color: '#1976D2', fontSize: '1rem', margin: '1.5rem 0 0.75rem' }}>📌 特定日の設定</h3>

        {specificDates.map((sd, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem',
            border: '1px solid #ffcc80', borderRadius: '6px', padding: '0.5rem', backgroundColor: '#fff3e0'
          }}>
            <span style={{ fontWeight: 'bold', minWidth: '90px' }}>{sd.date}</span>
            <span style={{ color: '#e65100', fontWeight: 'bold' }}>{sd.count}人</span>
            {sd.notes && <span style={{ fontSize: '0.85rem', color: '#666', flex: 1 }}>📝 {sd.notes}</span>}
            <button onClick={() => setSpecificDates(prev => prev.filter((_, idx) => idx !== i))}
              style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              削除
            </button>
          </div>
        ))}

        <div style={{ border: '1px dashed #90caf9', borderRadius: '8px', padding: '1rem', backgroundColor: '#f3f9ff', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              style={{ flex: 1, minWidth: '130px', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input type="number" min="1" max="50" value={newDateCount}
              onChange={e => setNewDateCount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '60px', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }} />
            <span style={{ fontSize: '0.9rem' }}>人</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" placeholder="備考（例：近くで祭りがあります）" value={newDateNotes}
              onChange={e => setNewDateNotes(e.target.value)}
              style={{ flex: 1, padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
            <button onClick={addSpecificDate}
              style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ＋ 追加
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '0.75rem', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            キャンセル
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: '0.75rem', backgroundColor: '#1976D2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '保存中...' : '💾 保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

// StaffAddModalの後に追加

// 設定モーダルコンポーネント
const SettingsModal = ({ isOpen, onClose, settings, onSave }) => {
  const [stores, setStores] = useState(settings.stores || ['A', 'B']);
  const [roles, setRoles] = useState(settings.roles || ['社員', 'アルバイト']);
  const [defaultStore, setDefaultStore] = useState(settings.defaultStore || 'A');
  const [defaultRole, setDefaultRole] = useState(settings.defaultRole || '社員');
  const [newStore, setNewStore] = useState('');
  const [newRole, setNewRole] = useState('');
  

  if (!isOpen) return null;

  const handleAddStore = () => {
    if (newStore.trim() && !stores.includes(newStore.trim())) {
      setStores([...stores, newStore.trim()]);
      setNewStore('');
    }
  };

  const handleRemoveStore = (store) => {
    if (stores.length > 1) {
      const updated = stores.filter(s => s !== store);
      setStores(updated);
      if (defaultStore === store) {
        setDefaultStore(updated[0]);
      }
    } else {
      alert('最低1つの店舗が必要です');
    }
  };

  const handleAddRole = () => {
    if (newRole.trim() && !roles.includes(newRole.trim())) {
      setRoles([...roles, newRole.trim()]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (role) => {
    if (roles.length > 1) {
      const updated = roles.filter(r => r !== role);
      setRoles(updated);
      if (defaultRole === role) {
        setDefaultRole(updated[0]);
      }
    } else {
      alert('最低1つの役割が必要です');
    }
  };

  const handleSaveSettings = () => {
    onSave({
      stores,
      roles,
      defaultStore,
      defaultRole
    });
  };

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
      padding: '1rem',
      overflowY: 'auto'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: '#1976D2', marginBottom: '1.5rem' }}>シフト設定</h2>
        
        {/* 店舗設定 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#1976D2', fontSize: '1.1rem', marginBottom: '0.5rem' }}>店舗</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
              placeholder="新しい店舗名"
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStore()}
            />
            <button
              onClick={handleAddStore}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1976D2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              追加
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stores.map(store => (
              <div key={store} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px'
              }}>
                <span>{store}</span>
                <button
                  onClick={() => handleRemoveStore(store)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 役割設定 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#1976D2', fontSize: '1.1rem', marginBottom: '0.5rem' }}>役割</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="新しい役割名"
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
            />
            <button
              onClick={handleAddRole}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1976D2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              追加
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {roles.map(role => (
              <div key={role} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#f3e5f5',
                borderRadius: '4px'
              }}>
                <span>{role}</span>
                <button
                  onClick={() => handleRemoveRole(role)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 優先設定 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#1976D2', fontSize: '1.1rem', marginBottom: '0.5rem' }}>優先する項目</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>デフォルト店舗:</label>
            <select
              value={defaultStore}
              onChange={(e) => setDefaultStore(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              {stores.map(store => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>デフォルト役割:</label>
            <select
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSaveSettings}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976D2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
const CandidateModal = ({ isOpen, onClose, candidates, loading, error, onSelectAndCreate, drafts = [], onSelectDraft }) => {
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [totalUsers, setTotalUsers] = useState(0);
  const [subLoading, setSubLoading] = useState(false);
  const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

  const getDateRange = (start, end) => {
    const dates = [];
    const d = new Date(start + 'T00:00:00');
    while (d <= new Date(end + 'T00:00:00')) {
      dates.push(localDateStr(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };

  const handleClickCandidate = async (c) => {
    if (c.isDone) return;
    setSelected(c);
    setSubLoading(true);
    try {
      const [shiftsRes, usersRes] = await Promise.all([
        supabase.from('shifts').select('date, manager_number').gte('date', c.start).lte('date', c.end),
        supabase.from('users').select('manager_number').eq('is_deleted', false)
      ]);
      const countMap = {};
      shiftsRes.data?.forEach(s => {
        if (!countMap[s.date]) countMap[s.date] = new Set();
        countMap[s.date].add(s.manager_number);
      });
      const countByDate = {};
      Object.entries(countMap).forEach(([date, set]) => { countByDate[date] = set.size; });
      setSubmissions(countByDate);
      setTotalUsers(usersRes.data?.length || 0);
    } catch (e) { console.error(e); }
    finally { setSubLoading(false); }
  };

  const handleClose = () => { setSelected(null); onClose(); };

  if (!isOpen) return null;

  const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
  const cardStyle = { backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          {selected ? (
            <button onClick={() => setSelected(null)}
              style={{ background: '#607D8B', color: 'white', border: 'none', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
              ← 戻る
            </button>
          ) : (
            <h3 style={{ margin: 0, color: '#1976D2' }}>📋 シフト期間の候補</h3>
          )}
          <button onClick={handleClose}
            style={{ background: '#FF5722', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>×</button>
        </div>

        {/* 候補リスト */}
        {!selected && (
          <>
            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>⏳ 読み込み中...</div>}
            {error && <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '8px', color: '#c62828' }}>⚠️ {error}</div>}
            {drafts.length > 0 && (
              <>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#E65100', marginBottom: '0.5rem' }}>🔄 途中まで作成</div>
                {drafts.map((draft, i) => (
                  <div key={i} onClick={() => onSelectDraft && onSelectDraft(draft)}
                    style={{ border: '2px solid #FFE0B2', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', cursor: 'pointer', backgroundColor: '#FFF8E1' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFE0B2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFF8E1'}
                  >
                    <div style={{ fontWeight: 'bold', color: '#E65100' }}>{draft.startDate} 〜 {draft.endDate}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem' }}>
                      📝 {draft.currentIndex + 1}日目まで作成済み → タップして続きから
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #eee', marginBottom: '0.75rem' }} />
              </>
            )}
            {!loading && !error && (() => {
              const pending = candidates.filter(c => !c.isDone);
              const history = candidates.filter(c => c.isDone);
              return (
                <>
                  {pending.length === 0 && history.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>候補が見つかりませんでした</div>
                  )}
                  {pending.map((c, i) => (
                    <div key={i} onClick={() => handleClickCandidate(c)}
                      style={{ border: `2px solid ${c.isExpired ? '#ffcdd2' : '#bbdefb'}`, borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', cursor: 'pointer', backgroundColor: c.isExpired ? '#fff8f8' : '#f8fbff' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = c.isExpired ? '#ffebee' : '#e3f2fd'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = c.isExpired ? '#fff8f8' : '#f8fbff'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#1565C0' }}>{c.start} 〜 {c.end}</span>
                        {c.isExpired && <span style={{ backgroundColor: '#f44336', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>期限切れ</span>}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: c.isExpired ? '#c62828' : '#555' }}>📅 期限：{c.deadline}</div>
                      <div style={{ fontSize: '0.8rem', color: '#1976D2', marginTop: '0.3rem', fontWeight: 'bold' }}>→ タップして提出状況を確認</div>
                    </div>
                  ))}
                  {history.length > 0 && (
                    <>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#888', margin: '1rem 0 0.5rem', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>📁 最近の履歴</div>
                      {history.map((c, i) => (
                        <div key={i} style={{ border: '2px solid #e0e0e0', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', backgroundColor: '#fafafa', opacity: 0.75 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#888' }}>{c.start} 〜 {c.end}</span>
                            <span style={{ backgroundColor: '#4CAF50', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>済</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#999' }}>📅 期限：{c.deadline}</div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* 提出状況詳細 */}
        {selected && (
          <div>
            <div style={{ backgroundColor: '#e3f2fd', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 'bold', color: '#1565C0', fontSize: '1rem' }}>{selected.start} 〜 {selected.end}</div>
              <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.2rem' }}>📅 期限：{selected.deadline}</div>
            </div>

            {subLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>⏳ 提出状況を読み込み中...</div>
            ) : (
              <>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555', marginBottom: '0.5rem' }}>
                  📊 シフト提出状況（全{totalUsers}人）
                </div>
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e3f2fd' }}>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#1565C0' }}>日付</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#1565C0' }}>提出</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 'bold', color: '#1565C0' }}>進捗</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDateRange(selected.start, selected.end).map((date, idx) => {
                        const count = submissions[date] || 0;
                        const pct = totalUsers > 0 ? Math.min(100, Math.round(count / totalUsers * 100)) : 0;
                        const dow = new Date(date + 'T00:00:00').getDay();
                        const isWeekend = dow === 0 || dow === 6;
                        return (
                          <tr key={date} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa', borderTop: '1px solid #eee' }}>
                            <td style={{ padding: '0.45rem 0.75rem', color: isWeekend ? (dow === 0 ? '#d32f2f' : '#1565c0') : '#333' }}>
                              {date}（{DAY_NAMES[dow]}）
                            </td>
                            <td style={{ padding: '0.45rem 0.75rem', textAlign: 'center', fontWeight: 'bold', color: count === 0 ? '#bbb' : count >= totalUsers ? '#2e7d32' : '#e65100' }}>
                              {count}/{totalUsers}
                            </td>
                            <td style={{ padding: '0.45rem 0.75rem' }}>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                                <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', backgroundColor: count === 0 ? '#e0e0e0' : count < totalUsers * 0.5 ? '#ff9800' : count >= totalUsers ? '#4CAF50' : '#2196F3', transition: 'width 0.4s' }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => onSelectAndCreate(selected)}
                  style={{ width: '100%', padding: '0.85rem', backgroundColor: '#1976D2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(25,118,210,0.4)' }}>
                  ✅ この期間でシフト作成
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


function ManagerCreate({ onBack }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftData, setShiftData] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [dates, setDates] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editRows, setEditRows] = useState([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [showHelp, setShowHelp] = useState(false);
  const [currentHelpPage, setCurrentHelpPage] = useState('shiftCreate');
  const [showStaffAddModal, setShowStaffAddModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

const [selectingTimeFor, setSelectingTimeFor] = useState(null);
const [showCandidateModal, setShowCandidateModal] = useState(false);
const [candidates, setCandidates] = useState([]);
const [candidateLoading, setCandidateLoading] = useState(false);
const [candidateError, setCandidateError] = useState('');

const [showSettingsModal, setShowSettingsModal] = useState(false);
const [showSettingsTypeModal, setShowSettingsTypeModal] = useState(false);
const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);

// ── 新規モーダル用 state ──
const [showSaveConfirm, setShowSaveConfirm] = useState(false);
const [pendingNavTarget, setPendingNavTarget] = useState(null);
const [showNotifyModal, setShowNotifyModal] = useState(false);
const [notifyComment, setNotifyComment] = useState('');
const [showDeleteDateConfirm, setShowDeleteDateConfirm] = useState(false);
const [deleteDateIdx, setDeleteDateIdx] = useState(null);
const [showOverwriteWarn, setShowOverwriteWarn] = useState(false);
const [isSavingShift, setIsSavingShift] = useState(false);
const [overwriteDates, setOverwriteDates] = useState([]);
const [pendingFetchArgs, setPendingFetchArgs] = useState(null);
const [localDraft, setLocalDraft] = useState(null);
const [showBackConfirm, setShowBackConfirm] = useState(false);

const [shiftSettings, setShiftSettings] = useState(() => {
  const saved = localStorage.getItem('shiftSettings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return {
    stores: ['A', 'B'],
    roles: ['社員', 'アルバイト'],
    defaultStore: 'A',
    defaultRole: '社員'
  };
});
// ── ドラフト管理 ──
const DRAFT_KEY = 'shiftCreationDraft';
const saveDraft = (idx) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      startDate, endDate,
      currentIndex: idx !== undefined ? idx : currentDateIndex,
      savedAt: Date.now()
    }));
  } catch {}
};
const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };
const loadDraft = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; } };

useEffect(() => {
  if (isEditing && startDate && endDate) saveDraft(currentDateIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isEditing, currentDateIndex]);

// アプリ終了時にドラフト保存
useEffect(() => {
  if (!isEditing) return;
  const handler = () => { if (startDate && endDate) saveDraft(currentDateIndex); };
  window.addEventListener('pagehide', handler);
  window.addEventListener('visibilitychange', handler);
  return () => {
    window.removeEventListener('pagehide', handler);
    window.removeEventListener('visibilitychange', handler);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isEditing, currentDateIndex, startDate, endDate]);

const handleBackRequest = () => {
  if (startDate && endDate) saveDraft(currentDateIndex);
  setShowBackConfirm(true);
};
const confirmGoBack = () => {
  setShowBackConfirm(false);
  if (onBack) onBack();
};
const cancelGoBack = () => {
  setShowBackConfirm(false);
};

const fetchCandidates = async () => {
  setCandidateLoading(true);
  setCandidateError('');
  setCandidates([]);
  try {
    const { data: periods, error } = await supabase
      .from('shift_periods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!periods || periods.length === 0) {
      setCandidateError('候補がありません。「シフト期限設定」で期間を設定・通知してください。');
      return;
    }

    const todayStr = localDateStr(new Date());

    const validPeriods = periods.filter(p => p.period_start && p.period_end && p.period_start <= p.period_end);
    const result = await Promise.all(validPeriods.map(async (p) => {
      // final_shifts にこの期間のデータがあれば「作成済み」
      const { data: finals } = await supabase
        .from('final_shifts')
        .select('id')
        .gte('date', p.period_start)
        .lte('date', p.period_end)
        .limit(1);
      const hasFinal = finals && finals.length > 0;
      return {
        start: p.period_start,
        end: p.period_end,
        deadline: p.deadline || '未設定',
        isDone: hasFinal || p.is_done,
        isExpired: p.deadline && p.deadline < todayStr && !hasFinal,
      };
    }));

    setCandidates(result);
  } catch (e) {
    setCandidateError(e.message || '取得中にエラーが発生しました');
  } finally {
    setCandidateLoading(false);
  }
};

const handleOpenCandidateModal = () => {
  setLocalDraft(loadDraft());
  setShowCandidateModal(true);
  if (candidates.length === 0 && !candidateLoading) fetchCandidates();
};
const handleSelectAndCreate = async (candidate) => {
  setStartDate(candidate.start);
  setEndDate(candidate.end);
  setShowCandidateModal(false);
  await fetchShiftData(candidate.start, candidate.end);
};


// マウント時にSupabaseから設定を読み込む＋候補をプリフェッチ
useEffect(() => {
  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shift_settings')
      .single();
    if (!error && data) {
      try {
        const parsed = JSON.parse(data.value);
        setShiftSettings(parsed);
        localStorage.setItem('shiftSettings', JSON.stringify(parsed));
      } catch (e) {}
    }
  };
  fetchSettings();
  fetchCandidates(); // 候補を事前に取得しておく（ボタンを押した時に即表示）
}, []);
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      console.log('Orientation check:', { width: window.innerWidth, height: window.innerHeight, portrait });
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const getDayOfWeek = (dateStr) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const formatDateWithDay = (dateStr) => {
    return `${dateStr} (${getDayOfWeek(dateStr)})`;
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: '', min: '' };
    const parts = timeStr.split(':');
    return { 
      hour: parts[0] ? parseInt(parts[0], 10).toString() : '', 
      min: parts[1] ? parseInt(parts[1], 10).toString() : '' 
    };
  };

  const fetchShiftData = async (overrideStart, overrideEnd, resumeIndex) => {
    const sd = overrideStart || startDate;
    const ed = overrideEnd || endDate;
    if (!sd || !ed || sd > ed) {
      alert('開始日と終了日を正しく入力してください');
      return;
    }

    try {
      const oneAndHalfYearsAgo = new Date(sd + 'T00:00:00');
      oneAndHalfYearsAgo.setMonth(oneAndHalfYearsAgo.getMonth() - 18);
      const oneAndHalfYearsAgoStr = localDateStr(oneAndHalfYearsAgo);

      const { error: deleteShiftsError } = await supabase
        .from('shifts')
        .delete()
        .lt('date', oneAndHalfYearsAgoStr);

      if (deleteShiftsError) {
        console.error('古いshiftsデータ削除エラー:', deleteShiftsError);
      }

      const { error: deleteFinalShiftsError } = await supabase
        .from('final_shifts')
        .delete()
        .lt('date', oneAndHalfYearsAgoStr);

      if (deleteFinalShiftsError) {
        console.error('古いfinal_shiftsデータ削除エラー:', deleteFinalShiftsError);
      }

      const { data: shifts, error: shiftError } = await supabase
        .from('shifts')
        .select('*')
        .gte('date', sd)
        .lte('date', ed)
        .order('created_at', { ascending: false });

      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*');

      if (shiftError) {
        alert('シフトデータ取得エラー: ' + (shiftError.message || JSON.stringify(shiftError)));
        return;
      }
      if (userError) {
        alert('スタッフデータ取得エラー: ' + (userError.message || JSON.stringify(userError)));
        return;
      }

      const safeUsers = users || [];
      const safeShifts = shifts || [];

      setAllUsers(safeUsers);

      const userManagerNumbers = new Set(safeUsers.map(user => String(user.manager_number)));
      const userMapTemp = {};
      safeUsers.forEach(user => {
        userMapTemp[String(user.manager_number)] = user.name;
      });

      const latestShiftsMap = {};
      safeShifts.forEach(shift => {
        const key = `${shift.date}_${shift.manager_number}`;
        if (!latestShiftsMap[key]) {
          latestShiftsMap[key] = shift;
        }
      });

      const filteredShifts = Object.values(latestShiftsMap).filter(shift =>
        userManagerNumbers.has(String(shift.manager_number))
      );

      const allDates = [];
      const d = new Date(sd + 'T00:00:00');
      while (d <= new Date(ed + 'T00:00:00')) {
        allDates.push(localDateStr(d));
        d.setDate(d.getDate() + 1);
      }

      setDates(allDates);
      setUserMap(userMapTemp);
      setShiftData(filteredShifts);
      setShowTable(true);
      if (resumeIndex !== undefined) {
        const safeIdx = Math.min(resumeIndex, allDates.length - 1);
        setTimeout(() => handleEditStart(safeIdx, allDates), 0);
      }

    } catch (error) {
      console.error('データ処理エラー:', error);
      alert('データ処理中にエラーが発生しました\n詳細: ' + (error?.message || String(error)));
    }
  };

  // 上書き確認付き fetchShiftData
  const checkOverwriteAndFetch = async (overrideStart, overrideEnd, resumeIndex) => {
    const sd = overrideStart || startDate;
    const ed = overrideEnd || endDate;
    if (!sd || !ed || sd > ed) { alert('開始日と終了日を正しく入力してください'); return; }
    const { data: existing } = await supabase.from('final_shifts').select('date').gte('date', sd).lte('date', ed);
    const existingDts = [...new Set((existing || []).map(r => r.date))].sort();
    if (existingDts.length > 0) {
      setOverwriteDates(existingDts);
      setPendingFetchArgs({ overrideStart: sd, overrideEnd: ed, resumeIndex });
      setShowOverwriteWarn(true);
      return;
    }
    await fetchShiftData(sd, ed, resumeIndex);
  };

  // ドラフトから続きを開始
  const handleSelectDraft = async (draft) => {
    setShowCandidateModal(false);
    await fetchShiftData(draft.startDate, draft.endDate, draft.currentIndex);
  };

  const groupedByUser = {};
shiftData.forEach(shift => {
  const name = userMap[String(shift.manager_number)] || '(不明)';
  if (!groupedByUser[name]) groupedByUser[name] = {};
  const isFreeDay = (shift.remarks || '').includes('終日フリー');
  const isUnavailable = (shift.remarks || '').includes('終日不可');
  if (isFreeDay) {
    groupedByUser[name][shift.date] = '00:00 ~ 35:45';
  } else if (isUnavailable) {
    groupedByUser[name][shift.date] = '終日不可';
  } else {
    groupedByUser[name][shift.date] = `${shift.start_time || ''} ~ ${shift.end_time || ''}`;
  }
});

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

const handleEditStart = async (dateIndex = 0, datesOverride) => {
  const datesArr = datesOverride || dates;
  const date = datesArr[dateIndex];
  setSelectedDate(date);
  setCurrentDateIndex(dateIndex);

   const { data: finalData } = await supabase
    .from('final_shifts')
    .select('*')
    .eq('date', date);

  const finalMap = {};
  (finalData || []).forEach(f => {
    finalMap[String(f.manager_number)] = f;
  });
  const rows = shiftData
  .filter(shift => shift.date === date)
  .map(shift => {
    const isFreeDay = (shift.remarks || '').includes('終日フリー');
    const isUnavailable = (shift.remarks || '').includes('終日不可');
    const startTime = isFreeDay ? { hour: '0', min: '0' } : parseTime(shift.start_time);
    const endTime = isFreeDay ? { hour: '35', min: '45' } : parseTime(shift.end_time);
    return {
        id: shift.id,
        name: userMap[shift.manager_number],
        manager_number: shift.manager_number,
        startHour: isFreeDay ? '0' : '0',
        startMin: isFreeDay ? '0' : '0',
        endHour: isFreeDay ? '35' : '0',
        endMin: isFreeDay ? '45' : '0',
        originalStart: isFreeDay ? '00:00' : shift.start_time,
        originalEnd: isFreeDay ? '35:45' : shift.end_time,
        originalStartHour: startTime.hour,
        originalStartMin: startTime.min,
        originalEndHour: endTime.hour,
        originalEndMin: endTime.min,
        isOff: isUnavailable,
      store: shift.store || shiftSettings.defaultStore,
role: shift.role || shiftSettings.defaultRole,
        isEditingStore: false,
        isEditingRole: false,
        remarks: shift.remarks || ''
      };
    });
  setEditRows(rows);
  setIsEditing(true);
};

  const handleDateSelect = (dateIndex) => {
    if (dateIndex === currentDateIndex) { setShowDateDropdown(false); return; }
    setShowDateDropdown(false);
    setPendingNavTarget({ index: dateIndex });
    setShowSaveConfirm(true);
  };

  const handleDeleteDate = (idx) => {
    setDeleteDateIdx(idx);
    setShowDeleteDateConfirm(true);
    setShowDateDropdown(false);
  };

  const confirmDeleteDate = () => {
    const newDates = dates.slice(0, deleteDateIdx);
    setDates(newDates);
    if (newDates.length > 0) setEndDate(newDates[newDates.length - 1]);
    const newIdx = Math.min(currentDateIndex, newDates.length - 1);
    setCurrentDateIndex(newIdx);
    if (newDates.length > 0) handleEditStart(newIdx, newDates);
    setShowDeleteDateConfirm(false);
    setDeleteDateIdx(null);
  };

  const handleCheckboxChange = (index, checked) => {
    const updated = [...editRows];
    updated[index].isOff = checked;
    if (checked) {
      updated[index].startHour = '0';
      updated[index].startMin = '0';
      updated[index].endHour = '0';
      updated[index].endMin = '0';
    }
    setEditRows(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...editRows];
    updated[index][field] = value;
    setEditRows(updated);
  };

  const toggleStoreEdit = (index) => {
    const updated = [...editRows];
    updated[index].isEditingStore = !updated[index].isEditingStore;
    setEditRows(updated);
  };


const toggleRoleEdit = (index) => {
  const updated = [...editRows];
  updated[index].isEditingRole = !updated[index].isEditingRole;
  setEditRows(updated);
};

const handleRoleSelect = (index, value) => {
  const updated = [...editRows];
  updated[index].role = value;
  updated[index].isEditingRole = false;
  setEditRows(updated);
};

 // eslint-disable-next-line no-unused-vars
 const handleStoreInputChange = (index, value) => {
  const updated = [...editRows];
  updated[index].store = value;
  setEditRows(updated);
};

const handleStoreSelect = (index, value) => {
  const updated = [...editRows];
  updated[index].store = value;
  updated[index].isEditingStore = false;
  setEditRows(updated);
};

 const handleSave = async () => {
  setIsSavingShift(true);
  try {
    for (const row of editRows) {
      const storeValue = row.store;
      const roleValue = row.role;

      if (!storeValue || storeValue.trim() === '') {
        setIsSavingShift(false);
        alert(`${row.name}の店舗を選択または入力してください`);
        return false;
      }

      if (!roleValue || roleValue.trim() === '') {
        setIsSavingShift(false);
        alert(`${row.name}の役割を選択してください`);
        return false;
      }

      const startTime = row.isOff
        ? null
        : `${String(row.startHour).padStart(2, '0')}:${String(row.startMin).padStart(2, '0')}:00`;
      const endTime = row.isOff
        ? null
        : `${String(row.endHour).padStart(2, '0')}:${String(row.endMin).padStart(2, '0')}:00`;

     const updateData = {
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        is_off: row.isOff,
        store: storeValue,
        role: roleValue,
        is_boshu: row.isBoshu ? true : false
      };

      if (row.isBoshu) {
        const { error } = await supabase
          .from('final_shifts')
          .insert(updateData);
        if (error) {
          console.error('募集の保存エラー:', error);
          alert(`募集の保存に失敗しました: ${error.message}`);
          return false;
        }
      } else {
        updateData.manager_number = row.manager_number;
        const { error } = await supabase
          .from('final_shifts')
          .upsert(updateData, { onConflict: 'date,manager_number' });
        if (error) {
          console.error(`${row.name} の保存エラー:`, error);
          alert(`${row.name} の保存に失敗しました: ${error.message}`);
          return false;
        }
      }
    }

    setIsSavingShift(false);
    return true;

  } catch (error) {
    setIsSavingShift(false);
    console.error('予期しないエラー:', error);
    alert(`エラーが発生しました: ${error.message}`);
    return false;
  }
};

  const executePendingNav = async (shouldSave) => {
    const target = pendingNavTarget;
    setShowSaveConfirm(false);
    setPendingNavTarget(null);
    if (!target) return;
    if (shouldSave) {
      const ok = await handleSave();
      if (!ok) return;
    }
    saveDraft(target.index);
    await handleEditStart(target.index);
  };

  const handlePreviousDay = () => {
    if (currentDateIndex > 0) {
      setPendingNavTarget({ index: currentDateIndex - 1 });
      setShowSaveConfirm(true);
    }
  };

  const handleNextDay = () => {
    if (currentDateIndex < dates.length - 1) {
      setPendingNavTarget({ index: currentDateIndex + 1 });
      setShowSaveConfirm(true);
    }
  };

  const handleSaveAndExit = async () => {
    const saveSuccess = await handleSave();
    if (saveSuccess) {
      setNotifyComment('');
      setShowNotifyModal(true);
    }
  };

  const finishShiftCreation = async (sendNotif) => {
    setShowNotifyModal(false);
    try {
      await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ managerNumber: MANAGER_NUMBER, start: startDate, end: endDate }) });
    } catch {}
    if (sendNotif) {
      try {
        const notifTitle = 'シフトが確定しました';
        const notifBody = `${startDate}〜${endDate} のシフトが確定しました。${notifyComment ? notifyComment + ' ' : ''}シフト確認からご確認ください。`;
        await supabase.functions.invoke('send-push-notification', { body: { title: notifTitle, body: notifBody } });
        await supabase.from('notifications').insert([{ title: notifTitle, body: notifBody }]);
      } catch (e) { console.error('通知エラー:', e); }
    }
    clearDraft();
    alert(sendNotif ? '保存・通知しました' : '保存しました');
    setIsEditing(false);
    fetchShiftData();
  };




  const getAvailableStaff = () => {
    const currentStaffIds = new Set(editRows.map(row => row.manager_number));
    return allUsers.filter(user => !currentStaffIds.has(user.manager_number));
  };


  const handleAddStaff = (managerNumber) => {
  console.log('handleAddStaff called with:', managerNumber);
  console.log('allUsers:', allUsers);
  
  const staff = allUsers.find(u => String(u.manager_number) === String(managerNumber));
  console.log('found staff:', staff);
  
  if (!staff) {
    alert('スタッフが見つかりませんでした');
    return;
  }

  const newRow = {
    id: null,
    name: staff.name,
    manager_number: staff.manager_number,
    startHour: '9',
    startMin: '0',
    endHour: '17',
    endMin: '0',
    originalStart: null,
    originalEnd: null,
    originalStartHour: '',
    originalStartMin: '',
    originalEndHour: '',
    originalEndMin: '',
    isOff: false,
    store: shiftSettings.defaultStore,   // ← 変更
    role: shiftSettings.defaultRole,      // ← 追加
    isEditingStore: false,
    isEditingRole: false,                 // ← 追加
    remarks: ''
  };

  console.log('Adding new row:', newRow);
  setEditRows([...editRows, newRow]);
  setShowStaffAddModal(false);
  alert(`${staff.name}を追加しました`);
};


const handleAddBoshu = () => {
  const boshuRow = {
    id: null,
    name: '募集',
    manager_number: `boshu_${Date.now()}`, // ユニークなキー
    startHour: '9',
    startMin: '0',
    endHour: '17',
    endMin: '0',
    originalStart: null,
    originalEnd: null,
    originalStartHour: '',
    originalStartMin: '',
    originalEndHour: '',
    originalEndMin: '',
    isOff: false,
    store: shiftSettings.defaultStore,
    role: shiftSettings.defaultRole,
    isEditingStore: false,
    isEditingRole: false,
    remarks: '',
    isBoshu: true  // 募集フラグ
  };
  setEditRows([...editRows, boshuRow]);
};

// handleAddStaff関数の後に追加

const handleTimeSlotClick = (rowIndex, slotTime) => {
  if (editRows[rowIndex].isOff) return; // 休みの場合はクリック無効

  // slotTimeを時と分に分解
  const [slotHour, slotMin] = slotTime.split(':').map(num => parseInt(num, 10));

  if (!selectingTimeFor || selectingTimeFor.rowIndex !== rowIndex) {
    // 1回目のクリック（開始時刻を選択）
    setSelectingTimeFor({
      rowIndex: rowIndex,
      firstSlot: slotTime
    });

    // 開始時刻を即座に反映
    const updated = [...editRows];
    updated[rowIndex].startHour = slotHour.toString();
    updated[rowIndex].startMin = slotMin.toString();
    setEditRows(updated);

  } else if (selectingTimeFor.rowIndex === rowIndex) {
    // 2回目のクリック（終了時刻を選択）
    const [firstHour, firstMin] = selectingTimeFor.firstSlot.split(':').map(num => parseInt(num, 10));
    
    // 開始と終了の順序を確認
    let startHour, startMin, endHour, endMin;
    
    if (firstHour < slotHour || (firstHour === slotHour && firstMin < slotMin)) {
      // 1回目が開始、2回目が終了
      startHour = firstHour;
      startMin = firstMin;
      endHour = slotHour;
      endMin = slotMin;
    } else {
      // 2回目が開始、1回目が終了
      startHour = slotHour;
      startMin = slotMin;
      endHour = firstHour;
      endMin = firstMin;
    }

    // 終了時刻を反映
    const updated = [...editRows];
    updated[rowIndex].startHour = startHour.toString();
    updated[rowIndex].startMin = startMin.toString();
    updated[rowIndex].endHour = endHour.toString();
    updated[rowIndex].endMin = endMin.toString();
    setEditRows(updated);

    // 選択状態をリセット
    setSelectingTimeFor(null);
  }
};
  


  const timeSlots = generateTimeSlots();

  // if (!showTable) のreturn部分を修正

if (!showTable) {
  return (
    <div className="login-wrapper" style={{ padding: '1rem', boxSizing: 'border-box' }}>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
      <CandidateModal isOpen={showCandidateModal} onClose={() => setShowCandidateModal(false)} candidates={candidates} loading={candidateLoading} error={candidateError} onSelectAndCreate={handleSelectAndCreate} drafts={localDraft ? [localDraft] : []} onSelectDraft={handleSelectDraft} />

<SettingsModal
  isOpen={showSettingsModal}
  onClose={() => setShowSettingsModal(false)}
  settings={shiftSettings}
  onSave={async (newSettings) => {
    setShiftSettings(newSettings);
    localStorage.setItem('shiftSettings', JSON.stringify(newSettings));
    await supabase
      .from('settings')
      .upsert({ key: 'shift_settings', value: JSON.stringify(newSettings) }, { onConflict: 'key' });
    setShowSettingsModal(false);
    alert('設定を保存しました');
  }}
/>

<RecruitmentSettingsModal
  isOpen={showRecruitmentModal}
  onClose={() => setShowRecruitmentModal(false)}
/>

{showSettingsTypeModal && (
  <div style={{
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
  }} onClick={() => setShowSettingsTypeModal(false)}>
    <div style={{
      backgroundColor: 'white', borderRadius: '12px', maxWidth: '360px', width: '100%',
      padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    }} onClick={e => e.stopPropagation()}>
      <h2 style={{ color: '#1976D2', marginBottom: '1.5rem', textAlign: 'center' }}>⚙️ 設定の種類</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={() => { setShowSettingsTypeModal(false); setShowSettingsModal(true); }}
          style={{
            padding: '1rem', backgroundColor: '#1976D2', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 'bold', textAlign: 'left'
          }}
        >
          🏪 役割・店舗の設定
          <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.3rem', opacity: 0.9 }}>
            店舗名・役割・デフォルト設定
          </div>
        </button>
        <button
          onClick={() => { setShowSettingsTypeModal(false); setShowRecruitmentModal(true); }}
          style={{
            padding: '1rem', backgroundColor: '#4CAF50', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 'bold', textAlign: 'left'
          }}
        >
          👥 募集人数の設定
          <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.3rem', opacity: 0.9 }}>
            曜日・特定日ごとの必要人数と備考
          </div>
        </button>
        <button
          onClick={() => setShowSettingsTypeModal(false)}
          style={{
            padding: '0.75rem', backgroundColor: '#e0e0e0', color: '#333',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          キャンセル
        </button>
      </div>
    </div>
  </div>
)}

      {showOverwriteWarn && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '360px', width: '100%' }}>
            <h3 style={{ margin: '0 0 0.75rem', color: '#E65100' }}>⚠️ 上書き確認</h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>以下の日付はすでにシフトが作成されています。新たに作成するとデータが上書きされます。よろしいですか？</p>
            <div style={{ backgroundColor: '#FFF3E0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
              {overwriteDates.map(d => <div key={d} style={{ fontSize: '0.85rem', color: '#E65100' }}>・{d}</div>)}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={async () => { setShowOverwriteWarn(false); if (pendingFetchArgs) await fetchShiftData(pendingFetchArgs.overrideStart, pendingFetchArgs.overrideEnd, pendingFetchArgs.resumeIndex); setPendingFetchArgs(null); }}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#E65100', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>はい（上書き）</button>
              <button onClick={() => { setShowOverwriteWarn(false); setPendingFetchArgs(null); }}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#eee', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>いいえ</button>
            </div>
          </div>
        </div>
      )}

      <HelpButton onClick={() => {
        setCurrentHelpPage('shiftCreate');
        setShowHelp(true);
      }} />
      <div className="login-card" style={{ maxWidth: '500px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* ↓↓↓ タイトル部分を修正 ↓↓↓ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>シフト作成</h2>
          <button
  onClick={() => setShowSettingsTypeModal(true)}
  style={{
    padding: '0.6rem 0.5rem',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.0rem',
    whiteSpace: 'nowrap',
    minWidth: 'auto',
    width: 'auto'
  }}
>
  ⚙️ 設定
</button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          シフト作成時に1年半前の古いデータは自動削除されます
        </p>
        <label>開始日:</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
        <label>終了日:</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => checkOverwriteAndFetch()}>次へ</button>
          <button onClick={handleOpenCandidateModal} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold', whiteSpace: 'nowrap', width: 'auto' }}>📋 候補</button>
        </div>
      </div>
    </div>
  );
}

  if (isEditing) {
    return (
      <div className="fullscreen-table" style={{ padding: '0.5rem', boxSizing: 'border-box', overflow: 'hidden' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        {isSavingShift && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', border: '5px solid rgba(255,255,255,0.3)', borderTop: '5px solid #43A047', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>保存中...</div>
          </div>
        )}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
         <StaffAddModal 
          isOpen={showStaffAddModal} 
          onClose={() => setShowStaffAddModal(false)}
          availableStaff={getAvailableStaff()}
          onAdd={handleAddStaff}
        />
        <HelpButton onClick={() => {
          setCurrentHelpPage('shiftEdit');
          setShowHelp(true);
        }} />
        {/* 作成中の戻るボタン（確認付き） */}
        <button
          onClick={handleBackRequest}
          style={{
            position: 'fixed',
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
            zIndex: 10000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          ← 戻る
        </button>
        {isPortrait && (
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
        {/* 保存確認モーダル */}
        {showSaveConfirm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>💾</div>
              <h3 style={{ margin: '0 0 1rem', color: '#1565C0' }}>この日のシフトを保存しますか？</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => executePendingNav(true)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>はい</button>
                <button onClick={() => executePendingNav(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#eee', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>いいえ</button>
              </div>
            </div>
          </div>
        )}
        {/* 通知確認モーダル */}
        {showNotifyModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '340px', width: '100%' }}>
              <div style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '0.5rem' }}>🔔</div>
              <h3 style={{ margin: '0 0 0.5rem', textAlign: 'center', color: '#1565C0' }}>スタッフに通知しますか？</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 1rem', textAlign: 'center' }}>{startDate}〜{endDate} のシフト確定を通知します</p>
              <textarea value={notifyComment} onChange={e => setNotifyComment(e.target.value)}
                placeholder="コメントを追加（任意）"
                style={{ width: '100%', minHeight: '70px', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', marginBottom: '1rem', boxSizing: 'border-box', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => finishShiftCreation(true)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>はい（通知する）</button>
                <button onClick={() => finishShiftCreation(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#eee', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>いいえ</button>
              </div>
            </div>
          </div>
        )}
        {/* 戻る確認モーダル */}
        {showBackConfirm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h3 style={{ margin: '0 0 0.75rem', color: '#E65100' }}>作成途中で戻りますか？</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 1rem' }}>途中まで作成したデータはドラフトとして保存されます。📋 候補ボタンから続きを再開できます。</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={confirmGoBack} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#E65100', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>はい（戻る）</button>
                <button onClick={cancelGoBack} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#eee', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>いいえ</button>
              </div>
            </div>
          </div>
        )}
        {/* 日付削除確認モーダル */}
        {showDeleteDateConfirm && deleteDateIdx !== null && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: '#E53935' }}>⚠️ 日付の削除</h3>
              <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
                <strong>{dates[deleteDateIdx]}</strong> 以降の日付がすべて削除されます。よろしいですか？
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={confirmDeleteDate} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#E53935', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>はい（削除）</button>
                <button onClick={() => { setShowDeleteDateConfirm(false); setDeleteDateIdx(null); }} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#eee', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>いいえ</button>
              </div>
            </div>
          </div>
        )}
        <div className="login-card" style={{ position: 'relative', width: '100%', height: '100%', boxSizing: 'border-box', padding: '1rem' }}>
          <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', right: '0.5rem', display: 'flex', justifyContent: 'space-between', zIndex: 10, gap: '0.5rem' }}>
            {currentDateIndex > 0 ? (
              <button onClick={handlePreviousDay} className="nav-button-small" style={{ flex: '0 0 auto', minWidth: '60px', padding: '0.3rem 0.5rem', fontSize: '0.8rem', marginLeft: '3rem' }}>
                前の日
              </button>
            ) : (
              <div style={{ flex: '0 0 auto', minWidth: '60px', marginLeft: '3rem' }}></div>
            )}
            <div style={{ flex: 1 }}></div>
            {currentDateIndex < dates.length - 1 && (
              <button onClick={handleNextDay} className="nav-button-small" style={{ flex: '0 0 auto', minWidth: '60px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}>
                次の日
              </button>
            )}
          </div>

          <div style={{ position: 'relative', display: 'inline-block', marginTop: '3rem', maxWidth: '100%' }}>
            <h2 
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-block', fontSize: 'clamp(1rem, 4vw, 1.5rem)', margin: 0 }}
            >
              {formatDateWithDay(selectedDate)} のシフト入力 ▼
            </h2>
            {showDateDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {dates.map((date, index) => (
                  <div
                    key={date}
                    style={{
                      padding: '0.4rem 0.75rem',
                      cursor: 'pointer',
                      backgroundColor: index === currentDateIndex ? '#f0f0f0' : 'white',
                      borderBottom: index < dates.length - 1 ? '1px solid #eee' : 'none',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <span onClick={() => handleDateSelect(index)} style={{ flex: 1, padding: '0.1rem 0' }}>
                      {formatDateWithDay(date)}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteDate(index); }}
                      style={{ background: 'none', border: 'none', color: '#999', fontSize: '1rem', cursor: 'pointer', padding: '0 0.25rem', lineHeight: 1 }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ overflowX: 'auto', overflowY: 'auto', marginTop: '1rem', width: '100%', position: 'relative', maxHeight: 'calc(100vh - 180px)', WebkitOverflowScrolling: 'touch' }}>
            <table className="shift-edit-table" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '35px', width: '35px', position: 'sticky', left: 0, zIndex: 3, backgroundColor: '#FFB6C1', border: '1px solid #ddd', color: 'black', fontSize: '0.65rem', padding: '0.1rem' }}>名前</th>
                  <th style={{ minWidth: '30px', width: '30px', position: 'sticky', left: '35px', zIndex: 3, backgroundColor: '#ADD8E6', border: '1px solid #ddd', color: 'black', fontSize: '0.65rem', padding: '0.1rem' }}>店舗</th>
                  <th style={{ minWidth: '40px', width: '40px', position: 'sticky', left: '65px', zIndex: 3, backgroundColor: '#DDA0DD', border: '1px solid #ddd', color: 'black', fontSize: '0.65rem', padding: '0.1rem' }}>役割</th>
                  <th style={{ minWidth: '60px', width: '60px', position: 'sticky', left: '105px' , zIndex: 3, backgroundColor: '#FFDAB9', border: '1px solid #ddd', color: 'black', fontSize: '0.65rem', padding: '0.1rem' }}>備考</th>
                  <th style={{ minWidth: '25px', width: '25px', position: 'sticky', left: '125px', zIndex: 3, backgroundColor: '#E6E6FA', border: '1px solid #ddd', color: 'black', fontSize: '0.65rem', padding: '0.1rem' }}>休</th>
                  <th style={{ minWidth: '85px', width: '85px', position: 'sticky', left: '150px', zIndex: 3, backgroundColor: '#98FB98', border: '1px solid #ddd', color: 'black', fontSize: '0.65rem', padding: '0.1rem' }}>開始</th>
                  <th style={{ minWidth: '85px', width: '85px', position: 'sticky', left: '235px', zIndex: 3, backgroundColor: '#FFE4B5', border: '1px solid #ddd', color: 'black', fontSize: '0.65rem', padding: '0.1rem' }}>終了</th>
                  {timeSlots.map((t, i) => (
                    <th key={i} style={{ minWidth: '28px', width: '28px', backgroundColor: '#F0E68C', border: '1px solid #ddd', color: 'black', fontSize: '0.7rem', padding: '0.1rem' }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editRows.map((row, rowIndex) => {
                 const isFreeRow = (row.remarks || '').includes('終日フリー');
const originalStartStr = isFreeRow
  ? '00:00'
  : (row.originalStartHour !== '' && row.originalStartMin !== ''
    ? `${String(row.originalStartHour).padStart(2, '0')}:${String(row.originalStartMin).padStart(2, '0')}`
    : 'none'); // 'none'は絶対にスロットにマッチしないので黄色にならない
const originalEndStr = isFreeRow
  ? '36:00'
  : (row.originalEndHour !== '' && row.originalEndMin !== ''
    ? `${String(row.originalEndHour).padStart(2, '0')}:${String(row.originalEndMin).padStart(2, '0')}`
    : 'none');
                  const finalStartStr = `${String(row.startHour).padStart(2, '0')}:${String(row.startMin).padStart(2, '0')}`;
                  const finalEndStr = `${String(row.endHour).padStart(2, '0')}:${String(row.endMin).padStart(2, '0')}`;

                const rowBg = row.isBoshu ? '#fff0f0' : 'white';
return (
  <tr key={rowIndex} className={row.isOff ? 'off-row' : ''} style={row.isBoshu ? { backgroundColor: '#fff0f0' } : {}}>
    <td style={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: rowBg, minWidth: '35px', width: '35px', padding: '0.1rem', border: '1px solid #ddd', fontSize: '0.65rem' }}>{row.name}</td>
                      
                      <td style={{ position: 'sticky', left: '35px', zIndex: 2, backgroundColor: rowBg, minWidth: '30px', width: '30px', padding: '0.1rem', border: '1px solid #ddd' }}>
  {row.isEditingStore ? (
    <select
      value={row.store}
      onChange={(e) => handleStoreSelect(rowIndex, e.target.value)}
      autoFocus
      onBlur={() => toggleStoreEdit(rowIndex)}
      style={{
        padding: '0.05rem',
        border: '1px solid #2196F3',
        borderRadius: '2px',
        width: '100%',
        boxSizing: 'border-box',
        fontSize: '0.65rem'
      }}
    >
      {shiftSettings.stores.map(store => (
        <option key={store} value={store}>{store}</option>
      ))}
    </select>
  ) : (
    <div
      onClick={() => toggleStoreEdit(rowIndex)}
      style={{
        padding: '0.05rem',
        cursor: 'pointer',
        backgroundColor: 'white',
        textAlign: 'center',
        fontSize: '0.65rem',
        minHeight: '16px'
      }}
    >
      {row.store || shiftSettings.defaultStore}
    </div>
  )}
</td>

  <td style={{ position: 'sticky', left: '65px', zIndex: 2, backgroundColor: rowBg, minWidth: '40px', width: '40px', padding: '0.1rem', border: '1px solid #ddd' }}>
    {row.isEditingRole ? (
      <select
        value={row.role}
        onChange={(e) => handleRoleSelect(rowIndex, e.target.value)}
        autoFocus
        onBlur={() => toggleRoleEdit(rowIndex)}
        style={{
          padding: '0.05rem',
          border: '1px solid #9C27B0',
          borderRadius: '2px',
          width: '100%',
          boxSizing: 'border-box',
          fontSize: '0.65rem'
        }}
      >
        {shiftSettings.roles.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
    ) : (
      <div
        onClick={() => toggleRoleEdit(rowIndex)}
        style={{
          padding: '0.05rem',
          cursor: 'pointer',
          backgroundColor: 'white',
          textAlign: 'center',
          fontSize: '0.65rem',
          minHeight: '16px'
        }}
      >
        {row.role || shiftSettings.defaultRole}
      </div>
    )}
  </td>
                      <td style={{ position: 'sticky', left: '65px', zIndex: 2, backgroundColor: rowBg, minWidth: '60px', width: '60px', padding: '0.1rem', fontSize: '0.6rem', color: '#666', border: '1px solid #ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.remarks || ''}
                      </td>
                      <td style={{ position: 'sticky', left: '125px', zIndex: 2, backgroundColor: rowBg, minWidth: '25px', width: '25px', padding: '0.1rem', border: '1px solid #ddd', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={row.isOff}
                          onChange={e => handleCheckboxChange(rowIndex, e.target.checked)}
                        />
                      </td>
                      <td style={{ position: 'sticky', left: '150px', zIndex: 2, backgroundColor: rowBg, minWidth: '85px', width: '85px', padding: '0.1rem', border: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
                          <select
                            value={row.startHour}
                            onChange={e => handleTimeChange(rowIndex, 'startHour', e.target.value)}
                            disabled={row.isOff}
                            style={{ flex: 1, fontSize: '0.65rem', padding: '0.05rem' }}
                          >
                            {[...Array(37)].map((_, h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <span style={{ fontSize: '0.65rem' }}>:</span>
                          <select
                            value={row.startMin}
                            onChange={e => handleTimeChange(rowIndex, 'startMin', e.target.value)}
                            disabled={row.isOff}
                            style={{ flex: 1, fontSize: '0.65rem', padding: '0.05rem' }}
                          >
                            {[...Array(60)].map((_, m) => (
                              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td style={{ position: 'sticky', left: '235px', zIndex: 2, backgroundColor: rowBg, minWidth: '85px', width: '85px', padding: '0.1rem', border: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
                          <select
                            value={row.endHour}
                            onChange={e => handleTimeChange(rowIndex, 'endHour', e.target.value)}
                            disabled={row.isOff}
                            style={{ flex: 1, fontSize: '0.65rem', padding: '0.05rem' }}
                          >
                            {[...Array(37)].map((_, h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <span style={{ fontSize: '0.65rem' }}>:</span>
                          <select
                            value={row.endMin}
                            onChange={e => handleTimeChange(rowIndex, 'endMin', e.target.value)}
                            disabled={row.isOff}
                            style={{ flex: 1, fontSize: '0.65rem', padding: '0.05rem' }}
                          >
                            {[...Array(60)].map((_, m) => (
                              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                     
{timeSlots.map((slot, colIndex) => {
 const shiftRecord = shiftData.find(
  s => s.manager_number === row.manager_number && s.date === selectedDate
);
const isFreeDay = (shiftRecord?.remarks || '').includes('終日フリー');
const inRequest = isFreeDay ? true : (slot >= originalStartStr && slot < originalEndStr);
  const inFinal = slot >= finalStartStr && slot < finalEndStr;
  let bgColor = 'transparent';
  
  const isFirstClick = selectingTimeFor?.rowIndex === rowIndex && selectingTimeFor?.firstSlot === slot;
  const isUnavailableRow = (shiftData.find(s => s.manager_number === row.manager_number && s.date === selectedDate)?.remarks || '').includes('終日不可');

  if (row.isOff && isUnavailableRow) {
    bgColor = '#f5f5f5'; // 終日不可：薄い灰色
  } else if (row.isOff) {
    bgColor = '#e0e0e0'; // 通常の休み：濃い灰色
  } else {
    if (inRequest) {
      bgColor = '#ffff99';
    }
    
    if (inFinal) {
      if (inRequest) {
        bgColor = '#90EE90';
      } else {
        bgColor = '#ff9999';
      }
    }
    
    // 1回目クリックされた枠は黒
    if (isFirstClick) {
      bgColor = '#000000';
    }
  }
  
  return (
    <td 
      key={colIndex} 
      onClick={() => handleTimeSlotClick(rowIndex, slot)}
      style={{ 
        backgroundColor: bgColor, 
        minWidth: '28px', 
        width: '28px', 
        border: '1px solid #ddd',
        cursor: row.isOff ? 'not-allowed' : 'pointer'
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
          
        
<div style={{ marginTop: '1rem', textAlign: 'center', paddingBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
  {currentDateIndex === dates.length - 1 && dates.length > 0 && (
    <button onClick={handleSaveAndExit} className="save-button-small" disabled={isSavingShift}
      style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', backgroundColor: isSavingShift ? '#aaa' : '#43A047', color: 'white' }}>
      {isSavingShift ? '保存中...' : '確定'}
    </button>
  )}
  <button 
    onClick={() => setShowStaffAddModal(true)} 
    className="save-button-small"
    style={{ 
      padding: '0.5rem 1.5rem', 
      fontSize: '0.9rem',
       backgroundColor: '#2196F3'
    }}
  >
    追加
  </button>
  <button 
    onClick={handleAddBoshu} 
    className="save-button-small"
    style={{ 
      padding: '0.5rem 1.5rem', 
      fontSize: '0.9rem',
      backgroundColor: '#f44336'
    }}
  >
    募集
  </button>
</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fullscreen-table" style={{ padding: '0.5rem', boxSizing: 'border-box' }}>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent(currentHelpPage)} />
      <HelpButton onClick={() => {
        setCurrentHelpPage('shiftCreate');
        setShowHelp(true);
      }} />
      <div className="login-card" style={{ maxWidth: '100%', width: '100%', boxSizing: 'border-box', padding: '1rem' }}>
        <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)' }}>シフト表</h2>
        <div className="shift-table-wrapper" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', WebkitOverflowScrolling: 'touch' }}>
          <table className="shift-table">
            <thead>
              <tr>
                <th>名前</th>
                {dates.map(date => (
                  <th key={date}>{formatDateWithDay(date)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByUser).map(([name, shifts]) => (
                <tr key={name}>
                  <td>{name}</td>
                  {dates.map(date => (
                    <td key={date}>{shifts[date] || ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button onClick={() => handleEditStart(0)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', minWidth: '100px' }}>
            作成
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerCreate;