import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shuffleArray,
  shuffleMultipleChoiceOptions,
  shuffleTrueFalseStatements,
  shuffleExamByFormat
} from '../src/utils/shuffleUtils.ts';
import type { Question, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion } from '../src/types.ts';

test('shuffleArray preserves length and items', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const shuffled = shuffleArray(original);
  assert.equal(shuffled.length, original.length);
  assert.deepEqual([...shuffled].sort(), [...original].sort());
});

test('shuffleMultipleChoiceOptions preserves correct answer value 100% of the time', () => {
  const mcQuestion: MultipleChoiceQuestion = {
    id: 'mc_test_1',
    type: 'multiple_choice',
    topic: 'Tự nhiên',
    text: 'Thủ đô của Việt Nam là gì?',
    options: ['Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh', 'Cần Thơ'],
    correctAnswerIndex: 1, // 'Hà Nội'
  };

  const originalCorrectText = mcQuestion.options[mcQuestion.correctAnswerIndex]; // 'Hà Nội'

  // Run 100 iterations of shuffling
  for (let i = 0; i < 100; i++) {
    const shuffled = shuffleMultipleChoiceOptions(mcQuestion);
    assert.equal(shuffled.options.length, 4);
    assert.equal(shuffled.options[shuffled.correctAnswerIndex], originalCorrectText);
    assert.ok(shuffled.correctAnswerIndex >= 0 && shuffled.correctAnswerIndex < 4);
  }
});

test('shuffleTrueFalseStatements maintains statement IDs and truth values', () => {
  const tfQuestion: TrueFalseQuestion = {
    id: 'tf_test_1',
    type: 'true_false',
    topic: 'Kinh tế',
    text: 'Đặc điểm ngành công nghiệp nước ta:',
    statements: [
      { id: 's1', text: 'Cơ cấu ngành đa dạng', isTrue: true },
      { id: 's2', text: 'Chỉ phân bố ở miền núi', isTrue: false },
      { id: 's3', text: 'Tỉ trọng công nghiệp chế biến ngày càng tăng', isTrue: true },
      { id: 's4', text: 'Không thu hút được vốn FDI', isTrue: false },
    ],
  };

  const shuffled = shuffleTrueFalseStatements(tfQuestion);
  assert.equal(shuffled.statements.length, 4);

  // Verify all original statements still exist with their original truth values
  const stmtMap = new Map(tfQuestion.statements.map(s => [s.id, s.isTrue]));
  shuffled.statements.forEach(stmt => {
    assert.equal(stmt.isTrue, stmtMap.get(stmt.id));
  });
});

test('shuffleExamByFormat preserves 3-section order (Phần I -> Phần II -> Phần III)', () => {
  const mockQuestions: Question[] = [
    // 3 câu trắc nghiệm (Phần I)
    { id: 'mc1', type: 'multiple_choice', topic: 'TN', text: 'Câu 1', options: ['A1', 'B1', 'C1', 'D1'], correctAnswerIndex: 0 },
    { id: 'mc2', type: 'multiple_choice', topic: 'TN', text: 'Câu 2', options: ['A2', 'B2', 'C2', 'D2'], correctAnswerIndex: 1 },
    { id: 'mc3', type: 'multiple_choice', topic: 'TN', text: 'Câu 3', options: ['A3', 'B3', 'C3', 'D3'], correctAnswerIndex: 2 },
    // 2 câu đúng sai (Phần II)
    { id: 'tf1', type: 'true_false', topic: 'DC', text: 'Câu 4', statements: [{ id: 'a', text: 'a', isTrue: true }] },
    { id: 'tf2', type: 'true_false', topic: 'DC', text: 'Câu 5', statements: [{ id: 'b', text: 'b', isTrue: false }] },
    // 2 câu trả lời ngắn (Phần III)
    { id: 'sa1', type: 'short_answer', topic: 'KT', text: 'Câu 6', correctAnswer: '100' },
    { id: 'sa2', type: 'short_answer', topic: 'KT', text: 'Câu 7', correctAnswer: '200' },
  ];

  const shuffledExam = shuffleExamByFormat(mockQuestions);
  assert.equal(shuffledExam.length, 7);

  // Verify section order is strictly Phần I (0..2), Phần II (3..4), Phần III (5..6)
  assert.equal(shuffledExam[0].type, 'multiple_choice');
  assert.equal(shuffledExam[1].type, 'multiple_choice');
  assert.equal(shuffledExam[2].type, 'multiple_choice');
  assert.equal(shuffledExam[3].type, 'true_false');
  assert.equal(shuffledExam[4].type, 'true_false');
  assert.equal(shuffledExam[5].type, 'short_answer');
  assert.equal(shuffledExam[6].type, 'short_answer');

  // Verify options for all MC questions match correct answers
  const originalMcMap = new Map<string, string>();
  (mockQuestions.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[]).forEach(q => {
    originalMcMap.set(q.id, q.options[q.correctAnswerIndex]);
  });

  (shuffledExam.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[]).forEach(q => {
    const expectedAnswerText = originalMcMap.get(q.id);
    assert.equal(q.options[q.correctAnswerIndex], expectedAnswerText);
  });
});
