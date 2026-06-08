import { useState } from 'react';
import { Icon } from './ui/Icon';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useEscape } from '../hooks/useEscape';
import { fmtDate } from '../types';
import type { Memo } from '../types';

interface Props {
  archived: Memo[];
  onRestore: (m: Memo) => void;
  onPurge: (m: Memo) => void;
  onPurgeAll: () => void;
  onClose: () => void;
}

type ConfirmState = { kind: 'one'; memo: Memo } | { kind: 'all' } | null;

export function ArchiveModal({ archived, onRestore, onPurge, onPurgeAll, onClose }: Props) {
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  useEscape(onClose);

  return (
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', maxHeight: '84vh' }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--ink-2)', display: 'flex' }}><Icon name="archive" size={20} /></span>
            <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>アーカイブ</h2>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{archived.length} 件</span>
          </div>
          <button className="iconbtn" onClick={onClose} style={{ width: 32, height: 32 }}><Icon name="close" size={17} /></button>
        </div>
        <div className="hr" />

        <div style={{ overflow: 'auto', padding: archived.length ? '8px 12px' : 0 }}>
          {!archived.length ? (
            <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--ink-3)' }}>
              <div style={{ display: 'inline-flex', marginBottom: 12, opacity: .45 }}><Icon name="archive" size={32} stroke={1.4} /></div>
              <p style={{ fontSize: 14, margin: 0 }}>アーカイブは空です</p>
              <p style={{ fontSize: 12.5, margin: '6px 0 0', color: 'var(--ink-3)' }}>一覧から外したメモはここに保管されます</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {archived.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 10px', borderRadius: 10, border: '1px solid var(--line)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink)',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{m.text}</p>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{fmtDate(m.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flex: '0 0 auto' }}>
                    <button className="pill" style={{ height: 32 }} onClick={() => onRestore(m)}>
                      <Icon name="restore" size={14} /> 元に戻す
                    </button>
                    <button className="iconbtn" style={{ width: 32, height: 32 }} title="完全に削除"
                      onClick={() => setConfirm({ kind: 'one', memo: m })}><Icon name="trash" size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {archived.length > 0 && (
          <>
            <div className="hr" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>完全に削除すると元に戻せません</span>
              <button className="btn btn-ghost" style={{ height: 36, color: 'oklch(0.55 0.16 28)' }} onClick={() => setConfirm({ kind: 'all' })}>
                <Icon name="trash" size={16} /> アーカイブを空にする
              </button>
            </div>
          </>
        )}
      </div>

      {confirm?.kind === 'one' && (
        <ConfirmDialog
          title="このメモを完全に削除しますか？"
          message="この操作は取り消せません。メモは復元できなくなります。"
          confirmLabel="完全に削除" onClose={() => setConfirm(null)}
          onConfirm={() => onPurge(confirm.memo)} />
      )}
      {confirm?.kind === 'all' && (
        <ConfirmDialog
          title="アーカイブを空にしますか？"
          message={`${archived.length} 件のメモをすべて完全に削除します。この操作は取り消せません。`}
          confirmLabel="すべて完全に削除" onClose={() => setConfirm(null)}
          onConfirm={onPurgeAll} />
      )}
    </div>
  );
}
