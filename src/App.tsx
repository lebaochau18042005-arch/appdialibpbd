/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import PracticeSetup from './pages/PracticeSetup';
import Quiz from './pages/Quiz';
import History from './pages/History';
import Profile from './pages/Profile';
import TeacherDashboard from './pages/TeacherDashboard';
import ExamSetup from './pages/ExamSetup';
import ExamRoom from './pages/ExamRoom';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<PracticeSetup />} />
            <Route path="/exam" element={<ExamSetup />} />
            <Route path="/exam-room" element={<ExamRoom />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
