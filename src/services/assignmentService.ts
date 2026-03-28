import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { ExamAssignment, Notification } from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// STORAGE STRATEGY (no Firebase Console / no extra rules needed):
//   - Assignments: saved in the existing `exams` collection (type='assignment')
//     with localStorage as fallback.
//   - Notifications: localStorage only — avoids all Firestore permission issues.
// ──────────────────────────────────────────────────────────────────────────────

const LS_ASSIGN_KEY = 'geo_pro_assignments';
const ASSIGN_TYPE = 'assignment';

function lsGetAssignments(): ExamAssignment[] {
  try { return JSON.parse(localStorage.getItem(LS_ASSIGN_KEY) || '[]'); } catch { return []; }
}
function lsAddAssignment(a: ExamAssignment) {
  const list = lsGetAssignments().filter(x => x.id !== a.id);
  localStorage.setItem(LS_ASSIGN_KEY, JSON.stringify([a, ...list].slice(0, 100)));
}

export const assignmentService = {
  // =====================
  // GV: Giao đề — saves in `exams` collection, falls back to localStorage
  // =====================
  async assignExam(
    examId: string,
    examTitle: string,
    assignedBy: string,
    targetClass: string,
    dueDate?: string
  ): Promise<string> {
    const assignDoc: Record<string, any> = {
      title: `[Giao đề] ${examTitle}`,
      examId,
      examTitle,
      assignedBy,
      targetClass,
      type: ASSIGN_TYPE,
      creatorId: 'teacher',
      questions: [],
      createdAt: new Date().toISOString(),
    };
    if (dueDate) assignDoc.dueDate = dueDate;

    let id = `local_${Date.now()}`;
    try {
      const ref = await addDoc(collection(db, 'exams'), assignDoc);
      id = ref.id;
    } catch (e) {
      console.warn('assignExam: Firestore write failed, using localStorage fallback', e);
    }

    const assignment: ExamAssignment = {
      id,
      examId,
      examTitle,
      assignedBy,
      targetClass,
      createdAt: new Date().toISOString(),
      ...(dueDate ? { dueDate } : {}),
    };
    lsAddAssignment(assignment);

    // Save notification for this class in localStorage
    const notif: Notification & { id: string } = {
      id,
      type: 'new_exam',
      examId,
      examTitle,
      message: `Giáo viên ${assignedBy} vừa giao đề thi "${examTitle}"${dueDate ? ` - Hạn nộp: ${new Date(dueDate).toLocaleDateString('vi-VN')}` : ''}.`,
      assignedBy,
      read: false,
      createdAt: new Date().toISOString(),
      ...(dueDate ? { dueDate } : {}),
    };
    const classKey = `geo_notifications_class_${targetClass}`;
    const allKey = 'geo_notifications_class_all';
    const push = (key: string) => {
      const existing: Notification[] = (() => {
        try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
      })();
      existing.unshift(notif);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
    };
    push(classKey);
    if (targetClass.toLowerCase() === 'all') push(allKey);

    return id;
  },

  // =====================
  // GV: Lắng nghe danh sách đề đã giao (realtime, with localStorage fallback)
  // Uses simple query (no composite index needed)
  // =====================
  subscribeToAssignments(callback: (assignments: ExamAssignment[]) => void) {
    // Simple query — no where+orderBy combo that needs a composite index
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const fsAssignments = snap.docs
        .filter(d => d.data().type === ASSIGN_TYPE)
        .map(d => ({
          id: d.id,
          examId: d.data().examId || d.id,
          examTitle: d.data().examTitle || d.data().title,
          assignedBy: d.data().assignedBy || 'Giáo viên',
          targetClass: d.data().targetClass || '',
          dueDate: d.data().dueDate,
          createdAt: d.data().createdAt,
        } as ExamAssignment));

      const lsAssignments = lsGetAssignments().filter(la => !fsAssignments.find(fa => fa.id === la.id));
      const merged = [...fsAssignments, ...lsAssignments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(merged);
    }, (err) => {
      console.error('subscribeToAssignments Firestore error, using localStorage', err);
      callback(lsGetAssignments());
    });

    return unsub;
  },

  // =====================
  // HS: Lắng nghe thông báo từ localStorage (polling + storage event)
  // =====================
  subscribeToNotifications(userId: string, callback: (notifs: Notification[]) => void) {
    const getNotifs = (): Notification[] => {
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

      const readKey = `geo_notifications_read_${userId}`;
      const readIds: string[] = (() => {
        try { return JSON.parse(localStorage.getItem(readKey) || '[]'); } catch { return []; }
      })();
      const readSet = new Set(readIds);

      return all
        .map(n => ({ ...n, read: readSet.has(n.id) }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    callback(getNotifs());
    const interval = setInterval(() => callback(getNotifs()), 10000);
    const handleStorage = () => callback(getNotifs());
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  },

  // =====================
  // HS: Đánh dấu đã đọc
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
      const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const fs = snap.docs
        .filter(d => d.data().type === ASSIGN_TYPE)
        .map(d => ({
          id: d.id,
          examId: d.data().examId || d.id,
          examTitle: d.data().examTitle || d.data().title,
          assignedBy: d.data().assignedBy || 'Giáo viên',
          targetClass: d.data().targetClass || '',
          dueDate: d.data().dueDate,
          createdAt: d.data().createdAt,
        } as ExamAssignment));
      const ls = lsGetAssignments().filter(la => !fs.find(fa => fa.id === la.id));
      return [...fs, ...ls].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return lsGetAssignments();
    }
  },
};
