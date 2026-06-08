interface Props { name: string; size?: number; stroke?: number }

export function Icon({ name, size = 20, stroke = 1.7 }: Props) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<string, React.ReactNode> = {
    search:  <g {...p}><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></g>,
    close:   <g {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></g>,
    plus:    <g {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    more:    <g fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></g>,
    image:   <g {...p}><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M3.5 17l4.8-4.6a2 2 0 0 1 2.7-.1L20.5 20" /></g>,
    shuffle: <g {...p}><path d="M3 16h4l3-3M3 8h4l9 9h5M16 17l3 3M16 7l3-3" /><path d="M14 7h5M19 7l-2.5-2.5M19 7l-2.5 2.5M19 17l-2.5-2.5M19 17l-2.5 2.5" /></g>,
    calendar:<g {...p}><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><line x1="3.5" y1="9.5" x2="20.5" y2="9.5" /><line x1="8" y1="3" x2="8" y2="6.5" /><line x1="16" y1="3" x2="16" y2="6.5" /></g>,
    trash:   <g {...p}><path d="M4 7h16" /><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" /><path d="M6 7l1 13.2A1.8 1.8 0 0 0 8.8 22h6.4a1.8 1.8 0 0 0 1.8-1.8L18 7" /></g>,
    edit:    <g {...p}><path d="M4 20h4L19 9a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z" /><line x1="13.5" y1="6.5" x2="17.5" y2="10.5" /></g>,
    send:    <g {...p}><path d="M21 4L11 14" /><path d="M21 4l-6.5 17-3.5-7.5L3.5 10 21 4z" /></g>,
    check:   <g {...p}><path d="M5 12.5l4.5 4.5L19 7" /></g>,
    settings:<g {...p}><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2L5.6 5.6" /></g>,
    repost:  <g {...p}><path d="M4 8.5l3-3 3 3" /><path d="M7 5.5V14a2 2 0 0 0 2 2h7" /><path d="M20 15.5l-3 3-3-3" /><path d="M17 18.5V10a2 2 0 0 0-2-2H8" /></g>,
    heart:   <g {...p}><path d="M12 20s-7-4.6-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7-2.5C19 11 12 20 12 20z" /></g>,
    logout:  <g {...p}><path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" /><path d="M9 12h11M20 12l-3-3M20 12l-3 3" /></g>,
    dice:    <g {...p}><rect x="4" y="4" width="16" height="16" rx="3.5" /><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></g>,
    lock:    <g {...p}><rect x="5" y="11" width="14" height="9" rx="2.2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
    user:    <g {...p}><circle cx="12" cy="8" r="3.6" /><path d="M5 20a7 7 0 0 1 14 0" /></g>,
    archive: <g {...p}><rect x="3.5" y="4" width="17" height="4" rx="1" /><path d="M5 8v10.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V8" /><path d="M10 12h4" /></g>,
    restore: <g {...p}><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" /><path d="M3 4.5V9h4.5" /></g>,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ display: 'block' }}>
      {paths[name] ?? null}
    </svg>
  );
}
