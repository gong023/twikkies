import { useState } from 'react';
import { Icon } from './ui/Icon';
import { Logo } from './ui/Logo';
import { Menu } from './ui/Menu';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  userId: string;
  archivedCount: number;
  onLogout: () => void;
  onShowArchive: () => void;
  onManageAccounts: () => void;
}

export function TopBar({ query, onQuery, userId, archivedCount, onLogout, onShowArchive, onManageAccounts }: Props) {
  const [umenu, setUmenu] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'color-mix(in oklab, var(--bg) 86%, transparent)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 18px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ flex: '0 0 auto' }}><Logo size={26} /></div>

        <div style={{ flex: 1, maxWidth: 560, margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
            <Icon name="search" size={18} />
          </span>
          <input
            value={query} onChange={e => onQuery(e.target.value)}
            placeholder="メモを検索…"
            style={{
              width: '100%', height: 42, paddingLeft: 42, paddingRight: query ? 40 : 14,
              border: '1px solid transparent', borderRadius: 999,
              background: 'oklch(0.945 0.004 262)', fontSize: 14, color: 'var(--ink)',
              fontFamily: 'inherit', outline: 'none',
              transition: 'background .14s, border-color .14s',
            }}
            onFocus={e => { e.target.style.background = 'var(--surface)'; e.target.style.borderColor = 'var(--line-2)'; }}
            onBlur={e => { e.target.style.background = 'oklch(0.945 0.004 262)'; e.target.style.borderColor = 'transparent'; }}
          />
          {query && (
            <button className="iconbtn" onClick={() => onQuery('')}
              style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32 }}>
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        <div style={{ flex: '0 0 auto', position: 'relative' }}>
          <button onClick={() => setUmenu(v => !v)} style={{
            width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--line-2)',
            background: 'var(--accent)', color: 'oklch(0.28 0.06 70)', fontWeight: 700,
            fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', textTransform: 'uppercase', cursor: 'pointer',
          }} title={userId}>{(userId || 'u').slice(0, 1)}</button>
          {umenu && (
            <Menu onClose={() => setUmenu(false)} style={{ top: 46, right: 0, minWidth: 200 }} items={[
              { label: userId, icon: 'user' },
              { sep: true },
              { label: `アーカイブ${archivedCount ? `（${archivedCount}）` : ''}`, icon: 'archive', onClick: onShowArchive },
              { label: '投稿アカウント設定', icon: 'settings', onClick: onManageAccounts },
              { sep: true },
              { label: 'ログアウト', icon: 'logout', onClick: onLogout },
            ]} />
          )}
        </div>
      </div>
    </header>
  );
}
