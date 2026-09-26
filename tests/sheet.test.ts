import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimeSpent,
  attemptToSheetPayload,
  buildCsvContent,
  GOOGLE_APPS_SCRIPT_TEMPLATE
} from '../src/services/googleSheetService.ts';
import type { QuizAttempt } from '../src/types.ts';

test('formatTimeSpent handles various durations accurately', () => {
  assert.equal(formatTimeSpent(undefined), '0s');
  assert.equal(formatTimeSpent(0), '0s');
  assert.equal(formatTimeSpent(45), '45s');
  assert.equal(formatTimeSpent(60), '1p 0s');
  assert.equal(formatTimeSpent(125), '2p 5s');
  assert.equal(formatTimeSpent(3665), '1h 1p 5s');
});

test('attemptToSheetPayload transforms QuizAttempt into structured sheet row and payload', () => {
  const mockAttempt: QuizAttempt = {
    id: 'att_123',
    userId: 'user_123',
    examId: 'exam_geography_12',
    examTitle: 'Kiểm tra Địa lí 12 - Học kỳ 1',
    userName: 'Nguyễn Văn An',
    className: '12A1',
    score: 8.5,
    totalQuestions: 28,
    answers: {},
    date: '2026-09-25T08:30:00.000Z',
    timeSpent: 1845, // 30p 45s
    mode: 'exam',
    tabSwitches: 2,
    teacherComment: 'Làm bài tốt'
  };

  const payload = attemptToSheetPayload(mockAttempt);

  assert.equal(payload.userName, 'Nguyễn Văn An');
  assert.equal(payload.className, '12A1');
  assert.equal(payload.examTitle, 'Kiểm tra Địa lí 12 - Học kỳ 1');
  assert.equal(payload.score, 8.5);
  assert.equal(payload.totalQuestions, 28);
  assert.equal(payload.timeSpent, '30p 45s');
  assert.equal(payload.tabSwitches, 2);
  assert.equal(payload.mode, 'Thi thử / Kiểm tra');
  assert.equal(payload.teacherComment, 'Làm bài tốt');
});

test('attemptToSheetPayload handles attempts with 0 tab switches or free practice mode', () => {
  const practiceAttempt: QuizAttempt = {
    id: 'att_456',
    userId: 'user_456',
    examId: 'practice_exam',
    examTitle: 'Ôn tập trắc nghiệm',
    userName: 'Trần Thị Bích',
    className: '10B2',
    score: 9.0,
    totalQuestions: 20,
    answers: {},
    date: '2026-09-25T10:00:00.000Z',
    timeSpent: 300,
    mode: 'lesson',
    tabSwitches: 0
  };

  const payload = attemptToSheetPayload(practiceAttempt);
  assert.equal(payload.tabSwitches, 0);
  assert.equal(payload.mode, 'Luyện theo bài');
  assert.equal(payload.teacherComment, '');
});

test('buildCsvContent formats valid CSV with UTF-8 BOM and correct headers', () => {
  const attempts: QuizAttempt[] = [
    {
      id: 'att_1',
      userId: 'user_1',
      examId: 'exam_1',
      examTitle: 'Đề thi 1, có dấu phẩy',
      userName: 'Lê "Văn" Cường',
      className: '11C3',
      score: 7.75,
      totalQuestions: 28,
      answers: {},
      date: '2026-09-25T09:00:00.000Z',
      timeSpent: 1200,
      mode: 'exam',
      tabSwitches: 1
    }
  ];

  const csv = buildCsvContent(attempts);

  // Must start with UTF-8 BOM
  assert.ok(csv.startsWith('\uFEFF'), 'CSV should start with UTF-8 BOM');

  // Must contain headers
  assert.ok(csv.includes('Thời gian nộp'));
  assert.ok(csv.includes('Họ và tên'));
  assert.ok(csv.includes('Lớp'));
  assert.ok(csv.includes('Tên bài kiểm tra'));
  assert.ok(csv.includes('Điểm số'));
  assert.ok(csv.includes('Số lần rời tab (Vi phạm)'));

  // Must escape quotes and commas
  assert.ok(csv.includes('"Đề thi 1, có dấu phẩy"'));
  assert.ok(csv.includes('"Lê ""Văn"" Cường"'));
});

test('GOOGLE_APPS_SCRIPT_TEMPLATE contains essential webhook functions', () => {
  assert.ok(GOOGLE_APPS_SCRIPT_TEMPLATE.includes('function doPost(e)'));
  assert.ok(GOOGLE_APPS_SCRIPT_TEMPLATE.includes('function doGet(e)'));
  assert.ok(GOOGLE_APPS_SCRIPT_TEMPLATE.includes('SpreadsheetApp.getActiveSpreadsheet()'));
  assert.ok(GOOGLE_APPS_SCRIPT_TEMPLATE.includes('Thời gian nộp'));
  assert.ok(GOOGLE_APPS_SCRIPT_TEMPLATE.includes('Họ và tên học sinh'));
});
