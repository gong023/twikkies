import { useState } from 'react';
import { Icon } from './ui/Icon';
import { PlatMark } from './ui/PlatMark';
import { useEscape } from '../hooks/useEscape';
import type { Memo, SocialAccount } from '../types';

const LIMITS: Record<string, number> = { x: 280, bluesky: 300 };
const PLAT_LABEL: Record<string, string> = { x: 'X', bluesky: 'Bluesky' };

interface Props {
  memo: Memo;
  accounts: SocialAccount[];
  onClose: () => void;
  onPosted: (targets: SocialAccount[]) => void;
}

export function PostDialog({ memo, accounts, onClose, onPosted }: Props) {
  const [platform, setPlatform] = useState<string>('x');
  const [picked, setPicked] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string> = {};
    accounts.forEach(a => { if (init[a.platform] === undefined) init[a.platform] = a.id; });
    return init['x'] ? { x: [init['x']] } : { x: [] };
  });
  const [text, setText] = useState(memo.text);
  const [busy, setBusy] = useState(false);
  useEscape(onClose);

  const list = accounts.filter(a => a.platform === platform);
  const sel = picked[platform] ?? [];
  const limit = LIMITS[platform] ?? 280;
  const over = text.length - limit;

  const toggle = (id: string) => {
    setPicked(p => {
      const cur = new Set(p[platform] ?? []);
      cur.has(id) ? cur.delete(id) : cur.add(id);
      return { ...p, [platform]: [...cur] };
    });
  };

  const totalSelected = Object.values(picked).reduce((n, arr) => n + (arr?.length ?? 0), 0);
  const canPost = totalSelected > 0 && text.trim().length > 0 && over <= 0;

  const post = () => {
    setBusy(true);
    const targets: SocialAccount[] = [];
    Object.entries(picked).forEach(([_plat, ids]) =>
      (ids ?? []).forEach(id => { const acc = accounts.find(a => a.id === id); if (acc) targets.push(acc); })
    );
    setTimeout(() => { onPosted(targets); onClose(); }, 560);
  };

  const counterColor = over > 0 ? 'oklch(0.55 0.16 28)' : over > -20 ? 'var(--accent-ink)' : 'var(--ink-3)';

  return (
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" style={{ maxWidth: 480 }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>投稿する</h2>
          <button className="iconbtn" onClick={onClose} style={{ width: 32, height: 32 }}><Icon name="close" size={17} /></button>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '0 18px 14px' }}>
          {['x', 'bluesky'].map(pl => {
            const n = (picked[pl] ?? []).length;
            const active = platform === pl;
            return (
              <button key={pl} onClick={() => setPlatform(pl)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                height: 44, borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                border: active ? '1.5px solid var(--ink)' : '1px solid var(--line-2)',
                background: active ? 'var(--surface-2)' : 'var(--surface)',
                color: active ? 'var(--ink)' : 'var(--ink-2)',
              }}>
                <PlatMark platform={pl} size={20} />
                {PLAT_LABEL[pl]}
                {n > 0 && <span className="mono" style={{ fontSize: 11, background: 'var(--accent)', color: 'oklch(0.28 0.06 70)', borderRadius: 999, padding: '1px 7px' }}>{n}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '0 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '.04em', marginBottom: 8, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            アカウント（複数選択可）
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {list.map(a => {
              const on = sel.includes(a.id);
              return (
                <button key={a.id} onClick={() => toggle(a.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 11, width: '100%',
                  padding: '10px 12px', borderRadius: 11, textAlign: 'left', cursor: 'pointer',
                  border: on ? '1.5px solid var(--accent-2)' : '1px solid var(--line-2)',
                  background: on ? 'var(--accent-wash)' : 'var(--surface)',
                  transition: 'all .12s ease',
                }}>
                  <PlatMark platform={a.platform} size={28} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{a.name}</span>
                    <span className="mono" style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-3)' }}>{a.platform === 'x' ? a.handle.replace(/^@?/, '@') : '@' + a.handle}</span>
                  </span>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6, flex: '0 0 auto',
                    border: on ? 'none' : '1.5px solid var(--line-2)',
                    background: on ? 'var(--accent)' : 'transparent',
                    color: 'oklch(0.28 0.06 70)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{on && <Icon name="check" size={15} stroke={2.4} />}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '16px 18px 4px' }}>
          <textarea className="field" value={text} onChange={e => setText(e.target.value)}
            style={{ resize: 'vertical', minHeight: 92, fontSize: 14.5, lineHeight: 1.7 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <span className="mono" style={{ fontSize: 12, color: counterColor }}>{text.length} / {limit}</span>
          </div>
        </div>

        <div className="hr" style={{ marginTop: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            {totalSelected > 0 ? `${totalSelected}件のアカウントに投稿` : 'アカウントを選択'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ height: 38 }} onClick={onClose}>キャンセル</button>
            <button className="btn btn-accent" style={{ height: 38 }} disabled={!canPost || busy} onClick={post}>
              {busy ? '投稿中…' : '投稿する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
