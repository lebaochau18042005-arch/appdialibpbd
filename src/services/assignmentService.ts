import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ExamAssignment, Notification } from '../types';

export const assignmentService = {
  // =====================
  // GV: Giao đề cho lớp
  // =====================
  async assignExam(
    examId: string,
    examTitle: string,
    assignedBy: string,
    targetClass: string,
    dueDate?: string
  ): Promise<string> {
    const assignment: Omit<ExamAssignment, 'id'> = {
      examId,
      examTitle,
      assignedBy,
      targetClass,
      dueDate,
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'exam_assignments'), assignment);

    // Broadcast thông báo: lấy tất cả user có className === targetClass
    try {
      const usersQ = targetClass === 'all'
        ? query(collection(db, 'users'))
        : query(collection(db, 'users'), where('className', '==', targetClass));

      const usersSnap = await getDocs(usersQ);
      const notificationData = {
        type: 'new_exam' as const,
        examId,
        examTitle,
        message: `Giáo viên ${assignedBy} vừa giao đề thi "${examTitle}"${dueDate ? ` - Hạn nộp: ${new Date(dueDate).toLocaleDateString('vi-VN')}` : ''}.`,
        assignedBy,
        read: false,
        createdAt: new Date().toISOString(),
        dueDate,
      };

      const promises = usersSnap.docs.map(userDoc =>
        addDoc(collection(db, 'notifications', userDoc.id, 'items'), notificationData)
      );
      await Promise.allSettled(promises);
    } catch (e) {
      console.warn('Broadcast notification partially failed:', e);
    }

    return ref.id;
  },

  // =====================
  // GV: Lắng nghe danh sách đề đã giao (realtime)
  // =====================
  subscribeToAssignments(callback: (assignments: ExamAssignment[]) => void) {
    const q = query(
      collection(db, 'exam_assignments'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamAssignment)));
    }, (err) => {
      console.error('subscribeToAssignments error:', err);
    });
  },

  // =====================
  // HS: Lắng nghe thông báo của cá nhân (realtime)
  // =====================
  subscribeToNotifications(userId: string, callback: (notifs: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications', userId, 'items'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    }, (err) => {
      console.error('subscribeToNotifications error:', err);
    });
  },

  // =====================
  // HS: Đánh dấu đã đọc
  // =====================
  async markNotificationRead(userId: string, notifId: string) {
    try {
      await updateDoc(doc(db, 'notifications', userId, 'items', notifId), { read: true });
    } catch (e) {
      console.error('markNotificationRead error:', e);
    }
  },

  // =====================
  // GV: Lấy danh sách đề đã giao (async, để check ai đã làm)
  // =====================
  async getAssignments(): Promise<ExamAssignment[]> {
    try {
      const q = query(collection(db, 'exam_assignments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamAssignment));
    } catch {
      return [];
    }
  },
};
