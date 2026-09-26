import { questions, lessons, topics, KNTT_PARTS, KNTT_LESSONS } from '../src/data.ts';

console.log('--- KNTT DATA INTEGRITY TEST ---');
console.log('Total questions:', questions.length);
console.log('Total KNTT lessons:', lessons.length);
console.log('Total KNTT parts:', KNTT_PARTS.length);
console.log('Total topics:', topics.length);

// Check sample questions
console.log('\nSample question 1:');
console.log('ID:', questions[0].id);
console.log('Text:', questions[0].text);
console.log('Lesson:', questions[0].lesson);
console.log('Topic:', questions[0].topic);

// Ensure every single question has a valid KNTT lesson
let validCount = 0;
questions.forEach(q => {
  if (KNTT_LESSONS.includes(q.lesson)) {
    validCount++;
  } else {
    console.error('Question with invalid lesson:', q.id, q.lesson);
  }
});

console.log(`\nValid questions matching KNTT: ${validCount}/${questions.length}`);
if (validCount === questions.length) {
  console.log('✅ 100% of questions are mapped to official KNTT lessons!');
}
