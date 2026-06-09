import { useState } from 'react';
import { Icon } from './ui/Icon';
import { PlatMark } from './ui/PlatMark';
import { useEscape } from '../hooks/useEscape';
import type { Memo } from '../types';

const LIMITS: Record<string, number> = { x: 280, bluesky: 300 };
const PLAT_LABEL: Record<string, string> = { x: 'X', bluesky: 'Bluesky' };
const INTENT_URL: Record<string, string> = {
  x: 'https://x.com/intent/tweet',
  bluesky: 'https://bsky.app/intent/compose',
};

interface Props {
  memo: Memo;
  onClose: () => void;
  onPosted: (platforms: string[]) => void;
}

export function PostDialog({ memo, onClose, onPosted }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(['x']));
  const [text, setText] = useState(memo.text);
  useEscape(onClose);

  const toggle = (pl: string) => {
    setSelected(s => {
      const next = new Set(s);
      next.has(pl) ? next.delete(pl) : next.add(pl);
      return next;
    });
  };

  const limit = selected.size > 0
    ? Math.min(...[...selected].map(pl => LIMITS[pl] ?? 280))
    : 280;
  const over = text.length - limit;
  const canPost = selected.size > 0 && text.trim().length > 0 && over <= 0;
  const counterColor = over > 0 ? 'oklch(0.55 0.16 28)' : over > -20 ? 'var(--accent-ink)' : 'var(--ink-3)';

  const post = () => {
    const platforms = [...selected];
    platforms.forEach(pl => {
      window.open(`${INTENT_URL[pl]}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });
    onPosted(platforms);
    onClose();
  };

  return (
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" style={{ maxWidth: 480 }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>投稿する</h2>
          <button className="iconbtn" onClick={onClose} style={{ width: 32, height: 32 }}><Icon name="close" size={17} /></button>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '0 18px 16px' }}>
          {['x', 'bluesky'].map(pl => {
            const on = selected.has(pl);
            return (
              <button key={pl} onClick={() => toggle(pl)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                height: 44, borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                border: on ? '1.5px solid var(--ink)' : '1px solid var(--line-2)',
                background: on ? 'var(--surface-2)' : 'var(--surface)',
                color: on ? 'var(--ink)' : 'var(--ink-2)',
              }}>
                <PlatMark platform={pl} size={20} />
                {PLAT_LABEL[pl]}
                {on && <span style={{ color: 'var(--accent-ink)', display: 'flex' }}><Icon name="check" size={14} stroke={2.4} /></span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '0 18px' }}>
          <textarea className="field" value={text} onChange={e => setText(e.target.value)}
            style={{ resize: 'vertical', minHeight: 92, fontSize: 14.5, lineHeight: 1.7 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <span className="mono" style={{ fontSize: 12, color: counterColor }}>{text.length} / {limit}</span>
          </div>
        </div>

        <div className="hr" style={{ marginTop: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            {selected.size > 0 ? `${selected.size}件に投稿` : 'プラットフォームを選択'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ height: 38 }} onClick={onClose}>キャンセル</button>
            <button className="btn btn-accent" style={{ height: 38 }} disabled={!canPost} onClick={post}>
              投稿する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
