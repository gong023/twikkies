import { useState, useRef, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { PlatMark } from './ui/PlatMark';
import type { Memo, SocialAccount } from '../types';

interface Props {
  onCreate: (data: { text: string; image?: Memo['image'] }, postTargets: SocialAccount[]) => void;
  accounts: SocialAccount[];
}

export function Composer({ onCreate, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [img, setImg] = useState<Memo['image'] | null>(null);
  const [targets, setTargets] = useState<string[]>([]);
  const [showPost, setShowPost] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (open) taRef.current?.focus(); }, [open]);

  const grow = (el: HTMLTextAreaElement) => { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 320) + 'px'; };
  const reset = () => { setText(''); setImg(null); setTargets([]); setShowPost(false); setOpen(false); };
  const commit = () => {
    const t = text.trim();
    if (t || img) onCreate({ text: t, image: img ?? undefined }, accounts.filter(a => targets.includes(a.id)));
    reset();
  };
  const toggleTarget = (id: string) => setTargets(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]);

  return (
    <div style={{ maxWidth: 632, margin: '26px auto 30px', padding: '0 24px' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line-2)',
        borderRadius: 14, boxShadow: open ? 'var(--shadow-2)' : 'var(--shadow-1)',
        transition: 'box-shadow .16s ease', overflow: 'hidden',
      }}>
        {!open ? (
          <button onClick={() => setOpen(true)} style={{
            width: '100%', textAlign: 'left', border: 'none', background: 'transparent',
            padding: '16px 18px', color: 'var(--ink-3)', fontSize: 15, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <span style={{ whiteSpace: 'nowrap' }}>気づいたことをメモ…</span>
            <span className="iconbtn" style={{ width: 34, height: 34 }} aria-hidden="true"><Icon name="image" size={19} /></span>
          </button>
        ) : (
          <div style={{ padding: 14 }}>
            {img && (
              <div className="imgph" style={{ aspectRatio: '16 / 7', borderRadius: 9, marginBottom: 10, borderBottom: 'none', border: '1px solid var(--line)' }}>
                <span>{img.label || '添付画像'}</span>
                <button className="iconbtn" onClick={() => setImg(null)} style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, background: 'color-mix(in oklab, var(--surface) 80%, transparent)' }}><Icon name="close" size={15} /></button>
              </div>
            )}
            <textarea ref={taRef} className="field" value={text}
              onInput={e => grow(e.currentTarget)}
              onChange={e => setText(e.target.value)}
              placeholder="気づいたことをメモ…"
              style={{ border: 'none', padding: '4px 4px 8px', resize: 'none', minHeight: 64, fontSize: 15, lineHeight: 1.7, boxShadow: 'none' }}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') commit(); }}
            />

            <div style={{ marginTop: 4 }}>
              <button onClick={() => setShowPost(v => !v)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '5px 2px', color: targets.length ? 'var(--accent-ink)' : 'var(--ink-3)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                <Icon name="send" size={15} />
                {targets.length ? `${targets.length}件のアカウントに同時投稿` : '同時にSNSへ投稿'}
                <span style={{ display: 'inline-flex', transform: showPost ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease', color: 'var(--ink-3)' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </span>
              </button>
              {showPost && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '8px 2px 4px' }}>
                  {accounts.map(a => {
                    const on = targets.includes(a.id);
                    return (
                      <button key={a.id} onClick={() => toggleTarget(a.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 11px 0 8px',
                        borderRadius: 999, transition: 'all .12s ease', whiteSpace: 'nowrap', cursor: 'pointer',
                        border: on ? '1.5px solid var(--accent-2)' : '1px solid var(--line-2)',
                        background: on ? 'var(--accent-wash)' : 'var(--surface)',
                      }}>
                        <PlatMark platform={a.platform} size={20} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{a.name}</span>
                        {on && <span style={{ color: 'var(--accent-ink)', display: 'flex' }}><Icon name="check" size={14} stroke={2.4} /></span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <button className="iconbtn" title="画像を添付" onClick={() => setImg({ ph: true, label: '添付画像', ratio: 0.6 })}><Icon name="image" size={19} /></button>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginRight: 4 }}>⌘↵ で保存</span>
                <button className="btn btn-ghost" style={{ height: 36 }} onClick={reset}>キャンセル</button>
                <button className={`btn ${targets.length ? 'btn-accent' : 'btn-primary'}`} style={{ height: 36 }} onClick={commit} disabled={!text.trim() && !img}>
                  {targets.length ? '保存して投稿' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
