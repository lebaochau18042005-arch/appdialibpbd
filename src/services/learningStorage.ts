import { Question } from '../types';
import { answerIsCorrect, questionKey } from '../utils/learning';

const PREFIX = 'geo_learning_v1:';
export function learningOwner(uid?: string): string {
  if (uid) return `user:${uid}`;
  try {
    const p = JSON.parse(localStorage.getItem('examGeoProfile') || '{}');
    return `profile:${JSON.stringify([p.name, p.className, p.school].map(v => String(v || '').trim().toLowerCase()))}`;
  } catch { return 'profile:unknown'; }
}
export function readLocal<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(PREFIX + key) || 'null'); } catch { return null; }
}
export function writeLocal(key: string, value: unknown): boolean {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch { return false; }
}
export function removeLocal(key: string): boolean {
  try { localStorage.removeItem(PREFIX + key); return true; } catch { return false; }
}

export interface Draft<T = any> {
  version: 1;
  route: string;
  title: string;
  savedAt: number;
  state: T;
}
export interface DraftState {
  questions: Question[];
  currentIndex: number;
  startTime: number;
}
export function readDraft<T extends DraftState>(owner: string, kind: 'quiz' | 'exam'): Draft<T> | null {
  const d = readLocal<Draft<T>>(`${owner}:draft:${kind}`);
  if (!d || d.version !== 1 || typeof d.route !== 'string' || !d.route.startsWith(kind === 'quiz' ? '/quiz?' : '/exam-room?') || !Number.isFinite(d.savedAt)) return null;
  const s = d.state;
  if (!s || !Array.isArray(s.questions) || !s.questions.length || !Number.isFinite(s.startTime) || s.startTime <= 0 || !Number.isInteger(s.currentIndex) || s.currentIndex < 0 || s.currentIndex >= s.questions.length) return null;
  if (!s.questions.every(q => q && typeof q.id === 'string' && typeof q.text === 'string' &&
    (q.type === 'multiple_choice' ? Array.isArray(q.options) && Number.isInteger(q.correctAnswerIndex) :
     q.type === 'true_false' ? Array.isArray(q.statements) && q.statements.every(st => st && typeof st.id === 'string' && typeof st.isTrue === 'boolean') :
     q.type === 'short_answer' && ['string', 'number'].includes(typeof q.correctAnswer)))) return null;
  const state = s as T & Record<string, any>;
  if (kind === 'quiz' && ((state.score !== undefined && !Number.isFinite(state.score)) ||
      (state.saAnswer !== undefined && typeof state.saAnswer !== 'string'))) return null;
  if (Date.now() - d.savedAt > 30 * 86400000) return null;
  return d;
}
export function remainingSeconds(startTime: number, now = Date.now()): number {
  return Math.max(0, Math.min(3000, Math.ceil((startTime + 3000000 - now) / 1000)));
}

export interface Mistake {
  key: string;
  question: Question;
  userAnswer: any;
  lastSeen: string;
  wrongCount: number;
  resolved: boolean;
}
export function getMistakes(owner: string): Mistake[] {
  const data = readLocal<Mistake[]>(`${owner}:mistakes`);
  return Array.isArray(data) ? data.filter(m => m && typeof m.key === 'string' && m.question?.text) : [];
}
export function recordAnswers(owner: string, entries: { question: Question; answer: any }[]): boolean {
  const records = new Map(getMistakes(owner).map(m => [m.key, m]));
  for (const { question, answer } of entries) {
    const key = questionKey(question);
    const previous = records.get(key);
    const correct = answerIsCorrect(question, answer);
    if (correct && !previous) continue;
    records.set(key, { key, question, userAnswer: answer ?? null, lastSeen: new Date().toISOString(),
      wrongCount: (previous?.wrongCount || 0) + Number(!correct), resolved: correct });
  }
  const recent = [...records.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)).slice(0, 200);
  return writeLocal(`${owner}:mistakes`, recent);
}
