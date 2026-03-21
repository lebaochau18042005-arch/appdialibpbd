import { db, handleFirestoreError, OperationType, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, setDoc, onSnapshot, Unsubscribe, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Question, Exam, QuizAttempt, UserProfile } from '../types';
import { Type } from "@google/genai";
import { generateContentWithFallback } from './ai';

// ===== LocalStorage Fallback Helpers =====
const LS_EXAM_KEY = 'geo_pro_local_exams';
const LS_ATTEMPT_KEY = 'geo_pro_local_attempts';

function lsGetExams(): Exam[] {
  try { return JSON.parse(localStorage.getItem(LS_EXAM_KEY) || '[]'); } catch { return []; }
}
function lsSaveExam(exam: Exam): void {
  const exams = lsGetExams().filter(e => e.id !== exam.id);
  localStorage.setItem(LS_EXAM_KEY, JSON.stringify([exam, ...exams]));
}
function lsDeleteExam(id: string): void {
  localStorage.setItem(LS_EXAM_KEY, JSON.stringify(lsGetExams().filter(e => e.id !== id)));
}
function lsGetAttempts(): QuizAttempt[] {
  try { return JSON.parse(localStorage.getItem(LS_ATTEMPT_KEY) || '[]'); } catch { return []; }
}
function lsSaveAttempt(attempt: QuizAttempt): void {
  const attempts = lsGetAttempts();
  localStorage.setItem(LS_ATTEMPT_KEY, JSON.stringify([attempt, ...attempts]));
}
function isPermissionError(e: unknown): boolean {
  return e instanceof Error && e.message.includes('Missing or insufficient permissions');
}
// ==========================================

export const examService = {
  // Real-time listeners
  subscribeToAttempts(callback: (attempts: QuizAttempt[]) => void): Unsubscribe {
    const q = collection(db, 'attempts');
    const unsub = onSnapshot(q, (snapshot) => {
      const fsAttempts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizAttempt));
      const lsAttempts = lsGetAttempts().filter(la => !fsAttempts.find(fa => fa.id === la.id));
      callback([...fsAttempts, ...lsAttempts]);
    }, (_error) => {
      // Firestore failed - use only localStorage
      callback(lsGetAttempts());
    });
    return unsub;
  },

  subscribeToExams(creatorId: string, callback: (exams: Exam[]) => void): Unsubscribe {
    const q = query(collection(db, 'exams'), where('creatorId', '==', creatorId));
    const unsub = onSnapshot(q, (snapshot) => {
      const fsExams = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      const lsExams = lsGetExams().filter(le => le.creatorId === creatorId && !fsExams.find(fe => fe.id === le.id));
      callback([...fsExams, ...lsExams]);
    }, (_error) => {
      // Firestore failed - use only localStorage
      callback(lsGetExams().filter(e => e.creatorId === creatorId));
    });
    return unsub;
  },

  // Generate AI Exam based on 2025 structure using Gemini
  async generateAIExam(): Promise<Question[]> {
    try {
      const model = "gemini-3-flash-preview";
      const systemInstruction = `Bạn là một chuyên gia biên soạn đề thi Địa lí THPT Quốc gia hàng đầu Việt Nam. 
      Nhiệm vụ của bạn là tạo ra một bộ đề thi TRỌN VẸN gồm ĐÚNG 28 CÂU HỎI theo cấu trúc mới 2025 và cập nhật mới nhất từ các văn bản sửa đổi chương trình.
      
      QUY TẮC BẮT BUỘC:
      1. SỐ LƯỢNG CÂU HỎI: Phải tạo đủ 28 câu hỏi (18 Phần I, 4 Phần II, 6 Phần III).
      2. CẬP NHẬT NỘI DUNG CHI TIẾT (Theo văn bản mới):
         - THUẬT NGỮ: Sử dụng "Địa lí các vùng kinh tế - xã hội" thay cho "Địa lí các vùng kinh tế".
         - VỊ TRÍ & LÃNH THỔ: Tập trung xác định đặc điểm trên bản đồ.
         - LAO ĐỘNG: Phân tích tình hình sử dụng lao động theo ngành và thành phần kinh tế.
         - ĐÔ THỊ HÓA: Trình bày đặc điểm đô thị hóa tại Việt Nam.
         - CHUYỂN DỊCH CƠ CẤU KINH TẾ: Theo ngành, theo thành phần kinh tế và theo lãnh thổ.
         - NÔNG NGHIỆP: Phân tích các hình thức tổ chức lãnh thổ (trang trại, khu nông nghiệp công nghệ cao, vùng chuyên canh).
         - CÔNG NGHIỆP: Tập trung vào khu công nghiệp, khu công nghệ cao.
         - DU LỊCH: Phân tích sự phân hóa lãnh thổ du lịch và phát triển bền vững.
         - CÁC VÙNG:
            + Trung du và miền núi phía Bắc: Khoáng sản, thủy điện, cây trồng cận nhiệt/ôn đới, chăn nuôi gia súc lớn.
            + Đồng bằng sông Hồng: Công nghiệp, dịch vụ, kinh tế biển.
            + Bắc Trung Bộ: Thế mạnh và phát triển du lịch.
            + Nam Trung Bộ: Kinh tế biển, thủy điện, khoáng sản (bôxit), cây công nghiệp lâu năm, lâm nghiệp, du lịch.
            + Đông Nam Bộ: Công nghiệp, dịch vụ, nông nghiệp, kinh tế biển.
         - BÃI BỎ: Không ra đề về nội dung "Phát triển các vùng kinh tế trọng điểm".
      3. KHÔNG SỬ DỤNG ATLAT: Thay thế mọi yêu cầu sử dụng Atlat bằng việc sử dụng "Bản đồ" hoặc kiến thức đã học.
      4. YÊU CẦU PHẦN II (ĐÚNG/SAI): Luôn có 1 câu về bảng số liệu/biểu đồ Đông Nam Á (Lớp 11).
      5. GIẢI THÍCH CHI TIẾT: Mỗi câu hỏi PHẢI có explanation, tips, và mnemonics.`;

      const prompt = `Hãy tạo ngay một đề thi Địa lí chuẩn 2025 gồm 28 câu hỏi. 
      Đảm bảo cập nhật đầy đủ các sửa đổi mới nhất:
      - Thuật ngữ "vùng kinh tế - xã hội".
      - Tập trung vào các hình thức tổ chức lãnh thổ nông nghiệp/công nghiệp mới.
      - Phân tích du lịch bền vững.
      - KHÔNG có câu hỏi Atlat, KHÔNG có vùng kinh tế trọng điểm.
      - Phần II có câu bảng số liệu Đông Nam Á.
      - Mỗi câu hỏi có giải thích, lời khuyên và mẹo ghi nhớ.`;

      const response = await generateContentWithFallback(prompt, {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["multiple_choice", "true_false", "short_answer"] },
              text: { type: Type.STRING },
              topic: { type: Type.STRING },
              lesson: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              tips: { type: Type.STRING },
              mnemonics: { type: Type.STRING },
              correctAnswer: { type: Type.STRING },
              unit: { type: Type.STRING },
              cognitiveLevel: { type: Type.STRING, enum: ["Nhận biết", "Thông hiểu", "Vận dụng"] },
              statements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    isTrue: { type: Type.BOOLEAN }
                  }
                }
              }
            },
            required: ["id", "type", "text", "explanation"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("AI không trả về nội dung.");
      
      const examQuestions = JSON.parse(text);
      if (!Array.isArray(examQuestions) || examQuestions.length === 0) {
        throw new Error("Dữ liệu đề thi không hợp lệ.");
      }

      return examQuestions;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  async generatePracticeQuestions(topicOrLesson: string, mode: 'topic' | 'lesson', count: number): Promise<Question[]> {
    try {
      const model = "gemini-3-flash-preview";
      const systemInstruction = `Bạn là một chuyên gia biên soạn đề thi Địa lí THPT Quốc gia hàng đầu Việt Nam. 
      Nhiệm vụ của bạn là tạo ra ${count} câu hỏi luyện tập về ${mode === 'topic' ? 'chủ đề' : 'bài học'}: "${topicOrLesson}".
      
      QUY TẮC BẮT BUỘC:
      1. CẤU TRÚC: Kết hợp các loại câu hỏi (Trắc nghiệm, Đúng/Sai, Trả lời ngắn) theo tỉ lệ phù hợp.
      2. CẬP NHẬT NỘI DUNG: Bám sát chương trình mới 2025.
      3. KHÔNG SỬ DỤNG ATLAT.
      4. GIẢI THÍCH CHI TIẾT: Mỗi câu hỏi PHẢI có explanation, tips, và mnemonics.
      5. ĐỘ KHÓ: Phân bổ từ Nhận biết đến Vận dụng.`;

      const prompt = `Hãy tạo ${count} câu hỏi Địa lí về ${mode === 'topic' ? 'chủ đề' : 'bài học'} "${topicOrLesson}".
      Đảm bảo nội dung chính xác, cập nhật và có giải thích chi tiết.`;

      const response = await generateContentWithFallback(prompt, {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["multiple_choice", "true_false", "short_answer"] },
              text: { type: Type.STRING },
              topic: { type: Type.STRING },
              lesson: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              tips: { type: Type.STRING },
              mnemonics: { type: Type.STRING },
              correctAnswer: { type: Type.STRING },
              unit: { type: Type.STRING },
              cognitiveLevel: { type: Type.STRING, enum: ["Nhận biết", "Thông hiểu", "Vận dụng"] },
              statements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    isTrue: { type: Type.BOOLEAN }
                  }
                }
              }
            },
            required: ["id", "type", "text", "explanation"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("AI không trả về nội dung.");
      
      const questions = JSON.parse(text);
      return questions;
    } catch (error) {
      console.error("AI Practice Generation Error:", error);
      throw error;
    }
  },

  async saveExam(exam: Omit<Exam, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'exams'), exam);
      return docRef.id;
    } catch (error) {
      if (isPermissionError(error)) {
        // Firestore blocked - fall back to localStorage
        const localId = `local_${Date.now()}`;
        lsSaveExam({ id: localId, ...exam });
        return localId;
      }
      handleFirestoreError(error, OperationType.CREATE, 'exams');
      return '';
    }
  },

  async getExamsByCreator(creatorId: string): Promise<Exam[]> {
    try {
      const q = query(collection(db, 'exams'), where('creatorId', '==', creatorId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'exams');
      return [];
    }
  },

  async getAllExams(): Promise<Exam[]> {
    const lsExams = lsGetExams();
    try {
      const querySnapshot = await getDocs(collection(db, 'exams'));
      const fsExams = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      // Merge: local exams not in Firestore
      const onlyLocal = lsExams.filter(le => !fsExams.find(fe => fe.id === le.id));
      return [...fsExams, ...onlyLocal];
    } catch (error) {
      if (isPermissionError(error)) return lsExams;
      handleFirestoreError(error, OperationType.LIST, 'exams');
      return lsExams;
    }
  },

  async saveUploadedExam(title: string, creatorId: string, file: File, fileType: 'word' | 'pdf' | 'html'): Promise<string> {
    try {
      // 1. Upload file to Firebase Storage
      const storageRef = ref(storage, `exams/${creatorId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);

      // 2. Save metadata to Firestore
      const examData = {
        title,
        creatorId,
        type: 'upload',
        fileUrl,
        fileType,
        questions: [], 
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'exams'), examData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'exams');
      return '';
    }
  },

  async deleteExam(examId: string): Promise<void> {
    // Try localStorage first
    lsDeleteExam(examId);
    try {
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        const exam = examSnap.data() as Exam;
        if (exam.type === 'upload' && exam.fileUrl) {
          try {
            const fileRef = ref(storage, exam.fileUrl);
            await deleteObject(fileRef);
          } catch (storageErr) {
            console.error("Error deleting file from storage:", storageErr);
          }
        }
        await deleteDoc(examRef);
      }
    } catch (error) {
      if (!isPermissionError(error)) {
        handleFirestoreError(error, OperationType.DELETE, `exams/${examId}`);
      }
    }
  },

  async saveAttempt(attempt: Omit<QuizAttempt, 'id'>): Promise<string> {
    const attemptWithDate = { ...attempt, date: new Date().toISOString() };
    try {
      const docRef = await addDoc(collection(db, 'attempts'), attemptWithDate);
      return docRef.id;
    } catch (error) {
      if (isPermissionError(error)) {
        const localId = `la_${Date.now()}`;
        lsSaveAttempt({ id: localId, ...attemptWithDate } as QuizAttempt);
        return localId;
      }
      handleFirestoreError(error, OperationType.CREATE, 'attempts');
      return '';
    }
  },

  async getStudentAttempts(userId: string): Promise<QuizAttempt[]> {
    try {
      const q = query(collection(db, 'attempts'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'attempts');
      return [];
    }
  },

  async getAllAttempts(): Promise<QuizAttempt[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'attempts'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'attempts');
      return [];
    }
  },

  async addTeacherComment(attemptId: string, comment: string, progress: string): Promise<void> {
    try {
      const docRef = doc(db, 'attempts', attemptId);
      await updateDoc(docRef, {
        teacherComment: comment,
        studentProgress: progress
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `attempts/${attemptId}`);
    }
  },

  async downloadExam(examId: string): Promise<void> {
    try {
      console.log("Downloading exam:", examId);
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        const exam = examSnap.data() as Exam;
        const safeTitle = (exam.title || 'De_thi').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        if (exam.type === 'upload' && exam.fileUrl) {
          const link = document.createElement('a');
          link.href = exam.fileUrl;
          const ext = exam.fileType === 'word' ? '.docx' : exam.fileType === 'pdf' ? '.pdf' : '.html';
          link.download = `${safeTitle}${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }

        let content = `ĐỀ THI: ${exam.title.toUpperCase()}\n`;
        content += `Cấu trúc: TT 17/2025 BGDĐT\n\n`;
        
        if (exam.questions && exam.questions.length > 0) {
          exam.questions.forEach((q, i) => {
            content += `Câu ${i + 1}: ${q.text}\n`;
            if (q.type === 'multiple_choice' && q.options) {
              q.options.forEach((opt, j) => {
                content += `${String.fromCharCode(65 + j)}. ${opt}\n`;
              });
            } else if (q.type === 'true_false' && q.statements) {
              q.statements.forEach((s, j) => {
                content += `- ${s.text} (Đúng/Sai)\n`;
              });
            }
            content += `\n`;
          });
        } else {
          content += `(Đề thi hiện chưa có câu hỏi chi tiết)\n`;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${safeTitle}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error("Không tìm thấy đề thi.");
      }
    } catch (error) {
      console.error("Download Error:", error);
      handleFirestoreError(error, OperationType.GET, `exams/${examId}`);
    }
  },

  async updateProfile(uid: string, profile: Partial<UserProfile>) {
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  async generateDetailedExplanation(question: Question, userAnswer: any): Promise<{ explanation: string, tips: string, mnemonics: string }> {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `Bạn là một chuyên gia giáo dục Địa lí. Hãy giải thích chi tiết câu hỏi sau đây cho học sinh.
      
      CÂU HỎI: ${question.text}
      LOẠI CÂU HỎI: ${question.type}
      ĐÁP ÁN ĐÚNG: ${question.type === 'multiple_choice' ? question.options[question.correctAnswerIndex] : 
                    question.type === 'true_false' ? JSON.stringify(question.statements.filter(s => s.isTrue).map(s => s.text)) : 
                    question.correctAnswer}
      CÂU TRẢ LỜI CỦA HỌC SINH: ${JSON.stringify(userAnswer)}
      
      YÊU CẦU:
      1. Giải thích tại sao đáp án đúng là chính xác.
      2. Nếu học sinh trả lời sai, hãy phân tích lỗi sai thường gặp.
      3. Cung cấp lời khuyên (tips) để làm dạng bài này.
      4. Cung cấp mẹo ghi nhớ (mnemonics) để nhớ kiến thức này lâu hơn.
      
      Trả về JSON: { "explanation": "...", "tips": "...", "mnemonics": "..." }`;

      const response = await generateContentWithFallback(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            tips: { type: Type.STRING },
            mnemonics: { type: Type.STRING }
          },
          required: ["explanation", "tips", "mnemonics"]
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("AI Explanation Error:", error);
      return {
        explanation: question.explanation || "Không có giải thích chi tiết.",
        tips: question.tips || "Hãy ôn tập kỹ kiến thức liên quan.",
        mnemonics: question.mnemonics || "Sử dụng sơ đồ tư duy để ghi nhớ."
      };
    }
  }
};
