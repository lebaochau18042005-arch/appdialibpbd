import type { Question } from '../src/types';
export const fixtureQuestions: Question[] = [
  { id: 'preview-mc', type: 'multiple_choice', topic: 'Tự nhiên', lesson: 'Vị trí địa lí', text: 'Lãnh thổ Việt Nam nằm trong khu vực nào?', options: ['Đông Nam Á', 'Bắc Âu', 'Nam Mỹ', 'Bắc Phi'], correctAnswerIndex: 0, explanation: 'Việt Nam thuộc khu vực Đông Nam Á.' },
  { id: 'preview-tf', type: 'true_false', topic: 'Dân cư', text: 'Xác định tính đúng/sai của các nhận định.', statements: [{ id: 'a', text: 'Dân cư phân bố không đều.', isTrue: true }, { id: 'b', text: 'Mọi địa phương có mật độ dân số bằng nhau.', isTrue: false }, { id: 'c', text: 'Đô thị có nhiều hoạt động dịch vụ.', isTrue: true }, { id: 'd', text: 'Mật độ dân số không liên quan đến diện tích.', isTrue: false }], explanation: 'Mật độ dân số là số dân chia cho diện tích.' },
  { id: 'preview-sa', type: 'short_answer', topic: 'Tính toán', text: 'Tính mật độ dân số: 120 người trên diện tích 10 km².', correctAnswer: 12, unit: 'người/km²', explanation: '$120 / 10 = 12$ người/km².' },
];
export function useAuth() { return { user: { uid: 'preview-student', displayName: 'Học sinh thử nghiệm', email: null }, isTeacherMode: true, profile: { name: 'Học sinh thử nghiệm', className: '12A' }, loading: false }; }
export const examService = {
  getAllExams: async () => [{ id: 'preview-exam', title: 'Bài kiểm tra minh họa', questions: fixtureQuestions }],
  generatePracticeQuestions: async () => fixtureQuestions,
  generateAIExam: async () => fixtureQuestions,
  saveAttempt: async (attempt: unknown) => { localStorage.setItem('preview-last-attempt', JSON.stringify(attempt)); return 'preview-result'; },
};
const noop = () => {};
export const liveTrackingService = { joinLiveExam: noop, updateLiveProgress: noop, finishLiveExam: noop };
export const liveExamService = { makeSessionKey: () => 'preview', joinSession: noop, reportAnswer: noop, finishSession: noop };
export const assignmentService = { getExamQuestionsFromRTDB: async () => null };
export const getExplanation = async (q: Question) => q.explanation || 'Giải thích minh họa.';
export const chatWithTutor = async () => 'Bản thử nghiệm không gọi AI.';
export const getDetailedExplanation = async () => ({ explanation: 'Giải thích minh họa.', tips: '', mnemonics: '' });
export const libraryService = {
  subscribeToVideos: (_id: any, cb: any) => { cb([]); return noop; },
  subscribeToFiles: (_id: any, cb: any) => { cb([{ id: 'preview-doc', title: 'Tài liệu ôn tập vùng kinh tế', fileName: 'Địa lí 12.pdf', fileType: 'pdf', fileSize: 102400, createdAt: '2026-09-25', fileUrl: '#', storagePath: '' }]); return noop; },
};
