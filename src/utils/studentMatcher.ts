/**
 * studentMatcher.ts — Chuẩn hóa và so khớp thông minh tên học sinh tiếng Việt
 * Giải quyết triệt để vấn đề:
 *  - Sai lệch bảng mã Unicode tổ hợp (NFD) vs dựng sẵn (NFC) giữa các thiết bị/bàn phím
 *  - Dư thừa khoảng trắng, ký tự vô hình (zero-width space, non-breaking space)
 *  - Đánh số thứ tự đầu tên ("1. Nguyễn Văn A", "02. Lê Thị B")
 *  - Gắn kèm lớp ở đầu hoặc cuối ("Nguyễn Văn A - 12C3", "12C3 - Nguyễn Văn A", "Nguyễn Văn A (12C3)")
 *  - Dấu thanh tiếng Việt khi so khớp mềm
 */

export function cleanStudentName(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFC')
    .toLowerCase()
    // Thay thế non-breaking spaces và khoảng trắng đặc biệt
    .replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, ' ')
    // Xóa số thứ tự đầu dòng như "1. ", "01. ", "1 - ", "01 - ", "1) "
    .replace(/^\s*\d+[\s.:)\-_]+\s*/, '')
    // Xóa nhãn lớp ở cuối như "(12C3)", "- 12C3", "[Lớp 12A1]", "_12C2"
    .replace(/\s*[\(\[\-–—_]\s*(?:lớp|lop|class)?\s*[0-9]{1,2}[a-zA-Z0-9_\s]*[\)\]]?\s*$/i, '')
    // Xóa nhãn lớp ở đầu như "12C3 - ", "[12C3] "
    .replace(/^\s*[\(\[\-–—_]?(?:lớp|lop|class)?\s*[0-9]{1,2}[a-zA-Z0-9_\s]*[\)\]\-–—:_]+\s*/i, '')
    // Xóa các ký tự dấu câu thừa
    .replace(/[.,:;_\-–—\(\)\[\]\/\\|"']/g, ' ')
    // Rút gọn nhiều dấu cách thành 1
    .replace(/\s+/g, ' ')
    .trim();
}

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Kiểm tra xem 2 tên học sinh có phải là cùng 1 người hay không
 */
export function isStudentNameMatch(rosterName: string, attemptName: string): boolean {
  if (!rosterName || !attemptName) return false;

  const a = cleanStudentName(rosterName);
  const b = cleanStudentName(attemptName);

  if (!a || !b) return false;
  if (a === b) return true;

  // So sánh sau khi bỏ số thứ tự
  const noNumA = a.replace(/^\d+\s*/, '');
  const noNumB = b.replace(/^\d+\s*/, '');
  if (noNumA === noNumB) return true;

  // So sánh chuỗi chứa nhau (VD: "Nguyen Thi Ngoc Diep" và "Nguyen Thi Ngoc Diep 12c3")
  if (noNumA.length >= 4 && noNumB.length >= 4) {
    if (noNumA.includes(noNumB) || noNumB.includes(noNumA)) return true;
  }

  // So sánh không dấu
  const toneA = removeVietnameseTones(noNumA);
  const toneB = removeVietnameseTones(noNumB);
  if (toneA === toneB) return true;

  if (toneA.length >= 4 && toneB.length >= 4) {
    if (toneA.includes(toneB) || toneB.includes(toneA)) return true;
  }

  // So sánh tập hợp từ (tránh sai lệch thứ tự Họ Tên / Tên Họ)
  const wordsA = toneA.split(' ').filter(Boolean);
  const wordsB = toneB.split(' ').filter(Boolean);
  if (wordsA.length >= 2 && wordsB.length >= 2) {
    const setA = new Set(wordsA);
    const common = wordsB.filter(w => setA.has(w));
    if (common.length >= Math.min(wordsA.length, wordsB.length) - 1 && common.length >= 2) {
      return true;
    }
  }

  return false;
}

/**
 * Chuẩn hóa tên lớp học để so sánh chính xác (VD: "12C3", "12 c3", "lớp 12c3" -> "12c3")
 */
export function normalizeClassName(className?: string): string {
  if (!className) return '';
  return className
    .toLowerCase()
    .replace(/(?:lớp|lop|class)\s*/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Kiểm tra xem 2 tên lớp có khớp nhau không
 */
export function isClassMatch(classA?: string, classB?: string): boolean {
  if (!classA || !classB) return true; // Nếu một bên chưa xác định thì chấp nhận
  const cA = normalizeClassName(classA);
  const cB = normalizeClassName(classB);
  if (!cA || !cB || cA === 'all' || cB === 'all' || cA === 'tatca' || cB === 'tatca') return true;
  return cA === cB;
}
