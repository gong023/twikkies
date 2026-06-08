import { useState } from 'react';
import { Icon } from './ui/Icon';
import { PlatMark } from './ui/PlatMark';
import { useEscape } from '../hooks/useEscape';
import type { SocialAccount } from '../types';

interface Props {
  accounts: SocialAccount[];
  onAdd: (data: { platform: string; name: string; handle: string }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onClose: () => void;
}

export function AccountsModal({ accounts, onAdd, onRemove, onClose }: Props) {
  const [adding, setAdding] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState(false);
  useEscape(onClose);

  const add = async () => {
    if (!name.trim() || !handle.trim() || !adding) return;
    setBusy(true);
    try { await onAdd({ platform: adding, name: name.trim(), handle: handle.trim() }); }
    finally { setName(''); setHandle(''); setAdding(null); setBusy(false); }
  };

  const group = (pl: string) => accounts.filter(a => a.platform === pl);

  return (
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" style={{ maxWidth: 460 }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>投稿アカウント</h2>
          <button className="iconbtn" onClick={onClose} style={{ width: 32, height: 32 }}><Icon name="close" size={17} /></button>
        </div>
        <div className="hr" />
        <div style={{ padding: '14px 18px 18px', maxHeight: '62vh', overflow: 'auto' }}>
          {['x', 'bluesky'].map(pl => (
            <div key={pl} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                <PlatMark platform={pl} size={22} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>{pl === 'x' ? 'X' : 'Bluesky'}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{group(pl).length} アカウント</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {group(pl).map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', border: '1px solid var(--line-2)', borderRadius: 10 }}>
                    <PlatMark platform={pl} size={26} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{a.name}</span>
                      <span className="mono" style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-3)' }}>{pl === 'x' ? a.handle.replace(/^@?/, '@') : '@' + a.handle}</span>
                    </span>
                    <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => onRemove(a.id)} title="削除"><Icon name="trash" size={16} /></button>
                  </div>
                ))}
                {adding === pl ? (
                  <div style={{ border: '1px dashed var(--line-2)', borderRadius: 10, padding: 11, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input className="field" placeholder="表示名" value={name} onChange={e => setName(e.target.value)} style={{ padding: '8px 10px' }} autoFocus />
                    <input className="field" placeholder={pl === 'x' ? '@handle' : 'name.bsky.social'} value={handle} onChange={e => setHandle(e.target.value)} style={{ padding: '8px 10px' }} />
                    <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ height: 32 }} onClick={() => { setAdding(null); setName(''); setHandle(''); }}>やめる</button>
                      <button className="btn btn-primary" style={{ height: 32 }} disabled={!name.trim() || !handle.trim() || busy} onClick={add}>追加</button>
                    </div>
                  </div>
                ) : (
                  <button className="pill" style={{ alignSelf: 'flex-start', height: 34 }} onClick={() => setAdding(pl)}>
                    <Icon name="plus" size={15} /> アカウントを追加
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
