interface Props { size?: number }

export function Logo({ size = 28 }: Props) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
      <span style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 7,
          background: 'var(--accent)',
          boxShadow: 'inset 0 0 0 1px oklch(0.74 0.13 76 / .6)',
        }} />
        <span style={{
          position: 'absolute', right: 0, bottom: 0, width: '42%', height: '42%',
          background: 'linear-gradient(135deg, transparent 50%, var(--bg) 50%)',
          borderBottomRightRadius: 7,
        }} />
      </span>
      <span style={{ fontWeight: 700, fontSize: size * 0.72, letterSpacing: '-.01em', color: 'var(--ink)' }}>twikkies</span>
    </span>
  );
}
