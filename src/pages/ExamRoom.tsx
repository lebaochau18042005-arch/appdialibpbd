import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { examService } from '../services/examService';
import { liveExamService } from '../services/liveExamService';
import { assignmentService } from '../services/assignmentService';
import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase';
import { extractTextFromUrl } from '../utils/fileExtractor';
import { useAuth } from '../contexts/AuthContext';
import { isShortAnswerCorrect } from '../utils/scoreUtils';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  LayoutGrid,
  Send,
  Home,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Search,
  Calculator,
  Map,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { questions } from '../data';
import { Question, QuestionType, QuizAttempt, UserProfile } from '../types';
import { cn } from '../utils/cn';
import { shuffleExamByFormat } from '../utils/shuffleUtils';
import ExamActiveCard from '../components/exam/ExamActiveCard';
import ExamQuestionMap from '../components/exam/ExamQuestionMap';
import ExamReviewCard from '../components/exam/ExamReviewCard';
import GeoFormulasModal from '../components/exam/GeoFormulasModal';
import InteractiveMapModal from '../components/exam/InteractiveMapModal';

import { useLearningDraft } from '../hooks/useLearningDraft';
import { DraftStatus } from '../components/LearningTools';
import { learningOwner, recordAnswers, remainingSeconds } from '../services/learningStorage';

interface ExamDraft { questions: Question[]; title: string; currentIndex: number; startTime: number; answers: Record<number, any> }
export default function ExamRoom() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get('examId');
  const assignmentId = searchParams.get('assignmentId');
  const mode = searchParams.get('mode');
  const libraryFileId = searchParams.get('libraryFileId');

  const owner = learningOwner(user?.uid);
  const draft = useLearningDraft<ExamDraft>(owner, 'exam', '/exam-room?' + searchParams.toString());
  const restored = draft.initial;
  const loadingStarted = useRef(false);
  const finishedRef = useRef(false);
  const [storageError, setStorageError] = useState('');
  const [examQuestions, setExamQuestions] = useState<Question[]>(restored?.questions || []);
  const [examTitle, setExamTitle] = useState(restored?.title || 'Đề thi ôn luyện');
  const [currentIndex, setCurrentIndex] = useState(restored?.currentIndex || 0);

  // Answers state: key is question index, value is the answer
  const [answers, setAnswers] = useState<Record<number, any>>(restored?.answers || {});

  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(restored?.startTime || 0);
  const [timeLeft, setTimeLeft] = useState(restored ? remainingSeconds(restored.startTime) : 3000); // 50 minutes
  const [timeRanOut, setTimeRanOut] = useState(false);
  const [showQuestionMap, setShowQuestionMap] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [detailedExplanations, setDetailedExplanations] = useState<Record<number, { explanation: string, tips: string, mnemonics: string }>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('Đang chuẩn bị đề thi...');
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Anti-cheat & Shuffling states
  const [isAntiCheatEnabled, setIsAntiCheatEnabled] = useState(false);
  const [maxTabSwitches, setMaxTabSwitches] = useState(3);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [antiCheatIntroAccepted, setAntiCheatIntroAccepted] = useState(!!restored);
  const [toastMessage, setToastMessage] = useState('');
  const tabSwitchesRef = useRef(0);
  const teacherEmailRef = useRef<string | undefined>(undefined);

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  /** Wraps any promise with a timeout; rejects after `ms` ms */
  const withTimeout = <T,>(promise: Promise<T>, ms: number, label = 'Timeout'): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms)),
    ]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const sessionKeyRef = useRef<string>('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('examGeoProfile');
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        setProfile(p);
        sessionKeyRef.current = liveExamService.makeSessionKey(p.name || 'unknown', p.className || '');
      } catch (e) { }
    }
  }, []);

  const loadQuestions = useCallback(async () => {
    if (examId) {
      let loaded = false;
      let rawQuestions: Question[] = [];
      let rawTitle = '';
      let shouldShuffle = false;

      // ── Step 0: Get assignment config (antiCheat, shuffleQuestions, maxTabSwitches, teacherEmail) ──
      try {
        const config = await assignmentService.getAssignmentConfig(examId, assignmentId || undefined);
        if (config.teacherEmail) {
          teacherEmailRef.current = config.teacherEmail;
        }
        if (config.antiCheat) {
          setIsAntiCheatEnabled(true);
          setMaxTabSwitches(config.maxTabSwitches ?? 3);
        }
        if (config.shuffleQuestions) {
          setIsShuffleEnabled(true);
          shouldShuffle = true;
        }
      } catch (e) {
        console.warn('assignmentService.getAssignmentConfig failed:', e);
      }

      // ── Try 1: Firestore + localStorage (most up-to-date, has ExamEditor edits) ──
      try {
        const allExams = await examService.getAllExams();
        const found = allExams.find(e => e.id === examId);
        if (found?.creatorEmail) {
          teacherEmailRef.current = found.creatorEmail;
        }
        if (found && found.questions && found.questions.length > 0) {
          rawQuestions = found.questions;
          rawTitle = found.title;
          loaded = true;
        } else if (found && found.type === 'upload') {
          alert('Đây là đề thi tải lên (file). Bạn có thể tải xuống để xem nội dung.');
          navigate('/exam');
          return;
        }
      } catch { /* Firestore failed, try RTDB bundle */ }

      if (!loaded) {
        // ── Try 2: RTDB assignment bundle (fallback for cross-device access) ──
        const rtdbExam = await assignmentService.getExamQuestionsFromRTDB(examId);
        if (rtdbExam && rtdbExam.questions.length > 0) {
          rawQuestions = rtdbExam.questions;
          rawTitle = rtdbExam.title;
          if (rtdbExam.teacherEmail) {
            teacherEmailRef.current = rtdbExam.teacherEmail;
          }
          loaded = true;
          if (rtdbExam.antiCheat !== undefined) setIsAntiCheatEnabled(rtdbExam.antiCheat);
          if (rtdbExam.maxTabSwitches !== undefined) setMaxTabSwitches(rtdbExam.maxTabSwitches);
          if (rtdbExam.shuffleQuestions !== undefined) {
            setIsShuffleEnabled(rtdbExam.shuffleQuestions);
            shouldShuffle = rtdbExam.shuffleQuestions;
          }
        }
      }

      if (!loaded) {
        alert('Không tìm thấy đề thi.\nVui lòng yêu cầu giáo viên giao lại đề để câu hỏi được đồng bộ.');
        navigate('/exam');
        return;
      }

      // Apply shuffling if enabled and not already restored from draft
      const finalQuestions = (!restored && shouldShuffle)
        ? shuffleExamByFormat(rawQuestions)
        : rawQuestions;

      setExamQuestions(finalQuestions);
      setExamTitle(rawTitle);

    } else {
      if (mode === 'mock') {
        setExamTitle('Đề thi thử (AI) - Luyện tập');
        if (libraryFileId) {
          try {
            setLoadingStatus('📂 Đang đọc tài liệu...');
            const fileSnap = await get(ref(rtdb, `library_files/${libraryFileId}`));
            if (fileSnap.exists()) {
              const fileData = fileSnap.val();
              const fileUrl = fileData.storagePath || fileData.fileUrl;
              let fileContext: string | File | any = '';
              try {
                fileContext = await withTimeout(
                  extractTextFromUrl(fileUrl, fileData.fileType, fileData.fileName),
                  30000,
                  'extractText'
                );
              } catch (extractErr) {
                console.warn('File extract failed or timed out, going to random fallback:', extractErr);
                setLoadingStatus('⚡ Tài liệu không trích xuất được — đang dùng ngân hàng câu hỏi...');
                generateRandomExam();
                setStartTime(Date.now()); setTimeLeft(3000);
                return;
              }
              try {
                setLoadingStatus('🤖 AI đang trích xuất số liệu và tạo đề thi (có thể mất 1 phút)...');
                const aiQuestions = await withTimeout(
                  examService.generateAIExam(fileContext),
                  90000,
                  'generateAIExam'
                );
                setExamQuestions(aiQuestions);
              } catch (aiErr) {
                console.warn('AI exam gen failed, falling back to random:', aiErr);
                setLoadingStatus('⚡ AI không phản hồi — đang dùng ngân hàng câu hỏi...');
                generateRandomExam();
              }
            } else {
              // Library file not found — generate from AI without context
              try {
                setLoadingStatus('🤖 AI đang tạo đề thi ngẫu nhiên...');
                const aiQuestions = await withTimeout(
                  examService.generateAIExam(),
                  25000,
                  'generateAIExam'
                );
                setExamQuestions(aiQuestions);
              } catch { generateRandomExam(); }
            }
          } catch (err) {
            console.error('Unexpected error loading library exam, falling back:', err);
            setLoadingStatus('⚡ Đang dùng ngân hàng câu hỏi...');
            generateRandomExam();
          }
        } else {
          // No library file — generate fresh AI exam
          try {
            setLoadingStatus('🤖 AI đang tạo đề thi (có thể mất 1 phút)...');
            const aiQuestions = await withTimeout(
              examService.generateAIExam(),
              90000,
              'generateAIExam'
            );
            setExamQuestions(aiQuestions);
          } catch (err) {
            console.warn('AI exam gen failed, falling back to random:', err);
            setLoadingStatus('⚡ Đang dùng ngân hàng câu hỏi...');
            generateRandomExam();
          }
        }
      } else {
        generateRandomExam();
      }
    }

    setStartTime(Date.now());
    setTimeLeft(3000);

    // Join live monitoring session if this is an assigned exam
    if (examId) {
      const savedProfile = localStorage.getItem('examGeoProfile');
      let p: any = null;
      if (savedProfile) {
        try { p = JSON.parse(savedProfile); } catch (e) { }
      }
      if (p?.name) {
        const key = liveExamService.makeSessionKey(p.name, p.className || '');
        sessionKeyRef.current = key;
        liveExamService.joinSession(examId, key, { name: p.name, className: p.className || '' });
      }
    }
  }, [examId, assignmentId, mode, navigate, restored]);

  const generateRandomExam = () => {
    const getQuestions = (type: QuestionType, count: number) => {
      let selected = questions.filter(q => q.type === type);
      selected = selected.sort(() => 0.5 - Math.random());
      return selected.slice(0, count);
    };

    const finalQuestions: Question[] = [
      ...getQuestions('multiple_choice', 18),
      ...getQuestions('true_false', 4),
      ...getQuestions('short_answer', 6)
    ];
    setExamQuestions(finalQuestions);
  };

  useEffect(() => {
    if (restored || loadingStarted.current) return;
    loadingStarted.current = true;
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (!isFinished) draft.persist({ questions: examQuestions, title: examTitle, currentIndex, startTime, answers }, examTitle);
  });

  useEffect(() => {
    if (isFinished || !startTime || examQuestions.length === 0) return;
    if (isAntiCheatEnabled && !antiCheatIntroAccepted) return;

    if (timeLeft <= 0) {
      setTimeRanOut(true);
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(remainingSeconds(startTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, examQuestions.length, startTime, isAntiCheatEnabled, antiCheatIntroAccepted]);

  // ── Anti-Cheat: Visibility change / Tab switch detection ──
  useEffect(() => {
    if (!isAntiCheatEnabled || isFinished || !antiCheatIntroAccepted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchesRef.current += 1;
        const currentCount = tabSwitchesRef.current;
        setTabSwitches(currentCount);

        // Report to RTDB live session for teacher
        if (examId && sessionKeyRef.current) {
          liveExamService.reportViolation(examId, sessionKeyRef.current, 'tab_switch', currentCount);
        }

        if (currentCount >= maxTabSwitches) {
          setViolationMessage(
            `Bạn đã chuyển tab hoặc rời khỏi màn hình làm bài ${currentCount}/${maxTabSwitches} lần, vượt quá giới hạn quy định của giáo viên! Hệ thống tự động kết thúc và nộp bài thi.`
          );
          setShowViolationModal(true);
          setTimeout(() => {
            handleSubmitExam();
          }, 2000);
        } else {
          setViolationMessage(
            `CẢNH BÁO VI PHẠM: Bạn vừa rời khỏi màn hình làm bài! Hệ thống đã ghi nhận vi phạm (Lần ${currentCount}/${maxTabSwitches}) và báo cáo trực tiếp cho Giáo viên.`
          );
          setShowViolationModal(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAntiCheatEnabled, isFinished, antiCheatIntroAccepted, maxTabSwitches, examId]);

  // ── Anti-Cheat: Block right click, copy/cut, and inspection shortcuts ──
  useEffect(() => {
    if (!isAntiCheatEnabled || isFinished || !antiCheatIntroAccepted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        showNotice('Phím F12 bị vô hiệu hóa trong phòng thi!');
        return;
      }
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        showNotice('Phím tắt công cụ kiểm tra bị vô hiệu hóa trong phòng thi!');
        return;
      }
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        showNotice('Phím tắt xem mã nguồn bị vô hiệu hóa trong phòng thi!');
        return;
      }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          showNotice('Thao tác sao chép nội dung bị khóa trong phòng thi!');
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showNotice('Menu chuột phải bị khóa trong phòng thi!');
    };

    const handleCopy = (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        showNotice('Sao chép nội dung bài thi bị khóa!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, [isAntiCheatEnabled, isFinished, antiCheatIntroAccepted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = examQuestions[currentIndex];

  const handleAnswer = (answer: any) => {
    const newAnswers = { ...answers, [currentIndex]: answer };
    setAnswers(newAnswers);

    // Report to RTDB for live teacher monitoring
    if (examId && sessionKeyRef.current && currentQuestion) {
      const progress = Object.keys(newAnswers).length;
      const { totalPoints } = calculateScoreFromAnswers(newAnswers);
      liveExamService.reportAnswer(
        examId, sessionKeyRef.current,
        currentIndex, currentQuestion,
        answer, progress, totalPoints
      );
    }
  };

  const calculateScoreFromAnswers = (ans: Record<number, any>) => {
    let totalPoints = 0;
    let maxPoints = 0;
    examQuestions.forEach((q, idx) => {
      const answer = ans[idx];
      if (q.type === 'multiple_choice') {
        maxPoints += 0.25;
        if (answer === q.correctAnswerIndex) totalPoints += 0.25;
      } else if (q.type === 'true_false') {
        maxPoints += 1.0;
        if (answer) {
          let correctCount = 0;
          q.statements.forEach((stmt: any) => { if (answer[stmt.id] === stmt.isTrue) correctCount++; });
          if (correctCount === 1) totalPoints += 0.1;
          else if (correctCount === 2) totalPoints += 0.25;
          else if (correctCount === 3) totalPoints += 0.5;
          else if (correctCount === 4) totalPoints += 1.0;
        }
      } else if (q.type === 'short_answer') {
        maxPoints += 0.25;
        if (answer && isShortAnswerCorrect(answer.toString(), q.correctAnswer)) totalPoints += 0.25;
      }
    });
    return { totalPoints, maxPoints };
  };

  const calculateScore = () => calculateScoreFromAnswers(answers);

  const handleSubmitExam = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (!recordAnswers(owner, examQuestions.map((question, index) => ({ question, answer: answers[index] })))) {
      setStorageError('Không lưu được sổ câu sai. Hãy kiểm tra dung lượng hoặc quyền lưu trữ của trình duyệt.');
    }
    draft.clear();
    const { totalPoints, maxPoints } = calculateScore();
    setFinalScore(totalPoints);
    setMaxPossibleScore(maxPoints);
    setIsFinished(true);

    // Gracefully exit fullscreen if active
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (e) { }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Build rich answers for topic analysis
    const detailedAnswers: Record<string, { topic: string; isCorrect: boolean; userAnswer: any }> = {};
    examQuestions.forEach((q, idx) => {
      const answer = answers[idx];
      let correct = false;
      if (q.type === 'multiple_choice') {
        correct = answer === q.correctAnswerIndex;
      } else if (q.type === 'true_false') {
        correct = answer ? q.statements.every(stmt => answer[stmt.id] === stmt.isTrue) : false;
      } else if (q.type === 'short_answer') {
        correct = answer ? isShortAnswerCorrect(answer.toString(), q.correctAnswer) : false;
      }
      detailedAnswers[q.id || String(idx)] = {
        topic: q.topic || 'Chung',
        isCorrect: correct,
        userAnswer: answer ?? null,
      };
    });

    const savedProfile = localStorage.getItem('examGeoProfile');
    let parsedProfile: any = null;
    if (savedProfile) {
      try { parsedProfile = JSON.parse(savedProfile); } catch (e) { }
    }

    const attempt: Omit<QuizAttempt, 'id'> = {
      userId: user?.uid || 'anonymous',
      userName: parsedProfile?.name || user?.displayName || 'Học sinh ẩn danh',
      className: parsedProfile?.className || profile?.className || 'Chưa xác định',
      teacherEmail: teacherEmailRef.current,
      examId: examId || 'ai_generated',
      examTitle: examTitle,
      date: new Date().toISOString(),
      mode: 'exam',
      score: Number(totalPoints.toFixed(2)),
      totalQuestions: examQuestions.length,
      timeSpent,
      answers: detailedAnswers,
      tabSwitches: tabSwitchesRef.current,
    };

    try { await examService.saveAttempt(attempt); } catch { setStorageError('Chưa lưu được kết quả bài làm. Hãy giữ trang này để xem lại kết quả.'); }

    // Mark live session as finished
    if (examId && sessionKeyRef.current) {
      liveExamService.finishSession(examId, sessionKeyRef.current, Number(totalPoints.toFixed(2)), examQuestions.length);
    }
  };

  const isQuestionAnswered = (index: number) => {
    const ans = answers[index];
    if (ans === undefined || ans === null) return false;

    const q = examQuestions[index];
    if (q.type === 'multiple_choice') return true;
    if (q.type === 'true_false') return Object.keys(ans).length === q.statements.length;
    if (q.type === 'short_answer') return ans.trim() !== '';

    return false;
  };

  const isCorrect = (index: number) => {
    const q = examQuestions[index];
    const answer = answers[index];
    if (answer === undefined || answer === null) return false;

    if (q.type === 'multiple_choice') {
      return answer === q.correctAnswerIndex;
    } else if (q.type === 'true_false') {
      return q.statements.every(stmt => answer[stmt.id] === stmt.isTrue);
    } else if (q.type === 'short_answer') {
      return isShortAnswerCorrect(answer.toString(), q.correctAnswer);
    }
    return false;
  };

  const isStatementCorrect = (questionIndex: number, statementId: string) => {
    const q = examQuestions[questionIndex];
    const answer = answers[questionIndex];
    if (q.type !== 'true_false' || !answer) return false;
    const stmt = q.statements.find(s => s.id === statementId);
    return stmt && answer[statementId] === stmt.isTrue;
  };

  const handleGetDetailedExplanation = async (index: number) => {
    if (detailedExplanations[index]) return;

    setLoadingExplanation(index);
    try {
      const result = await examService.generateDetailedExplanation(examQuestions[index], answers[index]);
      setDetailedExplanations(prev => ({ ...prev, [index]: result }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingExplanation(null);
    }
  };

  if (examQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">{loadingStatus}</p>
        <p className="text-slate-400 text-xs mt-2">Nếu màn hình không tiến triển sau 30 giây, hãy tải lại trang.</p>
      </div>
    );
  }

  // ── Review mode: must be checked BEFORE isFinished so it takes priority ──
  if (isReviewMode) {
    return (
      <ExamReviewCard
        examQuestions={examQuestions}
        answers={answers}
        finalScore={finalScore}
        maxPossibleScore={maxPossibleScore}
        detailedExplanations={detailedExplanations}
        loadingExplanation={loadingExplanation}
        handleGetDetailedExplanation={handleGetDetailedExplanation}
        setIsReviewMode={setIsReviewMode}
        navigate={navigate}
        isCorrect={isCorrect}
        isStatementCorrect={isStatementCorrect}
      />
    );
  }

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center"
      >
        {timeRanOut && (
          <div className="mb-6 inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-medium">
            <AlertCircle className="w-5 h-5" />
            Đã hết thời gian làm bài!
          </div>
        )}
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành bài thi!</h2>
        <p className="text-slate-600 mb-4">Bạn có thể xem lại đáp án và ôn những câu sai.</p>
        <p role="status" className="text-amber-800 mb-4">{storageError || draft.error}</p>
        <button onClick={() => navigate('/mistakes')} className="mb-6 px-4 py-2 bg-sky-700 text-white rounded-xl">Mở sổ câu sai</button>

        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-slate-50 p-6 rounded-2xl">
            <div className="text-sm text-slate-500 mb-1">Điểm số</div>
            <div className="text-4xl font-bold text-emerald-600">{finalScore.toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-1">trên tối đa {maxPossibleScore.toFixed(2)}</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl">
            <div className="text-sm text-slate-500 mb-1">Thời gian làm bài</div>
            <div className="text-4xl font-bold text-blue-600">
              {Math.floor(((Date.now() - startTime) / 1000) / 60)}p
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {Math.floor(((Date.now() - startTime) / 1000) % 60)} giây
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setIsReviewMode(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Xem lại bài làm
          </button>
          <button
            onClick={() => navigate(0)}
            className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Làm đề khác
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24">
      <DraftStatus restored={!!restored} error={storageError || draft.error} />
      {/* Header Sticky */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 mb-6 border-b border-slate-200 -mx-4 px-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-1",
                examId ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
              )}>
                {examId ? 'ĐỀ THI THẬT' : 'ĐỀ THI THỬ'}
              </div>
              <h1 className="text-sm font-black text-slate-800 truncate max-w-[200px]">{examTitle}</h1>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              <span className="text-sm font-bold text-emerald-600">Câu {currentIndex + 1}</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm text-slate-500">{examQuestions.length}</span>
            </div>
            {isAntiCheatEnabled && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-full">
                <ShieldCheck size={13} className="text-rose-500 animate-pulse" />
                <span>Giám sát: Rời tab {tabSwitches}/{maxTabSwitches}</span>
              </span>
            )}
            {isShuffleEnabled && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-full">
                <Shuffle size={12} className="text-blue-500" />
                <span>Đề xáo trộn</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm border font-mono font-bold transition-all",
              timeLeft < 300 ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse" : "bg-white text-slate-700 border-slate-200"
            )}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>

            <button
              onClick={() => setIsMapOpen(true)}
              className="p-2 bg-slate-800 rounded-full border border-cyan-500/40 text-cyan-400 hover:bg-slate-700 transition-colors"
              title="Tra cứu 34 Tỉnh & 6 Vùng mới (TT17)"
            >
              <Map className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsFormulasOpen(true)}
              className="p-2 bg-slate-800 rounded-full border border-cyan-500/40 text-cyan-400 hover:bg-slate-700 transition-colors"
              title="Sổ tay Công thức & Máy tính Địa lí"
            >
              <Calculator className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowQuestionMap(!showQuestionMap)}
              className="p-2 bg-white rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Sơ đồ câu hỏi"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="hidden md:flex items-center gap-2 bg-emerald-600 text-white px-5 py-1.5 rounded-full font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              Nộp bài
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <ExamActiveCard
            currentQuestion={currentQuestion}
            currentIndex={currentIndex}
            examQuestions={examQuestions}
            answer={answers[currentIndex]}
            handleAnswer={handleAnswer}
            setCurrentIndex={setCurrentIndex}
            setShowQuestionMap={setShowQuestionMap}
            isQuestionAnswered={isQuestionAnswered}
          />
        </div>

        {/* Sidebar: Question Map */}
        <ExamQuestionMap
          examQuestions={examQuestions}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isQuestionAnswered={isQuestionAnswered}
          setShowQuestionMap={setShowQuestionMap}
          setShowSubmitConfirm={setShowSubmitConfirm}
          showQuestionMap={showQuestionMap}
        />
      </div>

      {/* Mobile Submit Button - z-30 so it overlays Layout's bottom nav (z-20) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="p-3">
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Send className="w-5 h-5" />
            Nộp bài thi
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 text-center mb-2">Xác nhận nộp bài?</h3>
              <p className="text-slate-600 text-center mb-8">
                Bạn có chắc chắn muốn kết thúc bài thi và nộp bài ngay bây giờ không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    handleSubmitExam();
                  }}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                  Nộp bài ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating notice for blocked actions */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <ShieldAlert size={14} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anti-cheat violation modal */}
      <AnimatePresence>
        {showViolationModal && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-rose-300 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-4 mx-auto animate-bounce">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-rose-600 mb-2">CẢNH BÁO VI PHẠM PHÒNG THI</h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium">
                {violationMessage}
              </p>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl mb-6 text-xs text-rose-800 font-bold">
                Vi phạm hiện tại: {tabSwitches} / {maxTabSwitches} lần cho phép
              </div>
              {tabSwitches >= maxTabSwitches ? (
                <div className="py-3 px-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">
                  Đang tiến hành tự động nộp bài...
                </div>
              ) : (
                <button
                  onClick={() => setShowViolationModal(false)}
                  className="w-full py-3.5 bg-rose-600 text-white rounded-xl font-black text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                >
                  Tôi đã hiểu và Tiếp tục làm bài
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Anti-cheat entrance rules modal */}
      <AnimatePresence>
        {isAntiCheatEnabled && !antiCheatIntroAccepted && !isFinished && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">Chế Độ Thi Có Giám Sát Chống Gian Lận</h3>
                  <p className="text-xs text-slate-400">Đề thi: {examTitle}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">1.</span>
                  <span><strong>Không rời khỏi màn hình làm bài:</strong> Mọi hành động chuyển tab, thu nhỏ hoặc mở ứng dụng khác sẽ được hệ thống ghi nhận tức thì (Tối đa <strong>{maxTabSwitches} lần</strong>). Vượt quá số lần sẽ bị tự động nộp bài ngay.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">2.</span>
                  <span><strong>Chặn thao tác sao chép:</strong> Chuột phải, phím tắt sao chép (Ctrl+C), cắt dán đề bài và phím F12 bị vô hiệu hóa.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">3.</span>
                  <span><strong>Giám sát trực tiếp:</strong> Giáo viên có thể theo dõi tiến độ làm bài và số lần rời tab của bạn theo thời gian thực.</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setAntiCheatIntroAccepted(true);
                    setStartTime(Date.now());
                    setTimeLeft(3000);
                  }}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors text-center"
                >
                  Vào thi bình thường
                </button>
                <button
                  onClick={async () => {
                    setAntiCheatIntroAccepted(true);
                    setStartTime(Date.now());
                    setTimeLeft(3000);
                    try {
                      if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                      }
                    } catch (e) { }
                  }}
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-1.5"
                >
                  <Maximize2 size={14} /> Vào thi &amp; Toàn màn hình
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GeoFormulasModal
        isOpen={isFormulasOpen}
        onClose={() => setIsFormulasOpen(false)}
        onApplyResult={(val) => {
          if (currentQuestion && currentQuestion.type === 'short_answer') {
            handleAnswer(val);
          }
        }}
      />
      <InteractiveMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
