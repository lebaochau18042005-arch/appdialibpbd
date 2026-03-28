import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

export interface LiveStudent {
  id: string; // studentSessionId
  name: string;
  className: string;
  score: number;
  progress: number;
  isFinished: boolean;
  timeSpent?: number;
  updatedAt?: any;
}

export const liveTrackingService = {
  // 1. Học sinh tham gia phòng thi (Tạo/Cập nhật document của học sinh)
  async joinLiveExam(examId: string, studentSessionId: string, studentInfo: { name: string, className: string }) {
    try {
      const studentRef = doc(db, 'live_exams', examId, 'students', studentSessionId);
      await setDoc(studentRef, {
        id: studentSessionId,
        name: studentInfo.name,
        className: studentInfo.className,
        score: 0,
        progress: 0,
        isFinished: false,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error joining live exam:", error);
    }
  },

  // 2. Cập nhật tiến độ khi học sinh trả lời câu hỏi
  async updateLiveProgress(examId: string, studentSessionId: string, progress: number, score: number) {
    try {
      const studentRef = doc(db, 'live_exams', examId, 'students', studentSessionId);
      await updateDoc(studentRef, {
        progress,
        score,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating live progress:", error);
    }
  },

  // 3. Cập nhật trạng thái hoàn thành bài thi
  async finishLiveExam(examId: string, studentSessionId: string, timeSpent: number) {
    try {
      const studentRef = doc(db, 'live_exams', examId, 'students', studentSessionId);
      await updateDoc(studentRef, {
        isFinished: true,
        timeSpent,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error finishing live exam:", error);
    }
  },

  // 4. Giáo viên lắng nghe danh sách học sinh (Realtime)
  subscribeToLiveStudents(examId: string, callback: (students: LiveStudent[], newStudents: LiveStudent[]) => void) {
    // Sắp xếp theo thời gian cập nhật gần nhất hoặc giữ nguyên mặc định
    const studentsRef = collection(db, 'live_exams', examId, 'students');
    const q = query(studentsRef, orderBy('updatedAt', 'desc'), limit(100)); // limit to avoid listening to too many docs

    return onSnapshot(q, (snapshot) => {
      const students: LiveStudent[] = [];
      const newStudents: LiveStudent[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as LiveStudent;
        students.push(data);
      });

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // Document was just added or is part of the initial state
          // We can optionally use change.doc.data().updatedAt to filter out old ones
          // but for simplicity, we pass added documents
          newStudents.push(change.doc.data() as LiveStudent);
        }
      });

      callback(students, newStudents);
    }, (error) => {
      console.error("Error listening to live students:", error);
    });
  }
};
