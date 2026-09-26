import { Question, QuizAttempt } from '../types';
import { isShortAnswerCorrect } from './scoreUtils';

export function answerIsCorrect(question: Question, answer: any): boolean {
  if (answer === undefined || answer === null || answer === '') return false;
  if (question.type === 'multiple_choice') return answer === question.correctAnswerIndex;
  if (question.type === 'true_false') return question.statements.every(s => answer[s.id] === s.isTrue);
  return isShortAnswerCorrect(String(answer), question.correctAnswer);
}

// Include content and answer keys: AI questions can reuse IDs across unrelated exams.
export function questionKey(question: Question): string {
  return JSON.stringify([question.type, question.text, question.context, question.imageUrl,
    question.type === 'multiple_choice' ? [question.options, question.correctAnswerIndex] :
    question.type === 'true_false' ? question.statements : question.correctAnswer]);
}

export function topicReport(attempts: QuizAttempt[]) {
  const rows = new Map<string, { topic: string; total: number; correct: number; students: Set<string> }>();
  let coveredAttempts = 0;
  for (const attempt of attempts) {
    let covered = false;
    for (const answer of Object.values(attempt.answers || {})) {
      if (!answer || typeof answer !== 'object' || typeof answer.isCorrect !== 'boolean' || typeof answer.topic !== 'string' || !answer.topic.trim()) continue;
      covered = true;
      const topic = answer.topic.trim();
      const row = rows.get(topic) || { topic, total: 0, correct: 0, students: new Set<string>() };
      row.total++;
      row.correct += Number(answer.isCorrect);
      const uid = attempt.userId;
      row.students.add(uid && !uid.includes('anonymous') && !uid.startsWith('guest_') ? uid :
        JSON.stringify([attempt.userName?.trim().toLowerCase(), attempt.className?.trim().toLowerCase()]));
      rows.set(topic, row);
    }
    if (covered) coveredAttempts++;
  }
  return { coveredAttempts, rows: [...rows.values()].map(r => ({ ...r, students: r.students.size, percentage: Math.round(r.correct / r.total * 100) })).sort((a, b) => a.percentage - b.percentage || b.total - a.total) };
}
