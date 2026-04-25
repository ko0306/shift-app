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
        <div style={{ padding: '1rem 2rem 0.5rem', borderBottom: '1px solid #eee' }}>
          <button
            onClick={() => window.open('/manual.pptx', '_blank')}
            style={{
              backgroundColor: '#1976D2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(25,118,210,0.3)'
            }}
          >
            📖 説明書を見る
          </button>
        </div>
        <div style={{ padding: '2rem', paddingTop: '1.5rem' }}>
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 370" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', display: 'block' }}>
            <rect width="400" height="370" fill="#f5f5f5"/>
            <rect x="15" y="10" width="370" height="350" rx="10" fill="white" stroke="#1976D2" strokeWidth="2"/>
            {/* 月ナビ */}
            <rect x="20" y="20" width="36" height="28" rx="4" fill="#607D8B"/>
            <text x="38" y="39" textAnchor="middle" fontSize="14" fill="white">◀</text>
            <text x="200" y="42" textAnchor="middle" fontSize="15" fontWeight="bold">2025年 1月</text>
            <rect x="344" y="20" width="36" height="28" rx="4" fill="#607D8B"/>
            <text x="362" y="39" textAnchor="middle" fontSize="14" fill="white">▶</text>
            {/* 曜日ヘッダー */}
            <rect x="20" y="56" width="360" height="24" fill="#e0e0e0" rx="3"/>
            {['日','月','火','水','木','金','土'].map((d, i) => (
              <text key={d} x={46 + i * 52} y="73" textAnchor="middle" fontSize="11">{d}</text>
            ))}
            {/* 1行目: 白・青・白・青・赤+人数・青・青 */}
            {[
              { day: '29', fill: 'white', stroke: '#ddd', textFill: '#999' },
              { day: '30', fill: '#E3F2FD', stroke: '#90caf9', textFill: '#000' },
              { day: '31', fill: 'white', stroke: '#ddd', textFill: '#999' },
              { day: '1',  fill: '#E3F2FD', stroke: '#90caf9', textFill: '#000' },
              { day: '2',  fill: '#FFEBEE', stroke: '#ef9a9a', textFill: '#c62828', boshu: 2 },
              { day: '3',  fill: '#E3F2FD', stroke: '#90caf9', textFill: '#000' },
              { day: '4',  fill: '#E3F2FD', stroke: '#90caf9', textFill: '#000' },
            ].map((cell, i) => (
              <g key={i}>
                <rect x={20 + i * 52} y="84" width="48" height="44" rx="4" fill={cell.fill} stroke={cell.stroke}/>
                <text x={44 + i * 52} y={cell.boshu ? 101 : 110} textAnchor="middle" fontSize="12" fontWeight="bold" fill={cell.textFill}>{cell.day}</text>
                {cell.boshu && <text x={44 + i * 52} y="119" textAnchor="middle" fontSize="8" fill="#c62828">+{cell.boshu}人</text>}
              </g>
            ))}
            {/* 2行目: 赤+人数・青・白・青・青・白・青 */}
            {[
              { day: '5',  fill: '#FFEBEE', stroke: '#ef9a9a', textFill: '#c62828', boshu: 1 },
              { day: '6',  fill: '#E3F2FD', stroke: '#90caf9', textFill: '#000' },
              { day: '7',  fill: 'white',   stroke: '#ddd',    textFill: '#999' },
              { day: '8',  fill: '#E3F2FD', stroke: '#90caf9', textFill: '#000' },
              { day: '9',  fill: '#E3F2FD', stroke: '#90caf9', textFill: '#000' },
              { day: '10', fill: 'white',   stroke: '#ddd',    textFill: '#999' },
              { day: '11', fill: '#E3F2FD', stroke: '#90caf9', textFill: '#000' },
            ].map((cell, i) => (
              <g key={i}>
                <rect x={20 + i * 52} y="132" width="48" height="44" rx="4" fill={cell.fill} stroke={cell.stroke}/>
                <text x={44 + i * 52} y={cell.boshu ? 149 : 158} textAnchor="middle" fontSize="12" fontWeight="bold" fill={cell.textFill}>{cell.day}</text>
                {cell.boshu && <text x={44 + i * 52} y="167" textAnchor="middle" fontSize="8" fill="#c62828">+{cell.boshu}人</text>}
              </g>
            ))}
            {/* 凡例 */}
            <rect x="20" y="190" width="360" height="100" rx="6" fill="#f9f9f9" stroke="#ddd"/>
            <text x="200" y="210" textAnchor="middle" fontSize="10" fill="#555" fontWeight="bold">色の意味</text>
            <rect x="36" y="218" width="12" height="12" rx="2" fill="#FFEBEE" stroke="#ef9a9a"/>
            <text x="54" y="229" fontSize="9" fill="#c62828" fontWeight="bold">赤色</text>
            <text x="82" y="229" fontSize="9" fill="#555">：募集あり（+N人）</text>
            <rect x="36" y="240" width="12" height="12" rx="2" fill="#E3F2FD" stroke="#90caf9"/>
            <text x="54" y="251" fontSize="9" fill="#1565c0" fontWeight="bold">青色</text>
            <text x="82" y="251" fontSize="9" fill="#555">：シフトあり</text>
            <rect x="220" y="218" width="12" height="12" rx="2" fill="white" stroke="#ddd"/>
            <text x="238" y="229" fontSize="9" fill="#555">白色：シフトなし（当月）</text>
            <rect x="220" y="240" width="12" height="12" rx="2" fill="#f0f0f0" stroke="#ccc"/>
            <text x="238" y="251" fontSize="9" fill="#555">灰色：他の月の日付</text>
            <text x="200" y="278" textAnchor="middle" fontSize="9" fill="#666">シフトあり: 8日 ／ 募集あり: 2日</text>
            {/* 戻るボタン */}
            <rect x="130" y="305" width="140" height="32" rx="6" fill="#607D8B"/>
            <text x="200" y="326" textAnchor="middle" fontSize="12" fill="white">メニューに戻る</text>
          </svg>
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>基本操作：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>◀ ▶ボタン</strong>で月を切り替え</li>
          <li><strong>赤色・青色の日付</strong>をクリックしてシフトを確認</li>
          <li>白色・灰色の日付はシフトが登録されていません</li>
        </ol>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>色の意味：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><span style={{backgroundColor: '#FFEBEE', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid #ef9a9a', color: '#c62828', fontWeight: 'bold'}}>赤色</span>：募集シフトあり（クリック可能）</li>
          <li><span style={{backgroundColor: '#E3F2FD', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid #2196F3'}}>青色</span>：シフトあり（クリック可能）</li>
          <li><span style={{backgroundColor: 'white', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid #ddd'}}>白色</span>：シフトなし（当月）</li>
          <li><span style={{backgroundColor: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid #ddd', opacity: 0.5}}>灰色</span>：他の月の日付</li>
        </ul>
        <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid #ef9a9a' }}>
          <strong>🔴 募集とは：</strong> スタッフが不足しているため、追加の人員を募集しているシフトです
        </div>
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
          <strong>💡 ヒント：</strong> カレンダー下部にシフトが登録されている日数と募集のある日数が表示されます
        </div>
      </div>
    ),
    shiftView: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト確認・編集の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 430" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', display: 'block' }}>
            <rect width="400" height="430" fill="#f5f5f5"/>
            <rect x="12" y="10" width="376" height="410" rx="10" fill="white" stroke="#1976D2" strokeWidth="2"/>
            {/* 日付・ナビ */}
            <rect x="18" y="20" width="30" height="26" rx="4" fill="#607D8B"/>
            <text x="33" y="37" textAnchor="middle" fontSize="12" fill="white">◀</text>
            <text x="200" y="38" textAnchor="middle" fontSize="13" fontWeight="bold">2025-01-15（水）</text>
            <rect x="352" y="20" width="30" height="26" rx="4" fill="#607D8B"/>
            <text x="367" y="37" textAnchor="middle" fontSize="12" fill="white">▶</text>
            {/* ボタン行 */}
            <rect x="18" y="52" width="56" height="26" rx="4" fill="#4CAF50"/>
            <text x="46" y="69" textAnchor="middle" fontSize="9" fill="white">変更</text>
            <rect x="78" y="52" width="78" height="26" rx="4" fill="#673AB7"/>
            <text x="117" y="69" textAnchor="middle" fontSize="9" fill="white">タイムライン</text>
            <rect x="160" y="52" width="56" height="26" rx="4" fill="#ccc"/>
            <text x="188" y="69" textAnchor="middle" fontSize="9" fill="white">更新</text>
            <rect x="220" y="52" width="78" height="26" rx="4" fill="#607D8B"/>
            <text x="259" y="69" textAnchor="middle" fontSize="9" fill="white">カレンダー</text>
            {/* ※変更ボタンは編集中オレンジ「キャンセル」、更新は編集中のみ有効（青） */}
            {/* テーブルヘッダー: 名前・店舗・役割・勤務時間・状態 */}
            <rect x="18" y="86" width="364" height="24" fill="#e0e0e0" rx="3"/>
            <text x="35" y="102" fontSize="9" fontWeight="bold">名前</text>
            <text x="108" y="102" fontSize="9" fontWeight="bold">店舗</text>
            <text x="168" y="102" fontSize="9" fontWeight="bold">役割</text>
            <text x="238" y="102" fontSize="9" fontWeight="bold">勤務時間</text>
            <text x="338" y="102" fontSize="9" fontWeight="bold">状態</text>
            {/* 行1: 通常スタッフ */}
            <rect x="18" y="110" width="364" height="34" fill="white"/>
            <line x1="18" y1="144" x2="382" y2="144" stroke="#eee" strokeWidth="1"/>
            <text x="25" y="131" fontSize="9" fontWeight="bold">田中 太郎</text>
            <text x="100" y="131" fontSize="9" fill="#1976D2" fontWeight="bold">A店</text>
            <text x="158" y="131" fontSize="9" fill="#9C27B0">社員</text>
            <text x="225" y="131" fontSize="9" fontWeight="bold">9:00 - 17:00</text>
            <rect x="326" y="118" width="40" height="16" rx="8" fill="#4CAF50"/>
            <text x="346" y="130" textAnchor="middle" fontSize="7" fill="white">出勤</text>
            {/* 行2: 通常スタッフ */}
            <rect x="18" y="144" width="364" height="34" fill="#f9f9f9"/>
            <line x1="18" y1="178" x2="382" y2="178" stroke="#eee" strokeWidth="1"/>
            <text x="25" y="165" fontSize="9" fontWeight="bold">佐藤 花子</text>
            <text x="100" y="165" fontSize="9" fill="#1976D2" fontWeight="bold">B店</text>
            <text x="158" y="165" fontSize="9" fill="#9C27B0">アルバイト</text>
            <text x="225" y="165" fontSize="9" fontWeight="bold">10:00 - 18:00</text>
            <rect x="326" y="152" width="40" height="16" rx="8" fill="#4CAF50"/>
            <text x="346" y="164" textAnchor="middle" fontSize="7" fill="white">出勤</text>
            {/* 行3: 募集（赤背景） */}
            <rect x="18" y="178" width="364" height="34" fill="#fff0f0"/>
            <line x1="18" y1="212" x2="382" y2="212" stroke="#ffcccc" strokeWidth="1"/>
            <text x="25" y="199" fontSize="9" fill="#f44336" fontWeight="bold">募集</text>
            <text x="100" y="199" fontSize="9" fill="#1976D2" fontWeight="bold">A店</text>
            <text x="158" y="199" fontSize="9" fill="#9C27B0">-</text>
            <text x="225" y="199" fontSize="9">13:00 - 20:00</text>
            <rect x="320" y="186" width="50" height="16" rx="8" fill="#f44336"/>
            <text x="345" y="198" textAnchor="middle" fontSize="7" fill="white">募集中</text>
            {/* 行4: 休み */}
            <rect x="18" y="212" width="364" height="34" fill="white"/>
            <line x1="18" y1="246" x2="382" y2="246" stroke="#eee" strokeWidth="1"/>
            <text x="25" y="233" fontSize="9" fontWeight="bold">鈴木 一郎</text>
            <text x="100" y="233" fontSize="9" fill="#999">-</text>
            <text x="158" y="233" fontSize="9" fill="#999">-</text>
            <text x="225" y="233" fontSize="9" fill="#999">休み</text>
            <rect x="326" y="220" width="40" height="16" rx="8" fill="#9E9E9E"/>
            <text x="346" y="232" textAnchor="middle" fontSize="7" fill="white">休み</text>
            {/* 並び順の説明 */}
            <rect x="18" y="255" width="364" height="44" rx="6" fill="#e8f5e9" stroke="#a5d6a7"/>
            <text x="200" y="273" textAnchor="middle" fontSize="9" fill="#2e7d32" fontWeight="bold">並び順：通常スタッフ → 募集 → 休み</text>
            <text x="200" y="289" textAnchor="middle" fontSize="8" fill="#555">（基本シフトの人を優先して上に表示）</text>
            {/* 戻るボタン */}
            <rect x="130" y="315" width="140" height="30" rx="6" fill="#607D8B"/>
            <text x="200" y="335" textAnchor="middle" fontSize="11" fill="white">カレンダーに戻る</text>
          </svg>
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>表示列：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>名前</strong>：スタッフ名（募集行は赤字で「募集」と表示）</li>
          <li><strong>店舗</strong>：勤務店舗</li>
          <li><strong>役割</strong>：社員 / スタッフなど</li>
          <li><strong>勤務時間</strong>：開始〜終了時刻（休みの場合は「休み」）</li>
          <li><strong>状態</strong>：出勤（緑）／休み（赤）／募集中（赤）</li>
        </ul>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>ボタンの説明：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong style={{color: '#4CAF50'}}>変更</strong>：シフトの編集を開始。編集中は<strong style={{color: '#FF9800'}}>オレンジ色「キャンセル」</strong>に変わります</li>
          <li><strong style={{color: '#673AB7'}}>タイムライン</strong>：時間軸（横向き）表示に切り替え</li>
          <li><strong style={{color: '#2196F3'}}>更新</strong>：変更内容を保存（編集中のみ有効）</li>
          <li><strong style={{color: '#607D8B'}}>カレンダー</strong>：カレンダー画面に戻る</li>
        </ul>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>日付移動：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>◀ボタン</strong>：前の日のシフトを表示</li>
          <li><strong>▶ボタン</strong>：次の日のシフトを表示</li>
        </ul>
      </div>
    ),
    shiftEdit: (
      <div>
        <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>シフト編集の使い方</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', display: 'block' }}>
            <rect width="400" height="400" fill="#f5f5f5"/>
            <rect x="10" y="10" width="380" height="380" rx="10" fill="white" stroke="#1976D2" strokeWidth="2"/>
            {/* タイトル */}
            <text x="200" y="36" textAnchor="middle" fontSize="13" fontWeight="bold">編集モード（変更ボタン押下後）</text>
            {/* ヘッダー行（通常列） */}
            <rect x="15" y="46" width="370" height="22" fill="#e0e0e0" rx="3"/>
            <text x="35" y="61" fontSize="8" fontWeight="bold">名前</text>
            <text x="88" y="61" fontSize="8" fontWeight="bold">店舗</text>
            <text x="138" y="61" fontSize="8" fontWeight="bold">役割</text>
            <text x="195" y="61" fontSize="8" fontWeight="bold">勤務時間</text>
            <text x="300" y="61" fontSize="8" fontWeight="bold">状態</text>
            {/* ヘッダー行（編集列） */}
            {/* 編集列を示す区切り線 */}
            <line x1="15" y1="68" x2="385" y2="68" stroke="#1976D2" strokeWidth="1" strokeDasharray="3,2"/>
            <rect x="15" y="68" width="370" height="22" fill="#e8f5e9" rx="0"/>
            <text x="200" y="83" textAnchor="middle" fontSize="7" fill="#2e7d32" fontWeight="bold">↓ 編集列（店舗変更 ／ 役割変更 ／ 開始時刻 ／ 終了時刻 ／ 休み）</text>
            {/* データ行 */}
            <rect x="15" y="90" width="370" height="50" fill="white" stroke="#eee"/>
            {/* 名前 */}
            <text x="22" y="119" fontSize="9" fontWeight="bold">田中 太郎</text>
            {/* 店舗 */}
            <text x="80" y="110" fontSize="8" fill="#1976D2" fontWeight="bold">A店</text>
            {/* 役割 */}
            <text x="130" y="110" fontSize="8" fill="#9C27B0">社員</text>
            {/* 勤務時間 */}
            <text x="185" y="110" fontSize="8" fontWeight="bold">9:00 - 17:00</text>
            {/* 状態バッジ */}
            <rect x="292" y="100" width="36" height="14" rx="7" fill="#4CAF50"/>
            <text x="310" y="111" textAnchor="middle" fontSize="6" fill="white">出勤</text>
            {/* 店舗変更ドロップダウン */}
            <rect x="15" y="109" width="52" height="22" rx="3" fill="white" stroke="#bbb"/>
            <text x="30" y="124" fontSize="8">A ▾</text>
            {/* 役割変更ドロップダウン */}
            <rect x="72" y="109" width="56" height="22" rx="3" fill="white" stroke="#bbb"/>
            <text x="84" y="124" fontSize="8">社員 ▾</text>
            {/* 開始時刻 */}
            <rect x="133" y="109" width="30" height="22" rx="3" fill="white" stroke="#bbb"/>
            <text x="140" y="124" fontSize="8">9 ▾</text>
            <text x="165" y="124" fontSize="8">:</text>
            <rect x="170" y="109" width="30" height="22" rx="3" fill="white" stroke="#bbb"/>
            <text x="177" y="124" fontSize="8">00 ▾</text>
            <text x="202" y="124" fontSize="8" fill="#666">〜</text>
            {/* 終了時刻 */}
            <rect x="210" y="109" width="30" height="22" rx="3" fill="white" stroke="#bbb"/>
            <text x="216" y="124" fontSize="8">17 ▾</text>
            <text x="242" y="124" fontSize="8">:</text>
            <rect x="248" y="109" width="30" height="22" rx="3" fill="white" stroke="#bbb"/>
            <text x="255" y="124" fontSize="8">00 ▾</text>
            {/* 休みチェック */}
            <rect x="286" y="112" width="14" height="14" rx="2" fill="white" stroke="#999"/>
            {/* 凡例（タイムライン用） */}
            <rect x="15" y="155" width="370" height="110" rx="6" fill="#f9f9f9" stroke="#ddd"/>
            <text x="200" y="173" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#555">タイムライン表示の色の見方</text>
            <rect x="30" y="182" width="50" height="14" rx="3" fill="#90EE90"/>
            <text x="88" y="193" fontSize="9">：通常の勤務時間帯（緑）</text>
            <rect x="30" y="204" width="50" height="14" rx="3" fill="#ffb3b3"/>
            <text x="88" y="215" fontSize="9" fill="#c62828">：募集シフトの時間帯（赤）</text>
            <rect x="30" y="226" width="50" height="14" rx="3" fill="#e0e0e0"/>
            <text x="88" y="237" fontSize="9" fill="#666">：休みのスタッフ（灰）</text>
            {/* タイムラインイメージ */}
            <rect x="15" y="275" width="370" height="70" rx="6" fill="#fafafa" stroke="#ddd"/>
            <text x="200" y="293" textAnchor="middle" fontSize="8" fill="#888">タイムライン表示イメージ（横軸＝時間、縦軸＝スタッフ）</text>
            {/* タイムライン行1 */}
            <rect x="20" y="298" width="55" height="16" rx="0" fill="#FFB6C1"/>
            <text x="47" y="310" textAnchor="middle" fontSize="7">田中 太郎</text>
            <rect x="75" y="298" width="80" height="16" fill="#90EE90"/>
            <text x="115" y="310" textAnchor="middle" fontSize="7">9:00-17:00</text>
            {/* タイムライン行2 */}
            <rect x="20" y="316" width="55" height="16" rx="0" fill="#fff0f0"/>
            <text x="47" y="328" textAnchor="middle" fontSize="7" fill="#f44336">募集</text>
            <rect x="115" y="316" width="60" height="16" fill="#ffb3b3"/>
            <text x="145" y="328" textAnchor="middle" fontSize="7" fill="#c62828">13:00-20:00</text>
          </svg>
        </div>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>編集手順：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>変更</strong>ボタンをクリックして編集モードを開始</li>
          <li><strong>店舗変更</strong>：ドロップダウンから勤務店舗を選択</li>
          <li><strong>役割変更</strong>：ドロップダウンから役割（社員・スタッフ等）を選択</li>
          <li><strong>開始・終了時刻</strong>：時・分をそれぞれドロップダウンで選択</li>
          <li>休みの場合は<strong>休みチェックボックス</strong>にチェック（時刻選択が無効になります）</li>
          <li><strong>更新</strong>ボタンをクリックして保存</li>
        </ol>
        <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>タイムライン表示：</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><span style={{backgroundColor: '#90EE90', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>緑色</span>：通常の勤務時間帯</li>
          <li><span style={{backgroundColor: '#ffb3b3', padding: '0.2rem 0.5rem', borderRadius: '3px', color: '#c62828', fontWeight: 'bold'}}>赤色（薄）</span>：募集シフトの勤務時間帯</li>
          <li><span style={{backgroundColor: '#e0e0e0', padding: '0.2rem 0.5rem', borderRadius: '3px'}}>灰色</span>：休みのスタッフ</li>
          <li>横軸が時間、縦軸がスタッフ名で表示されます</li>
          <li>並び順：通常スタッフ → 募集 → 休み</li>
        </ul>
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>📱 推奨：</strong> タイムライン表示は横向き画面での使用を推奨します
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
  const [boshuCountMap, setBoshuCountMap] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [currentView, setCurrentView] = useState('calendar');
  const [isEditing, setIsEditing] = useState(false);
  const [editingShifts, setEditingShifts] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [showHelp, setShowHelp] = useState(false);
  const [currentHelpPage, setCurrentHelpPage] = useState('calendar');
const [selectingTimeFor, setSelectingTimeFor] = useState(null); // {shiftId: string, firstSlot: string | null}
const [showNotifConfirm, setShowNotifConfirm] = useState(false);
const [notifSending, setNotifSending] = useState(false);
const [notifResult, setNotifResult] = useState(null); // null | 'success' | 'error'

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
        .select('date, is_boshu')
        .order('date');

      if (error) {
        console.error('日付取得エラー:', error);
        return;
      }

      const uniqueDates = finalShifts ? [...new Set(finalShifts.map(item => item.date))].sort() : [];
      const countMap = {};
      if (finalShifts) {
        finalShifts.filter(item => item.is_boshu).forEach(item => {
          countMap[item.date] = (countMap[item.date] || 0) + 1;
        });
      }
      setAvailableDates(uniqueDates);
      setBoshuCountMap(countMap);
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
      
      const displayName = shift.isNew ? '追加行' : getUserName(shift.manager_number);
      if (!storeValue || storeValue.trim() === '') {
        alert(`${displayName}の店舗を選択または入力してください`);
        setLoading(false);
        return;
      }

      if (!roleValue || roleValue.trim() === '') {  // ← 追加
        alert(`${displayName}の役割を選択してください`);
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
        is_off: shift.is_off,
        remarks: shift.remarks || null
      };

      let error;
      if (shift.isNew) {
        updateData.is_boshu = true;
        const result = await supabase.from('final_shifts').insert(updateData);
        error = result.error;
      } else {
        const result = await supabase
          .from('final_shifts')
          .upsert(updateData, { onConflict: 'date,manager_number' });
        error = result.error;
      }

      if (error) {
        console.error(`${getUserName(shift.manager_number)} の保存エラー:`, error);
        alert(`${getUserName(shift.manager_number)} の保存に失敗しました: ${error.message}`);
        setLoading(false);
        return;
      }
    }

    setIsEditing(false);
    setShowTimeline(false);
    setCurrentHelpPage('shiftView');
    fetchShiftData(selectedDate);
    setShowNotifConfirm(true);

  } catch (error) {
    alert(`エラーが発生しました: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

const handleSendNotification = async () => {
  setNotifSending(true);
  try {
    const dateLabel = selectedDate
      ? `${selectedDate.replace(/-/g, '/')} `
      : '';
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        title: '📅 シフトが更新されました',
        body: `${dateLabel}のシフトが変更されました。アプリでご確認ください。`
      }
    });
    if (error) throw error;
    setNotifResult('success');
  } catch (e) {
    console.error('通知送信エラー:', e);
    setNotifResult('error');
  } finally {
    setNotifSending(false);
  }
};

const handleAddRow = () => {
  const tempId = `new_${Date.now()}`;
  setEditingShifts(prev => [...prev, {
    id: tempId,
    isNew: true,
    is_boshu: true,
    manager_number: null,
    date: selectedDate,
    store: shiftSettings.defaultStore,
    role: shiftSettings.defaultRole,
    startHour: 9,
    startMin: 0,
    endHour: 17,
    endMin: 0,
    is_off: false,
    remarks: ''
  }]);
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
      const boshuCount = boshuCountMap[dateStr] || 0;
      const hasBoshu = boshuCount > 0;

      days.push({
        date: new Date(currentDate),
        dateStr: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        hasShift,
        hasBoshu,
        boshuCount
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
    const getPriority = (shift) => {
      if (isOffDay(shift)) return 2;
      if (shift.is_boshu) return 1;
      return 0;
    };
    return getPriority(a) - getPriority(b);
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
          <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)' }}>シフト確認（オーナー）</h2>

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
                    backgroundColor: dayInfo.hasBoshu ? '#FFEBEE' :
                                   dayInfo.hasShift ? '#E3F2FD' :
                                   dayInfo.isCurrentMonth ? 'white' : '#f0f0f0',
                    color: !dayInfo.hasShift ? '#999' :
                           dayInfo.hasBoshu ? '#c62828' :
                           dayInfo.isCurrentMonth ? 'black' : '#666',
                    fontWeight: dayInfo.hasShift ? 'bold' : 'normal',
                    opacity: dayInfo.isCurrentMonth ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    fontSize: 'clamp(0.7rem, 3vw, 0.9rem)',
                    minHeight: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (dayInfo.hasShift) {
                      e.currentTarget.style.backgroundColor = dayInfo.hasBoshu ? '#FFCDD2' : '#BBDEFB';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (dayInfo.hasShift) {
                      e.currentTarget.style.backgroundColor = dayInfo.hasBoshu ? '#FFEBEE' : '#E3F2FD';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <span>{dayInfo.day}</span>
                  {dayInfo.hasBoshu && (
                    <span style={{ fontSize: 'clamp(0.5rem, 2vw, 0.65rem)', color: '#c62828', fontWeight: 'bold', lineHeight: 1 }}>
                      +{dayInfo.boshuCount}人
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{
              marginTop: '1rem',
              fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
              color: '#666'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.3rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#FFEBEE', border: '1px solid #ef9a9a', borderRadius: '3px' }}></span>
                  <span style={{ color: '#c62828', fontWeight: 'bold' }}>赤色</span>：募集あり
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#E3F2FD', border: '1px solid #90caf9', borderRadius: '3px' }}></span>
                  <span style={{ color: '#1565c0', fontWeight: 'bold' }}>青色</span>：シフトあり
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '3px' }}></span>
                  白色：シフトなし
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', opacity: 0.5 }}></span>
                  灰色：他の月
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                シフトあり: {availableDates.length}日 ／ 募集あり: {Object.keys(boshuCountMap).length}日
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

      {/* シフト更新後の通知確認モーダル */}
      {showNotifConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 9000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '340px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }}>
            {notifResult === null && !notifSending && (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '0.5rem' }}>シフトを更新しました</div>
                <div style={{ color: '#555', fontSize: '14px', marginBottom: '1.5rem' }}>
                  全員にプッシュ通知を送りますか？
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => { setShowNotifConfirm(false); setNotifResult(null); }}
                    style={{
                      flex: 1, padding: '0.75rem',
                      backgroundColor: '#eee', border: 'none',
                      borderRadius: '10px', fontSize: '14px',
                      cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    送らない
                  </button>
                  <button
                    onClick={handleSendNotification}
                    style={{
                      flex: 1, padding: '0.75rem',
                      backgroundColor: '#1976D2', color: 'white',
                      border: 'none', borderRadius: '10px',
                      fontSize: '14px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    全員に通知する
                  </button>
                </div>
              </>
            )}
            {notifSending && (
              <div style={{ padding: '1rem', color: '#555', fontSize: '14px' }}>
                📤 通知を送信中...
              </div>
            )}
            {notifResult === 'success' && (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📣</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '0.5rem' }}>通知を送信しました！</div>
                <div style={{ color: '#555', fontSize: '13px', marginBottom: '1.5rem' }}>
                  通知が有効なスタッフ全員に届きます。
                </div>
                <button
                  onClick={() => { setShowNotifConfirm(false); setNotifResult(null); }}
                  style={{
                    width: '100%', padding: '0.75rem',
                    backgroundColor: '#43A047', color: 'white',
                    border: 'none', borderRadius: '10px',
                    fontSize: '14px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  閉じる
                </button>
              </>
            )}
            {notifResult === 'error' && (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '0.5rem' }}>通知の送信に失敗しました</div>
                <div style={{ color: '#c62828', fontSize: '13px', marginBottom: '1.5rem' }}>
                  シフトの保存は完了しています。<br />通知は後ほど再試行してください。
                </div>
                <button
                  onClick={() => { setShowNotifConfirm(false); setNotifResult(null); }}
                  style={{
                    width: '100%', padding: '0.75rem',
                    backgroundColor: '#eee', border: 'none',
                    borderRadius: '10px', fontSize: '14px',
                    cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  閉じる
                </button>
              </>
            )}
          </div>
        </div>
      )}
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
    
    const isBoshu = shift.is_boshu === true;
    return (
      <tr key={shift.id || shift.manager_number || index} className={editingShift.is_off ? 'off-row' : ''} style={isBoshu ? { backgroundColor: '#fff0f0' } : {}}>
        <td style={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: isBoshu ? '#fff0f0' : 'white', border: '1px solid #ddd', padding: '0.2rem', fontSize: '0.65rem', color: isBoshu ? '#f44336' : '#000', fontWeight: isBoshu ? 'bold' : 'normal', minWidth: '50px', width: '50px' }}>
          {isBoshu ? '募集' : getUserName(shift.manager_number)}
        </td>
        <td style={{ position: 'sticky', left: '50px', zIndex: 2, backgroundColor: isBoshu ? '#fff0f0' : 'white', border: '1px solid #ddd', padding: '0.1rem', minWidth: '60px', width: '60px' }}>
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
        <td style={{ position: 'sticky', left: '110px', zIndex: 2, backgroundColor: isBoshu ? '#fff0f0' : 'white', border: '1px solid #ddd', padding: '0.1rem', minWidth: '60px', width: '60px' }}>
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
        <td style={{ position: 'sticky', left: '170px', zIndex: 2, backgroundColor: isBoshu ? '#fff0f0' : 'white', border: '1px solid #ddd', padding: '0.1rem', textAlign: 'center', minWidth: '25px', width: '25px' }}>
          <input
            type="checkbox"
            checked={editingShift.is_off || false}
            onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'is_off', e.target.checked)}
            style={{ transform: 'scale(1)', cursor: 'pointer' }}
          />
        </td>
        <td style={{ position: 'sticky', left: '195px', zIndex: 2, backgroundColor: isBoshu ? '#fff0f0' : 'white', border: '1px solid #ddd', padding: '0.1rem', minWidth: '85px', width: '85px' }}>
          <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
            <select
              value={editingShift.startHour || 0}
              onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'startHour', parseInt(e.target.value))}
              disabled={editingShift.is_off}
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.1rem', backgroundColor: editingShift.is_off ? '#f5f5f5' : (isBoshu ? '#fff0f0' : 'white'), color: '#000' }}
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
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.1rem', backgroundColor: editingShift.is_off ? '#f5f5f5' : (isBoshu ? '#fff0f0' : 'white'), color: '#000' }}
            >
              {[...Array(60)].map((_, m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </td>
        <td style={{ position: 'sticky', left: '280px', zIndex: 2, backgroundColor: isBoshu ? '#fff0f0' : 'white', border: '1px solid #ddd', padding: '0.1rem', minWidth: '85px', width: '85px' }}>
          <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
            <select
              value={editingShift.endHour || 0}
              onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'endHour', parseInt(e.target.value))}
              disabled={editingShift.is_off}
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.1rem', backgroundColor: editingShift.is_off ? '#f5f5f5' : (isBoshu ? '#fff0f0' : 'white'), color: '#000' }}
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
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.1rem', backgroundColor: editingShift.is_off ? '#f5f5f5' : (isBoshu ? '#fff0f0' : 'white'), color: '#000' }}
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
                         slot <= endTimeStr;
          
         let bgColor = isBoshu ? '#fff0f0' : 'transparent';
const isFirstClick = isEditing &&
                     selectingTimeFor?.shiftId === (shift.id || shift.manager_number) &&
                     selectingTimeFor?.firstSlot === slot;

if (editingShift.is_off) {
  bgColor = '#e0e0e0';
} else if (inShift) {
  bgColor = isBoshu ? '#ffb3b3' : '#90EE90';
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
    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
      備考
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
                  const isBoshuRow = shift.is_boshu === true;

                  return (
                    <tr key={shift.id || shift.manager_number || displayIndex} style={{
                      backgroundColor: isBoshuRow ? '#fff0f0' : (displayIndex % 2 === 0 ? 'white' : '#f9f9f9')
                    }}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: isBoshuRow ? '#f44336' : 'inherit' }}>{isBoshuRow ? '募集' : getUserName(shift.manager_number)}</strong>
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
                      <td style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid #eee',
                        fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
                        color: '#555',
                        minWidth: isEditing ? '120px' : '80px'
                      }}>
                        {isEditing ? (
                          <textarea
                            value={editingShift.remarks || ''}
                            onChange={(e) => handleShiftChange(shift.id || shift.manager_number, 'remarks', e.target.value)}
                            rows={2}
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
                              resize: 'vertical',
                              minWidth: '100px'
                            }}
                          />
                        ) : (
                          <span style={{ whiteSpace: 'pre-wrap' }}>{shift.remarks || ''}</span>
                        )}
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
        {isEditing && (
          <button
            onClick={handleAddRow}
            style={{
              marginTop: '0.5rem',
              padding: '0.4rem 0.6rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            ＋ 行を追加（募集枠）
          </button>
        )}
      </div>
    </div>
  );
}

export default ManagerShiftView;