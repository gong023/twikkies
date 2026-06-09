import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from './api';
import { Memo, User, PeriodKey, periodRange, inRange, shuffle, genXStats } from './types';
import { useToasts } from './hooks/useToasts';
import { Login } from './components/Login';
import { TopBar } from './components/TopBar';
import { FilterBar } from './components/FilterBar';
import { Composer } from './components/Composer';
import { MemoGrid } from './components/MemoCard';
import { EditorModal } from './components/EditorModal';
import { PostDialog } from './components/PostDialog';
import { ArchiveModal } from './components/ArchiveModal';
import { AddAccountModal } from './components/AddAccountModal';

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [sessions, setSessions] = useState<User[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [archived, setArchived] = useState<Memo[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<PeriodKey | null>(null);
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null);
  const [random, setRandom] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const [editing, setEditing] = useState<Memo | null>(null);
  const [posting, setPosting] = useState<Memo | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const { pushToast, toastNode } = useToasts();

  const loadData = useCallback(async () => {
    const [memoList, archivedList] = await Promise.all([
      api.memos.list(),
      api.memos.archived(),
    ]);
    setMemos(memoList);
    setArchived(archivedList);
  }, []);

  useEffect(() => {
    api.auth.me()
      .then(u => { setUser(u); loadData(); })
      .catch(() => setUser(null));
    api.auth.sessions().then(setSessions).catch(() => {});
  }, [loadData]);

  const filtered = useMemo(() => {
    let list = memos.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(m => m.text.toLowerCase().includes(q));
    if (custom) {
      const from = custom.from ? new Date(custom.from + 'T00:00:00').getTime() : null;
      const to = custom.to ? new Date(custom.to + 'T23:59:59').getTime() : null;
      list = list.filter(m => {
        const ts = new Date(m.createdAt).getTime();
        return (from == null || ts >= from) && (to == null || ts <= to);
      });
    } else if (period) {
      const range = periodRange(period);
      list = list.filter(m => inRange(new Date(m.createdAt).getTime(), range));
    }
    return list;
  }, [memos, query, period, custom]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const display = useMemo(() => random ? shuffle(filtered) : filtered, [filtered, random, shuffleKey]);

  const filtering = !!(query.trim() || period || custom);

  const create = async (data: { text: string; image?: Memo['image'] }, platforms: string[]) => {
    const postedToX = platforms.includes('x');
    const memo = await api.memos.create({ text: data.text, image: data.image, stats: postedToX ? genXStats() : undefined });
    setMemos(l => [memo, ...l]);
    pushToast(platforms.length ? `メモを追加し、${platforms.length}件に投稿しました` : 'メモを追加しました');
  };

  const saveMemo = async (m: Memo) => {
    const updated = await api.memos.update(m.id, { text: m.text, image: m.image, stats: m.stats });
    setMemos(l => l.map(x => x.id === updated.id ? updated : x));
  };

  const archiveMemo = async (m: Memo) => {
    const updated = await api.memos.archive(m.id);
    setMemos(l => l.filter(x => x.id !== m.id));
    setArchived(l => [updated, ...l]);
    pushToast('アーカイブしました');
  };

  const restoreMemo = async (m: Memo) => {
    const updated = await api.memos.restore(m.id);
    setArchived(l => l.filter(x => x.id !== m.id));
    setMemos(l => [updated, ...l]);
    pushToast('元に戻しました');
  };

  const purgeMemo = async (m: Memo) => {
    await api.memos.delete(m.id);
    setArchived(l => l.filter(x => x.id !== m.id));
    pushToast('完全に削除しました');
  };

  const purgeAllArchived = async () => {
    await Promise.all(archived.map(m => api.memos.delete(m.id)));
    setArchived([]);
    setShowArchive(false);
    pushToast('アーカイブを空にしました');
  };

  const onPosted = async (platforms: string[]) => {
    const postedToX = platforms.includes('x');
    if (postedToX && posting && !posting.stats) {
      const updated = await api.memos.update(posting.id, { text: posting.text, image: posting.image, stats: genXStats() });
      setMemos(l => l.map(x => x.id === updated.id ? updated : x));
    }
    pushToast(`${platforms.length}件に投稿しました`);
  };

  const handleLogin = async (username: string, password: string) => {
    const u = await api.auth.login(username, password);
    setUser(u);
    const [newSessions] = await Promise.all([api.auth.sessions(), loadData()]);
    setSessions(newSessions);
  };

  const handleAddSession = async (username: string, password: string) => {
    await api.auth.addSession(username, password);
    const newSessions = await api.auth.sessions();
    setSessions(newSessions);
  };

  const handleSwitchAccount = async (username: string) => {
    const u = await api.auth.switch(username);
    setUser(u);
    const [newSessions] = await Promise.all([api.auth.sessions(), loadData()]);
    setSessions(newSessions);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    setMemos([]); setArchived([]);
    setSessions([]);
  };

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <><Login onLogin={handleLogin} />{toastNode}</>;
  }

  return (
    <div>
      <TopBar query={query} onQuery={setQuery} userId={user.username}
        archivedCount={archived.length}
        sessions={sessions}
        onSwitch={handleSwitchAccount}
        onAddAccount={() => setShowAddAccount(true)}
        onLogout={handleLogout}
        onShowArchive={() => setShowArchive(true)} />

      <FilterBar
        period={period} onPeriod={k => { setPeriod(k); setCustom(null); }}
        custom={custom} onCustom={r => { setCustom(r); setPeriod(null); }}
        random={random} onRandom={() => { setRandom(v => !v); setShuffleKey(k => k + 1); }}
        onReshuffle={() => setShuffleKey(k => k + 1)}
      />

      {!filtering && !random && <Composer onCreate={create} />}
      {(filtering || random) && <div style={{ height: 14 }} />}

      <MemoGrid memos={display} query={query}
        onOpen={setEditing} onPost={setPosting} onArchive={archiveMemo}
        emptyNote={filtering ? '条件に合うメモはありません' : '最初のメモを書いてみましょう'}
      />

      {editing && (
        <EditorModal memo={memos.find(m => m.id === editing.id) ?? editing}
          onSave={saveMemo} onArchive={archiveMemo}
          onPost={m => { setEditing(null); setPosting(m); }}
          onClose={() => setEditing(null)} />
      )}
      {posting && (
        <PostDialog memo={posting}
          onClose={() => setPosting(null)} onPosted={onPosted} />
      )}
      {showArchive && (
        <ArchiveModal archived={archived}
          onRestore={restoreMemo} onPurge={purgeMemo} onPurgeAll={purgeAllArchived}
          onClose={() => setShowArchive(false)} />
      )}

      {showAddAccount && (
        <AddAccountModal
          onAdd={handleAddSession}
          onClose={() => setShowAddAccount(false)} />
      )}

      {toastNode}
    </div>
  );
}
