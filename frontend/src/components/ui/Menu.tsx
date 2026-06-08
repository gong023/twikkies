import { useEffect, useRef } from 'react';
import { useEscape } from '../../hooks/useEscape';
import { Icon } from './Icon';

export interface MenuItem {
  label?: string;
  icon?: string;
  danger?: boolean;
  onClick?: () => void;
  sep?: boolean;
}

interface Props {
  items: MenuItem[];
  onClose: () => void;
  style?: React.CSSProperties;
}

export function Menu({ items, onClose, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEscape(onClose);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} role="menu" style={{
      position: 'absolute', zIndex: 40, minWidth: 168,
      background: 'var(--surface)', border: '1px solid var(--line-2)',
      borderRadius: 12, boxShadow: 'var(--shadow-pop)', padding: 6,
      animation: 'pop .14s ease', ...style,
    }}>
      {items.map((it, i) => it.sep ? (
        <div key={i} className="hr" style={{ margin: '5px 4px' }} />
      ) : (
        <button key={i} role="menuitem"
          onClick={e => { e.stopPropagation(); onClose(); it.onClick?.(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '9px 11px', border: 'none', background: 'transparent',
            borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
            color: it.danger ? 'oklch(0.55 0.15 28)' : 'var(--ink)', textAlign: 'left',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = it.danger ? 'oklch(0.95 0.04 28)' : 'oklch(0.95 0.004 262)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {it.icon && (
            <span style={{ color: it.danger ? 'oklch(0.55 0.15 28)' : 'var(--ink-3)', display: 'flex' }}>
              <Icon name={it.icon} size={17} />
            </span>
          )}
          {it.label}
        </button>
      ))}
    </div>
  );
}
