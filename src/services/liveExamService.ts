import { rtdb } from '../firebase';
import { ref, set, onValue, off, remove, get } from 'firebase/database';
import { Question } from '../types';

export interface LiveAnswer {
  selected: any;          // 0|1|2|3 for MC, string for short, object for TF
  selectedLabel: string;  // 'A'/'B'/'C'/'D' / text / 'Đ/S'
  isCorrect: boolean;
  type: string;
  timestamp: number;
}

export interface LiveStudentStatus {
  sessionKey: string;
  name: string;
  className: string;
  startTime: number;
  lastActivity: number;
  score: number;
  progress: number;
  isFinished: boolean;
  answers: Record<number, LiveAnswer>;
}

const LABEL_MAP = ['A', 'B', 'C', 'D'];

function getIsCorrect(q: Question, answer: any): boolean {
  if (answer === undefined || answer === null) return false;
  if (q.type === 'multiple_choice') return answer === q.correctAnswerIndex;
  if (q.type === 'short_answer') return answer?.toString().trim().toLowerCase() === q.correctAnswer?.toString().toLowerCase();
  if (q.type === 'true_false') return q.statements?.every((s: any) => answer[s.id] === s.isTrue) ?? false;
  return false;
}

function getLabel(q: Question, answer: any): string {
  if (answer === undefined || answer === null) return '—';
  if (q.type === 'multiple_choice') return LABEL_MAP[answer] ?? '?';
  if (q.type === 'short_answer') return String(answer).slice(0, 8);
  if (q.type === 'true_false') return 'Đ/S';
  return '?';
}

export const liveExamService = {

  // ─── Student: join session when exam loads ────────────────────────────────

  async joinSession(examId: string, sessionKey: string, studentInfo: { name: string; className: string }) {
    if (!examId || !sessionKey) return;
    try {
      await set(ref(rtdb, `live_sessions/${examId}/${sessionKey}/info`), {
        sessionKey,
        name: studentInfo.name,
        className: studentInfo.className,
        startTime: Date.now(),
        lastActivity: Date.now(),
        score: 0,
        progress: 0,
        isFinished: false,
      });
    } catch (e) {
      console.warn('liveExamService.joinSession failed:', e);
    }
  },

  // ─── Student: report each answer as they select it ────────────────────────

  async reportAnswer(
    examId: string,
    sessionKey: string,
    qIdx: number,
    question: Question,
    answer: any,
    progress: number,
    score: number
  ) {
    if (!examId || !sessionKey) return;
    try {
      const isCorrect = getIsCorrect(question, answer);
      const label = getLabel(question, answer);
      await set(ref(rtdb, `live_sessions/${examId}/${sessionKey}/answers/${qIdx}`), {
        selected: answer,
        selectedLabel: label,
        isCorrect,
        type: question.type,
        timestamp: Date.now(),
      });
      // Update summary info
      await set(ref(rtdb, `live_sessions/${examId}/${sessionKey}/info`), {
        sessionKey,
        name: (await get(ref(rtdb, `live_sessions/${examId}/${sessionKey}/info/name`))).val() || '',
        className: (await get(ref(rtdb, `live_sessions/${examId}/${sessionKey}/info/className`))).val() || '',
        startTime: (await get(ref(rtdb, `live_sessions/${examId}/${sessionKey}/info/startTime`))).val() || Date.now(),
        lastActivity: Date.now(),
        score,
        progress,
        isFinished: false,
      });
    } catch (e) {
      console.warn('liveExamService.reportAnswer failed:', e);
    }
  },

  // ─── Student: mark as finished ────────────────────────────────────────────

  async finishSession(examId: string, sessionKey: string, score: number, totalQ: number) {
    if (!examId || !sessionKey) return;
    try {
      const infoRef = ref(rtdb, `live_sessions/${examId}/${sessionKey}/info`);
      const snap = await get(infoRef);
      const existing = snap.val() || {};
      await set(infoRef, {
        ...existing,
        lastActivity: Date.now(),
        score,
        progress: totalQ,
        isFinished: true,
      });
    } catch (e) {
      console.warn('liveExamService.finishSession failed:', e);
    }
  },

  // ─── Teacher: subscribe to all students in a live exam ───────────────────

  subscribeToLiveSessions(
    examId: string,
    callback: (students: LiveStudentStatus[]) => void
  ): () => void {
    const sessionsRef = ref(rtdb, `live_sessions/${examId}`);
    const handler = (snap: any) => {
      if (!snap.exists()) { callback([]); return; }
      const students: LiveStudentStatus[] = [];
      snap.forEach((child: any) => {
        const data = child.val();
        if (!data?.info) return;
        students.push({
          sessionKey: child.key,
          name: data.info.name || child.key,
          className: data.info.className || '',
          startTime: data.info.startTime || 0,
          lastActivity: data.info.lastActivity || 0,
          score: data.info.score || 0,
          progress: data.info.progress || 0,
          isFinished: data.info.isFinished || false,
          answers: data.answers || {},
        });
      });
      students.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      callback(students);
    };
    onValue(sessionsRef, handler);
    return () => off(sessionsRef, 'value', handler);
  },

  // ─── Teacher: clear a live session ───────────────────────────────────────

  async clearSession(examId: string) {
    try { await remove(ref(rtdb, `live_sessions/${examId}`)); } catch {}
  },

  makeSessionKey(name: string, className: string): string {
    return `${className}__${name}`.replace(/[.#$[\]/\s]/g, '_').slice(0, 100);
  },
};
