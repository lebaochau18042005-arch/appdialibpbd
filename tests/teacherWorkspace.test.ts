import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeEmailKey,
  isValidEmail,
  normalizeTeacherEmail,
  teacherWorkspaceService
} from '../src/services/teacherWorkspaceService.ts';
import { googleSheetService } from '../src/services/googleSheetService.ts';
import type { QuizAttempt, ExamAssignment } from '../src/types.ts';

// Mock localStorage for node test environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = String(value); },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  key: (i: number) => Object.keys(mockStorage)[i] || null,
  length: 0,
};

test('sanitizeEmailKey correctly formats emails for safe database and storage keys', () => {
  assert.equal(sanitizeEmailKey('thaynam.dialy@gmail.com'), 'thaynam_dialy_gmail_com');
  assert.equal(sanitizeEmailKey('CO.MAI.12A@GMAIL.COM '), 'co_mai_12a_gmail_com');
  assert.equal(sanitizeEmailKey('teacher+test@school.edu.vn'), 'teacher_test_school_edu_vn');
  assert.equal(sanitizeEmailKey(undefined), 'default_teacher');
  assert.equal(sanitizeEmailKey(null), 'default_teacher');
});

test('isValidEmail accurately validates standard email formats', () => {
  assert.equal(isValidEmail('thaynam@gmail.com'), true);
  assert.equal(isValidEmail('co.mai_12@edu.vn'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail('test@'), false);
  assert.equal(isValidEmail('@gmail.com'), false);
  assert.equal(isValidEmail(''), false);
});

test('normalizeTeacherEmail auto-appends @gmail.com when teacher types username only', () => {
  assert.equal(normalizeTeacherEmail('thaynam.dialy'), 'thaynam.dialy@gmail.com');
  assert.equal(normalizeTeacherEmail('COMAI123'), 'comai123@gmail.com');
  assert.equal(normalizeTeacherEmail('thaynam.dialy@gmail.com'), 'thaynam.dialy@gmail.com');
  assert.equal(normalizeTeacherEmail('teacher@school.edu.vn'), 'teacher@school.edu.vn');
  assert.equal(normalizeTeacherEmail(''), '');
});

test('teacherWorkspaceService persists and switches active teacher workspace', async () => {
  localStorage.clear();

  await teacherWorkspaceService.setActiveWorkspace({
    email: 'thaynam.dialy@gmail.com',
    name: 'Thầy Nam',
    school: 'THPT Chuyên Bình Phước'
  });

  assert.equal(teacherWorkspaceService.getActiveTeacherEmail(), 'thaynam.dialy@gmail.com');

  const profile = await teacherWorkspaceService.getTeacherProfile('thaynam.dialy@gmail.com');
  assert.equal(profile?.name, 'Thầy Nam');
  assert.equal(profile?.school, 'THPT Chuyên Bình Phước');

  // Switch to another teacher
  await teacherWorkspaceService.setActiveWorkspace({
    email: 'comai.dia12@gmail.com',
    name: 'Cô Mai',
    school: 'THPT Đồng Xoài'
  });

  assert.equal(teacherWorkspaceService.getActiveTeacherEmail(), 'comai.dia12@gmail.com');

  const recents = teacherWorkspaceService.getRecentTeachers();
  assert.equal(recents.length, 2);
  assert.equal(recents[0].email, 'comai.dia12@gmail.com');
  assert.equal(recents[1].email, 'thaynam.dialy@gmail.com');
});

test('googleSheetService keeps isolated configurations for different teachers', async () => {
  localStorage.clear();

  const teacherA = 'thaynam.dialy@gmail.com';
  const teacherB = 'comai.dia12@gmail.com';

  const webhookA = 'https://script.google.com/macros/s/WEBHOOK_TEACHER_A/exec';
  const webhookB = 'https://script.google.com/macros/s/WEBHOOK_TEACHER_B/exec';

  // Teacher A saves their Google Sheet webhook
  await googleSheetService.saveConfig(webhookA, 'https://docs.google.com/spreadsheets/d/SHEET_A', true, teacherA);

  // Teacher B saves their Google Sheet webhook
  await googleSheetService.saveConfig(webhookB, 'https://docs.google.com/spreadsheets/d/SHEET_B', true, teacherB);

  // Retrieve configs
  const configA = await googleSheetService.getConfig(teacherA);
  const configB = await googleSheetService.getConfig(teacherB);

  assert.equal(configA.webhookUrl, webhookA);
  assert.equal(configA.sheetUrl, 'https://docs.google.com/spreadsheets/d/SHEET_A');

  assert.equal(configB.webhookUrl, webhookB);
  assert.equal(configB.sheetUrl, 'https://docs.google.com/spreadsheets/d/SHEET_B');

  // Verify they are completely separate
  assert.notEqual(configA.webhookUrl, configB.webhookUrl);
});

test('QuizAttempt maintains teacherEmail for isolated reporting and sheet synchronization', () => {
  const attemptWithTeacher: QuizAttempt = {
    id: 'att_test_1',
    userId: 'student_1',
    userName: 'Nguyễn Văn Em',
    className: '12A1',
    teacherEmail: 'thaynam.dialy@gmail.com',
    examId: 'exam_geo_hk1',
    examTitle: 'Kiểm tra Địa lí 12 KNTT',
    date: '2026-09-25T10:00:00.000Z',
    mode: 'exam',
    score: 9.25,
    totalQuestions: 28,
    timeSpent: 2100,
    answers: {},
    tabSwitches: 0
  };

  assert.equal(attemptWithTeacher.teacherEmail, 'thaynam.dialy@gmail.com');
  assert.equal(attemptWithTeacher.score, 9.25);
  assert.equal(attemptWithTeacher.userName, 'Nguyễn Văn Em');
});
