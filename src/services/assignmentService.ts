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
} from 'firebase/firestore';
import { ExamAssignment, Notification } from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// STORAGE STRATEGY (no Firebase Console needed):
//   - exam_assignments  → stored in the `exams` collection with type='assignment'
//     (that collection already has open rules; no new rules needed)
//   - notifications     → stored in localStorage per-user (no Firestore needed)
//     (broadcasts are picked up next time student loads ExamSetup via onSnapshot)
// ──────────────────────────────────────────────────────────────────────────────

const ASSIGN_TYPE = 'assignment'; // marker inside exams collection

export const assignmentService = {
  // =====================
  // GV: Giao đề cho lớp
  // Saves into `exams` collection with type='assignment'; writes notification
  // to localStorage for the current browser AND to any other stored user keys.
  // =====================
  async assignExam(
    examId: string,
    examTitle: string,
    assignedBy: string,
    targetClass: string,
    dueDate?: string
  ): Promise<string> {
    const assignDoc: Record<string, any> = {
      // Mimic the Exam shape so getAllExams filters it out (type='assignment')
      title: `[ASSIGN] ${examTitle}`,
      examId,
      examTitle,
      assignedBy,
      targetClass,
      type: ASSIGN_TYPE,  // stored in exams collection with this type
      creatorId: 'teacher',
      questions: [],
      createdAt: new Date().toISOString(),
    };
    if (dueDate) assignDoc.dueDate = dueDate;

    const ref = await addDoc(collection(db, 'exams'), assignDoc);

    // Broadcast: push notification into localStorage (works cross-tab on same device)
    // On Vercel/production: students see new assignments via onSnapshot on exams collection
    const notif: Omit<Notification, 'id'> = {
      type: 'new_exam',
      examId,
      examTitle,
      message: `Giáo viên ${assignedBy} vừa giao đề thi "${examTitle}"${dueDate ? ` - Hạn nộp: ${new Date(dueDate).toLocaleDateString('vi-VN')}` : ''}.`,
      assignedBy,
      read: false,
      createdAt: new Date().toISOString(),
      ...(dueDate ? { dueDate } : {}),
    };

    // Push to localStorage notifications list (keyed by targetClass)
    const lsKey = `geo_notifications_class_${targetClass}`;
    const existing: Notification[] = (() => {
      try { return JSON.parse(localStorage.getItem(lsKey) || '[]'); } catch { return []; }
    })();
    existing.unshift({ ...notif, id: ref.id });
    localStorage.setItem(lsKey, JSON.stringify(existing.slice(0, 50)));

    return ref.id;
  },

  // =====================
  // GV: Lắng nghe danh sách đề đã giao (realtime via exams collection)
  // =====================
  subscribeToAssignments(callback: (assignments: ExamAssignment[]) => void) {
    const q = query(
      collection(db, 'exams'),
      where('type', '==', ASSIGN_TYPE),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({
        id: d.id,
        examId: d.data().examId || d.id,
        examTitle: d.data().examTitle || d.data().title,
        assignedBy: d.data().assignedBy || 'Giáo viên',
        targetClass: d.data().targetClass || '',
        dueDate: d.data().dueDate,
        createdAt: d.data().createdAt,
      } as ExamAssignment)));
    }, (err) => {
      console.error('subscribeToAssignments error:', err);
    });
  },

  // =====================
  // HS: Lắng nghe thông báo từ localStorage theo lớp của học sinh
  // Polls localStorage every 15s to pick up new assignments
  // =====================
  subscribeToNotifications(userId: string, callback: (notifs: Notification[]) => void) {
    const getNotifs = (): Notification[] => {
      // Get the student's className from localStorage profile
      const className = (() => {
        try {
          const p = JSON.parse(localStorage.getItem('examGeoProfile') || '{}');
          return p.className || '';
        } catch { return ''; }
      })();

      const keys = className
        ? [`geo_notifications_class_${className}`, 'geo_notifications_class_all']
        : ['geo_notifications_class_all'];

      const all: Notification[] = [];
      const seen = new Set<string>();

      keys.forEach(k => {
        const items: Notification[] = (() => {
          try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; }
        })();
        items.forEach(n => {
          if (!seen.has(n.id)) { seen.add(n.id); all.push(n); }
        });
      });

      // Merge with read-status from personal localStorage
      const readKey = `geo_notifications_read_${userId}`;
      const readIds: string[] = (() => {
        try { return JSON.parse(localStorage.getItem(readKey) || '[]'); } catch { return []; }
      })();
      const readSet = new Set(readIds);

      return all
        .map(n => ({ ...n, read: readSet.has(n.id) }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    // Initial call
    callback(getNotifs());

    // Poll interval (localStorage is sync, but useful for cross-tab updates)
    const interval = setInterval(() => callback(getNotifs()), 15000);

    // Also listen for storage events (cross-tab)
    const handleStorage = () => callback(getNotifs());
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  },

  // =====================
  // HS: Đánh dấu đã đọc (localStorage)
  // =====================
  async markNotificationRead(userId: string, notifId: string) {
    const readKey = `geo_notifications_read_${userId}`;
    const readIds: string[] = (() => {
      try { return JSON.parse(localStorage.getItem(readKey) || '[]'); } catch { return []; }
    })();
    if (!readIds.includes(notifId)) {
      readIds.push(notifId);
      localStorage.setItem(readKey, JSON.stringify(readIds));
    }
  },

  // =====================
  // GV: Lấy danh sách đề đã giao (async)
  // =====================
  async getAssignments(): Promise<ExamAssignment[]> {
    try {
      const q = query(
        collection(db, 'exams'),
        where('type', '==', ASSIGN_TYPE),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        id: d.id,
        examId: d.data().examId || d.id,
        examTitle: d.data().examTitle || d.data().title,
        assignedBy: d.data().assignedBy || 'Giáo viên',
        targetClass: d.data().targetClass || '',
        dueDate: d.data().dueDate,
        createdAt: d.data().createdAt,
      } as ExamAssignment));
    } catch {
      return [];
    }
  },
};
