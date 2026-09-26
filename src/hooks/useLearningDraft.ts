import { useRef, useState } from 'react';
import { DraftState, readDraft, removeLocal, writeLocal } from '../services/learningStorage';

export function useLearningDraft<T extends DraftState>(owner: string, kind: 'quiz' | 'exam', route: string) {
  const [initial] = useState(() => {
    const draft = readDraft<T>(owner, kind);
    return draft?.route === route ? draft.state : null;
  });
  const [error, setError] = useState('');
  const key = `${owner}:draft:${kind}`;
  const stopped = useRef(false);
  const lastSaved = useRef('');
  function persist(state: T, title: string) {
    if (stopped.current || !state.questions.length || !state.startTime) return;
    const payload = JSON.stringify(state);
    if (payload === lastSaved.current) return;
    const ok = writeLocal(key, { version: 1, route, title, savedAt: Date.now(), state });
    if (ok) lastSaved.current = payload;
    setError(ok ? '' : 'Không lưu được bản nháp trên trình duyệt. Hãy giữ trang này mở cho đến khi hoàn thành.');
  }
  function clear() {
    stopped.current = true;
    if (!removeLocal(key)) setError('Không xóa được bản nháp. Hãy kiểm tra quyền lưu trữ của trình duyệt.');
  }
  return { initial, error, persist, clear };
}
