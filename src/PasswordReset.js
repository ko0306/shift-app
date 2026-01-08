import React, { useState } from 'react';
import { supabase } from './supabaseClient';

// 簡易的なハッシュ関数
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const PasswordReset = ({ onBack, onSuccess }) => {
  const [managerNumber, setManagerNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePasswordChange = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    // 入力チェック
    if (!managerNumber.trim()) {
      setError('管理番号を入力してください');
      setLoading(false);
      return;
    }

    if (!currentPassword) {
      setError('現在のパスワードを入力してください');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('新しいパスワードは6文字以上にしてください');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードと確認パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      // ユーザー情報を取得
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('manager_number, user_password')
        .eq('manager_number', managerNumber)
        .eq('is_deleted', false)
        .single();

      if (userError || !user) {
        setError('管理番号が存在しません');
        setLoading(false);
        return;
      }

      // 現在のパスワードが設定されていない場合
      if (!user.user_password) {
        setError('パスワードが設定されていません。管理者に連絡してください');
        setLoading(false);
        return;
      }

      // 現在のパスワードを確認
      const hashedCurrentPassword = await hashPassword(currentPassword);
      if (hashedCurrentPassword !== user.user_password) {
        setError('現在のパスワードが違います');
        setLoading(false);
        return;
      }

      // 新しいパスワードをハッシュ化
      const hashedNewPassword = await hashPassword(newPassword);

      // データベースを更新
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_password: hashedNewPassword })
        .eq('manager_number', managerNumber);

      if (updateError) {
        throw updateError;
      }

      setShowSuccess(true);
      setMessage('パスワードが正常に変更されました！');
    } catch (err) {
      setError(`エラーが発生しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 成功画面
  if (showSuccess) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>登録成功</h2>
            <p style={{ color: '#4CAF50', marginBottom: '2rem' }}>
              パスワードが正常に変更されました
            </p>
            <button
              onClick={() => {
                if (onSuccess) onSuccess();
              }}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // パスワード変更画面
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>パスワード変更</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          現在のパスワードを入力して、新しいパスワードを設定してください
        </p>
        <div>
          <input
            type="text"
            placeholder="管理番号"
            value={managerNumber}
            onChange={(e) => setManagerNumber(e.target.value)}
          />
          <input
            type="password"
            placeholder="現在のパスワード"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="新しいパスワード（6文字以上）"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="新しいパスワード（確認）"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button 
            onClick={handlePasswordChange} 
            disabled={loading} 
            style={{ backgroundColor: '#4CAF50' }}
          >
            {loading ? '変更中...' : '登録'}
          </button>
        </div>
        {message && <p style={{ color: '#4CAF50', marginTop: '1rem' }}>{message}</p>}
        {error && <p className="error-msg">{error}</p>}
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#FF5722',
            marginTop: '1rem'
          }}
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default PasswordReset;