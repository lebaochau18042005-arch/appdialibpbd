import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase';
import { extractTextFromUrl } from '../utils/fileExtractor';
import { examService } from '../services/examService';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2, RefreshCcw, Home, Clock, Calculator, Map } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { liveTrackingService } from '../services/liveTrackingService';
import { questions } from '../data';
import { Question, QuestionType, QuizAttempt, UserProfile } from '../types';
import { getExplanation } from '../services/ai';
import { cn } from '../utils/cn';
import { isShortAnswerCorrect, getPoints, calcMaxScore, DEFAULT_BGD_SCORING, ScoringConfig } from '../utils/scoreUtils';
import QuizActiveCard from '../components/exam/QuizActiveCard';
import QuizResultCard from '../components/exam/QuizResultCard';
import ExamReviewCard from '../components/exam/ExamReviewCard';
import AITutorChatbot from '../components/ai/AITutorChatbot';
import GeoFormulasModal from '../components/exam/GeoFormulasModal';
import InteractiveMapModal from '../components/exam/InteractiveMapModal';

import { useLearningDraft } from '../hooks/useLearningDraft';
import { DraftStatus } from '../components/LearningTools';
import { getMistakes, learningOwner, recordAnswers, remainingSeconds } from '../services/learningStorage';

interface QuizDraft {
  questions: Question[]; currentIndex: number; startTime: number;
  mcAnswer: number | null; tfAnswer: Record<string, boolean>; saAnswer: string;
  detailedAnswers: Record<string, { topic: string; isCorrect: boolean; userAnswer: any }>;
  isSubmitted: boolean; isAnswerCorrect: boolean | null; score: number; scoringConfig: ScoringConfig;
}
export default function Quiz() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') as 'lesson' | 'topic' | 'exam' | 'format' || 'exam';
  const filter = searchParams.get('filter');
  const examId = searchParams.get('examId');
  const countParam = searchParams.get('count');
  const useAI = searchParams.get('useAI') === 'true';
  const libraryFileId = searchParams.get('libraryFileId');

  const owner = learningOwner(user?.uid);
  const reviewMistakes = searchParams.get('review') === 'mistakes';
  const draft = useLearningDraft<QuizDraft>(owner, 'quiz', '/quiz?' + searchParams.toString());
  const restored = draft.initial;
  const finishedRef = useRef(false);
  const loadingStarted = useRef(false);
  const [storageError, setStorageError] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>(restored?.questions || []);
  const [currentIndex, setCurrentIndex] = useState(restored?.currentIndex || 0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Answer states
  const [mcAnswer, setMcAnswer] = useState<number | null>(restored?.mcAnswer ?? null);
  const [tfAnswer, setTfAnswer] = useState<Record<string, boolean>>(restored?.tfAnswer || {});
  const [saAnswer, setSaAnswer] = useState<string>(restored?.saAnswer || '');
  const [detailedAnswers, setDetailedAnswers] = useState<Record<string, { topic: string; isCorrect: boolean; userAnswer: any }>>(restored?.detailedAnswers || {}); // per-question rich results

  const [isSubmitted, setIsSubmitted] = useState(restored?.isSubmitted || false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(restored?.isAnswerCorrect ?? null);
  const [score, setScore] = useState(restored?.score || 0); // Raw score for simplicity
  const scoreRef = useRef(restored?.score || 0);
  scoreRef.current = score;
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [startTime, setStartTime] = useState(restored?.startTime || 0);
  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>(restored?.scoringConfig || DEFAULT_BGD_SCORING);

  // Timer states (50 minutes = 3000 seconds)
  const [timeLeft, setTimeLeft] = useState(restored ? remainingSeconds(restored.startTime) : 3000);
  const [timeRanOut, setTimeRanOut] = useState(false);

  const [aiExplanation, setAiExplanation] = useState<string | null>(restored?.isSubmitted ? restored.questions[restored.currentIndex]?.explanation || 'Đáp án đã được khôi phục.' : null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try { return JSON.parse(localStorage.getItem('examGeoProfile') || 'null'); } catch { return null; }
  });
  const [studentSessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [studentName, setStudentName] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);

  const applyPracticeScoring = (questionsList: Question[]) => {
    if (mode !== 'exam' && questionsList.length > 0) {
      const basePoint = 10 / questionsList.length;
      setScoringConfig({
        mcPointsEach: basePoint,
        saPointsEach: basePoint,
        tfPointsPerLevel: [basePoint * 0.1, basePoint * 0.25, basePoint * 0.5, basePoint * 1.0]
      });
    }
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('examGeoProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setStudentName(parsed.name || 'Học sinh ẩn danh');
      } catch (e) {
        setStudentName(`Học sinh ${Math.floor(Math.random() * 1000)}`);
      }
    } else {
      setStudentName(`Học sinh ${Math.floor(Math.random() * 1000)}`);
    }
  }, []);

  useEffect(() => {
    if (restored || loadingStarted.current) return;
    loadingStarted.current = true;
    const loadQuestions = async () => {
      if (reviewMistakes) {
        const list = getMistakes(owner).filter(m => !m.resolved && (!filter || (m.question.topic || 'Chung') === filter))
          .map((m, i) => ({ ...m.question, id: 'review_' + i }));
        setQuizQuestions(list);
        applyPracticeScoring(list);
        setStartTime(Date.now());
        return;
      }
      if (mode === 'exam' && examId) {
        try {
          const res = await fetch(`/api/exam/${examId}`);
          const data = await res.json();
          if (data.success) {
            setQuizQuestions(data.exam.questions);
            if (data.exam.scoringConfig) setScoringConfig(data.exam.scoringConfig);
          } else {
            alert(data.error || 'Không tìm thấy đề thi!');
            navigate('/exam');
            return;
          }
        } catch (err) {
          console.error('Lỗi khi tải đề thi:', err);
          alert('Lỗi kết nối đến máy chủ!');
          navigate('/exam');
          return;
        }
      } else if (useAI && filter && (mode === 'lesson' || mode === 'topic' || mode === 'format')) {
        setIsGenerating(true);
        try {
          // Khi 'all': AI tạo theo số câu thực trong ngân hàng (tối đa 40 câu để tránh AI timeout)
          const count = countParam === 'all'
            ? Math.min(40, questions.filter(q =>
                mode === 'lesson' ? (q.lesson === filter || q.lesson?.toLowerCase().includes((filter || '').toLowerCase()))
                : mode === 'topic' ? q.topic === filter
                : mode === 'format' ? q.type === filter
                : true
              ).length || 20)
            : parseInt(countParam || '10', 10);

          // Bước 1: Đọc file thư viện — lỗi bị bỏ qua, AI vẫn chạy không có context
          let fileContext: string | File | undefined = undefined;
          if (libraryFileId) {
            try {
              const fileSnap = await get(ref(rtdb, `library_files/${libraryFileId}`));
              if (fileSnap.exists()) {
                const fileData = fileSnap.val();
                const fileUrl = fileData.storagePath || fileData.fileUrl;
                fileContext = await extractTextFromUrl(fileUrl, fileData.fileType, fileData.fileName);
              }
            } catch (fileErr) {
              console.warn('[Quiz] Không đọc được file thư viện, tiếp tục gọi AI không có context:', fileErr);
            }
          }

          // Bước 2: Gọi AI với timeout 90 giây để hoàn thành đủ số câu hỏi yêu cầu
          const aiPromise = examService.generatePracticeQuestions(filter, mode, count, fileContext);
          const timeoutPromise = new Promise<Question[]>((_, reject) =>
            setTimeout(() => reject(new Error('AI_TIMEOUT')), 90000)
          );
          const aiQuestions = await Promise.race([aiPromise, timeoutPromise]);
          setQuizQuestions(aiQuestions);
          applyPracticeScoring(aiQuestions);
        } catch (err: any) {
          console.error('Lỗi khi tạo câu hỏi AI:', err);
          const msg = err?.message || String(err);
          const count = countParam === 'all' ? 20 : parseInt(countParam || '10', 10);
          if (msg === 'AI_TIMEOUT') {
            console.warn(`[Quiz] AI timeout sau 90s — tự động chuẩn bị đủ ${count} câu hỏi chất lượng cao từ ngân hàng`);
          } else if (msg.includes('API Key') || msg.includes('apiKey') || msg.includes('Chưa thiết lập') || msg.includes('API_KEY_INVALID')) {
            alert(`⚠️ Chưa thiết lập Google Gemini API Key trong Cấu hình AI.\nHệ thống đang chuẩn bị đầy đủ ${count} câu hỏi chất lượng cao từ ngân hàng đề cho bạn.`);
          } else {
            console.warn(`[Quiz] Không thể tạo câu hỏi AI (${msg.slice(0, 80)}). Đang dùng ngân hàng câu hỏi có sẵn.`);
          }
          // Fallback to static questions
          loadStaticQuestions();
        } finally {
          setIsGenerating(false);
        }
      } else {
        loadStaticQuestions();
      }

      setStartTime(Date.now());
      setTimeLeft(3000); // Reset timer to 50 minutes
    };

    const loadStaticQuestions = () => {
      let preferredPool = questions;
      if (mode === 'lesson' && filter) {
        preferredPool = questions.filter(q =>
          q.lesson === filter ||
          q.lesson?.toLowerCase().includes(filter.toLowerCase()) ||
          filter.toLowerCase().includes(q.lesson?.toLowerCase() || '')
        );
      } else if (mode === 'topic' && filter) {
        preferredPool = questions.filter(q => q.topic === filter);
      } else if (mode === 'format' && filter) {
        preferredPool = questions.filter(q => q.type === filter);
      }

      // Khi theo bài học (lesson) hoặc chủ đề (topic), CHỈ lấy câu trong phạm vi đó
      // Khi theo dạng thức (format), câu hỏi có thể đến từ toàn bộ ngân hàng
      const isStrictScope = (mode === 'lesson' || mode === 'topic') && !!filter;

      const getQuestions = (type: QuestionType, count: number) => {
        let selected = preferredPool.filter(q => q.type === type);
        selected = selected.sort(() => 0.5 - Math.random());

        if (selected.length >= count) {
          return selected.slice(0, count);
        }

        // Nếu là bài học / chủ đề → KHÔNG bổ sung từ bài khác (giữ đúng phạm vi)
        if (isStrictScope) {
          return selected; // Trả về những gì có, dù ít hơn yêu cầu
        }

        // Chỉ bổ sung khi là dạng thức hoặc không có filter
        const remaining = count - selected.length;
        let others = questions.filter(q => q.type === type && !selected.includes(q));
        others = others.sort(() => 0.5 - Math.random());
        return [...selected, ...others.slice(0, remaining)];
      };

      let finalQuestions: Question[] = [];
      if (mode === 'exam') {
        finalQuestions = [
          ...getQuestions('multiple_choice', 18),
          ...getQuestions('true_false', 4),
          ...getQuestions('short_answer', 6)
        ];
      } else if (countParam) {
        const requestedCount = countParam === 'all' ? preferredPool.length : parseInt(countParam, 10);
        let shuffled = [...preferredPool].sort(() => 0.5 - Math.random());
        if (shuffled.length >= requestedCount) {
          finalQuestions = shuffled.slice(0, requestedCount);
        } else if (isStrictScope) {
          // Bài học / chủ đề không đủ câu → lấy hết những gì có trong phạm vi, KHÔNG pha trộn bài khác
          finalQuestions = shuffled;
        } else {
          // format hoặc không filter → bổ sung từ ngân hàng chung (hành vi cũ)
          const remainingNeeded = requestedCount - shuffled.length;
          const fallbackPool = questions.filter(q => !preferredPool.includes(q));
          const bonus = [...fallbackPool].sort(() => 0.5 - Math.random()).slice(0, remainingNeeded);
          finalQuestions = [...shuffled, ...bonus];
        }
      } else {
        finalQuestions = [
          ...getQuestions('multiple_choice', 12),
          ...getQuestions('true_false', 4),
          ...getQuestions('short_answer', 6)
        ];
      }
      setQuizQuestions(finalQuestions);
      applyPracticeScoring(finalQuestions);
    };

    loadQuestions();
  }, [mode, filter, examId, navigate, useAI, countParam, libraryFileId]);

  useEffect(() => {
    if (!isFinished) draft.persist({ questions: quizQuestions, currentIndex, startTime, mcAnswer, tfAnswer, saAnswer,
      detailedAnswers, isSubmitted, isAnswerCorrect, score, scoringConfig }, reviewMistakes ? 'Ôn lại câu sai' : filter || 'Bài luyện tập');
  });

  useEffect(() => {
    if (mode === 'exam' && studentName && !hasJoined) {
      const targetExamId = examId || 'exam_local';
      liveTrackingService.joinLiveExam(targetExamId, studentSessionId, {
        name: studentName,
        className: profile?.className || 'Chưa xác định'
      });
      setHasJoined(true);
    }
  }, [mode, studentName, hasJoined, examId, profile, studentSessionId]);

  useEffect(() => {
    if (isFinished || !startTime || quizQuestions.length === 0) return;

    if (timeLeft <= 0) {
      setTimeRanOut(true);
      finishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(remainingSeconds(startTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, quizQuestions.length, startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quizQuestions[currentIndex];

  const isAnswerComplete = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'multiple_choice') return mcAnswer !== null;
    if (currentQuestion.type === 'true_false') return Object.keys(tfAnswer).length === currentQuestion.statements.length;
    if (currentQuestion.type === 'short_answer') return saAnswer.trim() !== '';
    return false;
  };

  const handleSubmit = async () => {
    if (!isAnswerComplete() || isSubmitted) return;

    setIsSubmitted(true);
    let isCorrect = false;
    let userAnswerForAi: any = null;
    let pointsEarned = 0;

    if (currentQuestion.type === 'multiple_choice') {
      isCorrect = mcAnswer === currentQuestion.correctAnswerIndex;
      userAnswerForAi = mcAnswer;
      pointsEarned = getPoints('multiple_choice', isCorrect, 0, scoringConfig);
    } else if (currentQuestion.type === 'true_false') {
      let correctCount = 0;
      currentQuestion.statements.forEach(stmt => {
        if (tfAnswer[stmt.id] === stmt.isTrue) correctCount++;
      });
      isCorrect = correctCount === currentQuestion.statements.length;
      userAnswerForAi = tfAnswer;
      pointsEarned = getPoints('true_false', isCorrect, correctCount, scoringConfig);

    } else if (currentQuestion.type === 'short_answer') {
      isCorrect = isShortAnswerCorrect(saAnswer, currentQuestion.correctAnswer);
      userAnswerForAi = saAnswer.trim();
      pointsEarned = getPoints('short_answer', isCorrect, 0, scoringConfig);
    }

    const newTotal = scoreRef.current + pointsEarned;
    scoreRef.current = newTotal;
    setScore(newTotal);
    setIsAnswerCorrect(isCorrect);

    // Record rich answer data for topic analysis
    setDetailedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        topic: currentQuestion.topic || 'Chung',
        isCorrect,
        userAnswer: userAnswerForAi,
      }
    }));

    if (mode === 'exam') {
      liveTrackingService.updateLiveProgress(examId || 'exam_local', studentSessionId, currentIndex + 1, newTotal);
    }

    if (!recordAnswers(owner, [{ question: currentQuestion, answer: userAnswerForAi }])) {
      setStorageError('Không lưu được sổ câu sai. Hãy kiểm tra dung lượng hoặc quyền lưu trữ của trình duyệt.');
    }
    if (reviewMistakes) {
      setAiExplanation(currentQuestion.explanation || 'Hãy đối chiếu đáp án; hỏi giáo viên nếu cần giải thích thêm.');
      return;
    }
    const answeredIndex = currentIndex;
    setIsAiLoading(true);
    try {
    const explanation = await getExplanation(
      currentQuestion,
      userAnswerForAi,
      isCorrect,
      profile || undefined
    );
    if (activeIndex.current === answeredIndex && !finishedRef.current) setAiExplanation(explanation);
    } catch {
      if (activeIndex.current === answeredIndex) setAiExplanation(currentQuestion.explanation || 'Chưa tải được giải thích AI. Đáp án đã được ghi nhận.');
    } finally {
      if (activeIndex.current === answeredIndex) setIsAiLoading(false);
    }
  };

  const activeIndex = useRef(currentIndex);
  activeIndex.current = currentIndex;
  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      activeIndex.current = currentIndex + 1;
      setIsAiLoading(false);
      setCurrentIndex(i => i + 1);
      setMcAnswer(null);
      setTfAnswer({});
      setSaAnswer('');
      setIsSubmitted(false);
      setIsAnswerCorrect(null);
      setAiExplanation(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsFinished(true);
    const completeAnswers = { ...detailedAnswers };
    const omitted = quizQuestions.filter(q => !completeAnswers[q.id]);
    omitted.forEach(q => { completeAnswers[q.id] = { topic: q.topic || 'Chung', isCorrect: false, userAnswer: null }; });
    if (!recordAnswers(owner, omitted.map(question => ({ question, answer: null })))) setStorageError('Không lưu được một số câu vào sổ câu sai.');
    draft.clear();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    if (mode === 'exam') {
      liveTrackingService.finishLiveExam(examId || 'exam_local', studentSessionId, timeSpent);
    }

    const attempt: Omit<QuizAttempt, 'id'> = {
      userId: user?.uid || 'anonymous',
      userName: profile?.name || user?.displayName || 'Học sinh ẩn danh',
      className: profile?.className || 'Chưa xác định',
      examId: examId || 'local',
      examTitle: reviewMistakes ? 'Ôn lại câu sai' : mode === 'exam' ? 'Đề thi tham khảo 2026' : (filter || 'Luyện tập'),
      date: new Date().toISOString(),
      mode,
      score: Number(scoreRef.current.toFixed(2)),
      totalQuestions: quizQuestions.length,
      timeSpent,
      answers: completeAnswers
    };

    try { await examService.saveAttempt(attempt); } catch { setStorageError('Chưa lưu được kết quả bài làm. Hãy giữ trang này để xem lại kết quả.'); }
  };

  const mcQs = quizQuestions.filter(q => q.type === 'multiple_choice').length;
  const tfQs = quizQuestions.filter(q => q.type === 'true_false').length;
  const saQs = quizQuestions.filter(q => q.type === 'short_answer').length;
  const maxScore = calcMaxScore(mcQs, tfQs, saQs, scoringConfig);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AI đang tạo câu hỏi...</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Chúng tôi đang biên soạn các câu hỏi bám sát nội dung "{filter}" theo cấu trúc mới 2025. Vui lòng đợi trong giây lát.
        </p>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return <div className="text-center p-10">Không tìm thấy câu hỏi nào.</div>;
  }

  if (isFinished) {
    if (isReviewMode) {
      // Build a mock answers record keyed by index for ExamReviewCard
      const answersForReview: Record<number, any> = {};
      quizQuestions.forEach((q, idx) => {
        const rich = detailedAnswers[q.id];
        if (rich) answersForReview[idx] = rich.userAnswer;
      });
      const isCorrectFn = (idx: number) => {
        const q = quizQuestions[idx];
        const ans = answersForReview[idx];
        if (q.type === 'multiple_choice') return ans === (q as any).correctAnswerIndex;
        if (q.type === 'true_false') return ans ? (q as any).statements.every((s: any) => ans[s.id] === s.isTrue) : false;
        if (q.type === 'short_answer') return ans ? isShortAnswerCorrect(ans.toString(), (q as any).correctAnswer) : false;
        return false;
      };
      const isStatementCorrectFn = (qIdx: number, stmtId: string) => {
        const q = quizQuestions[qIdx];
        const ans = answersForReview[qIdx];
        if (q.type !== 'true_false' || !ans) return false;
        const stmt = (q as any).statements.find((s: any) => s.id === stmtId);
        return stmt && ans[stmtId] === stmt.isTrue;
      };
      return (
        <ExamReviewCard
          examQuestions={quizQuestions}
          answers={answersForReview}
          finalScore={score}
          maxPossibleScore={maxScore}
          detailedExplanations={{}}
          loadingExplanation={null}
          handleGetDetailedExplanation={async () => { }}
          setIsReviewMode={setIsReviewMode}
          navigate={navigate}
          isCorrect={isCorrectFn}
          isStatementCorrect={isStatementCorrectFn}
        />
      );
    }
    return (
      <div><p role="status" className="text-amber-200 mb-3">{storageError || draft.error}</p><button onClick={() => navigate('/mistakes')} className="mb-4 px-4 py-2 bg-sky-700 text-white rounded-xl">Mở sổ câu sai</button><QuizResultCard
        timeRanOut={timeRanOut}
        mode={mode}
        filter={filter}
        score={score}
        maxScore={maxScore}
        startTime={startTime}
        navigate={navigate}
        onReview={() => setIsReviewMode(true)}
      /></div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-36 md:pb-12 px-2 sm:px-4">
      <DraftStatus restored={!!restored} error={storageError || draft.error} />
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs sm:text-sm font-bold text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-700">
            Câu {currentIndex + 1} / {quizQuestions.length}
          </div>
          <div className={cn(
            "text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors",
            timeLeft < 300 ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse" : "bg-slate-900/90 text-slate-300 border-slate-700"
          )}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="p-1.5 sm:p-2 px-3 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Tra cứu 34 Tỉnh & 6 Vùng (TT17)"
          >
            <Map size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Tra cứu</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFormulasOpen(true)}
            className="p-1.5 sm:p-2 px-3 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Sổ tay Công thức & Máy tính"
          >
            <Calculator size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Máy tính</span>
          </button>
          <div className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
            Điểm: {score.toFixed(2)}
          </div>
        </div>
      </div>

      <QuizActiveCard
        currentQuestion={currentQuestion}
        currentIndex={currentIndex}
        isSubmitted={isSubmitted}
        mcAnswer={mcAnswer}
        tfAnswer={tfAnswer}
        saAnswer={saAnswer}
        setMcAnswer={setMcAnswer}
        setTfAnswer={setTfAnswer}
        setSaAnswer={setSaAnswer}
        aiExplanation={aiExplanation}
        isAiLoading={isAiLoading}
        isAnswerCorrect={isAnswerCorrect}
      />

      <div className="flex justify-end mt-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!isAnswerComplete()}
            className="px-8 py-3.5 min-h-[50px] bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg w-full sm:w-auto"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-3.5 min-h-[50px] bg-blue-600 text-white rounded-2xl font-black text-base hover:bg-blue-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span>{currentIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài thi'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <AITutorChatbot />
      <GeoFormulasModal
        isOpen={isFormulasOpen}
        onClose={() => setIsFormulasOpen(false)}
        onApplyResult={(val) => {
          if (currentQuestion && currentQuestion.type === 'short_answer') {
            setSaAnswer(val);
          }
        }}
      />
      <InteractiveMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
}
