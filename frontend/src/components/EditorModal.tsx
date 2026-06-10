import { useState, useRef, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { useEscape } from '../hooks/useEscape';
import { fmtDate } from '../types';
import type { Memo } from '../types';
import { api } from '../api';

interface ImgSlot {
  preview: string;
  id?: string;
}

interface Props {
  memo: Memo;
  onSave: (m: Memo) => void;
  onArchive: (m: Memo) => void;
  onPost: (m: Memo) => void;
  onClose: () => void;
}

export function EditorModal({ memo, onSave, onArchive, onPost, onClose }: Props) {
  const [text, setText] = useState(memo.text);
  const [imgs, setImgs] = useState<ImgSlot[]>(
    memo.images.map(id => ({ preview: `/api/images/${id}`, id }))
  );
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEscape(onClose);

  const uploading = imgs.some(s => !s.id);

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

  const save = () => {
    if (uploading) return;
    onSave({ ...memo, text: text.trim(), images: imgs.map(s => s.id!) });
    onClose();
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

  return (
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) save(); }}>
      <div className="sheet" style={{ maxWidth: 600 }} onMouseDown={e => e.stopPropagation()}>
        {imgs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '16px 16px 0' }}>
            {imgs.map(s => (
              <div key={s.preview} style={{ position: 'relative', width: 88, height: 88 }}>
                <img
                  src={s.preview}
                  alt=""
                  style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)', display: 'block' }}
                />
                {!s.id && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 8,
                    background: 'color-mix(in oklab, var(--surface) 60%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
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
            <button className="iconbtn" title="画像を追加" onClick={() => fileRef.current?.click()}
              style={{ color: imgs.length ? 'var(--accent-ink)' : undefined }}>
              <Icon name="image" size={18} />
            </button>
            <button className="iconbtn" title="投稿" onClick={() => onPost(memo)}><Icon name="send" size={18} /></button>
            <button className="iconbtn" title="アーカイブ" onClick={() => { onArchive(memo); onClose(); }}><Icon name="archive" size={18} /></button>
          </div>
          <button className="btn btn-primary" style={{ height: 38 }} onClick={save} disabled={uploading}>
            {uploading ? 'アップロード中…' : '完了'}
          </button>
        </div>
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
