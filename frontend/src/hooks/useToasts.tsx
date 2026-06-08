import { useState, useCallback, ReactNode } from 'react';

interface Toast { id: string; msg: string }

export function useToasts(): { pushToast: (msg: string) => void; toastNode: ReactNode } {
  const [items, setItems] = useState<Toast[]>([]);

  const pushToast = useCallback((msg: string) => {
    const id = Math.random().toString(36).slice(2);
    setItems(l => [...l, { id, msg }]);
    setTimeout(() => setItems(l => l.filter(t => t.id !== id)), 2600);
  }, []);

  const toastNode = (
    <div className="toast-wrap">
      {items.map(t => (
        <div className="toast" key={t.id}><span className="dot" />{t.msg}</div>
      ))}
    </div>
  );

  return { pushToast, toastNode };
}
