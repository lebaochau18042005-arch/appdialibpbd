/**
 * assignmentService — uses Firebase Realtime Database as primary storage
 * so exam assignments sync cross-device without needing Firestore rules.
 */
import { rtdb } from '../firebase';
import { ref, set, push, onValue, off, remove } from 'firebase/database';
import { ExamAssignment } from '../types';

const LS_KEY = 'geo_pro_assignments';

// ─── localStorage helpers ─────────────────────────────────────────────────────
function lsGet(): ExamAssignment[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function lsSet(list: ExamAssignment[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 100)));
}
function lsAdd(a: ExamAssignment) {
  lsSet([a, ...lsGet().filter(x => x.id !== a.id)]);
}

// ─── Main service ─────────────────────────────────────────────────────────────
export const assignmentService = {

  // Teacher: create assignment → RTDB + localStorage
  async assignExam(
    examId: string,
    examTitle: string,
    assignedBy: string,
    targetClass: string,
    dueDate?: string,
    targetStudents?: string[]
  ): Promise<string> {
    const createdAt = new Date().toISOString();
    const assignDoc: Record<string, any> = {
      examId,
      examTitle,
      assignedBy,
      targetClass,
      createdAt,
      ...(dueDate ? { dueDate } : {}),
      ...(targetStudents?.length ? { targetStudents } : {}),
    };

    // Write to RTDB
    let id = `local_${Date.now()}`;
    try {
      const newRef = await push(ref(rtdb, 'assignments'), assignDoc);
      id = newRef.key || id;
    } catch (e) {
      console.warn('assignmentService: RTDB write failed, using localStorage', e);
    }

    const assignment: ExamAssignment = { id, examId, examTitle, assignedBy, targetClass, createdAt, ...(dueDate ? { dueDate } : {}) };
    lsAdd(assignment);
    return id;
  },

  // Teacher: subscribe to ALL assignments (realtime)
  subscribeToAssignments(callback: (assignments: ExamAssignment[]) => void): () => void {
    const assignRef = ref(rtdb, 'assignments');
    const handler = (snap: any) => {
      if (!snap.exists()) {
        // Fall back to localStorage
        callback(lsGet());
        return;
      }
      const list: ExamAssignment[] = [];
      snap.forEach((child: any) => {
        const d = child.val();
        list.push({
          id: child.key,
          examId: d.examId || child.key,
          examTitle: d.examTitle || '',
          assignedBy: d.assignedBy || 'Giáo viên',
          targetClass: d.targetClass || '',
          dueDate: d.dueDate,
          createdAt: d.createdAt || '',
        });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    };
    onValue(assignRef, handler, () => callback(lsGet()));
    return () => off(assignRef, 'value', handler);
  },

  // Student: subscribe to assignments for their class (realtime)
  subscribeToStudentAssignments(
    className: string,
    callback: (assignments: ExamAssignment[]) => void
  ): () => void {
    const assignRef = ref(rtdb, 'assignments');
    const cls = className.trim().toLowerCase();
    const handler = (snap: any) => {
      if (!snap.exists()) {
        const ls = lsGet().filter(a => {
          const tc = (a.targetClass || '').trim().toLowerCase();
          return tc === cls || tc === 'all';
        });
        callback(ls);
        return;
      }
      const list: ExamAssignment[] = [];
      snap.forEach((child: any) => {
        const d = child.val();
        const tc = (d.targetClass || '').trim().toLowerCase();
        if (tc !== cls && tc !== 'all') return;
        list.push({
          id: child.key,
          examId: d.examId || child.key,
          examTitle: d.examTitle || '',
          assignedBy: d.assignedBy || 'Giáo viên',
          targetClass: d.targetClass || '',
          dueDate: d.dueDate,
          createdAt: d.createdAt || '',
        });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    };
    onValue(assignRef, handler, () => {
      const ls = lsGet().filter(a => {
        const tc = (a.targetClass || '').trim().toLowerCase();
        return tc === cls || tc === 'all';
      });
      callback(ls);
    });
    return () => off(assignRef, 'value', handler);
  },

  // Teacher: delete assignment
  async deleteAssignment(id: string): Promise<void> {
    try { await remove(ref(rtdb, `assignments/${id}`)); } catch {}
    lsSet(lsGet().filter(a => a.id !== id));
  },

  // Compat: read assignments once (for ExamAssignPanel initial load)
  getAssignments(): ExamAssignment[] {
    return lsGet();
  },
};
