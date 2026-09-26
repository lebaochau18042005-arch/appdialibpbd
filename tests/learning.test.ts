import test from 'node:test';
import assert from 'node:assert/strict';
import { answerIsCorrect, questionKey, topicReport } from '../src/utils/learning.ts';
import { getMistakes, learningOwner, readDraft, recordAnswers, remainingSeconds, writeLocal, removeLocal } from '../src/services/learningStorage.ts';
import type { Question, QuizAttempt } from '../src/types.ts';

const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => store.set(k, v),
  removeItem: (k: string) => store.delete(k),
} });
const q: Question = { id: 'ai-1', type: 'multiple_choice', topic: 'Dân cư', text: 'Chọn đáp án', options: ['A', 'B'], correctAnswerIndex: 0 };
const tf: Question = { id: 'tf', type: 'true_false', topic: 'Tự nhiên', text: 'Đúng/sai', statements: [{ id: 'a', text: 'A', isTrue: false }, { id: 'b', text: 'B', isTrue: true }] };

test('wrong answer survives reload, correct review resolves it, regression reopens it', () => {
  store.clear();
  assert.equal(recordAnswers('student-a', [{ question: q, answer: 1 }]), true);
  assert.equal(getMistakes('student-a')[0].wrongCount, 1);
  assert.equal(getMistakes('student-b').length, 0);
  recordAnswers('student-a', [{ question: { ...q, id: 'review_0' }, answer: 0 }]);
  assert.equal(getMistakes('student-a')[0].resolved, true);
  recordAnswers('student-a', [{ question: q, answer: null }]);
  assert.equal(getMistakes('student-a')[0].wrongCount, 2);
  assert.equal(getMistakes('student-a')[0].resolved, false);
});
test('reused AI IDs do not overwrite different questions', () => {
  store.clear();
  recordAnswers('a', [{ question: q, answer: 1 }, { question: { ...q, text: 'Khác' }, answer: 1 }]);
  assert.equal(getMistakes('a').length, 2);
  assert.notEqual(questionKey(q), questionKey({ ...q, correctAnswerIndex: 1 }));
});
test('true/false partial and omitted answers remain wrong; numeric zero is accepted', () => {
  assert.equal(answerIsCorrect(tf, { a: false }), false);
  assert.equal(answerIsCorrect(tf, { a: false, b: true }), true);
  const short: Question = { id: 's', type: 'short_answer', topic: 'Tính toán', text: 'Tính', correctAnswer: '0' };
  assert.equal(answerIsCorrect(short, 0), true);
  assert.equal(answerIsCorrect({ ...short, correctAnswer: '1,5' }, '1.5'), true);
  assert.equal(answerIsCorrect({ ...short, correctAnswer: 12 }, '12abc'), false);
  assert.equal(answerIsCorrect(short, ''), false);
});
test('restoration keeps question order, answers, and original deadline', () => {
  store.clear();
  const start = Date.now() - 20000;
  const state = { questions: [q, tf], currentIndex: 1, startTime: start, answers: { 0: 0, 1: { a: false } } };
  writeLocal('a:draft:exam', { version: 1, route: '/exam-room?examId=test', title: 'Bài thi', savedAt: Date.now(), state });
  assert.deepEqual(readDraft('a', 'exam')?.state, state);
  assert.equal(readDraft('b', 'exam'), null);
  assert.equal(remainingSeconds(start, start + 120000), 2880);
  assert.equal(remainingSeconds(start, start + 4000000), 0);
  removeLocal('a:draft:exam');
  assert.equal(readDraft('a', 'exam'), null);
});
test('corrupt or obsolete drafts do not crash a new session', () => {
  store.clear();
  store.set('geo_learning_v1:a:draft:quiz', 'broken JSON');
  assert.equal(readDraft('a', 'quiz'), null);
  writeLocal('a:draft:quiz', { version: 1, route: '/quiz?mode=topic', savedAt: Date.now(), state: { questions: [q], currentIndex: 5, startTime: Date.now() } });
  assert.equal(readDraft('a', 'quiz'), null);
});
test('guest profiles and signed-in users have separate storage identities', () => {
  store.clear();
  localStorage.setItem('examGeoProfile', JSON.stringify({ name: 'An', className: '12A' }));
  const first = learningOwner();
  localStorage.setItem('examGeoProfile', JSON.stringify({ name: 'An', className: '12B' }));
  assert.notEqual(first, learningOwner());
  assert.equal(learningOwner('account-a'), 'user:account-a');
});
test('topic report ignores legacy answers and counts repeated attempts separately', () => {
  const base = { userId: 'anonymous', userName: 'An', className: '12A', mode: 'topic' };
  const attempts = [
    { ...base, answers: { a: { topic: 'Dân cư', isCorrect: false }, b: { topic: 'Tự nhiên', isCorrect: true } } },
    { ...base, answers: { a: { topic: 'Dân cư', isCorrect: true } } },
    { ...base, answers: { a: 2, b: { userAnswer: 1 }, c: { topic: 'Sai dữ liệu', isCorrect: 'false' } } },
  ] as unknown as QuizAttempt[];
  const report = topicReport(attempts);
  assert.equal(report.coveredAttempts, 2);
  assert.deepEqual(report.rows[0], { topic: 'Dân cư', total: 2, correct: 1, students: 1, percentage: 50 });
});
test('storage quota failure is reported without destroying previous notebook', () => {
  store.clear();
  recordAnswers('a', [{ question: q, answer: 1 }]);
  const setter = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  try {
    assert.equal(recordAnswers('a', [{ question: tf, answer: null }]), false);
    assert.equal(getMistakes('a').length, 1);
  } finally { localStorage.setItem = setter; }
});
