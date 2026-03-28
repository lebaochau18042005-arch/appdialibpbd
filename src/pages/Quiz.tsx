import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { examService } from '../services/examService';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2, RefreshCcw, Home, Clock } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { liveTrackingService } from '../services/liveTrackingService';
import { questions } from '../data';
import { Question, QuestionType, QuizAttempt, UserProfile } from '../types';
import { getExplanation } from '../services/ai';
import { cn } from '../utils/cn';
import QuizActiveCard from '../components/exam/QuizActiveCard';
import QuizResultCard from '../components/exam/QuizResultCard';
import AITutorChatbot from '../components/ai/AITutorChatbot';

export default function Quiz() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') as 'lesson' | 'topic' | 'exam' || 'exam';
  const filter = searchParams.get('filter');
  const examId = searchParams.get('examId');
  const countParam = searchParams.get('count');
  const useAI = searchParams.get('useAI') === 'true';

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Answer states
  const [mcAnswer, setMcAnswer] = useState<number | null>(null);
  const [tfAnswer, setTfAnswer] = useState<Record<string, boolean>>({});
  const [saAnswer, setSaAnswer] = useState<string>('');
  const [detailedAnswers, setDetailedAnswers] = useState<Record<string, { topic: string; isCorrect: boolean; userAnswer: any }>>({}); // per-question rich results
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0); // Raw score for simplicity
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  
  // Timer states (50 minutes = 3000 seconds)
  const [timeLeft, setTimeLeft] = useState(3000);
  const [timeRanOut, setTimeRanOut] = useState(false);
  
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentSessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [studentName, setStudentName] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('examGeoProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setStudentName(parsed.name || 'Học sinh ẩn danh');
    } else {
      setStudentName(`Học sinh ${Math.floor(Math.random() * 1000)}`);
    }
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      if (mode === 'exam' && examId) {
        try {
          const res = await fetch(`/api/exam/${examId}`);
          const data = await res.json();
          if (data.success) {
            setQuizQuestions(data.exam.questions);
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
      } else if (useAI && filter && (mode === 'lesson' || mode === 'topic')) {
        setIsGenerating(true);
        try {
          const count = countParam === 'all' ? 20 : parseInt(countParam || '10', 10);
          const aiQuestions = await examService.generatePracticeQuestions(filter, mode, count);
          setQuizQuestions(aiQuestions);
        } catch (err) {
          console.error('Lỗi khi tạo câu hỏi AI:', err);
          alert('Không thể tạo câu hỏi AI lúc này. Hệ thống sẽ sử dụng ngân hàng câu hỏi có sẵn.');
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
        preferredPool = questions.filter(q => q.lesson === filter);
      } else if (mode === 'topic' && filter) {
        preferredPool = questions.filter(q => q.topic === filter);
      }

      const getQuestions = (type: QuestionType, count: number) => {
        let selected = preferredPool.filter(q => q.type === type);
        selected = selected.sort(() => 0.5 - Math.random());
        
        if (selected.length >= count) {
          return selected.slice(0, count);
        }
        
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
        const count = countParam === 'all' ? preferredPool.length : parseInt(countParam, 10);
        let shuffled = [...preferredPool].sort(() => 0.5 - Math.random());
        finalQuestions = shuffled.slice(0, count);
      } else {
        finalQuestions = [
          ...getQuestions('multiple_choice', 12),
          ...getQuestions('true_false', 4),
          ...getQuestions('short_answer', 6)
        ];
      }
      setQuizQuestions(finalQuestions);
    };

    loadQuestions();
  }, [mode, filter, examId, navigate, useAI, countParam]);

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
    if (isFinished || quizQuestions.length === 0) return;
    
    if (timeLeft <= 0) {
      setTimeRanOut(true);
      finishQuiz();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, quizQuestions.length]);

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
      if (isCorrect) pointsEarned = 0.25;
    } else if (currentQuestion.type === 'true_false') {
      let correctCount = 0;
      currentQuestion.statements.forEach(stmt => {
        if (tfAnswer[stmt.id] === stmt.isTrue) correctCount++;
      });
      isCorrect = correctCount === currentQuestion.statements.length;
      userAnswerForAi = tfAnswer;
      
      // Official scoring for TF
      if (correctCount === 1) pointsEarned = 0.1;
      else if (correctCount === 2) pointsEarned = 0.25;
      else if (correctCount === 3) pointsEarned = 0.5;
      else if (correctCount === 4) pointsEarned = 1.0;
      
    } else if (currentQuestion.type === 'short_answer') {
      isCorrect = saAnswer.trim() === currentQuestion.correctAnswer.toString();
      userAnswerForAi = saAnswer.trim();
      if (isCorrect) pointsEarned = 0.25;
    }
    
    setScore(s => s + pointsEarned);
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
      const newScore = score + pointsEarned;
      liveTrackingService.updateLiveProgress(examId || 'exam_local', studentSessionId, currentIndex + 1, newScore);
    }
    
    setIsAiLoading(true);
    const explanation = await getExplanation(
      currentQuestion,
      userAnswerForAi,
      isCorrect,
      profile || undefined
    );
    setAiExplanation(explanation);
    setIsAiLoading(false);
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
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
    setIsFinished(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    if (mode === 'exam') {
      liveTrackingService.finishLiveExam(examId || 'exam_local', studentSessionId, timeSpent);
    }
    
    const attempt: Omit<QuizAttempt, 'id'> = {
      userId: user?.uid || 'anonymous',
      userName: profile?.name || user?.displayName || 'Học sinh ẩn danh',
      className: profile?.className || 'Chưa xác định',
      examId: examId || 'local',
      examTitle: mode === 'exam' ? 'Đề thi tham khảo 2025' : (filter || 'Luyện tập'),
      date: new Date().toISOString(),
      mode,
      score: Number(score.toFixed(2)),
      totalQuestions: quizQuestions.length,
      timeSpent,
      answers: detailedAnswers
    };

    await examService.saveAttempt(attempt);
  };

  const maxScore = quizQuestions.reduce((acc, q) => {
    if (q.type === 'multiple_choice') return acc + 0.25;
    if (q.type === 'true_false') return acc + 1.0;
    if (q.type === 'short_answer') return acc + 0.25;
    return acc;
  }, 0);

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
    return (
      <QuizResultCard
        timeRanOut={timeRanOut}
        mode={mode}
        filter={filter}
        score={score}
        maxScore={maxScore}
        startTime={startTime}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
            Câu {currentIndex + 1} / {quizQuestions.length}
          </div>
          <div className={cn(
            "text-sm font-medium px-3 py-1 rounded-full shadow-sm border flex items-center gap-1.5 transition-colors",
            timeLeft < 300 ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : "bg-white text-slate-600 border-slate-100"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Điểm: {score.toFixed(2)}
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

      <div className="flex justify-end">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!isAnswerComplete()}
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md w-full md:w-auto"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 w-full md:w-auto"
          >
            {currentIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <AITutorChatbot />
    </div>
  );
}
