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
  Search
} from 'lucide-react';
import { questions } from '../data';
import { Question, QuestionType, QuizAttempt, UserProfile } from '../types';
import { cn } from '../utils/cn';
import ExamActiveCard from '../components/exam/ExamActiveCard';
import ExamQuestionMap from '../components/exam/ExamQuestionMap';
import ExamReviewCard from '../components/exam/ExamReviewCard';

export default function ExamRoom() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get('examId');
  const mode = searchParams.get('mode');
  const libraryFileId = searchParams.get('libraryFileId');
  
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState('Đề thi ôn luyện');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Answers state: key is question index, value is the answer
  const [answers, setAnswers] = useState<Record<number, any>>({});
  
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3000); // 50 minutes
  const [timeRanOut, setTimeRanOut] = useState(false);
  const [showQuestionMap, setShowQuestionMap] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [detailedExplanations, setDetailedExplanations] = useState<Record<number, { explanation: string, tips: string, mnemonics: string }>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const sessionKeyRef = useRef<string>('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('examGeoProfile');
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      setProfile(p);
      sessionKeyRef.current = liveExamService.makeSessionKey(p.name || 'unknown', p.className || '');
    }
  }, []);

  const loadQuestions = useCallback(async () => {
    if (examId) {
      let loaded = false;

      // ── Try 1: Firestore + localStorage (most up-to-date, has ExamEditor edits) ──
      try {
        const allExams = await examService.getAllExams();
        const found = allExams.find(e => e.id === examId);
        if (found && found.questions && found.questions.length > 0) {
          setExamQuestions(found.questions);
          setExamTitle(found.title);
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
          setExamQuestions(rtdbExam.questions);
          setExamTitle(rtdbExam.title);
          loaded = true;
        }
      }

      if (!loaded) {
        alert('Không tìm thấy đề thi.\nVui lòng yêu cầu giáo viên giao lại đề để câu hỏi được đồng bộ.');
        navigate('/exam');
        return;
      }

    } else {
      if (mode === 'mock') {
        setExamTitle('Đề thi thử (AI) - Luyện tập');
        if (libraryFileId) {
          try {
            const fileSnap = await get(ref(rtdb, `library_files/${libraryFileId}`));
            if (fileSnap.exists()) {
              const fileData = fileSnap.val();
              const fileUrl = fileData.storagePath || fileData.fileUrl;
              const fileContext = await extractTextFromUrl(fileUrl, fileData.fileType);
              const aiQuestions = await examService.generateAIExam(fileContext);
              setExamQuestions(aiQuestions);
            } else {
              generateRandomExam();
            }
          } catch (err) {
            console.error('Lỗi khi đọc file thư viện, fallback về ngẫu nhiên:', err);
            alert('Không thể tạo đề từ file (lỗi đọc tài liệu). Đang tạo đề ngẫu nhiên thay thế.');
            generateRandomExam();
          }
        } else {
          generateRandomExam();
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
      const p = savedProfile ? JSON.parse(savedProfile) : null;
      if (p?.name) {
        const key = liveExamService.makeSessionKey(p.name, p.className || '');
        sessionKeyRef.current = key;
        liveExamService.joinSession(examId, key, { name: p.name, className: p.className || '' });
      }
    }
  }, [examId, mode, navigate]);

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
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (isFinished || examQuestions.length === 0) return;
    
    if (timeLeft <= 0) {
      setTimeRanOut(true);
      handleSubmitExam();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, examQuestions.length]);

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
        if (answer && answer.trim() === q.correctAnswer.toString()) totalPoints += 0.25;
      }
    });
    return { totalPoints, maxPoints };
  };

  const calculateScore = () => calculateScoreFromAnswers(answers);

  const handleSubmitExam = async () => {
    const { totalPoints, maxPoints } = calculateScore();
    setFinalScore(totalPoints);
    setMaxPossibleScore(maxPoints);
    setIsFinished(true);
    
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
        correct = answer ? answer.toString().trim().toLowerCase() === q.correctAnswer.toString().toLowerCase() : false;
      }
      detailedAnswers[q.id || String(idx)] = {
        topic: q.topic || 'Chung',
        isCorrect: correct,
        userAnswer: answer,
      };
    });
    
    const savedProfile = localStorage.getItem('examGeoProfile');
    const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;

    const attempt: Omit<QuizAttempt, 'id'> = {
      userId: user?.uid || 'anonymous',
      userName: parsedProfile?.name || user?.displayName || 'Học sinh ẩn danh',
      className: parsedProfile?.className || profile?.className || 'Chưa xác định',
      examId: examId || 'ai_generated',
      examTitle: examTitle,
      date: new Date().toISOString(),
      mode: 'exam',
      score: Number(totalPoints.toFixed(2)),
      totalQuestions: examQuestions.length,
      timeSpent,
      answers: detailedAnswers
    };

    await examService.saveAttempt(attempt);

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
      return answer.toString().trim().toLowerCase() === q.correctAnswer.toString().toLowerCase();
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
      setLoadingExplanation(index);
      setLoadingExplanation(null);
    }
  };

  if (examQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Đang chuẩn bị đề thi...</p>
      </div>
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
        <p className="text-slate-600 mb-8">Hệ thống đã ghi nhận kết quả của bạn.</p>
        
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

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24">
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

      {/* Mobile Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:hidden z-10">
        <button
          onClick={() => setShowSubmitConfirm(true)}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
        >
          <Send className="w-5 h-5" />
          Nộp bài thi
        </button>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
