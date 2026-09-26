import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Quiz from '../src/pages/Quiz';
import ExamRoom from '../src/pages/ExamRoom';
import MistakeNotebook from '../src/pages/MistakeNotebook';
import LibraryPage from '../src/pages/LibraryPage';
import LearningTools from '../src/components/LearningTools';
import TopicReport from '../src/components/teacher/TopicReport';
import { recordAnswers } from '../src/services/learningStorage';
import { fixtureQuestions } from './previewFixtures';
import type { QuizAttempt } from '../src/types';
import '../src/index.css';

const attempts = [
  { id: '1', userId: 'p1', className: '12A', mode: 'exam', answers: { a: { topic: 'Tự nhiên', isCorrect: true }, b: { topic: 'Dân cư', isCorrect: false } } },
  { id: '2', userId: 'p2', className: '12B', mode: 'topic', answers: { a: { topic: 'Tự nhiên', isCorrect: false }, b: { topic: 'Dân cư', isCorrect: false } } },
] as unknown as QuizAttempt[];
function Preview() {
  const loc = useLocation();
  return <div className="max-w-6xl mx-auto p-4 space-y-4"><p className="rounded-xl bg-amber-100 text-amber-950 p-3">Bản kiểm tra bằng dữ liệu giả lập · Không gửi dữ liệu lên hệ thống thật</p>
    <nav className="flex flex-wrap gap-4 text-sky-200 underline"><Link to="/">Góc ôn tập</Link><Link to="/quiz?mode=topic&filter=Tự+nhiên&useAI=true&count=3">Luyện tập mẫu</Link><Link to="/exam-room?examId=preview-exam">Thi mẫu</Link><Link to="/mistakes">Sổ câu sai</Link><Link to="/report">Báo cáo chủ đề</Link><Link to="/library">Thư viện</Link></nav>
    <Routes>
      <Route path="/" element={<><LearningTools /><button className="p-3 bg-sky-700 rounded-lg" onClick={() => { recordAnswers('user:preview-student', fixtureQuestions.map(question => ({ question, answer: null }))); window.location.hash = '/mistakes'; }}>Tạo 3 câu sai minh họa</button></>} />
      <Route path="/quiz" element={<Quiz key={loc.search} />} /><Route path="/exam-room" element={<ExamRoom key={loc.search} />} />
      <Route path="/mistakes" element={<MistakeNotebook />} /><Route path="/report" element={<TopicReport attempts={attempts} />} /><Route path="/library" element={<LibraryPage />} />
    </Routes>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><HashRouter><Preview /></HashRouter></StrictMode>);
