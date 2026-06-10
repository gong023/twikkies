import type { Memo, User } from './types';

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
    addSession: (username: string, password: string) =>
      req<User>('/auth/add-session', { method: 'POST', body: JSON.stringify({ username, password }) }),
    sessions: () => req<User[]>('/auth/sessions'),
    switch: (username: string) =>
      req<User>('/auth/switch', { method: 'POST', body: JSON.stringify({ username }) }),
    logout: () => req<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  },
  memos: {
    list: () => req<Memo[]>('/memos'),
    archived: () => req<Memo[]>('/memos/archived'),
    create: (data: { text: string; images?: string[]; stats?: Memo['stats'] }) =>
      req<Memo>('/memos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { text: string; images?: string[]; stats?: Memo['stats'] }) =>
      req<Memo>(`/memos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    archive: (id: string) => req<Memo>(`/memos/${id}/archive`, { method: 'POST' }),
    restore: (id: string) => req<Memo>(`/memos/${id}/restore`, { method: 'POST' }),
    delete: (id: string) => req<{ ok: boolean }>(`/memos/${id}`, { method: 'DELETE' }),
  },
  uploads: {
    upload: async (file: File): Promise<{ id: string }> => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<{ id: string }>;
    },
  },
};
