export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';
export type UserRole = 'student' | 'teacher';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  topic: string;
  lesson?: string;
  context?: string;
  imageUrl?: string; // URL or base64 of chart/map/diagram image
  cognitiveLevel?: CognitiveLevel;
  explanation?: string;
  tips?: string;
  mnemonics?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correctAnswerIndex: number;
}

export interface TrueFalseStatement {
  id: string;
  text: string;
  isTrue: boolean;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  statements: TrueFalseStatement[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  correctAnswer: string | number;
  unit?: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;

export interface Exam {
  id: string;
  title: string;
  creatorId: string;
  type: 'ai' | 'upload' | 'assignment';
  fileUrl?: string;
  fileType?: 'word' | 'pdf' | 'html';
  questions: Question[];
  createdAt: string;
  description?: string;
}

export interface ExamAssignment {
  id: string;
  examId: string;
  examTitle: string;
  assignedBy: string; // teacher name or uid
  targetClass: string; // className, or 'all'
  dueDate?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'new_exam';
  examId: string;
  examTitle: string;
  message: string;
  assignedBy: string;
  read: boolean;
  createdAt: string;
  dueDate?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  userName?: string;
  className?: string;
  examId: string;
  examTitle: string;
  date: string;
  mode: 'lesson' | 'topic' | 'exam';
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: Record<string, any>;
  teacherComment?: string;
  studentProgress?: string;
}

export interface UserProfile {
  uid?: string;
  email?: string;
  name: string;
  role?: UserRole;
  className: string;
  school?: string;
  targetScore?: string;
}

export interface StudentSummary {
  key: string;           // userId or userName (for guests)
  userName: string;
  className: string;
  totalAttempts: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  lastAttemptDate: string;
  attempts: QuizAttempt[];
}

export interface TopicStats {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}
