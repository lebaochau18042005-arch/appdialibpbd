/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ExamSetup from './pages/ExamSetup';
import ExamRoom from './pages/ExamRoom';
import MistakeNotebook from './pages/MistakeNotebook';
import { learningOwner } from './services/learningStorage';

// Code-split heavy pages to optimize initial bundle size for students
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const LearningPath = lazy(() => import('./pages/LearningPath'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm tracking-wide">Đang tải trang...</p>
    </div>
  );
}

function AppRoutes() {
  const { isTeacherMode, user, loading } = useAuth();
  const location = useLocation();
  const learningKey = `${learningOwner(user?.uid)}:${location.search}`;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-black text-sm tracking-wider uppercase">Đang tải hồ sơ học tập...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={isTeacherMode ? <Home /> : <StudentHome />} />
        <Route path="/assigned" element={<AssignedExamsPage />} />
        <Route path="/practice" element={<PracticeSetup />} />
        <Route path="/exam" element={<ExamSetup />} />
        <Route path="/exam-room" element={<ExamRoom key={learningKey} />} />
        <Route path="/quiz" element={<Quiz key={learningKey} />} />
        <Route path="/mistakes" element={<MistakeNotebook key={learningKey} />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/learning-path" element={<LearningPath />} />
        {/* Catch-all route to avoid blank screen on broken or mistyped URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
