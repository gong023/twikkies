import { useEscape } from '../../hooks/useEscape';

interface Props {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = '削除', cancelLabel = 'キャンセル', danger = true, onConfirm, onClose }: Props) {
  useEscape(onClose);
  return (
    <div className="scrim" style={{ alignItems: 'center', padding: 20 }} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" style={{ maxWidth: 384, padding: '22px 22px 18px' }} onMouseDown={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 8px', fontSize: 16.5, fontWeight: 700 }}>{title}</h2>
        {message && <p style={{ margin: '0 0 20px', fontSize: 13.5, lineHeight: 1.75, color: 'var(--ink-2)' }}>{message}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" style={{ height: 38 }} onClick={onClose}>{cancelLabel}</button>
          <button className="btn" style={{ height: 38, background: danger ? 'oklch(0.55 0.17 28)' : 'var(--ink)', color: '#fff' }}
            onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
