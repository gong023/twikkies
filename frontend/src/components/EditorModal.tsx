import { useState, useRef, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { useEscape } from '../hooks/useEscape';
import { fmtDate } from '../types';
import type { Memo } from '../types';

interface Props {
  memo: Memo;
  onSave: (m: Memo) => void;
  onArchive: (m: Memo) => void;
  onPost: (m: Memo) => void;
  onClose: () => void;
}

export function EditorModal({ memo, onSave, onArchive, onPost, onClose }: Props) {
  const [text, setText] = useState(memo.text);
  const [img, setImg] = useState<Memo['image'] | null>(memo.image ?? null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEscape(onClose);

  useEffect(() => {
    const el = taRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 420) + 'px';
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, []);

  const grow = (el: HTMLTextAreaElement) => { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 420) + 'px'; };
  const save = () => { onSave({ ...memo, text: text.trim(), image: img ?? undefined }); onClose(); };

  return (
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) save(); }}>
      <div className="sheet" style={{ maxWidth: 600 }} onMouseDown={e => e.stopPropagation()}>
        {img && (
          <div className="imgph" style={{ aspectRatio: `1 / ${Math.min(img.ratio ?? 0.5, 0.5)}`, borderRadius: '16px 16px 0 0' }}>
            <span>{img.label || '画像'}</span>
            <button className="iconbtn" onClick={() => setImg(null)} style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, background: 'color-mix(in oklab, var(--surface) 82%, transparent)' }}><Icon name="close" size={16} /></button>
          </div>
        )}
        <div style={{ padding: '20px 22px 6px' }}>
          <textarea ref={taRef} className="field" value={text}
            onInput={e => grow(e.currentTarget)} onChange={e => setText(e.target.value)}
            style={{ border: 'none', padding: 0, resize: 'none', fontSize: 15.5, lineHeight: 1.78, boxShadow: 'none', minHeight: 80 }}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') save(); }}
          />
        </div>
        <div className="memo-meta" style={{ padding: '8px 22px 16px' }}>
          <Icon name="calendar" size={13} /> <span>{fmtDate(memo.createdAt)}</span><span style={{ opacity: .5 }}>·</span><span>作成日</span>
        </div>
        <div className="hr" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="iconbtn" title="投稿" onClick={() => onPost(memo)}><Icon name="send" size={18} /></button>
            <button className="iconbtn" title="アーカイブ" onClick={() => { onArchive(memo); onClose(); }}><Icon name="archive" size={18} /></button>
          </div>
          <button className="btn btn-primary" style={{ height: 38 }} onClick={save}>完了</button>
        </div>
      </div>
    </div>
  );
}
