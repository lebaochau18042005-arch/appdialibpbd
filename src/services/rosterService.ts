import * as XLSX from 'xlsx';
import { rtdb } from '../firebase';
import { ref, set, get, onValue, off, remove } from 'firebase/database';
import { sanitizeEmailKey, teacherWorkspaceService } from './teacherWorkspaceService';

// Types
export interface StudentEntry {
  name: string;
}

export interface ClassRoster {
  id: string;
  className: string;
  students: StudentEntry[];
  updatedAt: string;
}

const LS_KEY = 'geo_pro_rosters';

function getRosterLsKey(teacherEmail?: string): string {
  const email = (teacherEmail || teacherWorkspaceService.getActiveTeacherEmail() || '').trim().toLowerCase();
  if (!email || email === 'lebaochau18042005@gmail.com') {
    return LS_KEY;
  }
  return `${LS_KEY}_${sanitizeEmailKey(email)}`;
}

// ─── Persistence ──────────────────────────────────────────────────────────────
export const rosterService = {
  getRosters(teacherEmail?: string): ClassRoster[] {
    const key = getRosterLsKey(teacherEmail);
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
      // Super admin falls back to global LS_KEY if scoped key is empty
      const active = (teacherEmail || teacherWorkspaceService.getActiveTeacherEmail() || '').trim().toLowerCase();
      if (active === 'lebaochau18042005@gmail.com' && key !== LS_KEY) {
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      }
      return [];
    } catch {
      return [];
    }
  },

  saveRoster(className: string, students: StudentEntry[], creatorId?: string, teacherEmail?: string): ClassRoster {
    const key = getRosterLsKey(teacherEmail);
    const rosters = this.getRosters(teacherEmail);
    const existing = rosters.find(r => r.className.toLowerCase() === className.toLowerCase());
    const roster: ClassRoster = {
      id: existing?.id || `roster_${Date.now()}`,
      className: className.trim(),
      students,
      updatedAt: new Date().toISOString(),
    };
    const updated = rosters.filter(r => r.id !== roster.id);
    updated.unshift(roster);
    localStorage.setItem(key, JSON.stringify(updated));
    // Sync to RTDB for cross-device student auto-detect if creatorId provided
    if (creatorId) {
      this.syncRosterToRTDB(roster, creatorId);
    }
    return roster;
  },

  // ─── RTDB sync ────────────────────────────────────────────────────────────

  async syncRosterToRTDB(roster: ClassRoster, creatorId: string) {
    if (!creatorId) return;
    try {
      const safeClass = roster.className.replace(/[.#$[\]/]/g, '_');
      const studentsObj: Record<string, string> = {};
      roster.students.forEach((s, i) => {
        const key = s.name.replace(/[.#$[\]/]/g, '_').slice(0, 80) || `s${i}`;
        studentsObj[key] = s.name;
      });
      await set(ref(rtdb, `rosters/${creatorId}/${safeClass}`), {
        className: roster.className,
        updatedAt: roster.updatedAt,
        students: studentsObj,
      });
    } catch (e) {
      console.warn('rosterService.syncRosterToRTDB failed:', e);
    }
  },

  // Student: find which class they belong to by name (RTDB lookup)
  async findClassForStudent(studentName: string): Promise<{ className: string; creatorId: string } | null> {
    if (!studentName.trim()) return null;
    const nameLower = studentName.trim().toLowerCase();
    try {
      const snap = await get(ref(rtdb, 'rosters'));
      if (!snap.exists()) return null;
      let foundClass: string | null = null;
      let foundCreator: string | null = null;
      snap.forEach((creatorSnap: any) => {
        if (foundClass) return;
        creatorSnap.forEach((classSnap: any) => {
          if (foundClass) return;
          const data = classSnap.val();
          const students: Record<string, string> = data.students || {};
          const match = Object.values(students).find(
            (name: string) => name.trim().toLowerCase() === nameLower
          );
          if (match) {
            foundClass = data.className || classSnap.key;
            foundCreator = creatorSnap.key;
          }
        });
      });
      if (foundClass && foundCreator) return { className: foundClass, creatorId: foundCreator };
      return null;
    } catch (e) {
      // RTDB failed, try localStorage
      const rosters = this.getRosters();
      for (const r of rosters) {
        if (r.students.some(s => s.name.trim().toLowerCase() === nameLower)) {
          return { className: r.className, creatorId: 'local' };
        }
      }
      return null;
    }
  },

  // Teacher: subscribe to rosters from RTDB (isolated by creatorId / teacher workspace)
  subscribeToRosters(creatorId: string, callback: (rosters: ClassRoster[]) => void, teacherEmail?: string): () => void {
    const activeEmail = (teacherEmail || teacherWorkspaceService.getActiveTeacherEmail() || '').trim().toLowerCase();
    if (!creatorId) {
      callback(this.getRosters(activeEmail));
      return () => { };
    }
    const rostersRef = ref(rtdb, `rosters/${creatorId}`);
    const handler = (snap: any) => {
      const localRosters = this.getRosters(activeEmail);
      if (!snap.exists()) {
        callback(localRosters);
        return;
      }
      const list: ClassRoster[] = [];
      snap.forEach((child: any) => {
        const data = child.val();
        const students: StudentEntry[] = Object.values(data.students || {}).map(
          (name: any) => ({ name: String(name) })
        );
        list.push({
          id: child.key,
          className: data.className || child.key,
          students,
          updatedAt: data.updatedAt || '',
        });
      });

      // Merge local elements that belong to this teacher
      const merged = [...list];
      for (const lr of localRosters) {
        if (!list.some(r => r.className.toLowerCase() === lr.className.toLowerCase())) {
          merged.push(lr);
        }
      }

      // Sort by newest first
      merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      callback(merged);
    };
    onValue(rostersRef, handler, () => callback(this.getRosters(activeEmail)));
    return () => off(rostersRef, 'value', handler);
  },

  deleteRoster(id: string, creatorId?: string, teacherEmail?: string) {
    const key = getRosterLsKey(teacherEmail);
    const updated = this.getRosters(teacherEmail).filter(r => r.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    // Also remove from RTDB
    if (creatorId) {
      try { remove(ref(rtdb, `rosters/${creatorId}/${id}`)); } catch { }
    }
  },

  getClassNames(teacherEmail?: string): string[] {
    return this.getRosters(teacherEmail).map(r => r.className);
  },

  getStudentsForClass(className: string, teacherEmail?: string): StudentEntry[] {
    const r = this.getRosters(teacherEmail).find(r => r.className.toLowerCase() === className.toLowerCase());
    return r?.students || [];
  },

  // ─── File Parsers ────────────────────────────────────────────────────────────

  async parseFile(file: File): Promise<{ students: StudentEntry[]; suggestedClass: string }> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const suggestedClass = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ').trim();

    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return { students: await this.parseExcel(file), suggestedClass };
    } else if (ext === 'docx') {
      return { students: await this.parseWord(file), suggestedClass };
    } else if (ext === 'txt') {
      return { students: await this.parseTxt(file), suggestedClass };
    } else if (ext === 'pdf') {
      return { students: await this.parsePdf(file), suggestedClass };
    }
    throw new Error(`Định dạng không hỗ trợ: .${ext}. Hãy dùng xlsx, csv, docx, hoặc txt.`);
  },

  async parseExcel(file: File): Promise<StudentEntry[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const names: StudentEntry[] = [];
          for (const row of rows) {
            const cell = (row[0] || row[1] || '').toString().trim();
            if (cell && cell.length > 1 && !/^\d+$/.test(cell) && !/stt|số|họ tên|tên|name|lớp|class/i.test(cell)) {
              names.push({ name: cell });
            }
          }
          resolve(names);
        } catch (err) {
          reject(new Error('Lỗi đọc file Excel: ' + (err instanceof Error ? err.message : String(err))));
        }
      };
      reader.onerror = () => reject(new Error('Không đọc được file'));
      reader.readAsArrayBuffer(file);
    });
  },

  async parseTxt(file: File): Promise<StudentEntry[]> {
    const text = await file.text();
    return text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 1)
      .map(name => ({ name }));
  },

  async parseWord(file: File): Promise<StudentEntry[]> {
    const mammoth = await import('mammoth');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target!.result as ArrayBuffer });
          const lines = result.value.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 1 && !/stt|số tt|họ và tên|tên|lớp|danh sách/i.test(l));
          resolve(lines.map(name => ({ name })));
        } catch (err) {
          reject(new Error('Lỗi đọc file Word: ' + (err instanceof Error ? err.message : String(err))));
        }
      };
      reader.onerror = () => reject(new Error('Không đọc được file'));
      reader.readAsArrayBuffer(file);
    });
  },

  async parsePdf(file: File): Promise<StudentEntry[]> {
    throw new Error('PDF chưa được hỗ trợ trực tiếp. Vui lòng chuyển sang Excel (.xlsx), CSV, hoặc Word (.docx).');
  },
};
