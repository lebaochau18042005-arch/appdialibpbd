/**
 * assignmentService — uses Firebase Realtime Database as primary storage
 * so exam assignments sync cross-device without needing Firestore rules.
 */
import { rtdb } from '../firebase';
import { ref, set, push, onValue, off, remove, get } from 'firebase/database';
import { ExamAssignment } from '../types';
import { sanitizeEmailKey, teacherWorkspaceService } from './teacherWorkspaceService';

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

  // Teacher: create assignment → RTDB + localStorage (with exam questions bundled)
  async assignExam(
    examId: string,
    examTitle: string,
    assignedBy: string,
    targetClass: string,
    dueDate?: string,
    targetStudents?: string[],
    examQuestions?: any[],
    creatorId?: string,
    shuffleQuestions: boolean = true,
    antiCheat: boolean = true,
    maxTabSwitches: number = 3,
    teacherEmail?: string
  ): Promise<string> {
    const createdAt = new Date().toISOString();
    const finalTeacherEmail = (teacherEmail || teacherWorkspaceService.getActiveTeacherEmail() || '').trim().toLowerCase();
    const assignDoc: Record<string, any> = {
      examId,
      examTitle,
      assignedBy,
      targetClass,
      createdAt,
      creatorId,
      teacherEmail: finalTeacherEmail || undefined,
      shuffleQuestions,
      antiCheat,
      maxTabSwitches,
      ...(dueDate ? { dueDate } : {}),
      ...(targetStudents?.length ? { targetStudents } : {}),
      ...(examQuestions?.length ? { questions: examQuestions } : {}),
    };

    // Write to RTDB: ưu tiên node theo creatorId hoặc teacherEmail để tách biệt không gian giáo viên
    let id = `local_${Date.now()}`;
    const storageKey = creatorId || (finalTeacherEmail ? sanitizeEmailKey(finalTeacherEmail) : 'global');
    try {
      const newRef = await push(ref(rtdb, `assignments/${storageKey}`), assignDoc);
      id = newRef.key || id;
    } catch (e) {
      console.warn('assignmentService: RTDB write failed, using localStorage', e);
    }

    const assignment: ExamAssignment = {
      id,
      examId,
      examTitle,
      assignedBy,
      teacherEmail: finalTeacherEmail || undefined,
      targetClass,
      createdAt,
      shuffleQuestions,
      antiCheat,
      maxTabSwitches,
      ...(dueDate ? { dueDate } : {}),
      ...(targetStudents?.length ? { targetStudents } : {}),
    };
    lsAdd(assignment);
    return id;
  },

  // Student: get exam questions from RTDB (by examId) as fallback when Firestore fails
  async getExamQuestionsFromRTDB(examId: string): Promise<{
    title: string;
    questions: any[];
    shuffleQuestions?: boolean;
    antiCheat?: boolean;
    maxTabSwitches?: number;
    teacherEmail?: string;
  } | null> {
    try {
      const snap = await get(ref(rtdb, 'assignments'));
      if (!snap.exists()) return null;
      let result: {
        title: string;
        questions: any[];
        shuffleQuestions?: boolean;
        antiCheat?: boolean;
        maxTabSwitches?: number;
        teacherEmail?: string;
      } | null = null;
      snap.forEach((creatorSnap: any) => {
        if (result) return;
        creatorSnap.forEach((child: any) => {
          if (result) return;
          const d = child.val();
          if (d.examId === examId && d.questions?.length) {
            result = {
              title: d.examTitle || 'Đề thi',
              questions: d.questions,
              shuffleQuestions: d.shuffleQuestions ?? true,
              antiCheat: d.antiCheat ?? false,
              maxTabSwitches: d.maxTabSwitches ?? 3,
              teacherEmail: d.teacherEmail || undefined,
            };
          }
        });
      });
      return result;
    } catch { return null; }
  },

  // Get full assignment configuration (shuffle, antiCheat, maxTabSwitches)
  async getAssignmentConfig(examId: string, assignmentId?: string): Promise<{
    shuffleQuestions: boolean;
    antiCheat: boolean;
    maxTabSwitches: number;
    teacherEmail?: string;
    assignment?: ExamAssignment;
  }> {
    // 1. Check localStorage first
    const local = lsGet();
    const foundLocal = local.find(a => (assignmentId && a.id === assignmentId) || a.examId === examId);
    if (foundLocal && (foundLocal.shuffleQuestions !== undefined || foundLocal.antiCheat !== undefined)) {
      return {
        shuffleQuestions: foundLocal.shuffleQuestions ?? true,
        antiCheat: foundLocal.antiCheat ?? false,
        maxTabSwitches: foundLocal.maxTabSwitches ?? 3,
        teacherEmail: foundLocal.teacherEmail,
        assignment: foundLocal,
      };
    }

    // 2. Query RTDB assignments
    try {
      const snap = await get(ref(rtdb, 'assignments'));
      if (snap.exists()) {
        let match: any = null;
        snap.forEach((creatorSnap: any) => {
          if (match) return;
          creatorSnap.forEach((child: any) => {
            if (match) return;
            const d = child.val();
            if ((assignmentId && child.key === assignmentId) || d.examId === examId) {
              match = { ...d, id: child.key };
            }
          });
        });

        if (match) {
          return {
            shuffleQuestions: match.shuffleQuestions ?? true,
            antiCheat: match.antiCheat ?? false,
            maxTabSwitches: match.maxTabSwitches ?? 3,
            teacherEmail: match.teacherEmail || foundLocal?.teacherEmail,
            assignment: match,
          };
        }
      }
    } catch (e) {
      console.warn('getAssignmentConfig error:', e);
    }

    return {
      shuffleQuestions: foundLocal?.shuffleQuestions ?? true,
      antiCheat: foundLocal?.antiCheat ?? false,
      maxTabSwitches: foundLocal?.maxTabSwitches ?? 3,
      teacherEmail: foundLocal?.teacherEmail,
      assignment: foundLocal,
    };
  },

  // Teacher: subscribe to ALL assignments (realtime)
  subscribeToAssignments(creatorIdOrEmail: string, callback: (assignments: ExamAssignment[]) => void): () => void {
    if (!creatorIdOrEmail) { callback(lsGet()); return () => { }; }
    const safeKey = creatorIdOrEmail.includes('@') ? sanitizeEmailKey(creatorIdOrEmail) : creatorIdOrEmail;
    const assignRef = ref(rtdb, `assignments/${safeKey}`);
    const handler = (snap: any) => {
      if (!snap.exists()) {
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
          teacherEmail: d.teacherEmail,
          targetClass: d.targetClass || '',
          dueDate: d.dueDate,
          createdAt: d.createdAt || '',
          targetStudents: d.targetStudents || [],
          shuffleQuestions: d.shuffleQuestions ?? true,
          antiCheat: d.antiCheat ?? false,
          maxTabSwitches: d.maxTabSwitches ?? 3,
        });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    };
    onValue(assignRef, handler, () => callback(lsGet()));
    return () => off(assignRef, 'value', handler);
  },

  // Student: subscribe to assignments for their class or by individual name (realtime)
  subscribeToStudentAssignments(
    className: string,
    callback: (assignments: ExamAssignment[]) => void,
    studentName?: string
  ): () => void {
    const assignRef = ref(rtdb, 'assignments');
    // Normalize: lowercase + remove all spaces for robust matching
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');
    const cls = normalize(className);
    const sName = normalize(studentName || '');

    function matchesStudent(d: any): boolean {
      const tc = normalize(d.targetClass || '');
      // Class-wide or "all" match
      if (tc === cls || tc === 'all') return true;
      // Individual student targeting: check targetStudents array
      if (sName && Array.isArray(d.targetStudents)) {
        return d.targetStudents.some((n: string) => normalize(n) === sName);
      }
      return false;
    }

    function parseSnap(snap: any): ExamAssignment[] {
      const list: ExamAssignment[] = [];
      snap.forEach((creatorSnap: any) => {
        creatorSnap.forEach((child: any) => {
          const d = child.val();
          if (!matchesStudent(d)) return;
          list.push({
            id: child.key,
            examId: d.examId || child.key,
            examTitle: d.examTitle || '',
            assignedBy: d.assignedBy || 'Giáo viên',
            targetClass: d.targetClass || '',
            dueDate: d.dueDate,
            createdAt: d.createdAt || '',
            targetStudents: d.targetStudents || [],
            shuffleQuestions: d.shuffleQuestions ?? true,
            antiCheat: d.antiCheat ?? false,
            maxTabSwitches: d.maxTabSwitches ?? 3,
          });
        });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }

    const handler = (snap: any) => {
      if (!snap.exists()) { callback([]); return; }
      callback(parseSnap(snap));
    };

    // Fallback: when onValue fails (permission denied / network issues), try one-time get()
    const errorHandler = async () => {
      console.warn('assignmentService: onValue failed, trying get() fallback...');
      try {
        const snap = await get(assignRef);
        if (snap.exists()) {
          callback(parseSnap(snap));
        } else {
          callback([]);
        }
      } catch (e2) {
        console.error('assignmentService: both onValue and get() failed', e2);
        // Last resort: localStorage on THIS device (only works if teacher used same device)
        const ls = lsGet().filter(a => {
          const tc = normalize(a.targetClass || '');
          return tc === cls || tc === 'all';
        });
        callback(ls);
      }
    };

    onValue(assignRef, handler, errorHandler);
    return () => off(assignRef, 'value', handler);
  },

  // Teacher: delete assignment
  async deleteAssignment(id: string, creatorId?: string): Promise<void> {
    if (creatorId) {
      try { await remove(ref(rtdb, `assignments/${creatorId}/${id}`)); } catch { }
    }
    lsSet(lsGet().filter(a => a.id !== id));
  },

  // Compat: read assignments once (for ExamAssignPanel initial load)
  getAssignments(): ExamAssignment[] {
    return lsGet();
  },
};
