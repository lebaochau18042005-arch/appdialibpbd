/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import StudentProfileGate from './components/StudentProfileGate';
import Home from './pages/Home';
import StudentHome from './pages/StudentHome';
import AssignedExamsPage from './pages/AssignedExamsPage';
import PracticeSetup from './pages/PracticeSetup';
import Quiz from './pages/Quiz';
import History from './pages/History';
import Profile from './pages/Profile';
import TeacherDashboard from './pages/TeacherDashboard';
import ExamSetup from './pages/ExamSetup';
import ExamRoom from './pages/ExamRoom';
import LearningPath from './pages/LearningPath';
import LibraryPage from './pages/LibraryPage';

function AppRoutes() {
  const { isTeacherMode } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isTeacherMode ? <Home /> : <StudentHome />} />
      <Route path="/assigned" element={<AssignedExamsPage />} />
      <Route path="/practice" element={<PracticeSetup />} />
      <Route path="/exam" element={<ExamSetup />} />
      <Route path="/exam-room" element={<ExamRoom />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/learning-path" element={<LearningPath />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudentProfileGate>
          <Layout>
            <AppRoutes />
          </Layout>
        </StudentProfileGate>
      </AuthProvider>
    </BrowserRouter>
  );
}


