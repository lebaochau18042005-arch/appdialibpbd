/**
 * teacherWorkspaceService — Quản lý không gian làm việc độc lập của từng giáo viên (Multi-Tenant by Gmail)
 * Giúp mỗi giáo viên có một không gian lưu trữ riêng biệt về:
 *  - Ngân hàng đề thi
 *  - Phân công giao bài & Giám sát học sinh
 *  - Lịch sử kết quả làm bài của học sinh
 *  - Cấu hình bảng tính Google Sheet Webhook đích
 */

import { rtdb } from '../firebase';
import { ref, get, set } from 'firebase/database';
import { TeacherWorkspace } from '../types';

export const LS_ACTIVE_TEACHER_EMAIL = 'geo_pro_active_teacher_email';
export const LS_TEACHER_PROFILE_PREFIX = 'geo_pro_teacher_profile_';
export const LS_TEACHER_RECENT_LIST = 'geo_pro_recent_teachers';

/**
 * Chuyển email (ví dụ thaynam.dialy@gmail.com) thành khóa an toàn cho Firebase RTDB / LocalStorage
 * thaynam_dialy_gmail_com
 */
export function sanitizeEmailKey(email?: string | null): string {
  if (!email) return 'default_teacher';
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

/**
 * Kiểm tra định dạng email hợp lệ
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Đảm bảo email có đuôi @gmail.com nếu người dùng chỉ gõ tên tài khoản
 */
export function normalizeTeacherEmail(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return '';
  if (!trimmed.includes('@')) {
    return `${trimmed}@gmail.com`;
  }
  return trimmed;
}

export const teacherWorkspaceService = {
  /**
   * Lấy email của giáo viên đang kích hoạt trên thiết bị
   */
  getActiveTeacherEmail(): string {
    const saved = localStorage.getItem(LS_ACTIVE_TEACHER_EMAIL);
    return saved ? saved.trim().toLowerCase() : '';
  },

  /**
   * Lấy danh sách các tài khoản giáo viên đã từng đăng nhập trên máy này
   */
  getRecentTeachers(): TeacherWorkspace[] {
    try {
      return JSON.parse(localStorage.getItem(LS_TEACHER_RECENT_LIST) || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Đặt không gian làm việc hoạt động và lưu hồ sơ giáo viên
   */
  async setActiveWorkspace(workspace: TeacherWorkspace): Promise<void> {
    const email = normalizeTeacherEmail(workspace.email);
    if (!email) return;

    const safeKey = sanitizeEmailKey(email);
    const updatedWorkspace: TeacherWorkspace = {
      ...workspace,
      email,
      lastActiveAt: new Date().toISOString(),
      createdAt: workspace.createdAt || new Date().toISOString(),
    };

    // 1. Lưu vào LocalStorage
    localStorage.setItem(LS_ACTIVE_TEACHER_EMAIL, email);
    localStorage.setItem(`${LS_TEACHER_PROFILE_PREFIX}${safeKey}`, JSON.stringify(updatedWorkspace));

    // 2. Cập nhật danh sách gần đây
    const recents = this.getRecentTeachers().filter(t => t.email.toLowerCase() !== email.toLowerCase());
    const newRecents = [updatedWorkspace, ...recents].slice(0, 10);
    localStorage.setItem(LS_TEACHER_RECENT_LIST, JSON.stringify(newRecents));

    // 3. Đồng bộ lên Firebase RTDB để truy cập chéo thiết bị
    try {
      await set(ref(rtdb, `teachers/${safeKey}/profile`), updatedWorkspace);
    } catch (e) {
      console.warn('teacherWorkspaceService: Không thể ghi RTDB profile giáo viên, lưu cục bộ:', e);
    }
  },

  /**
   * Lấy thông tin hồ sơ của giáo viên (từ LocalStorage trước, sau đó từ RTDB)
   */
  async getTeacherProfile(email?: string): Promise<TeacherWorkspace | null> {
    const targetEmail = email ? normalizeTeacherEmail(email) : this.getActiveTeacherEmail();
    if (!targetEmail) return null;

    const safeKey = sanitizeEmailKey(targetEmail);

    // 1. Kiểm tra LocalStorage
    const local = localStorage.getItem(`${LS_TEACHER_PROFILE_PREFIX}${safeKey}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch { }
    }

    // 2. Kiểm tra RTDB
    try {
      const snap = await get(ref(rtdb, `teachers/${safeKey}/profile`));
      if (snap.exists()) {
        const val = snap.val() as TeacherWorkspace;
        localStorage.setItem(`${LS_TEACHER_PROFILE_PREFIX}${safeKey}`, JSON.stringify(val));
        return val;
      }
    } catch (e) {
      console.warn('teacherWorkspaceService.getTeacherProfile RTDB error:', e);
    }

    return {
      email: targetEmail,
      name: 'Giáo viên',
    };
  },

  /**
   * Chuyển đổi sang tài khoản giáo viên khác
   */
  switchWorkspace(email: string): void {
    const normalized = normalizeTeacherEmail(email);
    if (!normalized) return;
    localStorage.setItem(LS_ACTIVE_TEACHER_EMAIL, normalized);
  },

  /**
   * Xóa không gian làm việc hiện tại (đăng xuất khỏi không gian giáo viên)
   */
  clearActiveWorkspace(): void {
    localStorage.removeItem(LS_ACTIVE_TEACHER_EMAIL);
  }
};
