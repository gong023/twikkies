import { useState, useRef, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { PlatMark } from './ui/PlatMark';
import { api } from '../api';

const INTENT_URL: Record<string, string> = {
  x: 'https://x.com/intent/tweet',
  bluesky: 'https://bsky.app/intent/compose',
};

interface ImgSlot {
  preview: string;
  id?: string;
}

interface Props {
  onCreate: (data: { text: string; images: string[] }, platforms: string[]) => void;
}

export function Composer({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [imgs, setImgs] = useState<ImgSlot[]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [showPost, setShowPost] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploading = imgs.some(s => !s.id);

  useEffect(() => { if (open) taRef.current?.focus(); }, [open]);

  const grow = (el: HTMLTextAreaElement) => { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 320) + 'px'; };

  const reset = () => {
    imgs.forEach(s => { if (s.preview.startsWith('blob:')) URL.revokeObjectURL(s.preview); });
    setText(''); setImgs([]); setTargets([]); setShowPost(false); setOpen(false);
  };

  const commit = () => {
    if (uploading) return;
    const t = text.trim();
    const imageIds = imgs.map(s => s.id!);
    if (t || imageIds.length) {
      targets.forEach(pl => {
        const base = INTENT_URL[pl];
        if (base) window.open(`${base}?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
      });
      onCreate({ text: t, images: imageIds }, targets);
    }
    reset();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach(async file => {
      const preview = URL.createObjectURL(file);
      setImgs(prev => [...prev, { preview }]);
      try {
        const { id } = await api.uploads.upload(file);
        setImgs(prev => prev.map(s => s.preview === preview ? { ...s, id } : s));
      } catch {
        setImgs(prev => prev.filter(s => s.preview !== preview));
      }
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImg = (preview: string) => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setImgs(prev => prev.filter(s => s.preview !== preview));
  };

  const toggleTarget = (pl: string) => setTargets(l => l.includes(pl) ? l.filter(x => x !== pl) : [...l, pl]);

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
            {imgs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {imgs.map(s => (
                  <div key={s.preview} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={s.preview}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)', display: 'block' }}
                    />
                    {!s.id && (
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: 8,
                        background: 'color-mix(in oklab, var(--surface) 60%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      </div>
                    )}
                    <button
                      className="iconbtn"
                      onClick={() => removeImg(s.preview)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '50%' }}
                    >
                      <Icon name="close" size={11} />
                    </button>
                  </div>
                ))}
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
                {targets.length ? `${targets.length}件に同時投稿` : '同時にSNSへ投稿'}
                <span style={{ display: 'inline-flex', transform: showPost ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease', color: 'var(--ink-3)' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </span>
              </button>
              {showPost && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '8px 2px 4px' }}>
                  {(['x', 'bluesky'] as const).map(pl => {
                    const on = targets.includes(pl);
                    return (
                      <button key={pl} onClick={() => toggleTarget(pl)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 11px 0 8px',
                        borderRadius: 999, transition: 'all .12s ease', whiteSpace: 'nowrap', cursor: 'pointer',
                        border: on ? '1.5px solid var(--accent-2)' : '1px solid var(--line-2)',
                        background: on ? 'var(--accent-wash)' : 'var(--surface)',
                      }}>
                        <PlatMark platform={pl} size={20} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{pl === 'x' ? 'X' : 'Bluesky'}</span>
                        {on && <span style={{ color: 'var(--accent-ink)', display: 'flex' }}><Icon name="check" size={14} stroke={2.4} /></span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <button
                className="iconbtn"
                title="画像を添付"
                onClick={() => fileRef.current?.click()}
                style={{ color: imgs.length ? 'var(--accent-ink)' : undefined }}
              >
                <Icon name="image" size={19} />
              </button>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginRight: 4 }}>⌘↵ で保存</span>
                <button className="btn btn-ghost" style={{ height: 36 }} onClick={reset}>キャンセル</button>
                <button
                  className={`btn ${targets.length ? 'btn-accent' : 'btn-primary'}`}
                  style={{ height: 36 }}
                  onClick={commit}
                  disabled={(!text.trim() && !imgs.length) || uploading}
                >
                  {uploading ? 'アップロード中…' : targets.length ? '保存して投稿' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
