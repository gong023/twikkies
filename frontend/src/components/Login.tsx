import { useState } from 'react';
import { Icon } from './ui/Icon';
import { Logo } from './ui/Logo';

interface Props { onLogin: (username: string, password: string) => Promise<void> }

export function Login({ onLogin }: Props) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !pw.trim()) { setErr('IDとパスワードを入力してください'); return; }
    if (pw.length < 4) { setErr('パスワードは4文字以上です'); return; }
    setErr(''); setBusy(true);
    try {
      await onLogin(id.trim(), pw);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'ログインに失敗しました');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '32px 20px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <Logo size={34} />
        </div>
        <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5, margin: '0 0 30px', lineHeight: 1.7 }}>
          気づいたことを、ただ書きとめる。<br />あとで見返して、発見する。
        </p>
        <form onSubmit={submit} style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 16, padding: '26px 24px 24px', boxShadow: 'var(--shadow-1)',
        }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7, letterSpacing: '.02em' }}>ユーザーID</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}><Icon name="user" size={18} /></span>
            <input className="field" style={{ paddingLeft: 38 }} value={id} autoFocus
              onChange={e => setId(e.target.value)} placeholder="your_id" autoComplete="username" />
          </div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7, letterSpacing: '.02em' }}>パスワード</label>
          <div style={{ position: 'relative', marginBottom: err ? 12 : 22 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}><Icon name="lock" size={18} /></span>
            <input className="field" style={{ paddingLeft: 38 }} type="password" value={pw}
              onChange={e => setPw(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {err && <div style={{ color: 'oklch(0.55 0.15 28)', fontSize: 12.5, marginBottom: 16 }}>{err}</div>}
          <button className="btn btn-accent" type="submit" disabled={busy} style={{ width: '100%', height: 44 }}>
            {busy ? 'サインイン中…' : 'サインイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
