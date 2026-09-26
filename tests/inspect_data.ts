import { lessons, topics, questions } from '../src/data.ts';

console.log('--- QUESTIONS PER LESSON ---');
const lessonCounts: Record<string, number> = {};
const topicCounts: Record<string, number> = {};

questions.forEach(q => {
  const l = q.lesson || 'CHƯA_CÓ_BÀI';
  lessonCounts[l] = (lessonCounts[l] || 0) + 1;
  const t = q.topic || 'CHƯA_CÓ_CHỦ_ĐỀ';
  topicCounts[t] = (topicCounts[t] || 0) + 1;
});

Object.entries(lessonCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([l, c], i) => {
    console.log(`${i + 1}. [${c} câu] ${l}`);
  });

console.log('\n--- QUESTIONS PER TOPIC ---');
Object.entries(topicCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([t, c], i) => {
    console.log(`${i + 1}. [${c} câu] ${t}`);
  });
