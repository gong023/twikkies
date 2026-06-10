export interface Memo {
  id: string;
  text: string;
  images: string[];
  stats?: { reposts: number; likes: number };
  archived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
}

export type PeriodKey = 'yesterday' | 'month-ago' | 'last-year';

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export function genXStats(): { reposts: number; likes: number } {
  return { reposts: Math.floor(Math.random() * 12), likes: Math.floor(Math.random() * 60) + 3 };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function periodRange(key: PeriodKey): { from: number; to: number } | null {
  const DAY = 86_400_000;
  const now = Date.now();
  const startOfDay = (ts: number) => { const x = new Date(ts); x.setHours(0, 0, 0, 0); return x.getTime(); };
  const todayStart = startOfDay(now);
  switch (key) {
    case 'yesterday':
      return { from: todayStart - DAY, to: todayStart };
    case 'month-ago': {
      const m = new Date(now); m.setDate(1); m.setHours(0, 0, 0, 0);
      const prev = new Date(m); prev.setMonth(prev.getMonth() - 1);
      return { from: prev.getTime(), to: m.getTime() };
    }
    case 'last-year': {
      const y = new Date(now); y.setMonth(0, 1); y.setHours(0, 0, 0, 0);
      const prev = new Date(y); prev.setFullYear(prev.getFullYear() - 1);
      return { from: prev.getTime(), to: y.getTime() };
    }
  }
}

export function inRange(ts: number, range: { from: number; to: number } | null): boolean {
  if (!range) return true;
  return ts >= range.from && ts < range.to;
}
