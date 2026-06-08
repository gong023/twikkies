interface Props { platform: string; size?: number }

export function PlatMark({ platform, size = 22 }: Props) {
  const isX = platform === 'x';
  return (
    <span style={{
      width: size, height: size, borderRadius: isX ? 6 : '50%',
      background: isX ? 'oklch(0.27 0.006 262)' : 'oklch(0.62 0.13 248)',
      color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.56, flex: '0 0 auto', lineHeight: 1,
      fontFamily: 'var(--font-mono)',
    }}>{isX ? 'X' : 'B'}</span>
  );
}
