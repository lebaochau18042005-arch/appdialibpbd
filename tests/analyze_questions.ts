import { questions } from '../src/data.ts';

function inspectQuestionsWithLesson(oldLesson: string) {
  console.log(`\n=== QUESTIONS WITH LESSON: "${oldLesson}" ===`);
  const matched = questions.filter(q => q.lesson === oldLesson);
  matched.slice(0, 10).forEach(q => {
    console.log(`- [${q.id}] (${q.topic}): ${q.text.slice(0, 80)}...`);
  });
}

inspectQuestionsWithLesson('Đặc điểm chung của tự nhiên');
inspectQuestionsWithLesson('Dân số, lao động và việc làm');
inspectQuestionsWithLesson('Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản');
inspectQuestionsWithLesson('Vấn đề phát triển công nghiệp');
inspectQuestionsWithLesson('Thiên tai và biện pháp phòng chống');
