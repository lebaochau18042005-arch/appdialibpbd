import { db, handleFirestoreError, OperationType, storage, rtdb } from '../firebase';
import { ref as rtdbRef, push as rtdbPush, set as rtdbSet, onValue as rtdbOnValue, off as rtdbOff, update as rtdbUpdate } from 'firebase/database';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, setDoc, onSnapshot, Unsubscribe, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Question, Exam, QuizAttempt, UserProfile } from '../types';
import { Type } from "@google/genai";
import { generateContentWithFallback } from './ai';

// ===== LocalStorage Fallback Helpers =====
const LS_EXAM_KEY = 'geo_pro_local_exams';
const LS_ATTEMPT_KEY = 'geo_pro_local_attempts';

function lsGetExams(): Exam[] {
  try { return JSON.parse(localStorage.getItem(LS_EXAM_KEY) || '[]'); } catch { return []; }
}
function lsSaveExam(exam: Exam): void {
  // Strip data URLs before storing — they can be several MB and blow localStorage quota.
  // Data URLs are only needed transiently for AI extraction; metadata is all we persist.
  const safe: Exam = (exam.fileUrl || '').startsWith('data:') ? { ...exam, fileUrl: '' } : exam;
  const exams = lsGetExams().filter(e => e.id !== safe.id);
  localStorage.setItem(LS_EXAM_KEY, JSON.stringify([safe, ...exams]));
}
function lsDeleteExam(id: string): void {
  localStorage.setItem(LS_EXAM_KEY, JSON.stringify(lsGetExams().filter(e => e.id !== id)));
}
function lsGetAttempts(): QuizAttempt[] {
  try { return JSON.parse(localStorage.getItem(LS_ATTEMPT_KEY) || '[]'); } catch { return []; }
}
function lsSaveAttempt(attempt: QuizAttempt): void {
  const attempts = lsGetAttempts();
  localStorage.setItem(LS_ATTEMPT_KEY, JSON.stringify([attempt, ...attempts]));
}
function isPermissionError(e: unknown): boolean {
  return e instanceof Error && e.message.includes('Missing or insufficient permissions');
}
// ==========================================

export const examService = {
  // Real-time listeners
  subscribeToAttempts(callback: (attempts: QuizAttempt[]) => void): Unsubscribe {
    const q = collection(db, 'attempts');
    const unsub = onSnapshot(q, (snapshot) => {
      const fsAttempts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizAttempt));
      const lsAttempts = lsGetAttempts().filter(la => !fsAttempts.find(fa => fa.id === la.id));
      callback([...fsAttempts, ...lsAttempts]);
    }, (_error) => {
      // Firestore failed - use only localStorage
      callback(lsGetAttempts());
    });
    return unsub;
  },

  subscribeToExams(creatorId: string, callback: (exams: Exam[]) => void): Unsubscribe {
    const q = query(collection(db, 'exams'), where('creatorId', '==', creatorId));
    const unsub = onSnapshot(q, (snapshot) => {
      const fsExams = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      const lsExams = lsGetExams().filter(le => le.creatorId === creatorId && !fsExams.find(fe => fe.id === le.id));
      callback([...fsExams, ...lsExams]);
    }, (_error) => {
      // Firestore failed - use only localStorage
      callback(lsGetExams().filter(e => e.creatorId === creatorId));
    });
    return unsub;
  },


  // Generate AI Exam based on 2025 structure using Gemini
  async generateAIExam(fileContext?: string): Promise<Question[]> {
    try {
      // model is selected automatically by generateContentWithFallback
      // ===== KHỐI KIẾN THỨC HÀNH CHÍNH BẮT BUỘC (sau sáp nhập 1/7/2025) =====
      const HANH_CHINH_2025 = `
=== DANH SÁCH 34 ĐƠN VỊ HÀNH CHÍNH CẤP TỈNH HIỆN HÀNH (sau NQ202/2025/QH15 có hiệu lực 1/7/2025) ===
BỎ HOÀN TOÀN 29 tỉnh cũ đã sáp nhập. KHÔNG BAO GIỜ dùng tên "Hà Giang", "Hải Dương", "Bắc Kạn", "Yên Bái",
"Vĩnh Phúc", "Hòa Bình", "Bắc Giang", "Hà Nam", "Nam Định", "Thái Bình", "Quảng Bình", "Quảng Nam",
"Kon Tum", "Bình Định", "Ninh Thuận", "Đắk Nông", "Bình Thuận", "Bình Dương", "Bà Rịa-Vũng Tàu",
"Hậu Giang", "Sóc Trăng", "Kiên Giang", "Bạc Liêu" là một tỉnh độc lập.

6 THÀNH PHỐ TRỰC THUỘC TW:
1. Hà Nội | 2. TP Huế | 3. Hải Phòng (= HP cũ + Hải Dương)
4. Đà Nẵng (= ĐN cũ + Quảng Nam) | 5. TP Hồ Chí Minh (= HCM + Bình Dương + Bà Rịa-Vũng Tàu)
6. Cần Thơ (= CT cũ + Hậu Giang + Sóc Trăng)

28 TỈNH:
Tuyên Quang (= TQ+Hà Giang), Lào Cai (= LC+Yên Bái), Cao Bằng, Lạng Sơn, Lai Châu, Điện Biên, Sơn La
Thái Nguyên (= TN+Bắc Kạn), Phú Thọ (= PT+Hòa Bình+Vĩnh Phúc), Bắc Ninh (= BN+Bắc Giang)
Hưng Yên (= HY+Thái Bình), Quảng Ninh, Ninh Bình (= NB+Hà Nam+Nam Định)
Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Trị (= QT+Quảng Bình)
Quảng Ngãi (= QN+Kon Tum), Gia Lai (= GL+Bình Định), Khánh Hòa (= KH+Ninh Thuận)
Đắk Lắk, Lâm Đồng (= LĐ+Đắk Nông+Bình Thuận), Đồng Nai, Tây Ninh, Vĩnh Long, Đồng Tháp
An Giang (= AG+Kiên Giang), Cà Mau (= CM+Bạc Liêu)

VÍ DỤ ĐÚNG về điểm cực Bắc: "Điểm cực Bắc nằm tại tỉnh Cao Bằng hoặc Lũng Cú, Tuyên Quang" (Lũng Cú nay thuộc Tuyên Quang vì Hà Giang đã sáp nhập)
`;

      // ===== MA TRẬN ĐỀ THI CHUẨN BỘ GDĐT 2025 =====
      const MA_TRAN_DE_THI = `
=== MA TRẬN ĐỀ THI ĐỊA LÍ THPT CHUẨN BỘ GDĐT 2025 ===
Tổng: 28 câu = 10 điểm. Thời gian: 50 phút.

PHẦN I – TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN (18 câu × 0,25đ = 4,5đ):
  • Nhận biết: 8 câu (về khái niệm, định nghĩa, số liệu cơ bản)
  • Thông hiểu: 6 câu (về nguyên nhân, đặc điểm, so sánh)
  • Vận dụng: 4 câu (phân tích, đánh giá, liên hệ thực tế)
  NỘI DUNG PHẦN I (phân bổ theo bài học Địa 12 + Địa 11):
  - Địa lí tự nhiên VN: 3–4 câu (vị trí, địa hình, khí hậu, sông ngòi, đất, sinh vật, biển)
  - Dân cư & lao động: 2–3 câu
  - Kinh tế VN theo ngành (nông-lâm-thủy sản, CN, DV, du lịch): 4–5 câu
  - Địa lí các vùng kinh tế-xã hội: 3–4 câu (KHÔNG ra vùng kinh tế trọng điểm)
  - Địa lí Đông Nam Á (lớp 11): 2–3 câu

PHẦN II – TRẮC NGHIỆM ĐÚNG/SAI (4 câu × 1đ = 4đ):
  Mỗi câu có 4 ý a/b/c/d: 1 ý đúng = 0,1đ | 2 ý đúng = 0,25đ | 3 ý đúng = 0,5đ | 4 ý đúng = 1đ
  - Câu 4 (BẮT BUỘC về ĐNÁ): Bảng GDP/dân số/xuất nhập khẩu ĐÔNG NAM Á (lớp 11), với ít nhất 3 quốc gia và 3 mốc năm

PHẦN III – TRẢ LỜI NGẮN / ĐIỀN SỐ (6 câu × 0,25đ = 1,5đ):
  TẤT CẢ câu Phần III PHẢI là bài tính toán cho kết quả là CON SỐ (không hỏi khái niệm).
  Các dạng tính bắt buộc:
  - Tỉ suất sinh thô (‰): (số_sinh / DS) × 1000
  - Tỉ suất tử thô (‰): (số_chết / DS) × 1000
  - Tỉ lệ tăng tự nhiên (‰): CBR - CDR
  - Mật độ dân số (người/km²): DS / diện_tích
  - Tăng trưởng GDP (%): (GDP_sau - GDP_trước) / GDP_trước × 100
  - Cơ cấu ngành (%): GDP_ngành / Tổng_GDP × 100
  - Năng suất (tạ/ha): sản_lượng / diện_tích
  - Bình quân lương thực (kg/người): sản_lượng / DS
`;

      // ===== NỘI DUNG CHƯƠNG TRÌNH PHẢI BÁM SÁT (TT 17/2025/TT-BGDĐT) =====
      const CHUONG_TRINH_TT17 = `
=== NỘI DUNG CHƯƠNG TRÌNH ĐỊA LÍ 12 (THEO TT 17/2025/TT-BGDĐT) ===
KHÔNG ra đề về: Atlat Địa lí (bị bãi bỏ), vùng kinh tế trọng điểm.
SỬ DỤNG đúng thuật ngữ: "vùng kinh tế - xã hội" (thay cho "vùng kinh tế").

Các chủ đề PHẢI được đề cập trong đề:
1. VỊ TRÍ & LÃNH THỔ: Xác định đặc điểm địa lí theo bản đồ (điểm cực Bắc ở Tuyên Quang, cực Nam ở Cà Mau)
2. ĐỊA HÌNH: Lãnh thổ phần đất liền đồi núi chiếm 3/4, đồng bằng chiếm 1/4 diện tích
3. KHÍ HẬU: Mưa mùa, gió mùa, phân hóa Bắc-Nam, Đông-Tây
4. SÔNG NGÒI: Mạng dày, chảy ra biển phía đông
5. ĐẤT & SINH VẬT: Phân hóa theo địa hình
6. BIỂN ĐÔNG: Vùng biển 1 triệu km², quần đảo Hoàng Sa (ĐN) và Trường Sa (Khánh Hòa)
7. DÂN CƯ: 100+ triệu người, Kinh chiếm 85%, dân số trẻ, lao động đông
8. ĐÔ THỊ HÓA: Tỉ lệ đô thị hóa ~40%, hệ thống đô thị theo tầng
9. CHUYỂN DỊCH CƠ CẤU KT: Theo ngành, thành phần, lãnh thổ
10. NÔNG NGHIỆP: Vùng chuyên canh, trang trại, khu NNCNC
11. LÂM NGHIỆP: Phát triển bền vững, rừng phòng hộ, đặc dụng
12. THỦY SẢN: Nuôi trồng + khai thác, xuất khẩu
13. CÔNG NGHIỆP: Khu công nghiệp, khu công nghệ cao (Hòa Lạc, Đà Nẵng, HCM)
14. DỊCH VỤ & DU LỊCH: Du lịch bền vững, phân hóa lãnh thổ
15. CÁC VÙNG:
   - TRUNG DU & MIỀN NÚI PHÍA BẮC: khoáng sản, thủy điện (Hòa Bình, Sơn La, Lai Châu), cây cận nhiệt/ôn đới, chăn nuôi gia súc lớn
   - ĐỒNG BẰNG SÔNG HỒNG: CN nặng, dịch vụ, kinh tế biển (Hải Phòng, Quảng Ninh)
   - BẮC TRUNG BỘ: Du lịch, cảng biển, khai khoáng
   - NAM TRUNG BỘ: Bô-xít (Gia Lai, Lâm Đồng), thủy điện, kinh tế biển, du lịch
   - TÂY NGUYÊN: Cà phê, cao su, bô-xít, thủy điện
   - ĐÔNG NAM BỘ: Kinh tế số 1 VN, CN-DV, cảng biển
   - ĐỒNG BẰNG SÔNG CỬU LONG: lúa gạo, thủy sản, trái cây xuất khẩu

ĐỊA LÍ ĐÔNG NAM Á (Lớp 11 - bắt buộc có trong đề):
- Đặc điểm tự nhiên, dân cư, kinh tế ĐNÁ
- ASEAN và hợp tác khu vực
- So sánh GDP, dân số, cơ cấu kinh tế các nước ĐNÁ
`;

      const systemInstruction = `Bạn là chuyên gia biên soạn đề thi Địa lí THPT Quốc gia cấp Bộ, GIỎI NHẤT Việt Nam.
      Nhiệm vụ: tạo đề thi ĐÚNG MA TRẬN chu      B. PHẦN III - correctAnswer PHẦN III PHẢI là một CON SỐ (string hoặc number). Bài tính có đủ dữ liệu trong câu text.
      C. MỌI CÂU HỎi phải có fields: id, type, text, context, topic, lesson, cognitiveLevel, explanation, tips, mnemonics.
      D. Câu hỏi trắc nghiệm: phải có options (4 phương án) và correctAnswerIndex.
      E. correctAnswerIndex là INDEX (0, 1, 2, 3), KHÔNG phải nhãn A/B/C/D.
      F. KHÔNG sử dụng tỉnh/thành đã bị sáp nhập làm đáp án đúng tồn tại độc lập.
      ${fileContext ? `G. Dùng TÀI LIỆU THAM KHẢO được cung cấp là nguồn kiến thức chính.` : ''}`;

      const prompt = `Hãy tạo ngay một đề thi Địa lí THPT chuẩn Bộ 2025 gồm ĐÚNG 28 câu theo đúng ma trận:
      - 18 câu Phần I (trắc nghiệm 4 đáp án: 8 Nhận biết + 6 Thông hiểu + 4 Vận dụng)
      - 4 câu Phần II (mỗi câu có 4 statements đúng/sai, không có correctAnswerIndex)
      - 6 câu Phần III (điền số: tất cả là bài tính toán, correctAnswer là số)

         ❌ FORBIDDEN (sẽ gây lỗi hệ thống): { "text": "Cho biểu đồ X...", "context": null }
          ✅ REQUIRED: { "text": "Cho biểu đồ X...", "context": "| Loại | 2015 | 2020 | 2024 |\n|---|---|---|---|\n..." }
          🔑 GIẢI PHÁP ĐƠN GIẢN: Nếu không có số liệu → KHÔNG VÀO câu hỏi về biểu đồ/bảng mà hỏi về đặc điểm/nguyên nhân.

         CHUẨN BẢNG SỐ LIỆU BẮT BUỘC — phải tuân thủ CHÍNH XÁC:
         - Hàng 1: header với tên các cột (dùng đơn vị trong ngoốc nếu cần): | Chỉ tiêu | 2015 | 2020 | 2024 |
         - Hàng 2: dòng phân cách: |---|---|---|---|
         - Hàng 3+: dữ liệu số, dùng DẤU PHẨY ngăn hàng nghìn phổ thông VN: 1.234,5
         - Dòng cuối bắt đầu bằng "(Nguồn: ..." để ghi nguồn số liệu
         - Số liệu PHẢI NHẤT QUÁN với câu text và phương án đúng/sai

      B. PHẦN III - correctAnswer PHẦN III PHẢI là một CON SỐ (string hoặc number). Bài tính có đủ dữ liệu trong câu text.
      C. MỌI CÂU HỎI phải có fields: id, type, text, context, topic, lesson, cognitiveLevel, explanation, tips, mnemonics.
      D. Câu hỏi trắc nghiệm: phải có options (4 phương án) và correctAnswerIndex.
      E. correctAnswerIndex là INDEX (0, 1, 2, 3), KHÔNG phải nhãn A/B/C/D.
      F. KHÔNG sử dụng tỉnh/thành đã bị sáp nhập làm đáp án đúng tồn tại độc lập.
      - 6 câu Phần III (điền số: tất cả là bài tính toán, correctAnswer là số)

      YÊU CẦU PHẦN II (ĐÚNG CẤU TRÚC THI TỐT NGHIỆP 2025 — BẮT BUỘC):
      *** CÂU 1, 2, 3 Phần II: CẤM dùng bất kỳ từ "biểu đồ", "bảng", "số liệu", "hình" trong câu hỏi. ***
          - 4 mệnh đề Đúng/Sai về kiến thức, khái niệm, đặc điểm địa lí Việt Nam (lý thuyết thuần túy).
          - Câu hỏi phải hỏi về khái niệm, đặc điểm, nguyên nhân, ý nghĩa địa lí — KHÔNG hỏi về số liệu.
          - id 4 statements: "stmt_a", "stmt_b", "stmt_c", "stmt_d"
          - Phân bố: 2 đúng 2 sai (hoặc 3-1 hoặc 1-3, đa dạng).

      *** CÂU 4 Phần II: BẮT BUỘC có bảng số liệu Đông Nam Á. context là Markdown table. ***
          - Về địa lí Đông Nam Á (Địa 11). text: "Cho bảng số liệu... một số nước Đông Nam Á..."
          - context: bảng Markdown ít nhất 5 quốc gia ĐNÁ, 3 mốc năm (2019, 2021, 2024).
          - 4 mệnh đề phân tích số liệu từ bảng (id: "stmt_a" đến "stmt_d").

      LƯU Ý KHÁC:
      - Phần III: 1 câu tính tỉ suất sinh/tử, 1 mật độ dân số, 2 cơ cấu %, 2 tăng trưởng/năng suất.
      - Điểm cực Bắc VN: TUYÊN QUANG. Không ra câu hỏi có đáp án tỉnh đã bị sáp nhập.

      ${fileContext ? `=== TÀI LIỆU THAM KHẢO ===\n${fileContext.slice(0, 50000)}` : ''}`;

      const response = await generateContentWithFallback(prompt, {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["multiple_choice", "true_false", "short_answer"] },
              text: { type: Type.STRING },
              context: { type: Type.STRING },
              topic: { type: Type.STRING },
              lesson: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              tips: { type: Type.STRING },
              mnemonics: { type: Type.STRING },
              correctAnswer: { type: Type.STRING },
              unit: { type: Type.STRING },
              cognitiveLevel: { type: Type.STRING, enum: ["Nhận biết", "Thông hiểu", "Vận dụng"] },
              statements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    isTrue: { type: Type.BOOLEAN }
                  },
                  required: ["id", "text", "isTrue"]
                }
              }
            },
            required: ["id", "type", "text", "context", "explanation", "cognitiveLevel"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("AI không trả về nội dung.");
      
      const examQuestions = JSON.parse(text);
      if (!Array.isArray(examQuestions) || examQuestions.length === 0) {
        throw new Error("Dữ liệu đề thi không hợp lệ.");
      }

      // ===== TWO-PASS: Generate missing context for chart-reference questions =====
      // Gemini may still return context="" for some chart questions despite being required.
      // For those, call AI separately just to generate the data table.
      const CHART_RE = /biểu đồ|bảng số liệu|bảng dưới đây|bảng trên|lược đồ|hình dưới|số liệu sau/i;
      const needsContext = examQuestions.filter((q: any) => 
        CHART_RE.test(q.text || '') && (!q.context || q.context.trim().length < 15)
      );

      if (needsContext.length > 0) {
        await Promise.all(needsContext.map(async (q: any) => {
          try {
            const ctxPrompt = `Tạo ngay một bảng số liệu Markdown phù hợp với câu hỏi địa lí sau (không giải thích gì thêm, chỉ trả về bảng Markdown):

CÂU HỎI: ${q.text}

YÊU CẦU:
- Bảng có ít nhất 4 hàng dữ liệu và 3-5 cột
- Nếu câu hỏi về Đông Nam Á: dùng ít nhất 5 quốc gia ĐNÁ với GDP/dân số từ 2019-2024
- Nếu câu hỏi về Việt Nam: dùng số liệu kinh tế-xã hội VN từ 2015-2024
- Số liệu phải nhất quán với nội dung câu hỏi
- Kết thúc bảng bằng dòng "(Nguồn: ...)"
- CHỈ trả về bảng Markdown, không có text khác`;
            const ctxRes = await generateContentWithFallback(ctxPrompt);
            const generated = ctxRes.text?.trim() || '';
            if (generated.includes('|') && generated.includes('---')) {
              q.context = generated;
            }
          } catch {
            // if fails, leave context as-is — warning will show as fallback
          }
        }));
      }

      return examQuestions;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  async generatePracticeQuestions(topicOrLesson: string, mode: 'topic' | 'lesson' | 'format' | string, count: number, fileContext?: string): Promise<Question[]> {
    try {
      // model is selected automatically by generateContentWithFallback

      const HANH_CHINH_NOTE = `
CẬP NHẬT HÀNH CHÍNH 2025 (NQ202/2025/QH15 hiệu lực 1/7/2025): Việt Nam còn 34 đơn vị hành chính cấp tỉnh.
KHÔNG BAO GIỌ dùng tên củ (đã sáp nhập) là một tỉnh độc lập: Hà Giang (nay = Tuyên Quang), Hải Dương (nay = Hải Phòng),
Bắc Kạn (nay = Thái Nguyên), Yên Bái (nay = Lào Cai), Bắc Giang (nay = Bắc Ninh), Vĩnh Phúc+Hòa Bình (nay = Phú Thọ),
Thái Bình (nay = Hưng Yên), Hà Nam+Nam Định (nay = Ninh Bình), Quảng Bình (nay = Quảng Trị),
Quảng Nam (nay = Đà Nẵng), Kon Tum (nay = Quảng Ngãi), Bình Định (nay = Gia Lai),
Bình Dương+Bà Rịa-Vũng Tàu (nay = TP Hồ Chí Minh), Hậu Giang+Sóc Trăng (nay = Cần Thơ),
Kiên Giang (nay = An Giang), Bạc Liêu (nay = Cà Mau), Ninh Thuận (nay = Khánh Hòa),
Đắk Nông+Bình Thuận (nay = Lâm Đồng).
Điểm cực Bắc nằm tại Tuyên Quang (đã gộp Hà Giang). Quần đảo Hoàng Sa thuộc Đà Nẵng, Trường Sa thuộc Khánh Hòa.
Thuật ngữ mới: "vùng kinh tế - xã hội" (thay cho "vùng kinh tế"). KHÔNG dùng Atlat. KHÔNG ra vùng kinh tế trọng điểm.
`;

      const systemInstruction = `Bạn là một chuyên gia biên soạn câu hỏi luyện tập môn Địa lí THPT chuẩn chương trình 2025 (TT 17/2025/TT-BGDĐT).
      Nhiệm vụ: tạo ${count} câu hỏi luyện tập về ${mode === 'topic' ? 'chủ đề' : mode === 'lesson' ? 'bài học' : 'dạng thức'}: "${topicOrLesson}".
      
      ${HANH_CHINH_NOTE}
      
      QUY TẮC BẮT BUỘC:
      1. CẤU TRÚC: ${mode === 'format' ? `CHỈ TẠO CÁC CÂU HỎI THUỘC ĐÚNG MỘT DẠNG: ${topicOrLesson}. (multiple_choice, true_false, hoặc short_answer).` : `Kết hợp các loại câu hỏi (Trắc nghiệm, Đúng/Sai, Trả lời ngắn) theo tỉ lệ phù hợp.`}
      2. SỐ LIỆU: Nếu câu hỏi cần bảng số liệu, đặt vào trường "context" dưới dạng MARKDOWN TABLE với số liệu cụ thể (không dùng URL).
      3. CHÍNH XÁC KIẾN THỨC: Bám sát chương trình mới nhất (TT 17/2025). Dùng đúng tên tỉnh thành sau sáp nhập.
      4. GIẢI THÍCH CHI TIẾT: Mỗi câu hỏi PHẢI có explanation, tips, và mnemonics.
      5. ĐỘ KHÓ: Phân bổ từ Nhận biết đến Vận dụng.
      ${fileContext ? `6. RẤT QUAN TRỌNG: Bạn PHẢI sử dụng tài liệu gốc (TÀI LIỆU THAM KHẢO) được cung cấp dưới đây để biên soạn câu hỏi. Đảm bảo câu hỏi phản ánh chính xác thông tin từ tài liệu này.` : ''}`;

      const prompt = `Hãy tạo ${count} câu hỏi Địa lí về ${mode === 'topic' ? 'chủ đề' : mode === 'lesson' ? 'bài học' : 'dạng thức'} "${topicOrLesson}".
      Đảm bảo nội dung chính xác (dùng tên tỉnh thành sau sáp nhập 2025), cập nhật và có giải thích chi tiết.

      ĐỐI VỚI CÂU ĐÚNG/SAI (true_false) - BẮT BUỘC:
      - Mỗi câu PHẢI CÓ ĐÚNG 4 statements, id lần lượt là: "stmt_a", "stmt_b", "stmt_c", "stmt_d".
      - Viết text mỗi mệnh đề bắt đầu bằng chữ thường (không cần ghi a) b) c) d) vì UI đã tự thêm).
      - Phân bố đúng/sai đa dạng (không phải lúc nào cũng 2 đúng 2 sai).
      - Nếu có bảng số liệu, đặt vào trường "context" dạng MARKDOWN TABLE.
      
      ${fileContext ? `=== TÀI LIỆU THAM KHẢO GỐC ===\n${fileContext.slice(0, 50000)}` : ''}`;

      const response = await generateContentWithFallback(prompt, {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["multiple_choice", "true_false", "short_answer"] },
              text: { type: Type.STRING },
              topic: { type: Type.STRING },
              lesson: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              tips: { type: Type.STRING },
              mnemonics: { type: Type.STRING },
              correctAnswer: { type: Type.STRING },
              unit: { type: Type.STRING },
              cognitiveLevel: { type: Type.STRING, enum: ["Nhận biết", "Thông hiểu", "Vận dụng"] },
              statements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    isTrue: { type: Type.BOOLEAN }
                  }
                }
              }
            },
            required: ["id", "type", "text", "explanation"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("AI không trả về nội dung.");
      
      const questions = JSON.parse(text);
      return questions;
    } catch (error) {
      console.error("AI Practice Generation Error:", error);
      throw error;
    }
  },

  async saveExam(exam: Omit<Exam, 'id'>): Promise<string> {
    // If creator is anonymous/guest, skip Firestore entirely - save instantly
    const isGuest = !exam.creatorId || exam.creatorId === 'anonymous' || exam.creatorId.includes('anonymous') || exam.creatorId.startsWith('guest_');
    if (isGuest) {
      const localId = `local_${Date.now()}`;
      lsSaveExam({ id: localId, ...exam });
      return localId;
    }
    try {
      const docRef = await addDoc(collection(db, 'exams'), exam);
      return docRef.id;
    } catch (error) {
      if (isPermissionError(error)) {
        const localId = `local_${Date.now()}`;
        lsSaveExam({ id: localId, ...exam });
        return localId;
      }
      handleFirestoreError(error, OperationType.CREATE, 'exams');
      return '';
    }
  },

  // Update an existing exam (questions, images, tables, etc.)
  async updateExam(exam: Exam): Promise<void> {
    // Always update localStorage immediately
    lsSaveExam(exam);
    // Try Firestore if it's a real (non-local) ID
    if (!exam.id.startsWith('local_')) {
      try {
        const docRef = doc(db, 'exams', exam.id);
        const { id, ...data } = exam;
        await updateDoc(docRef, data as any);
      } catch (error) {
        if (!isPermissionError(error)) {
          console.warn('updateExam Firestore failed, kept in localStorage:', error);
        }
      }
    }
    // IMPORTANT: Also sync questions into RTDB assignment bundles so students
    // on other devices see the updated context/imageUrl added via ExamEditor
    if (exam.questions?.length) {
      try {
        const { get: rtdbGet } = await import('firebase/database');
        const snap = await rtdbGet(rtdbRef(rtdb, 'assignments'));
        if (snap.exists()) {
          const updates: Record<string, any> = {};
          snap.forEach((child: any) => {
            if (child.val()?.examId === exam.id) {
              updates[`assignments/${child.key}/questions`] = exam.questions;
            }
          });
          if (Object.keys(updates).length > 0) {
            await rtdbUpdate(rtdbRef(rtdb, '/'), updates);
            console.log(`updateExam: synced questions to ${Object.keys(updates).length} RTDB assignment(s)`);
          }
        }
      } catch (e) {
        console.warn('updateExam: could not sync to RTDB assignments', e);
      }
    }
  },

  async getExamsByCreator(creatorId: string): Promise<Exam[]> {
    try {
      const q = query(collection(db, 'exams'), where('creatorId', '==', creatorId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'exams');
      return [];
    }
  },

  async getAllExams(): Promise<Exam[]> {
    const lsExams = lsGetExams();
    try {
      const querySnapshot = await getDocs(collection(db, 'exams'));
      const fsExams = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      // Merge: local exams not in Firestore
      const onlyLocal = lsExams.filter(le => !fsExams.find(fe => fe.id === le.id));
      return [...fsExams, ...onlyLocal];
    } catch (error) {
      if (isPermissionError(error)) return lsExams;
      handleFirestoreError(error, OperationType.LIST, 'exams');
      return lsExams;
    }
  },

  async saveUploadedExam(title: string, creatorId: string, file: File, fileType: 'word' | 'pdf' | 'html'): Promise<string> {
    const createdAt = new Date().toISOString();
    const localId = `local_${Date.now()}`;

    // Step 1: Read file as data URL (best-effort, silent on failure)
    let fileUrl = '';
    if (file.size <= 8 * 1024 * 1024) {
      try {
        fileUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch { /* silent */ }
    }

    // Step 2: Save to localStorage (with data URL) - best-effort
    const localExamData: Exam = {
      id: localId, title, creatorId,
      type: 'upload', fileUrl, fileType,
      questions: [], createdAt,
    };
    try {
      lsSaveExam(localExamData);
    } catch {
      // Quota exceeded - try without data URL
      try { lsSaveExam({ ...localExamData, fileUrl: '' }); } catch { /* skip */ }
    }

    // Step 3: Firestore metadata only (NEVER data URL - 1MB doc limit)
    const isGuest = !creatorId || creatorId === 'anonymous' || creatorId.includes('anonymous') || creatorId.startsWith('guest_');
    if (!isGuest) {
      try {
        const docRef = await addDoc(collection(db, 'exams'), {
          title, creatorId, type: 'upload' as const,
          fileUrl: '', fileType, questions: [], createdAt,
        });
        try {
          lsDeleteExam(localId);
          lsSaveExam({ ...localExamData, id: docRef.id });
        } catch { /* quota - keep localId entry */ }
        return docRef.id;
      } catch (fsErr) {
        console.warn('saveUploadedExam Firestore failed, keeping local:', fsErr);
      }
    }

    return localId;
  },


  async deleteExam(examId: string): Promise<void> {
    // Try localStorage first
    lsDeleteExam(examId);
    try {
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        const exam = examSnap.data() as Exam;
        if (exam.type === 'upload' && exam.fileUrl) {
          try {
            const fileRef = ref(storage, exam.fileUrl);
            await deleteObject(fileRef);
          } catch (storageErr) {
            console.error("Error deleting file from storage:", storageErr);
          }
        }
        await deleteDoc(examRef);
      }
    } catch (error) {
      if (!isPermissionError(error)) {
        handleFirestoreError(error, OperationType.DELETE, `exams/${examId}`);
      }
    }
  },

  async saveAttempt(attempt: Omit<QuizAttempt, 'id'>): Promise<string> {
    const attemptWithDate = { ...attempt, date: new Date().toISOString() };
    const localId = `la_${Date.now()}`;

    // Always save to RTDB so teacher can see cross-device (strip undefined fields)
    const rtdbPayload: Record<string, any> = {};
    Object.entries(attemptWithDate).forEach(([k, v]) => { if (v !== undefined) rtdbPayload[k] = v; });
    rtdbPayload.id = localId;
    try {
      await rtdbSet(rtdbRef(rtdb, `attempts/${localId}`), rtdbPayload);
    } catch (e) { console.warn('RTDB attempt save failed', e); }

    // Also save locally
    lsSaveAttempt({ id: localId, ...attemptWithDate } as QuizAttempt);

    // Try Firestore for authenticated users
    const isGuest = !attempt.userId || attempt.userId === 'anonymous' || attempt.userId.includes('anonymous') || attempt.userId.startsWith('guest_');
    if (!isGuest) {
      try {
        const docRef = await addDoc(collection(db, 'attempts'), attemptWithDate);
        return docRef.id;
      } catch { /* fall through */ }
    }
    return localId;
  },

  // Subscribe to ALL attempts from RTDB (for teacher dashboard)
  subscribeToRTDBAttempts(callback: (attempts: QuizAttempt[]) => void): () => void {
    const attRef = rtdbRef(rtdb, 'attempts');
    const handler = (snap: any) => {
      if (!snap.exists()) { callback([]); return; }
      const list: QuizAttempt[] = [];
      snap.forEach((child: any) => {
        const d = child.val();
        list.push({ id: child.key, ...d });
      });
      list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      callback(list);
    };
    rtdbOnValue(attRef, handler, () => callback([]));
    return () => rtdbOff(attRef, 'value', handler);
  },

  // Teacher: add comment/progress to RTDB attempt
  async addRTDBComment(attemptId: string, teacherComment: string, studentProgress: string): Promise<void> {
    try {
      await rtdbUpdate(rtdbRef(rtdb, `attempts/${attemptId}`), { teacherComment, studentProgress, commentedAt: new Date().toISOString() });
    } catch (e) { console.warn('addRTDBComment failed', e); }
  },

  async getStudentAttempts(userId: string): Promise<QuizAttempt[]> {
    const lsAttempts = lsGetAttempts().filter(a => a.userId === userId);
    try {
      const q = query(collection(db, 'attempts'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fsAttempts = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizAttempt));
      const onlyLocal = lsAttempts.filter(la => !fsAttempts.find(fa => fa.id === la.id));
      return [...fsAttempts, ...onlyLocal];
    } catch (error) {
      if (isPermissionError(error)) return lsAttempts;
      console.error('getStudentAttempts error:', error);
      return lsAttempts;
    }
  },

  async getAllAttempts(): Promise<QuizAttempt[]> {
    const lsAttempts = lsGetAttempts();
    try {
      const querySnapshot = await getDocs(collection(db, 'attempts'));
      const fsAttempts = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizAttempt));
      const onlyLocal = lsAttempts.filter(la => !fsAttempts.find(fa => fa.id === la.id));
      return [...fsAttempts, ...onlyLocal];
    } catch (error) {
      if (isPermissionError(error)) return lsAttempts;
      console.error('getAllAttempts error:', error);
      return lsAttempts;
    }
  },

  async addTeacherComment(attemptId: string, comment: string, progress: string): Promise<void> {
    // If this is a localStorage attempt, update it locally
    const isLocalAttempt = attemptId.startsWith('la_') || attemptId.startsWith('local_');
    if (isLocalAttempt) {
      const attempts: QuizAttempt[] = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
      const updated = attempts.map(a =>
        a.id === attemptId ? { ...a, teacherComment: comment, studentProgress: progress } : a
      );
      localStorage.setItem('geo_pro_local_attempts', JSON.stringify(updated));
      return;
    }
    // Otherwise try Firestore
    try {
      const docRef = doc(db, 'attempts', attemptId);
      await updateDoc(docRef, {
        teacherComment: comment,
        studentProgress: progress
      });
    } catch (error) {
      if (isPermissionError(error)) {
        // Firestore blocked - save to localStorage as fallback
        const attempts: QuizAttempt[] = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
        const exists = attempts.find(a => a.id === attemptId);
        if (exists) {
          const updated = attempts.map(a =>
            a.id === attemptId ? { ...a, teacherComment: comment, studentProgress: progress } : a
          );
          localStorage.setItem('geo_pro_local_attempts', JSON.stringify(updated));
        }
      } else {
        handleFirestoreError(error, OperationType.UPDATE, `attempts/${attemptId}`);
      }
    }
  },

  async downloadExam(examId: string): Promise<void> {
    try {
      console.log("Downloading exam:", examId);
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        const exam = examSnap.data() as Exam;
        const safeTitle = (exam.title || 'De_thi').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        if (exam.type === 'upload' && exam.fileUrl) {
          const link = document.createElement('a');
          link.href = exam.fileUrl;
          const ext = exam.fileType === 'word' ? '.docx' : exam.fileType === 'pdf' ? '.pdf' : '.html';
          link.download = `${safeTitle}${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }

        let content = `ĐỀ THI: ${exam.title.toUpperCase()}\n`;
        content += `Cấu trúc: TT 17/2025 BGDĐT\n\n`;
        
        if (exam.questions && exam.questions.length > 0) {
          exam.questions.forEach((q, i) => {
            content += `Câu ${i + 1}: ${q.text}\n`;
            if (q.type === 'multiple_choice' && q.options) {
              q.options.forEach((opt, j) => {
                content += `${String.fromCharCode(65 + j)}. ${opt}\n`;
              });
            } else if (q.type === 'true_false' && q.statements) {
              q.statements.forEach((s, j) => {
                content += `- ${s.text} (Đúng/Sai)\n`;
              });
            }
            content += `\n`;
          });
        } else {
          content += `(Đề thi hiện chưa có câu hỏi chi tiết)\n`;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${safeTitle}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error("Không tìm thấy đề thi.");
      }
    } catch (error) {
      console.error("Download Error:", error);
      handleFirestoreError(error, OperationType.GET, `exams/${examId}`);
    }
  },

  async updateProfile(uid: string, profile: Partial<UserProfile>) {
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  async generateDetailedExplanation(question: Question, userAnswer: any): Promise<{ explanation: string, tips: string, mnemonics: string }> {
    try {
      // Lấy kiến thức hành chính 2025 từ ai.ts
      const { KIEN_THUC_HANH_CHINH_2025_EXPORT } = await import('./ai');
      const adminNote = KIEN_THUC_HANH_CHINH_2025_EXPORT ||
        'Cập nhật hành chính 2025: Việt Nam còn 34 tỉnh/thành sau NQ202/2025/QH15 (hiệu lực 1/7/2025). Dùng đúng tên tỉnh mới.';

      const contextBlock = question.context ? `\nBẢNG SỐ LIỆU / NGỮ CẢNH:\n${question.context}\n` : '';

      const prompt = `Bạn là một chuyên gia giáo dục Địa lí THPT, nắm vững cấu trúc đề 2025 và TT 17/2025/TT-BGDĐT. Hãy giải thích chi tiết câu hỏi sau cho học sinh.

${adminNote}${contextBlock}
CÂU HỎI: ${question.text}
LOẠI CÂU HỎI: ${question.type}
ĐÁP ÁN ĐÚNG: ${question.type === 'multiple_choice' ? (question as any).options[(question as any).correctAnswerIndex] :
                    question.type === 'true_false' ? JSON.stringify((question as any).statements.filter((s: any) => s.isTrue).map((s: any) => s.text)) :
                    (question as any).correctAnswer}
CÂU TRẢ LỜI CỦA HỌC SINH: ${JSON.stringify(userAnswer)}

YÊU CẦU:
1. Giải thích tại sao đáp án đúng là chính xác (trích dẫn nội dung TT 17/2025 nếu phù hợp).
2. Nếu học sinh trả lời sai, hãy phân tích lỗi sai thường gặp.
3. Cung cấp lời khuyên (tips) để làm dạng bài này.
4. Cung cấp mẹo ghi nhớ (mnemonics) để nhớ kiến thức này lâu hơn.
Nếu câu hỏi liên quan tỉnh/thành, vùng kinh tế — SỬ DỤNG TÊN TỈNH SAU SÁP NHẬP 1/7/2025.

Trả về JSON: { "explanation": "...", "tips": "...", "mnemonics": "..." }`;

      const response = await generateContentWithFallback(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            tips: { type: Type.STRING },
            mnemonics: { type: Type.STRING }
          },
          required: ["explanation", "tips", "mnemonics"]
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("AI Explanation Error:", error);
      return {
        explanation: question.explanation || "Không có giải thích chi tiết.",
        tips: question.tips || "Hãy ôn tập kỹ kiến thức liên quan.",
        mnemonics: question.mnemonics || "Sử dụng sơ đồ tư duy để ghi nhớ."
      };
    }
  }
};
