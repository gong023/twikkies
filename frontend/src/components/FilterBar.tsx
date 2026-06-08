import { useState, useRef, useEffect } from 'react';
import { Icon } from './ui/Icon';
import type { PeriodKey } from '../types';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'yesterday', label: '昨日' },
  { key: 'month-ago', label: '1ヶ月前' },
  { key: 'last-year', label: '去年' },
];

interface Props {
  period: PeriodKey | null;
  onPeriod: (k: PeriodKey | null) => void;
  custom: { from: string; to: string } | null;
  onCustom: (r: { from: string; to: string } | null) => void;
  random: boolean;
  onRandom: () => void;
  onReshuffle: () => void;
}

export function FilterBar({ period, onPeriod, custom, onCustom, random, onRandom, onReshuffle }: Props) {
  const [showRange, setShowRange] = useState(false);

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 24px 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', marginRight: 2 }}>
          <Icon name="calendar" size={16} />
          <span className="mono" style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase' }}>期間</span>
        </span>

        {PERIODS.map(p => (
          <button key={p.key} className={`pill is-accent${period === p.key && !custom ? ' is-active' : ''}`}
            onClick={() => onPeriod(period === p.key ? null : p.key)}>
            {p.label}
          </button>
        ))}

        <div style={{ position: 'relative' }}>
          <button className={`pill${custom ? ' is-active' : ''}`} onClick={() => setShowRange(v => !v)}>
            {custom ? `${custom.from || '…'} → ${custom.to || '…'}` : '期間を指定'}
          </button>
          {showRange && (
            <RangePicker value={custom}
              onClose={() => setShowRange(false)}
              onApply={r => { onCustom(r); setShowRange(false); }}
              onClear={() => { onCustom(null); setShowRange(false); }}
            />
          )}
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--line-2)', margin: '0 4px' }} />

        <button className={`pill is-accent${random ? ' is-active' : ''}`} onClick={onRandom}>
          <Icon name="dice" size={15} /> ランダム表示
        </button>
        {random && (
          <button className="pill" onClick={onReshuffle}>
            <Icon name="shuffle" size={15} /> 引き直す
          </button>
        )}
      </div>
    </div>
  );
}

interface RangeProps {
  value: { from: string; to: string } | null;
  onApply: (r: { from: string; to: string }) => void;
  onClear: () => void;
  onClose: () => void;
}

function RangePicker({ value, onApply, onClear, onClose }: RangeProps) {
  const [from, setFrom] = useState(value?.from ?? '');
  const [to, setTo] = useState(value?.to ?? '');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 42, left: 0, zIndex: 40, width: 248,
      background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 12,
      boxShadow: 'var(--shadow-pop)', padding: 14, animation: 'pop .14s ease',
    }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.04em' }}>開始</label>
      <input type="date" className="field" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} style={{ marginBottom: 12, padding: '8px 10px' }} />
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.04em' }}>終了</label>
      <input type="date" className="field" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} style={{ marginBottom: 14, padding: '8px 10px' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" style={{ height: 34, flex: 1 }} onClick={onClear}>クリア</button>
        <button className="btn btn-primary" style={{ height: 34, flex: 1 }} disabled={!from && !to} onClick={() => onApply({ from, to })}>適用</button>
      </div>
    </div>
  );
}
