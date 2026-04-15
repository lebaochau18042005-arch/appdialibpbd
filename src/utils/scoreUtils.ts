import { QuestionType } from '../types';

export interface ScoringConfig {
  mcPointsEach: number;        // Phần I – Trắc nghiệm
  tfPointsPerLevel: number[];  // Phần II – Đúng/Sai [1đ, 2đ, 3đ, 4đ]
  saPointsEach: number;        // Phần III – Trả lời ngắn
}

export const DEFAULT_BGD_SCORING: ScoringConfig = {
  mcPointsEach: 0.25,
  tfPointsPerLevel: [0.1, 0.25, 0.5, 1.0],
  saPointsEach: 0.25,
};

/**
 * Chuẩn hóa đáp án trả lời ngắn theo định dạng phiếu BGD:
 * - Phiếu BGD chỉ có 4 ô gồm chữ số, dấu "," và dấu "-"
 * - Loại khoảng trắng, chuyển "." → "," (học sinh VN hay dùng dấu chấm)
 * - Về chữ thường
 */
export function normalizeShortAnswer(val: string | number): string {
  return String(val).trim().replace(/\./g, ',').toLowerCase();
}

/**
 * Kiểm tra định dạng hợp lệ theo phiếu BGD (tối đa 4 ký tự, chỉ chữ số + "," + "-").
 * Ví dụ hợp lệ: "803", "80,3", "-8,3", "1234", "-803", "0,25"
 * Ví dụ KHÔNG hợp lệ: "803,2" (5 ký tự), "1234,5" (5 ký tự)
 */
export function isBGDFormat(val: string): boolean {
  const normalized = normalizeShortAnswer(val);
  // Chỉ cho phép: chữ số, dấu phẩy, dấu trừ — tối đa 4 ký tự
  return /^-?[0-9]{1,3}(,[0-9]+)?$/.test(normalized) && normalized.length <= 4;
}

/**
 * Chuyển chuỗi số (VN hoặc quốc tế) sang số thực.
 * Chấp nhận cả "," và "." làm dấu thập phân.
 */
function parseNumericAnswer(val: string): number | null {
  // Chuẩn hoá thập phân VN: "," → "."
  const normalized = val.replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? null : n;
}

/**
 * So sánh đáp án trả lời ngắn — tuân thủ quy tắc phiếu BGD 4 ô.
 *
 * QUY TẮC BGD: Phiếu chấm chỉ có 4 ô (chữ số + "," + "-").
 * Học sinh PHẢI điền đúng giá trị đã làm tròn theo yêu cầu đề.
 * → KHÔNG có dung sai làm tròn: "803" ≠ "803,3" — sai là sai.
 *
 * Chỉ chuẩn hoá dấu "." ↔ "," để học sinh dùng cả hai cách đều được nhận.
 */
export function isShortAnswerCorrect(userAnswer: string, correctAnswer: string | number): boolean {
  // Bước 1: Khớp chuỗi sau chuẩn hoá (chỉ chuẩn hoá dấu . và ,)
  const user = normalizeShortAnswer(userAnswer);
  const correct = normalizeShortAnswer(correctAnswer);
  if (user === correct) return true;

  // Bước 2: So sánh số học chính xác (KHÔNG dung sai — học sinh phải tính đúng)
  const userNum = parseNumericAnswer(user);
  const correctNum = parseNumericAnswer(correct);
  if (userNum === null || correctNum === null) return false;

  return userNum === correctNum;
}

/**
 * Tính điểm cho từng loại câu dựa theo cấu hình điểm.
 * @param questionType Loại câu hỏi
 * @param correctCount Số ý đúng (chỉ dùng cho true_false)
 * @param isCorrect Kết quả đúng/sai (dùng cho mc và short_answer)
 * @param config Cấu hình điểm (mặc định theo BGD TT17/2025)
 */
export function getPoints(
  questionType: QuestionType,
  isCorrect: boolean,
  correctCount: number = 0,
  config: ScoringConfig = DEFAULT_BGD_SCORING
): number {
  if (questionType === 'multiple_choice') return isCorrect ? config.mcPointsEach : 0;
  if (questionType === 'short_answer') return isCorrect ? config.saPointsEach : 0;
  if (questionType === 'true_false') {
    if (correctCount <= 0) return 0;
    return config.tfPointsPerLevel[Math.min(correctCount, config.tfPointsPerLevel.length) - 1] ?? 0;
  }
  return 0;
}

/**
 * Tính tổng điểm tối đa của một đề theo cấu hình điểm
 */
export function calcMaxScore(
  mcCount: number,
  tfCount: number,
  saCount: number,
  config: ScoringConfig = DEFAULT_BGD_SCORING
): number {
  const mcMax = mcCount * config.mcPointsEach;
  const tfMax = tfCount * (config.tfPointsPerLevel[config.tfPointsPerLevel.length - 1] ?? 1.0);
  const saMax = saCount * config.saPointsEach;
  return mcMax + tfMax + saMax;
}
