import { db, handleFirestoreError, OperationType, storage, rtdb } from '../firebase';
import { ref as rtdbRef, push as rtdbPush, set as rtdbSet, onValue as rtdbOnValue, off as rtdbOff, update as rtdbUpdate } from 'firebase/database';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, setDoc, onSnapshot, Unsubscribe, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Question, Exam, QuizAttempt, UserProfile } from '../types';
import { Type } from "@google/genai";
import { generateContentWithFallback, KIEN_THUC_HANH_CHINH_2025_EXPORT, fileToGenerativePart, uploadPDFViaFileAPI } from './ai';

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

// Remove undefined fields recursively so Firestore never rejects them
function sanitizeForFirestore<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_k, v) => (v === undefined ? null : v)));
}

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
    const q = collection(db, 'exams'); // Global bank - show all exams
    const unsub = onSnapshot(q, (snapshot) => {
      const fsExams = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      // Show all local exams not already in Firestore (no creatorId filter — localStorage is device-specific)
      const lsExams = lsGetExams().filter(le => !fsExams.find(fe => fe.id === le.id));
      callback([...fsExams, ...lsExams]);
    }, (_error) => {
      // Firestore failed - use all local exams
      callback(lsGetExams());
    });
    return unsub;
  },


  // Generate AI Exam based on 2025 structure using Gemini
  async generateAIExam(fileContext?: string | any): Promise<Question[]> {
    try {
      let documentSummary = '';

      // BƯỚC 1: TRÍCH XUẤT (EXTRACTION) - NẾU CÓ TÀI LIỆU
      if (fileContext) {
        let generativePart = null;
        let textContext = '';

        if (typeof fileContext === 'object' && fileContext.name) {
          console.log("[AI Bước 1] Bắt đầu đọc file qua File/Base64 API...");
          const isPDF = fileContext.type === 'application/pdf' || fileContext.name.toLowerCase().endsWith('.pdf');
          if (isPDF) {
            generativePart = await uploadPDFViaFileAPI(fileContext as File);
          } else {
            generativePart = await fileToGenerativePart(fileContext as File);
          }
        } else {
          textContext = fileContext;
        }

        console.log("[AI Bước 1] Đang trích xuất biểu đồ & dữ liệu cốt lõi...");
        const extractionPrompt = `Bạn là chuyên gia phân tích dữ liệu Địa lý. Hãy đọc kỹ TÀI LIỆU ĐÍNH KÈM và trích xuất TOÀN BỘ số liệu, bảng biểu, biểu đồ, hình học, kiến thức trọng tâm.
Dữ liệu sẽ dùng cho Bước 2. Yêu cầu:
1) BẢNG SỐ LIỆU: Trình bày nghiêm ngặt dưới dạng Bảng Markdown đầy đủ cột, dòng, đơn vị. MỖI BẢNG PHẢI KÈM THEO NGUỒN TRÍCH DẪN RÕ RÀNG (nếu tài liệu có nguồn, bắt buộc trích xuất; nếu tài liệu không đề cập rõ, ghi rõ "Nguồn: Số liệu tham khảo/Tổng cục Thống kê (nếu khớp)").
2) TÍNH KHOA HỌC: Tóm tắt tinh gọn đặc điểm, số liệu, vị trí với ĐỘ CHÍNH XÁC TUYỆT ĐỐI. Tuyệt đối không tự bịa hoặc làm tròn bát nháo số liệu.
TUYỆT ĐỐI tuân thủ đơn vị hành chính sau sáp nhập 1/7/2025.`;

        const extractParts: any[] = [extractionPrompt];
        if (generativePart) extractParts.push(generativePart);
        if (textContext) extractParts.push(`\n=== TÀI LIỆU VĂN BẢN ===\n${textContext.substring(0, 50000)}`);

        const extractRes = await generateContentWithFallback(extractParts);
        documentSummary = extractRes.text || '';
        console.log("[AI Bước 1] Đã tạo bản tóm tắt tinh khiết thành công.");
      }

      // model is selected automatically by generateContentWithFallback
      // ===== KHỐI KIẾN THỨC HÀNH CHÍNH BẮT BUỘC (sau sáp nhập 1/7/2025) =====
      const HANH_CHINH_2025 = KIEN_THUC_HANH_CHINH_2025_EXPORT;


      // ===== MA TRẬN ĐỀ THI CHUẨN BỘ GDĐT 2025 BÁM SÁT ĐỀ THAM KHẢO =====
      const MA_TRAN_DE_THI = `
=== MA TRẬN ĐỀ THI ĐỊA LÍ THPT CHUẨN BỘ GDĐT THEO ẢNH ĐỀ THAM KHẢO ===
Tổng: 28 câu = 10 điểm. Thời gian: 50 phút.

PHẦN I – TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN (18 câu × 0,25đ = 4,5đ) Gồm 8 Nhận biết, 4 Thông hiểu, 6 Vận dụng:
  Câu 1: Nhận xét biểu đồ (VD)
  Câu 2: Thiên tai và biện pháp phòng chống (NB)
  Câu 3: Dịch vụ (GTVT/BCVT) (TH)
  Câu 4: Đồng bằng sông Cửu Long (VD)
  Câu 5: Dịch vụ (Thương mại/Du lịch) (NB)
  Câu 6: Nam Trung Bộ (TH)
  Câu 7: Vị trí địa lí và lãnh thổ (NB)
  Câu 8: Thiên nhiên nhiệt đới ẩm gió mùa (VD)
  Câu 9: Nông-lâm-thủy sản (NB)
  Câu 10: Đồng bằng sông Hồng (VD)
  Câu 11: Chuyển dịch cơ cấu kinh tế (TH)
  Câu 12: Phát triển công nghiệp (NB)
  Câu 13: Dân số (NB)
  Câu 14: Lao động và việc làm (NB)
  Câu 15: Phát triển kinh tế gắn với bảo vệ chủ quyền biển đảo / Bắc Trung Bộ / TD&MNPB (NB)
         [KHÔNG hỏi "Vùng KTTĐ" — nội dung đó đã bị TT17 bãi bỏ hoàn toàn]
  Câu 16: Phân hóa đa dạng của thiên nhiên (VD)
  Câu 17: Đông Nam Bộ (VD)
  Câu 18: Nông-lâm-thủy sản (khái quát/Trồng trọt) (TH)

PHẦN II – TRẮC NGHIỆM ĐÚNG/SAI (4 câu × 1đ = 4đ):
  Mỗi câu có 4 lệnh a/b/c/d. Bám sát độ khó sau:
  - Câu 1: Vùng kinh tế-xã hội VN: a(VD), b(NB), c(TH), d(NB)
  - Câu 2: Các ngành kinh tế VN: a(TH), b(NB), c(VD), d(NB)
  - Câu 3: Tự nhiên VN: a(VD), b(TH), c(NB), d(NB)
  - Câu 4: Nhận xét biểu đồ: a(NB), b(TH), c(NB), d(VD)

PHẦN III – TRẢ LỜI NGẮN / ĐIỀN SỐ (6 câu × 0,25đ = 1,5đ):
  TẤT CẢ câu Phần III PHẢI là bài tính toán cho kết quả là CON SỐ. Phân bổ chủ đề và độ khó:
  Câu 1 (Dân cư VN): Thông hiểu
  Câu 2 (Ngành KT VN): Vận dụng
  Câu 3 (Tự nhiên VN): Thông hiểu
  Câu 4 (Vùng KT VN): Vận dụng
  Câu 5 (Ngành KT VN): Thông hiểu
  Câu 6 (Tự nhiên VN): Thông hiểu
`;

      // ===== NỘI DUNG CHƯƠNG TRÌNH PHẢI BÁM SÁT (TT 17/2025/TT-BGDĐT - CTGDPT 2018) =====
      const CHUONG_TRINH_TT17 = `
=== NỘI DUNG BÀI HỌC CỤ THỂ - ĐỊA LÍ 12 (CTGDPT 2018, BÁM SÁT SỬA ĐỔI TT 17/2025/TT-BGDĐT) ===
CẤM HỎI KIẾN THỨC BỊ BÃI BỎ THEO TT17: KHÔNG được hỏi về vùng kinh tế trọng điểm. KHÔNG hỏi "Atlat Địa lí" mà chỉ được hỏi về "bản đồ". 
Câu hỏi PHẢI bám sát các bài học sau:

A. ĐỊA LÍ TỰ NHIÊN VIỆT NAM:
Bài 1 - Vị trí địa lí và lãnh thổ VN:
  • Xác định được đặc điểm vị trí địa lí, phạm vi lãnh thổ Việt Nam và các tỉnh, thành phố trên bản đồ.
  • Ý nghĩa vị trí: kinh tế, xã hội, quốc phòng an ninh.

Bài 2 - Địa hình VN:
  • Đồi núi 3/4 diện tích (chủ yếu thấp < 1.000m), đồng bằng 1/4
  • 4 vùng địa hình núi, 2 đồng bằng lớn (ĐBSH, ĐBSCL), địa hình bờ biển/hải đảo.

Bài 3 đến Bài 8 vẫn theo CT 2018:
  • Khí hậu: phân hoá đa dạng, nhiệt đới ẩm gió mùa.
  • Thủy văn: mạng lưới sông ngòi, chế độ nước theo mùa.
  • Đất và sinh vật: đất feralit, phù sa, tài nguyên rừng, đa dạng sinh học.
  • Biển Đông: đặc điểm biển, tài nguyên môi trường biển.
  • Thiên nhiên phân hóa B-N, Đ-T, theo độ cao.

B. ĐỊA LÍ DÂN CƯ:
Bài 9 - Dân số và phân bố dân cư:
  • Dân số đông, cơ cấu đang già hoá, mật độ dân số cao ở đồng bằng.

Bài 10 - Lao động và việc làm:
  • Trình bày được đặc điểm nguồn lao động; phân tích được tình hình sử dụng lao động theo ngành, theo thành phần kinh tế ở nước ta.

Bài 11 - Đô thị hóa:
  • ĐÃ XÓA nội dung "Phân bố mạng lưới đô thị". CHỈ HỎI: Trình bày được đặc điểm đô thị hoá ở Việt Nam.

C. ĐỊA LÍ CÁC NGÀNH KINH TẾ:
Bài 12 - Chuyển dịch cơ cấu kinh tế:
  • CHÚ Ý KĨ (TT17 BÃI BỎ): Gần như ĐÃ BÃI BỎ yêu cầu phân tích chuyển dịch cơ cấu theo ngành, thành phần, lãnh thổ ở chương này (Trang 31 - TT17). Tập trung hỏi các kiến thức tổng quan.

Bài 13+14 - Nông-lâm-thủy sản:
  • Phân tích được một số hình thức tổ chức lãnh thổ nông nghiệp ở Việt Nam: trang trại, khu nông nghiệp công nghệ cao, vùng chuyên canh.

Bài 15 - Công nghiệp VN:
  • Phân tích được một số hình thức tổ chức lãnh thổ công nghiệp ở Việt Nam: khu công nghiệp, khu công nghệ cao.

Bài 16 - Dịch vụ và du lịch:
  • Phân tích được sự phân hoá lãnh thổ du lịch (các điểm du lịch, khu du lịch), du lịch với sự phát triển bền vững.
`;

      const systemInstruction = `Bạn là chuyên gia biên soạn đề thi Địa lí THPT Quốc gia cấp Bộ, GIỎI NHẤT Việt Nam.
      Nhiệm vụ: Tạo ĐÚNG 28 câu theo MA TRẬN DƯỚI ĐÂY. ĐỌC TOÀN BỘ TRƯỚC KHI SINH CÂU HỎI ĐẦU TIÊN.

${HANH_CHINH_2025}

${CHUONG_TRINH_TT17}

      QUY TẮC BIỂU ĐỒ — NGHIÊM NGẶT TUYỆT ĐỐI:
      • Mọi câu hỏi có từ "biểu đồ" / "bảng số liệu" / "hình" PHẢI có context là bảng Markdown đầy đủ.
      • Cột đơn vị BẮT BUỘC: | Chỉ tiêu | Đơn vị | 2015 | 2020 | 2024 |
      • Dòng đầu context phải ghi: "Biểu đồ: [tên loại]" (cột / đường / tròn / miền / kết hợp)
      • ⚠️ NGUYÊN TẮC 'CƠ CẤU' PHẢI TỰ ĐỘNG QUY ĐỔI SANG %: Bất cứ câu hỏi nào có chứa từ khóa "cơ cấu", HOẶC loại biểu đồ là "Tròn"/"Miền", ĐƠN VỊ CỦA BẢNG BẮT BUỘC PHẢI LÀ "%". Bạn (AI) PHẢI tự đứng ra làm toán quy đổi các số liệu thô (như nghìn tấn, tỷ đồng, nghìn ha) sang % sao cho tổng = 100%. TUYỆT ĐỐI NGHIÊM CẤM đưa các giá trị tuyệt đối thô (chưa chia) vào bảng số liệu cơ cấu. ĐỒNG THỜI, NGHIÊM CẤM chèn thêm các hàng thừa không thuộc tổ hợp 100% (như "Tốc độ tăng trưởng", "Tổng số").
      • Câu 1 và Câu II.4 PHẢI dùng 2 loại biểu đồ KHÁC NHAU.
      • Số liệu trong bảng PHẢI khớp với phương án đúng / mệnh đề đúng/sai.
      • Nguồn số liệu: BẮT BUỘC phải có dòng cuối ở context ghi rõ "(Nguồn: [Tên nguồn rõ ràng từ tài liệu hoặc Tổng cục Thống kê/Ngân hàng thế giới], năm X)". Cấm để trống nguồn.
      • ⚠️ VỊ TRÍ ĐẶT BẢNG (TRƯỜNG CONTEXT): Bảng số liệu BẮT BUỘC phải nằm trọn vẹn trong trường "context" (có xuống dòng \n đàng hoàng). TUYỆT ĐỐI CẤM gộp/nhét bảng Markdown inline vào trường "text" của câu hỏi. Trường "text" chỉ chứa câu dẫn.
      • ⚠️ DỮ LIỆU CẦN ĐỦ 12 THÁNG NẾU HỎI CẢ NĂM: Nếu câu hỏi hỏi về "cả năm" / "tất cả các tháng", TẠO BẢNG CHÍNH XÁC 14 CỘT: 1 Cột Tên - 1 Cột Đơn vị - 12 Cột Tháng (từ 1 đến 12), tuyệt đối không gộp hay cắt bớt.
      • ⚠️ DỮ LIỆU CHÍNH XÁC VÀ ĐẦY ĐỦ 100%: Dữ liệu phải tuyệt đối chính xác về mặt khoa học. Nếu dựa vào "Tóm tắt", phải lấy đúng số nguyên bản.
      • ⚠️ SỐ LIỆU NHẤT QUÁN: correctAnswer PHẢI là kết quả tính đúng từ số liệu trong bảng. Kiểm tra lại toán học sau khi sinh.

      QUY TẮC TRẮC NGHIỆM ABCD (NGHIÊM CẤM GỘP PHƯƠNG ÁN):
      • Thuộc tính \`options\` PHẢI LÀ MẢNG GỒM ĐÚNG 4 CHUỖI TÁCH BIỆT NHAU.
      • ⚠️ NGUYÊN TẮC: Tài liệu gốc thường trình bày gộp trên cùng 1 dòng (ví dụ: "A. Lựa chọn Một. B. Lựa chọn Hai."). BẠN BẮT BUỘC PHẢI NHẬN DIỆN VÀ CHIA CẮT (SPLIT) CHÚNG THÀNH 4 CHUỖI RIÊNG BIỆT DỰA VÀO TIỀN TỐ A., B., C., D.
      • NGHIÊM CẤM CHỨA CÁC TIỀN TỐ "A. ", "B. ", "C. ", "D. " BÊN TRONG CÁC OPTION. (Ví dụ SAI: ["A. Xong B. Chạy", ...]. Ví dụ ĐÚNG: ["Xong", "Chạy", "Đi", "Nhảy"]).
      • Nếu AI sinh ra mảng options có phần tử chứa chữ "A.", "B.", "C." hoặc "D." ở giữa chuỗi, hệ thống sẽ BỊ PHẠT 0 ĐIỂM.

      QUY TẮC ĐIỀN KHUYẾT THỐNG KÊ (PHẦN III) — LƯU Ý NGUYÊN TẮC QUAN TRỌNG NHẤT:
      • Theo format phiếu trả lời Bộ GD&ĐT 2025, Phiếu TLTN câu Trả lời ngắn CHỈ CÓ TỐI ĐA 4 Ô ĐỂ TÔ (bao gồm cả dấu phẩy "," thập phân và dấu âm "-").
      • KIÊN QUYẾT: Thuộc tính \`correctAnswer\` của Phần III BẮT BUỘC chỉ được chứa TỐI ĐA 4 KÝ TỰ (Ví dụ ĐÚNG: '12.5', '123', '0.55', '-4.2'. Ví dụ SAI: '3000000', '12.456').
      • KỸ THUẬT RÚT GỌN ĐƠN VỊ: Nếu đáp án tính ra quá lớn (ví dụ 3000000), BẠN PHẢI bắt buộc thay đổi ĐƠN VỊ TRONG CÂU HỎI (để đáp án rút gọn còn '3.0' hoặc '3000'). Ví dụ: Thay vì hỏi "bao nhiêu người" hãy hỏi "bao nhiêu triệu người".
      • Luôn ghi chú làm tròn trong câu hỏi, ví dụ: "(Làm tròn đến 1 chữ số sau dấu phẩy)".

      QUY TẮC KHÁC:
      A. correctAnswerIndex là số nguyên 0/1/2/3 — KHÔNG phải chữ A/B/C/D.
      B. Phần III correctAnswer PHẢI là con số (string số hoặc number, NẾU LÀ SỐ THẬP PHÂN PHẢI DÙNG DẤU CHẤM '.').
      C. Mỗi câu phải có: id, type, text, context, topic, lesson, cognitiveLevel, explanation, tips, mnemonics.
      D. Phần II câu I/II/III: CẤM dùng "biểu đồ"/"bảng"/"số liệu" — chỉ hỏi lý thuyết.
      E. KHÔNG dùng tỉnh/thành đã sáp nhập làm đáp án đúng độc lập.
      F. ⚠️ NGHIÊM CẤM 100% CÁC NỘI DUNG ĐÃ BỊ LƯỢC BỎ BỞI TT17/2025: TUYỆT ĐỐI KHÔNG hỏi "Vùng kinh tế trọng điểm" (đã bãi bỏ). TUYỆT ĐỐI KHÔNG hỏi "Phân bố mạng lưới đô thị". TUYỆT ĐỐI KHÔNG hỏi chi tiết "Chuyển dịch cơ cấu kinh tế theo ngành/thành phần/lãnh thổ". Ưu tiên điểm mới: Phát triển bền vững, Nông nghiệp công nghệ cao, Biến đổi khí hậu.
      ${documentSummary ? `G. ⚠️ CHỈ DÙNG BẢN TÓM TẮT SAU ĐÂY LÀM NGUỒN KIẾN THỨC & SỐ LIỆU: \n\n=== TÓM TẮT TRÍCH XUẤT TỪ TÀI LIỆU GỐC ===\n${documentSummary}` : ''}`;


      const prompt = `MA TRẬN ĐỀ (tuân thủ nghiêm ngặt):
${MA_TRAN_DE_THI}

SINH ĐỦ 28 CÂU JSON, TUÂN THỦ THEO ĐÚNG TỪNG VỊ TRÍ DƯỚI ĐÂY:

═══ PHẦN I — 18 CÂU TRẮC NGHIỆM (type=multiple_choice) ═══
Câu 1:  topic="Nhận xét biểu đồ"                          cognitiveLevel="Vận dụng"
        → context BẮT BUỘC: bảng Markdown. Nếu so sánh cấu trúc tỷ lệ/tốc độ với quy mô, sinh Biểu đồ "Kết hợp". Nếu các đối tượng đồng nhất đơn vị tuyệt đối, CẤM DÙNG KẾT HỢP.
Câu 2:  topic="Thiên tai và biện pháp phòng chống"         cognitiveLevel="Nhận biết"
Câu 3:  topic="Dịch vụ GTVT/BCVT"                         cognitiveLevel="Thông hiểu"
Câu 4:  topic="Đồng bằng sông Cửu Long"                   cognitiveLevel="Vận dụng"
Câu 5:  topic="Dịch vụ Thương mại/Du lịch"                cognitiveLevel="Nhận biết"
Câu 6:  topic="Nam Trung Bộ"                               cognitiveLevel="Thông hiểu"
Câu 7:  topic="Vị trí địa lí và phạm vi lãnh thổ"         cognitiveLevel="Nhận biết"
Câu 8:  topic="Thiên nhiên nhiệt đới ẩm gió mùa"           cognitiveLevel="Vận dụng"
Câu 9:  topic="Nông nghiệp lâm nghiệp thủy sản"           cognitiveLevel="Nhận biết"
Câu 10: topic="Đồng bằng sông Hồng"                       cognitiveLevel="Vận dụng"
Câu 11: topic="Chuyển dịch cơ cấu kinh tế"               cognitiveLevel="Thông hiểu"
Câu 12: topic="Phát triển công nghiệp"                    cognitiveLevel="Nhận biết"
Câu 13: topic="Dân số Việt Nam"                           cognitiveLevel="Nhận biết"
Câu 14: topic="Lao động và việc làm"                      cognitiveLevel="Nhận biết"
Câu 15: topic="Kinh tế biển đảo/Bắc Trung Bộ/TD&MNPB"    cognitiveLevel="Nhận biết"
        [TUYỆT ĐỐI CẤM hỏi Vùng KTTĐ]
Câu 16: topic="Phân hóa đa dạng của thiên nhiên"          cognitiveLevel="Vận dụng"
Câu 17: topic="Đông Nam Bộ"                               cognitiveLevel="Vận dụng"
Câu 18: topic="Nông lâm thủy sản khái quát/Trồng trọt"   cognitiveLevel="Thông hiểu"

═══ PHẦN II — 4 CÂU ĐÚNG/SAI (type=true_false, mỗi câu 4 statements) ═══
Câu II.1: topic="Địa lí các vùng KT-XH Việt Nam"
          stmt_a→cognitiveLevel="Vận dụng"  stmt_b→"Nhận biết"  stmt_c→"Thông hiểu"  stmt_d→"Nhận biết"
          [CẤM đề cập biểu đồ/bảng số liệu]
Câu II.2: topic="Địa lí các ngành kinh tế Việt Nam"
          stmt_a→"Thông hiểu"  stmt_b→"Nhận biết"  stmt_c→"Vận dụng"  stmt_d→"Nhận biết"
          [CẤM đề cập biểu đồ/bảng số liệu]
Câu II.3: topic="Địa lí tự nhiên Việt Nam"
          stmt_a→"Vận dụng"  stmt_b→"Thông hiểu"  stmt_c→"Nhận biết"  stmt_d→"Nhận biết"
          [CẤM đề cập biểu đồ/bảng số liệu]
Câu II.4: topic="Nhận xét biểu đồ"
          stmt_a→"Nhận biết"  stmt_b→"Thông hiểu"  stmt_c→"Nhận biết"  stmt_d→"Vận dụng"
          → context BẮT BUỘC: bảng Markdown + cột Đơn vị, dùng loại biểu đồ KHÁC Câu 1

═══ PHẦN III — 6 CÂU TÍNH TOÁN (type=short_answer) ═══
[Tất cả 6 câu PHẢI là bài TỰ TÍNH ra số, correctAnswer là CON SỐ]
Câu III.1: topic="Địa lí dân cư Việt Nam"          cognitiveLevel="Thông hiểu"
Câu III.2: topic="Địa lí các ngành kinh tế VN"     cognitiveLevel="Vận dụng"
Câu III.3: topic="Địa lí tự nhiên Việt Nam"        cognitiveLevel="Thông hiểu"
Câu III.4: topic="Địa lí các vùng KT VN"           cognitiveLevel="Vận dụng"
Câu III.5: topic="Địa lí các ngành kinh tế VN"     cognitiveLevel="Thông hiểu"
Câu III.6: topic="Địa lí tự nhiên Việt Nam"        cognitiveLevel="Thông hiểu"

─── VÍ DỤ CÂU TÍNH HỢP LỆ ───
"Dân số VN 2024: 99,5 triệu, tỉ lệ tăng tự nhiên 0,9‰ → Tính số tăng thêm (nghìn người)" → correctAnswer: "896"
"GDP VN 2024: 477 tỷ USD, dân số 99,5 triệu → Tính GDP/người (USD, làm tròn nghìn)" → correctAnswer: "4793"
"TP HCM: diện tích 30500 km², dân số 24,5 triệu → Tính mật độ dân số (người/km², làm tròn đến hàng đơn vị)" → correctAnswer: "803"

⚠️ QUY TẮC PHIẾU CHẤM BGD — BẮT BUỘC TUYỆT ĐỐI:
Phiếu trả lời của BGD chỉ có 4 ô (gồm chữ số + dấu "," + dấu "-"), do đó:
- correctAnswer PHẢI là chuỗi TỐI ĐA 4 KÝ TỰ, chỉ gồm chữ số, dấu phẩy "," và dấu trừ "-".
- Nếu đề yêu cầu "làm tròn đến hàng đơn vị" → correctAnswer là số nguyên (vd: "803").
- Nếu đề yêu cầu "làm tròn đến 1 chữ số thập phân" → correctAnswer có đúng 1 thập phân (vd: "80,3").
- Nếu đề yêu cầu "làm tròn đến 2 chữ số thập phân" → correctAnswer có đúng 2 thập phân (vd: "8,03").
- VÍ DỤ HỢP LỆ: "803" (3 ký tự), "80,3" (4 ký tự), "-8,3" (4 ký tự), "1234" (4 ký tự).
- VÍ DỤ SAI: "803,2" (5 ký tự — quá 4 ô), "803.28" (dấu chấm — KHÔNG dùng).
- RA ĐỀ PHẢI thiết kế số liệu sao cho kết quả tính toán sau làm tròn vừa đúng 4 ký tự trở xuống.
- KHÔNG được lưu correctAnswer có phần thập phân khi câu hỏi yêu cầu làm tròn đến hàng đơn vị.

─── FORMAT CONTEXT BIỂU ĐỒ ───
Dòng 1: "Biểu đồ: [Tên loại]"
Dòng 2+: | Chỉ tiêu | Đơn vị | 2015 | 2019 | 2024 |
         |---|---|---|---|---|
         | ... | ... | ... | ... | ... |
         (Nguồn: Tổng cục Thống kê, 2024)

⚠️ KIỂM TRA CUỐI: đếm phải đủ 18+4+6=28. Câu có "biểu đồ" → context ≠ null. Câu 15 không hỏi KTTĐ.


      `;


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

      // ===== POST-PROCESSING: Auto-repair missing context for chart questions =====
      // AI may return context="", context=" ", or null despite prompt rules.
      // Detect these and call AI to generate a proper data table with unit column.
      const CHART_RE = /biểu đồ|bảng số liệu|bảng dưới đây|bảng trên|lược đồ|hình dưới|số liệu sau/i;
      const needsContext = examQuestions.filter((q: any) =>
        CHART_RE.test(q.text || '') && (!q.context || !q.context.includes('|') || q.context.trim().length < 20 || ['null', 'undefined', 'none'].includes((q.context || '').trim().toLowerCase()))
      );

      if (needsContext.length > 0) {
        for (const q of needsContext) {
          try {
            await new Promise(r => setTimeout(r, 800)); // Rate limit prevention
            const isSEA = /đông nam á|asean|indonesia|singapore|malaysia|philippines|thái lan|myanmar/i.test(q.text);
            const ctxPrompt = `Tạo ngay môt bảng số liệu Markdown đầy đủ cho câu hỏi địa lí sau.
${documentSummary ? `BẮT BUỘC SỬ DỤNG SỐ LIỆU TỪ TÀI LIỆU GỐC SAU ĐÂY:\n${documentSummary}\n` : ''}
CÂU HỎI: ${q.text}

YÊU CẦU CHÍNH XÁC:
- Dòng 1: "Biểu đồ: ${isSEA ? 'Cột nhóm' : 'Kết hợp cột và đường'}" (không có gì khác)
- Dòng 2 trở đi: bảng Markdown với CỘT ĐƠN VỊ bắt buộc:
  | Chỉ tiêu | Đơn vị | [cột 1] | [cột 2] | ... | [cột cuối] |
  |---|---|---|---|---|---|
  | ... | ... | ... | ... | ... | ... |
- NẾU BIỂU ĐỒ TRÒN/CƠ CẤU: Cột Đơn Vị BẮT BUỘC là "%".
- NẾU BẢNG KHÍ HẬU (THÁNG): TUYỆT ĐỐI KHÔNG dàn ngang 14 cột. BẮT BUỘC DÀN THEO CHIỀU DỌC MỖI THÁNG LÀ 1 HÀNG:
  | Tháng | Nhiệt độ (°C) | Lượng mưa (mm) |
  |---|---|---|
  | 1 | ... | ... |
  | ... | ... | ... |
  | 12 | ... | ... |
  Nghiêm cấm làm mất các tháng cuối năm.
- Ít nhất 3 hàng (hoặc 12 hàng nếu là bảng tháng) dữ liệu thực tế 2019-2024.
- ${isSEA ? 'Dùng 5-6 quốc gia ĐNÁ cụ thể (NẾU HỎI QUỐC GIA)' : 'Dùng số liệu Việt Nam (NẾU DỮ LIỆU TRONG NƯỚC)'}
- Dòng cuối: "(Nguồn: Tổng cục Thống kê / World Bank, 2024)"
- CHỈ trả về bảng Markdown, không có text, giải thích khác`;
            const ctxRes = await generateContentWithFallback(ctxPrompt);
            const generated = ctxRes.text?.trim() || '';
            if (generated.includes('|') && generated.includes('---')) {
              q.context = generated;
            }
          } catch (e) {
            console.warn(`[Auto-Repair] Context repair failed for ${q.id}:`, e);
          }
        }
      }

      // Validate final count — must be 28
      if (examQuestions.length !== 28) {
        console.warn(`generateAIExam: Received ${examQuestions.length} questions instead of 28`);
      }

      return examQuestions;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  async generatePracticeQuestions(topicOrLesson: string, mode: 'topic' | 'lesson' | 'format' | string, count: number, fileContext?: string | any): Promise<Question[]> {
    try {
      // model is selected automatically by generateContentWithFallback

      const HANH_CHINH_NOTE = KIEN_THUC_HANH_CHINH_2025_EXPORT;

      const systemInstruction = `Bạn là một chuyên gia biên soạn câu hỏi luyện tập môn Địa lí THPT chuẩn chương trình 2025 (TT 17/2025/TT-BGDĐT).
      Nhiệm vụ: tạo ${count} câu hỏi luyện tập về ${mode === 'topic' ? 'chủ đề' : mode === 'lesson' ? 'bài học' : 'dạng thức'}: "${topicOrLesson}".
      
      ${HANH_CHINH_NOTE}
      
      QUY TẮC BẮT BUỘC:
      1. CẤU TRÚC: ${mode === 'format' ? `CHỈ TẠO CÁC CÂU HỎI THUỘC ĐÚNG MỘT DẠNG: ${topicOrLesson}. (multiple_choice, true_false, hoặc short_answer).` : `Kết hợp các loại câu hỏi (Trắc nghiệm, Đúng/Sai, Trả lời ngắn) theo tỉ lệ phù hợp.`}
      2. ĐỐI VỚI DẠNG TRẢ LỜI NGẮN (short_answer): BẮT BUỘC phải là các bài tập tính toán dựa trên công thức địa lí (ví dụ: mật độ dân số, năng suất, bình quân đầu người, biên độ nhiệt, v.v.). Đáp án correctAnswer PHẢI LÀ MỘT CON SỐ. Không ra câu hỏi lý thuyết cho dạng trả lời ngắn.
         ⚠️ QUY TẮC PHIẾU BGD 4 Ô — BẮT BUỘC: Phiếu trả lời BGD chỉ có 4 ô (chữ số + dấu "," + dấu "-"). Do đó correctAnswer PHẢI là chuỗi tối đa 4 ký tự. Nếu câu yêu cầu làm tròn đến hàng đơn vị → correctAnswer là số nguyên (vd: "803"). Nếu yêu cầu 1 thập phân → vd: "80,3". Nếu yêu cầu 2 thập phân → vd: "8,03". Ra đề phải thiết kế số liệu sao cho kết quả sau làm tròn vừa đúng ≤ 4 ký tự.
      3. SỐ LIỆU ĐẦY ĐỦ 100% — NGHIÊM CẤM THIẾU DỮ LIỆU:
         - Nếu câu hỏi tính toán dựa trên bảng số liệu, bảng PHẢI chứa ĐỦ dữ liệu để học sinh tự tính.
         - Nếu câu hỏi về "cả năm" / "trung bình năm" / "tất cả các tháng" → bảng PHẢI có đủ 12 tháng (T1 đến T12). KHÔNG được chỉ có 10 hoặc 11 tháng.
         - Nếu câu hỏi tính tổng/trung bình/tốc độ tăng → số liệu trong bảng PHẢI đủ hàng/cột cần thiết.
         - correctAnswer PHẢI là kết quả tính ĐÚNG từ số liệu bảng. Phải kiểm tra lại trước khi trả kết quả.
         - Đặt bảng vào trường "context" dưới dạng MARKDOWN TABLE.
      4. CHÍNH XÁC KIẾN THỨC: Bám sát chương trình mới nhất (TT 17/2025). Dùng đúng tên tỉnh thành sau sáp nhập.
      5. GIẢI THÍCH CHI TIẾT: Mỗi câu hỏi PHẢI có explanation, tips, và mnemonics.
      6. ĐỘ KHÓ: Phân bổ từ Nhận biết đến Vận dụng.
      ${fileContext ? `7. RẤT QUAN TRỌNG: Bạn PHẢI sử dụng tài liệu gốc (TÀI LIỆU THAM KHẢO) được cung cấp dưới đây để biên soạn câu hỏi. Đảm bảo câu hỏi phản ánh chính xác thông tin từ tài liệu này.` : ''}`;

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

      // ===== POST-PROCESSING BẮT BUỘC: Auto-repair context bị thiếu =====
      // Nếu câu hỏi có từ "biểu đồ" / "bảng số liệu" mà context rỗng → BẮT BUỘC sinh bảng Markdown.
      // Học sinh không thể làm bài nếu không có dữ liệu tham khảo.
      const CHART_RE = /biểu đồ|bảng số liệu|bảng dưới đây|bảng trên|số liệu sau|dưới đây|theo bảng|tổng số giờ|tháng|lượng mưa|nhiệt độ|sản lượng|diện tích|căn cứ vào|tính toán|tính ra|tính được|theo hình/i;
      const needsContext = questions.filter((q: any) => {
        const hasContextKeyword = CHART_RE.test(q.text || '');
        const missingContext = !q.context || !q.context.includes('|') || q.context.trim().length < 20 || ['null', 'undefined', 'none'].includes((q.context || '').trim().toLowerCase());
        // For short_answer, also catch questions that expect a numeric calculation but have no context
        const isCalculation = q.type === 'short_answer' && /bao nhiêu|tính|tổng|trung bình|tỉ lệ|tốc độ/i.test(q.text || '');
        return (hasContextKeyword || isCalculation) && missingContext;
      });

      if (needsContext.length > 0) {
        console.log(`[Practice] Auto-repairing context for ${needsContext.length} question(s)...`);
        for (const q of needsContext) {
          try {
            await new Promise(r => setTimeout(r, 800)); // Rate limit prevention
            const isSEA = /đông nam á|asean|indonesia|singapore|malaysia|philippines|thái lan|myanmar/i.test(q.text);
            const isPercentage = /cơ cấu|tỉ trọng|tỉ lệ|%|phần trăm/i.test(q.text);
            const chartType = isPercentage ? 'Tròn (cơ cấu)' : isSEA ? 'Cột nhóm (so sánh)' : 'Kết hợp cột và đường';

            const ctxPrompt = `BẮT BUỘC tạo ngay bảng số liệu Markdown HOÀN CHỈNH cho câu hỏi địa lí sau.
HỌC SINH KHÔNG THỂ LÀM BÀI NẾU THIẾU HOẶC THIẾU DỮ LIỆU.
${fileContext ? `BẮT BUỘC SỬ DỤNG SỐ LIỆU TỪ TÀI LIỆU SAU ĐÂY:\n${typeof fileContext === 'string' ? fileContext.substring(0, 50000) : ''}\n` : ''}
CÂU HỎI: ${q.text}

QUY TẮC DỮ LIỆU ĐẦY ĐỦ — BẮT BUỘC TUYỆT ĐỐI:
1. NẾU BẢNG LÀ CÁC THÁNG TRONG NĂM: TUYỆT ĐỐI KHÔNG dàn ngang 14 cột. BẮT BUỘC DÀN THEO CHIỀU DỌC MỖI THÁNG LÀ 1 HÀNG (từ tháng 1 -> 12).
2. Nếu câu tính toán → số liệu phải đủ để tính ra kết quả ĐÚNG.
3. Nếu câu về nhiều năm hoặc nhiều quốc gia → phải có đủ cột dữ liệu.

CẤU TRÚC BẮT BUỘC:
- Dòng 1: "Biểu đồ: ${chartType}" (không có gì khác)
- Dòng 2 trở đi: bảng Markdown với CỘT ĐƠN VỊ:
  | Chỉ tiêu | Đơn vị | [cột 1] | [cột 2] | ... | [cột cuối] |
  |---|---|---|---|---|---|
  | ... | ... | ... | ... | ... | ... |
- NẾU BẢNG KHÍ HẬU/THÁNG:
  | Tháng | Nhiệt độ (°C) | Lượng mưa (mm) |
  |---|---|---|
  | 1 | ... | ... |
  ...
  | 12| ... | ... |
- NẾU BIỂU ĐỒ TRÒN/CƠ CẤU: Cột Đơn Vị BẮT BUỘC là "%".
- Ít nhất 3-4 hàng dữ liệu (hoặc 12 hàng cho bảng tháng)
- ${isSEA ? 'Dùng 5-6 quốc gia ĐNÁ cụ thể (nếu hỏi các biểu đồ quốc gia)' : 'Dùng số liệu cụ thể'}
- Số liệu PHẢI khớp với đáp án/mệnh đề đúng trong câu hỏi
- Dòng cuối: "(Nguồn: Tổng cục Thống kê / World Bank, 2024)"
- CHỈ trả về bảng Markdown, không có text hay giải thích khác`;

            const ctxRes = await generateContentWithFallback(ctxPrompt);
            const generated = ctxRes.text?.trim() || '';
            if (generated.includes('|') && generated.includes('---')) {
              q.context = generated;
              console.log(`[Practice] ✅ Context generated for question: ${q.id}`);
            } else {
              console.warn(`[Practice] ⚠️ Failed to generate valid context for: ${q.id}`);
            }
          } catch (e) {
            console.warn(`[Practice] Context repair failed for ${q.id}:`, e);
          }
        }
      }

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
      const sanitized = sanitizeForFirestore({ ...exam, fileUrl: '' });
      const docRef = await addDoc(collection(db, 'exams'), sanitized);
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
        // Strip data URLs (too large for Firestore 1MB limit)
        const sanitized = sanitizeForFirestore({ ...data, fileUrl: '' });
        await updateDoc(docRef, sanitized as any);
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
    return this.getAllExams();
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

  async saveUploadedExam(title: string, creatorId: string, file: File, fileType: 'word' | 'pdf' | 'html', questions: Question[] = []): Promise<string> {
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
      questions, createdAt,
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
          fileUrl: '', fileType, questions, createdAt,
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
