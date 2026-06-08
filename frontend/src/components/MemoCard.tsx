import { useState } from 'react';
import { Icon } from './ui/Icon';
import { Menu } from './ui/Menu';
import { fmtDate } from '../types';
import type { Memo } from '../types';

function fmtCount(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(0) + 'K';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  while (true) {
    const at = lower.indexOf(ql, i);
    if (at === -1) { parts.push(text.slice(i)); break; }
    parts.push(text.slice(i, at));
    parts.push(<mark key={at} style={{ background: 'var(--accent-wash)', color: 'inherit', borderRadius: 3, padding: '0 1px' }}>{text.slice(at, at + q.length)}</mark>);
    i = at + q.length;
  }
  return <>{parts}</>;
}

interface Props {
  memo: Memo;
  query: string;
  onOpen: (m: Memo) => void;
  onPost: (m: Memo) => void;
  onArchive: (m: Memo) => void;
}

export function MemoCard({ memo, query, onOpen, onPost, onArchive }: Props) {
  const [menu, setMenu] = useState(false);

  return (
    <article className="memo" onClick={() => onOpen(memo)}>
      {memo.image && (
        <div className="imgph" style={{ aspectRatio: `1 / ${memo.image.ratio || 0.6}` }}>
          <span>{memo.image.label || '画像'}</span>
        </div>
      )}
      <div className="memo-body">{highlight(memo.text, query)}</div>
      <div className="memo-meta">
        <span>{fmtDate(memo.createdAt)}</span>
        {memo.stats && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }} title="Xでの反応">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="repost" size={13} /><span>{fmtCount(memo.stats.reposts)}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="heart" size={13} /><span>{fmtCount(memo.stats.likes)}</span>
            </span>
          </span>
        )}
      </div>

      <div className="memo-tools" onClick={e => e.stopPropagation()}>
        <button className="iconbtn" title="投稿" onClick={() => onPost(memo)}><Icon name="send" size={17} /></button>
        <button className="iconbtn" title="その他" onClick={() => setMenu(v => !v)} style={{ position: 'relative' }}><Icon name="more" size={17} /></button>
      </div>
      {menu && (
        <div onClick={e => e.stopPropagation()}>
          <Menu onClose={() => setMenu(false)} style={{ top: 40, right: 8 }} items={[
            { label: '編集', icon: 'edit', onClick: () => onOpen(memo) },
            { label: 'X / Blueskyに投稿', icon: 'send', onClick: () => onPost(memo) },
            { sep: true },
            { label: 'アーカイブ', icon: 'archive', onClick: () => onArchive(memo) },
          ]} />
        </div>
      )}
    </article>
  );
}

interface GridProps {
  memos: Memo[];
  query: string;
  onOpen: (m: Memo) => void;
  onPost: (m: Memo) => void;
  onArchive: (m: Memo) => void;
  emptyNote?: string;
}

export function MemoGrid({ memos, query, onOpen, onPost, onArchive, emptyNote }: GridProps) {
  if (!memos.length) {
    return (
      <div style={{ textAlign: 'center', padding: '90px 20px', color: 'var(--ink-3)' }}>
        <div style={{ display: 'inline-flex', marginBottom: 14, opacity: .5 }}><Icon name="search" size={34} stroke={1.4} /></div>
        <p style={{ fontSize: 14.5, margin: 0 }}>{emptyNote ?? 'メモが見つかりませんでした'}</p>
      </div>
    );
  }
  return (
    <div className="grid">
      {memos.map(m => (
        <MemoCard key={m.id} memo={m} query={query} onOpen={onOpen} onPost={onPost} onArchive={onArchive} />
      ))}
    </div>
  );
}
