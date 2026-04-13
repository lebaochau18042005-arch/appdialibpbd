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
 * Chuẩn hóa đáp án trả lời ngắn:
 * - Loại khoảng trắng thừa
 * - Chuyển dấu chấm "." thành dấu phẩy "," (chuẩn VN)
 * - Về chữ thường
 */
export function normalizeShortAnswer(val: string | number): string {
  return String(val).trim().replace(/\./g, ',').toLowerCase();
}

/**
 * So sánh đáp án trả lời ngắn — chấp nhận cả dấu "," và "." làm dấu thập phân.
 * Không yêu cầu khớp đơn vị.
 */
export function isShortAnswerCorrect(userAnswer: string, correctAnswer: string | number): boolean {
  const user = normalizeShortAnswer(userAnswer);
  const correct = normalizeShortAnswer(correctAnswer);
  return user === correct;
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
