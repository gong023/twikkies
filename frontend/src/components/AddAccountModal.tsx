import { useState } from 'react';
import { Icon } from './ui/Icon';

interface Props {
  onAdd: (username: string, password: string) => Promise<void>;
  onClose: () => void;
}

export function AddAccountModal({ onAdd, onClose }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      await onAdd(username.trim(), password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'oklch(0.15 0.01 262 / 0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16,
        boxShadow: 'var(--shadow-pop)', padding: '28px 32px',
        width: '100%', maxWidth: 360,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>アカウントを追加</span>
          <button className="iconbtn" onClick={onClose} style={{ width: 30, height: 30 }}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            autoFocus
            value={username} onChange={e => setUsername(e.target.value)}
            placeholder="ユーザー名"
            style={{
              height: 42, padding: '0 14px', border: '1px solid var(--line-2)',
              borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
              background: 'var(--bg)', color: 'var(--ink)', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--line-2)')}
          />
          <input
            type="password"
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="パスワード"
            style={{
              height: 42, padding: '0 14px', border: '1px solid var(--line-2)',
              borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
              background: 'var(--bg)', color: 'var(--ink)', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--line-2)')}
          />
          {error && <p style={{ margin: 0, fontSize: 13, color: 'oklch(0.55 0.15 28)' }}>{error}</p>}
          <button type="submit" disabled={loading || !username.trim() || !password}
            style={{
              height: 42, borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: 'oklch(0.28 0.06 70)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              opacity: loading || !username.trim() || !password ? 0.5 : 1,
            }}>
            {loading ? '確認中…' : '追加'}
          </button>
        </form>
      </div>
    </div>
  );
}
