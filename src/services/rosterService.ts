import * as XLSX from 'xlsx';

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

// ─── Persistence ──────────────────────────────────────────────────────────────
export const rosterService = {
  getRosters(): ClassRoster[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
  },

  saveRoster(className: string, students: StudentEntry[]): ClassRoster {
    const rosters = this.getRosters();
    const existing = rosters.find(r => r.className.toLowerCase() === className.toLowerCase());
    const roster: ClassRoster = {
      id: existing?.id || `roster_${Date.now()}`,
      className: className.trim(),
      students,
      updatedAt: new Date().toISOString(),
    };
    const updated = rosters.filter(r => r.id !== roster.id);
    updated.unshift(roster);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    return roster;
  },

  deleteRoster(id: string) {
    const updated = this.getRosters().filter(r => r.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  },

  getClassNames(): string[] {
    return this.getRosters().map(r => r.className);
  },

  getStudentsForClass(className: string): StudentEntry[] {
    const r = this.getRosters().find(r => r.className.toLowerCase() === className.toLowerCase());
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
            // Try common column patterns: col A (index 0), or look for a column containing "họ" / "tên"
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
    // Dynamically import mammoth to avoid SSR issues
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
    // For PDF, we use a simple approach - ask user to copy-paste or convert
    // We can read with pdf.js dynamically, but it's complex
    // For now, return helpful message by reading text from the file name
    throw new Error('PDF chưa được hỗ trợ trực tiếp. Vui lòng chuyển sang Excel (.xlsx), CSV, hoặc Word (.docx).');
  },
};
