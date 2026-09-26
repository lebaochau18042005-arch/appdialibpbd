import { Question, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion } from '../types';

/**
 * Fisher-Yates shuffle: Trả về một mảng mới đã được xáo trộn ngẫu nhiên
 */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Xáo trộn phương án lựa chọn A, B, C, D của câu hỏi trắc nghiệm
 * và cập nhật lại correctAnswerIndex tương ứng, đảm bảo đáp án đúng luôn chuẩn xác 100%.
 */
export function shuffleMultipleChoiceOptions(q: MultipleChoiceQuestion): MultipleChoiceQuestion {
  if (!q.options || q.options.length <= 1) return { ...q };

  // Đính kèm chỉ số ban đầu vào từng phương án
  const indexedOptions = q.options.map((opt, idx) => ({
    text: opt,
    isOriginalCorrect: idx === q.correctAnswerIndex,
  }));

  // Xáo trộn mảng phương án
  const shuffledIndexed = shuffleArray(indexedOptions);

  // Tìm vị trí mới của phương án đúng ban đầu
  const newCorrectAnswerIndex = shuffledIndexed.findIndex(item => item.isOriginalCorrect);

  return {
    ...q,
    options: shuffledIndexed.map(item => item.text),
    correctAnswerIndex: newCorrectAnswerIndex >= 0 ? newCorrectAnswerIndex : q.correctAnswerIndex,
  };
}

/**
 * Xáo trộn 4 mệnh đề statements a, b, c, d của câu hỏi Đúng/Sai (Phần II).
 * Giữ nguyên thuộc tính `id`, `text`, `isTrue` để logic chấm điểm dựa trên stmt.id không bị ảnh hưởng.
 */
export function shuffleTrueFalseStatements(q: TrueFalseQuestion): TrueFalseQuestion {
  if (!q.statements || q.statements.length <= 1) return { ...q };
  return {
    ...q,
    statements: shuffleArray(q.statements),
  };
}

/**
 * Xáo trộn đề thi theo từng dạng thức:
 * 1. Phần I (multiple_choice):
 *    - Xáo trộn thứ tự các câu hỏi trắc nghiệm
 *    - Xáo trộn các phương án A, B, C, D trong mỗi câu hỏi
 * 2. Phần II (true_false):
 *    - Xáo trộn thứ tự các câu hỏi Đúng / Sai
 *    - Xáo trộn 4 mệnh đề a, b, c, d trong mỗi câu hỏi
 * 3. Phần III (short_answer):
 *    - Xáo trộn thứ tự các câu hỏi trả lời ngắn
 *
 * Kết quả: Đề thi giữ nguyên cấu trúc chuẩn 3 phần (Phần I -> Phần II -> Phần III),
 * vị trí các câu hỏi và các phương án được xáo trộn độc lập trong từng phần,
 * và điểm số/đáp án luôn bảo toàn chính xác 100%.
 */
export function shuffleExamByFormat(questions: Question[]): Question[] {
  if (!questions || questions.length === 0) return [];

  // Tách câu hỏi theo 3 dạng thức
  const mcList: MultipleChoiceQuestion[] = [];
  const tfList: TrueFalseQuestion[] = [];
  const saList: ShortAnswerQuestion[] = [];
  const otherList: Question[] = [];

  questions.forEach(q => {
    if (q.type === 'multiple_choice') {
      mcList.push(q as MultipleChoiceQuestion);
    } else if (q.type === 'true_false') {
      tfList.push(q as TrueFalseQuestion);
    } else if (q.type === 'short_answer') {
      saList.push(q as ShortAnswerQuestion);
    } else {
      otherList.push(q);
    }
  });

  // 1. Phần I: Xáo trộn câu hỏi và các phương án A, B, C, D
  const shuffledMc = shuffleArray(mcList).map(q => shuffleMultipleChoiceOptions(q));

  // 2. Phần II: Xáo trộn câu hỏi và 4 mệnh đề a, b, c, d
  const shuffledTf = shuffleArray(tfList).map(q => shuffleTrueFalseStatements(q));

  // 3. Phần III: Xáo trộn câu hỏi trả lời ngắn
  const shuffledSa = shuffleArray(saList);

  // Ghép lại theo đúng trật tự chuẩn: Phần I -> Phần II -> Phần III
  return [...shuffledMc, ...shuffledTf, ...shuffledSa, ...otherList];
}
