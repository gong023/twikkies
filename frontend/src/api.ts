import type { Memo, SocialAccount, User } from './types';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch('/api' + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    me: () => req<User>('/auth/me'),
    login: (username: string, password: string) =>
      req<User>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    logout: () => req<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  },
  memos: {
    list: () => req<Memo[]>('/memos'),
    archived: () => req<Memo[]>('/memos/archived'),
    create: (data: { text: string; image?: Memo['image']; stats?: Memo['stats'] }) =>
      req<Memo>('/memos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { text: string; image?: Memo['image']; stats?: Memo['stats'] }) =>
      req<Memo>(`/memos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    archive: (id: string) => req<Memo>(`/memos/${id}/archive`, { method: 'POST' }),
    restore: (id: string) => req<Memo>(`/memos/${id}/restore`, { method: 'POST' }),
    delete: (id: string) => req<{ ok: boolean }>(`/memos/${id}`, { method: 'DELETE' }),
  },
  accounts: {
    list: () => req<SocialAccount[]>('/accounts'),
    add: (data: { platform: string; name: string; handle: string }) =>
      req<SocialAccount>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => req<{ ok: boolean }>(`/accounts/${id}`, { method: 'DELETE' }),
  },
};
