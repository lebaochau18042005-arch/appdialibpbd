/**
 * googleSheetService — Dịch vụ đồng bộ và lưu trữ kết quả kiểm tra vào Google Sheet
 * Sử dụng Google Apps Script Web App Webhook (miễn phí, hoạt động thời gian thực trên mọi thiết bị).
 */
import { rtdb } from '../firebase';
import { ref, get, set } from 'firebase/database';
import { QuizAttempt } from '../types';
import { sanitizeEmailKey, teacherWorkspaceService } from './teacherWorkspaceService';

const LS_KEY_WEBHOOK = 'geo_pro_google_sheets_url';
const LS_KEY_SHEET = 'geo_pro_google_sheets_link';

export interface GoogleSheetConfig {
  webhookUrl: string;
  sheetUrl?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface SheetRowPayload {
  date: string;
  userName: string;
  className: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  timeSpent: string;
  tabSwitches: number;
  mode: string;
  teacherComment: string;
  isTest?: boolean;
}

/**
 * Mã nguồn chuẩn hóa Google Apps Script để giáo viên dán vào Extensions -> Apps Script
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ỨNG DỤNG ĐỊA LÍ BP (GEO - EXAM - PRO)
 * Kịch bản tự động tiếp nhận và ghi kết quả làm bài của học sinh vào Google Sheet
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Khóa tối đa 10 giây để đảm bảo nhiều học sinh nộp cùng lúc không bị mất dữ liệu
  lock.tryLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Nếu trang tính mới tinh, tự động tạo hàng Tiêu đề chuẩn đẹp
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Thời gian nộp",
        "Họ và tên học sinh",
        "Lớp",
        "Tên bài kiểm tra / Đề thi",
        "Điểm số (Thang 10)",
        "Số câu",
        "Thời gian làm bài",
        "Số lần rời tab (Vi phạm)",
        "Chế độ làm bài",
        "Nhận xét của Giáo viên"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#4338ca"); // Màu Indigo sang trọng
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    // Hỗ trợ cả gửi một bài nộp đơn lẻ lẫn gửi hàng loạt bài nộp
    var rowsToInsert = [];
    var items = Array.isArray(data) ? data : [data];
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      rowsToInsert.push([
        item.date || new Date().toLocaleString("vi-VN"),
        item.userName || "Học sinh",
        item.className || "Chưa xác định",
        item.examTitle || "Bài kiểm tra",
        item.score !== undefined ? Number(item.score).toFixed(2) : "",
        item.totalQuestions || "",
        item.timeSpent || "",
        item.tabSwitches !== undefined ? item.tabSwitches : 0,
        item.mode || "Kiểm tra",
        item.teacherComment || ""
      ]);
    }
    
    // Ghi các dòng vào bảng tính
    for (var j = 0; j < rowsToInsert.length; j++) {
      sheet.appendRow(rowsToInsert[j]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: rowsToInsert.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Hệ thống Webhook Địa Lí BP đang hoạt động tốt!");
}
`;

/**
 * Định dạng thời lượng giây thành chuỗi phút giây
 */
export function formatTimeSpent(seconds?: number): string {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  if (h > 0) return `${h}h ${m}p ${rem}s`;
  return `${m}p ${rem}s`;
}

/**
 * Chuyển đổi QuizAttempt thành SheetRowPayload
 */
export function attemptToSheetPayload(a: QuizAttempt): SheetRowPayload {
  const dateStr = a.date
    ? new Date(a.date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : new Date().toLocaleString('vi-VN');

  const modeLabel = a.mode === 'exam'
    ? 'Thi thử / Kiểm tra'
    : a.mode === 'lesson'
      ? 'Luyện theo bài'
      : a.mode === 'topic'
        ? 'Luyện theo chủ đề'
        : 'Luyện tập';

  return {
    date: dateStr,
    userName: a.userName || 'Học sinh ẩn danh',
    className: a.className || 'Chưa xác định',
    examTitle: a.examTitle || 'Bài kiểm tra',
    score: Number((a.score || 0).toFixed(2)),
    totalQuestions: a.totalQuestions || 28,
    timeSpent: formatTimeSpent(a.timeSpent || 0),
    tabSwitches: a.tabSwitches || 0,
    mode: modeLabel,
    teacherComment: a.teacherComment || a.studentProgress || '',
  };
}

/**
 * Tạo nội dung chuỗi CSV với BOM UTF-8 hỗ trợ tiếng Việt
 */
export function buildCsvContent(attempts: QuizAttempt[]): string {
  const headers = [
    'Thời gian nộp',
    'Họ và tên',
    'Lớp',
    'Tên bài kiểm tra',
    'Điểm số',
    'Số câu',
    'Thời gian làm bài',
    'Số lần rời tab (Vi phạm)',
    'Chế độ',
    'Nhận xét'
  ];

  const escapeCSV = (str: any) => `"${String(str ?? '').replace(/"/g, '""')}"`;

  const rows = attempts.map(a => {
    const p = attemptToSheetPayload(a);
    return [
      escapeCSV(p.date),
      escapeCSV(p.userName),
      escapeCSV(p.className),
      escapeCSV(p.examTitle),
      escapeCSV(p.score),
      escapeCSV(p.totalQuestions),
      escapeCSV(p.timeSpent),
      escapeCSV(p.tabSwitches),
      escapeCSV(p.mode),
      escapeCSV(p.teacherComment)
    ].join(',');
  });

  return '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');
}

export const googleSheetService = {
  /**
   * Lấy cấu hình Google Sheets từ LocalStorage hoặc RTDB
   * Hỗ trợ lấy cấu hình riêng biệt theo Gmail của từng giáo viên (Multi-Tenant)
   */
  async getConfig(teacherEmail?: string): Promise<GoogleSheetConfig> {
    const email = (teacherEmail || teacherWorkspaceService.getActiveTeacherEmail() || '').trim().toLowerCase();
    const safeKey = email ? sanitizeEmailKey(email) : '';

    // 1. Nếu có email giáo viên, ưu tiên lấy cấu hình riêng của giáo viên đó
    if (safeKey) {
      const teacherWebhook = localStorage.getItem(`geo_pro_google_sheets_url_${safeKey}`) || '';
      const teacherSheet = localStorage.getItem(`geo_pro_google_sheets_link_${safeKey}`) || '';

      try {
        const snap = await get(ref(rtdb, `teachers/${safeKey}/google_sheets_config`));
        if (snap.exists()) {
          const d = snap.val();
          if (d.webhookUrl) {
            localStorage.setItem(`geo_pro_google_sheets_url_${safeKey}`, d.webhookUrl);
            if (d.sheetUrl) localStorage.setItem(`geo_pro_google_sheets_link_${safeKey}`, d.sheetUrl);
            return {
              webhookUrl: d.webhookUrl,
              sheetUrl: d.sheetUrl || teacherSheet,
              autoSync: d.autoSync ?? true,
              lastSyncedAt: d.lastSyncedAt,
            };
          }
        }
      } catch { }

      if (teacherWebhook) {
        return {
          webhookUrl: teacherWebhook,
          sheetUrl: teacherSheet,
          autoSync: true,
        };
      }
    }

    // 2. Fallback: Lấy cấu hình toàn cục (Legacy / Default)
    const localWebhook = localStorage.getItem(LS_KEY_WEBHOOK) || '';
    const localSheet = localStorage.getItem(LS_KEY_SHEET) || '';

    try {
      const snap = await get(ref(rtdb, 'settings/google_sheets_config'));
      if (snap.exists()) {
        const d = snap.val();
        if (d.webhookUrl) {
          localStorage.setItem(LS_KEY_WEBHOOK, d.webhookUrl);
          if (d.sheetUrl) localStorage.setItem(LS_KEY_SHEET, d.sheetUrl);
          return {
            webhookUrl: d.webhookUrl,
            sheetUrl: d.sheetUrl || localSheet,
            autoSync: d.autoSync ?? true,
            lastSyncedAt: d.lastSyncedAt,
          };
        }
      }
    } catch { }

    return {
      webhookUrl: localWebhook,
      sheetUrl: localSheet,
      autoSync: true,
    };
  },

  /**
   * Lưu cấu hình Webhook URL và link Google Sheet cho tài khoản giáo viên
   */
  async saveConfig(webhookUrl: string, sheetUrl?: string, autoSync: boolean = true, teacherEmail?: string): Promise<void> {
    const trimmedWebhook = webhookUrl.trim();
    const trimmedSheet = (sheetUrl || '').trim();
    const email = (teacherEmail || teacherWorkspaceService.getActiveTeacherEmail() || '').trim().toLowerCase();
    const safeKey = email ? sanitizeEmailKey(email) : '';

    if (safeKey) {
      // Lưu vào không gian riêng của giáo viên
      localStorage.setItem(`geo_pro_google_sheets_url_${safeKey}`, trimmedWebhook);
      localStorage.setItem(`geo_pro_google_sheets_link_${safeKey}`, trimmedSheet);

      try {
        await set(ref(rtdb, `teachers/${safeKey}/google_sheets_config`), {
          webhookUrl: trimmedWebhook,
          sheetUrl: trimmedSheet,
          autoSync,
          teacherEmail: email,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('googleSheetService: Không thể ghi RTDB teacher settings, đã lưu LocalStorage', e);
      }
    }

    // Lưu vào bộ nhớ nhanh thiết bị
    localStorage.setItem(LS_KEY_WEBHOOK, trimmedWebhook);
    localStorage.setItem(LS_KEY_SHEET, trimmedSheet);

    try {
      await set(ref(rtdb, 'settings/google_sheets_config'), {
        webhookUrl: trimmedWebhook,
        sheetUrl: trimmedSheet,
        autoSync,
        lastTeacherEmail: email || undefined,
        updatedAt: new Date().toISOString(),
      });
    } catch { }
  },

  /**
   * Gửi một bài làm lên Google Sheet qua Webhook
   * Tự động định tuyến chính xác tới Google Sheet của Giáo viên đã giao đề / tạo đề
   */
  async syncAttemptToGoogleSheet(attempt: QuizAttempt): Promise<boolean> {
    // 1. Định tuyến tới Google Sheet của Giáo viên giao đề
    const targetTeacherEmail = attempt.teacherEmail || undefined;
    const config = await this.getConfig(targetTeacherEmail);

    if (!config.webhookUrl) return false;

    const payload = attemptToSheetPayload(attempt);

    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      return true;
    } catch (e) {
      console.warn('googleSheetService.syncAttemptToGoogleSheet error:', e);
      return false;
    }
  },

  /**
   * Gửi hàng loạt bài làm lên Google Sheet của giáo viên
   */
  async syncBatchAttempts(attempts: QuizAttempt[], teacherEmail?: string): Promise<boolean> {
    const config = await this.getConfig(teacherEmail);
    if (!config.webhookUrl || attempts.length === 0) return false;

    const payloads = attempts.map(a => attemptToSheetPayload(a));

    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payloads),
      });

      // Cập nhật mốc thời gian đồng bộ gần nhất
      await this.saveConfig(config.webhookUrl, config.sheetUrl, config.autoSync, teacherEmail);
      return true;
    } catch (e) {
      console.warn('googleSheetService.syncBatchAttempts error:', e);
      return false;
    }
  },

  /**
   * Kiểm tra kết nối Webhook URL bằng cách gửi một dòng test
   */
  async testConnection(webhookUrl: string): Promise<boolean> {
    if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

    const testPayload: SheetRowPayload = {
      date: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      userName: '🔔 KIỂM TRA KẾT NỐI',
      className: 'HỆ THỐNG',
      examTitle: 'Kiểm tra kết nối Google Sheet thành công!',
      score: 10,
      totalQuestions: 28,
      timeSpent: '0p 01s',
      tabSwitches: 0,
      mode: 'Hệ thống',
      teacherComment: 'Đã kết nối ứng dụng Địa Lí BP thành công với Google Sheet.',
      isTest: true,
    };

    try {
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(testPayload),
      });
      return true;
    } catch (e) {
      console.error('googleSheetService.testConnection failed:', e);
      return false;
    }
  },

  /**
   * Xuất danh sách kết quả bài thi ra file CSV tương thích Google Sheets / Excel
   */
  exportAttemptsToCSV(attempts: QuizAttempt[], filename: string = 'diem_thi_dia_li.csv'): void {
    if (!attempts || attempts.length === 0) {
      alert('Không có dữ liệu bài thi để xuất!');
      return;
    }

    const csvContent = buildCsvContent(attempts);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
