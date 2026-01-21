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

// 使い方ガイドの内容
const getHelpContent = () => {
  return (
    <div>
      <h2 style={{ color: '#1976D2', marginBottom: '1rem' }}>新人登録画面の使い方</h2>
      <div style={{ marginBottom: '1.5rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', margin: 0 }}>👤 新しいスタッフを登録したり、既存スタッフの管理番号を確認できます。</p>
      </div>

      <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>新人を登録する手順：</h3>
      <ol style={{ lineHeight: '1.8' }}>
        <li><strong>名前</strong>：スタッフの名前を入力します</li>
        <li><strong>管理番号</strong>：一意の管理番号を入力します（例：101, 102など）</li>
        <li><strong>パスワード</strong>：スタッフのログインパスワードを設定します（6文字以上）</li>
        <li><strong>登録</strong>ボタンをクリックして登録完了</li>
      </ol>

      <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <strong>⚠️ 重要：</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
          <li>管理番号は重複できません（既に登録されている番号は使えません）</li>
          <li>パスワードは6文字以上で設定してください</li>
          <li>登録後もパスワード変更画面から変更可能です</li>
          <li>一度登録した管理番号は変更できないので注意してください</li>
        </ul>
      </div>

      <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>登録済みスタッフを確認する：</h3>
      <ol style={{ lineHeight: '1.8' }}>
        <li><strong>番号確認</strong>ボタンをクリック</li>
        <li>登録されているスタッフの一覧が表示されます</li>
        <li><strong>更新</strong>ボタンで最新の一覧に更新できます</li>
        <li><strong>パスワード変更</strong>ボタンで各スタッフのパスワードを変更できます</li>
      </ol>

      <h3 style={{ color: '#1976D2', marginTop: '1.5rem' }}>スタッフを削除する：</h3>
      <ol style={{ lineHeight: '1.8' }}>
        <li>一覧表示で削除したいスタッフの<strong>削除</strong>ボタンをクリック</li>
        <li>削除されたスタッフはシフト提出や確認ができなくなります</li>
        <li>過去のシフトデータは残ります</li>
      </ol>
    </div>
  );
};

function RegisterUser({ onBack }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newPasswordForEdit, setNewPasswordForEdit] = useState('');

  const handleRegister = async () => {
  if (!name || !number) {
    setMessage('名前と管理番号を入力してください');
    return;
  }

  if (!password || password.length < 6) {
    setMessage('パスワードは6文字以上で入力してください');
    return;
  }

  // ✅ 削除済みも含めて全ユーザーをチェック
  const { data: existing, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('manager_number', number);

  if (fetchError) {
    console.error(fetchError);
    setMessage('確認中にエラーが発生しました');
    return;
  }

  // ✅ 削除済みユーザーがいる場合は警告
  if (existing.length > 0) {
    const deletedUser = existing.find(u => u.is_deleted === true);
    if (deletedUser) {
      const confirmReuse = window.confirm(
        `この管理番号(${number})は過去に削除されたユーザー「${deletedUser.name}」が使用していました。\n同じ番号を再利用しますか？`
      );
      if (!confirmReuse) {
        setMessage('登録をキャンセルしました');
        return;
      }
    } else {
      // アクティブなユーザーが存在する場合
      setMessage('この番号はすでに登録されています');
      return;
    }
  }

  try {
    const hashedPassword = await hashPassword(password);

    const { error } = await supabase
      .from('users')
      .insert([{ 
        name, 
        manager_number: number, 
        user_password: hashedPassword,
        plain_password: password,
        is_deleted: false 
      }]);

    if (error) {
      console.error(error);
      setMessage('登録に失敗しました');
    } else {
      setMessage('登録が完了しました');
      setName('');
      setNumber('');
      setPassword('');
    }
  } catch (err) {
    setMessage('登録中にエラーが発生しました');
  }
};

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_deleted', false);

    if (error) {
      console.error(error);
      setMessage('ユーザー取得に失敗しました');
    } else {
      setUsers(data);
      setShowConfirm(false);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('users')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) {
      console.error(error);
      setMessage('削除に失敗しました');
    } else {
      fetchUsers();
    }
  };

  const handlePasswordChange = async (user) => {
    if (!newPasswordForEdit || newPasswordForEdit.length < 6) {
      alert('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      const hashedPassword = await hashPassword(newPasswordForEdit);
      
      const { error } = await supabase
        .from('users')
        .update({ 
          user_password: hashedPassword,
          plain_password: newPasswordForEdit  // 平文パスワードも保存
        })
        .eq('id', user.id);

      if (error) {
        alert('パスワード変更に失敗しました');
      } else {
        alert('パスワードを変更しました');
        setEditingUser(null);
        setNewPasswordForEdit('');
        fetchUsers(); // 一覧を更新
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
  };

  return (
    <div className="login-wrapper">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={getHelpContent()} />
      <div className="login-card" style={{ position: 'relative' }}>
        <HelpButton onClick={() => setShowHelp(true)} />
        <h2>新人登録</h2>

        <label>名前:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="例：山田太郎"
        />

        <label>管理番号:</label>
        <input
          type="text"
          value={number}
          onChange={e => setNumber(e.target.value)}
          placeholder="例：101"
        />

        <label>パスワード:</label>
        <input
          type="text"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="6文字以上"
        />

        {message && <p style={{ 
          color: message.includes('完了') ? '#4CAF50' : '#e74c3c', 
          marginTop: '0.5rem',
          fontWeight: 'bold'
        }}>{message}</p>}

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'nowrap',
          overflowX: 'auto',
        }}>
          <button onClick={handleRegister} style={{
            backgroundColor: '#4CAF50',
            color: 'white'
          }}>登録</button>
          {showConfirm && <button onClick={fetchUsers} style={{
            backgroundColor: '#2196F3',
            color: 'white'
          }}>番号確認</button>}
        </div>

        {users.length > 0 && (
          <>
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <h4 style={{ margin:'auto' }}>登録一覧</h4>
              <button
                onClick={fetchUsers}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.4rem',
                  cursor: 'pointer',
                  height: '24px',
                  minWidth: 'auto',
                  width: 'auto',
                  whiteSpace: 'nowrap',
                  backgroundColor: '#00BCD4',
                  color: 'white'
                }}
                title="一覧を更新"
              >
                更新
              </button>
            </div>

            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              marginTop: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#f5f5f5'
                }}>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>管理番号</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>名前</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>パスワード</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <tr style={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9'
                      }}>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{user.manager_number}</td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{user.name}</td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                          {user.plain_password || '未設定'}
                        </td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button onClick={() => {
                              if (editingUser?.id === user.id) {
                                setEditingUser(null);
                                setNewPasswordForEdit('');
                              } else {
                                setEditingUser(user);
                                setNewPasswordForEdit('');
                              }
                            }} style={{
                              backgroundColor: '#FF9800',
                              color: 'white',
                              border: 'none',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}>
                              {editingUser?.id === user.id ? 'キャンセル' : 'PW変更'}
                            </button>
                            <button onClick={() => {
                              if (window.confirm(`${user.name}（管理番号：${user.manager_number}）を削除しますか？`)) {
                                handleDelete(user.id);
                              }
                            }} style={{
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}>
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editingUser?.id === user.id && (
                        <tr style={{
                          backgroundColor: '#FFF3E0'
                        }}>
                          <td colSpan="4" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexDirection: 'column' }}>
                              <input
                                type="text"
                                placeholder="新しいパスワード（6文字以上）"
                                value={newPasswordForEdit}
                                onChange={(e) => setNewPasswordForEdit(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  borderRadius: '4px',
                                  border: '2px solid #FF9800',
                                  fontSize: '14px',
                                  boxSizing: 'border-box'
                                }}
                              />
                              <button onClick={() => handlePasswordChange(user)} style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                変更
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterUser;