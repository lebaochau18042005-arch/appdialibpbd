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
  async generateAIExam(fileContext?: string): Promise<Question[]> {
    try {
      // model is selected automatically by generateContentWithFallback
      // ===== KHỐI KIẾN THỨC HÀNH CHÍNH BẮT BUỘC (sau sáp nhập 1/7/2025) =====
      const HANH_CHINH_2025 = `
=== ĐƠN VỊ HÀNH CHÍNH VIỆT NAM SAU SÁP NHẬP (NQ 202/2025/QH15, hiệu lực 1/7/2025) ===
Việt Nam hiện có ĐÚNG 34 tỉnh/thành phố trực thuộc TW. TUYỆT ĐỐI CẤM dùng tên tỉnh cũ đã bị xóa.

DANH SÁCH ĐẦY ĐỦ 34 ĐƠN VỊ (chỉ được dùng những tên này):
--- 6 THÀNH PHỐ TRỰC THUỘC TW ---
1. Hà Nội
2. TP Huế (mới - nâng cấp từ tỉnh Thừa Thiên Huế)
3. Hải Phòng (= Hải Phòng + Hải Dương cũ)
4. Đà Nẵng (= Đà Nẵng + Quảng Nam cũ)
5. TP Hồ Chí Minh (= HCM + Bình Dương cũ + Bà Rịa-Vũng Tàu cũ)
6. Cần Thơ (= Cần Thơ + Hậu Giang cũ + Sóc Trăng cũ)

--- 28 TỈNH ---
7. Tuyên Quang (= Tuyên Quang + Hà Giang cũ) → Điểm cực Bắc VN (Lũng Cú) nay thuộc TUYÊN QUANG
8. Lào Cai (= Lào Cai + Yên Bái cũ)
9. Cao Bằng
10. Lạng Sơn
11. Lai Châu
12. Điện Biên
13. Sơn La
14. Thái Nguyên (= Thái Nguyên + Bắc Kạn cũ)
15. Phú Thọ (= Phú Thọ + Hòa Bình cũ + Vĩnh Phúc cũ)
16. Bắc Ninh (= Bắc Ninh + Bắc Giang cũ)
17. Hưng Yên (= Hưng Yên + Thái Bình cũ)
18. Quảng Ninh
19. Ninh Bình (= Ninh Bình + Hà Nam cũ + Nam Định cũ)
20. Thanh Hóa
21. Nghệ An
22. Hà Tĩnh
23. Quảng Trị (= Quảng Trị + Quảng Bình cũ)
24. Quảng Ngãi (= Quảng Ngãi + Kon Tum cũ)
25. Gia Lai (= Gia Lai + Bình Định cũ)
26. Khánh Hòa (= Khánh Hòa + Ninh Thuận cũ)
27. Đắk Lắk
28. Lâm Đồng (= Lâm Đồng + Đắk Nông cũ + Bình Thuận cũ)
29. Đồng Nai
30. Tây Ninh
31. Vĩnh Long
32. Đồng Tháp
33. An Giang (= An Giang + Kiên Giang cũ)
34. Cà Mau (= Cà Mau + Bạc Liêu cũ)

CÁC TÊN TỈNH ĐÃ XÓA BỎ — TUYỆT ĐỐI KHÔNG ĐƯỢC DÙNG LÀM ĐÁP ÁN ĐÚNG ĐỘC LẬP:
Hà Giang, Hải Dương, Bắc Kạn, Yên Bái, Vĩnh Phúc, Hòa Bình, Bắc Giang, Hà Nam, Nam Định,
Thái Bình, Quảng Bình, Quảng Nam, Kon Tum, Bình Định, Ninh Thuận, Đắk Nông, Bình Thuận,
Bình Dương, Bà Rịa-Vũng Tàu, Hậu Giang, Sóc Trăng, Kiên Giang, Bạc Liêu,
Thừa Thiên Huế (đã đổi thành TP Huế)

SỰ KIỆN ĐỊA LÍ QUAN TRỌNG SAU SÁP NHẬP (phải dùng đúng khi ra câu hỏi):
• Điểm cực Bắc VN (Lũng Cú): thuộc tỉnh TUYÊN QUANG (không phải Hà Giang)
• Điểm cực Tây VN (Apáchải): thuộc tỉnh ĐIỆN BIÊN (không đổi)
• Điểm cực Nam VN (Mũi Cà Mau): thuộc tỉnh CÀ MAU (không đổi)
• Điểm cực Đông VN (Mũi Đôi): thuộc tỉnh KHÁNH HÒA
• Sapa: thuộc tỉnh LÀO CAI (không đổi)
• Vịnh Hạ Long: thuộc tỉnh QUẢNG NINH (không đổi)
• Bắc Ninh là tỉnh có mật độ dân số cao nhất (sau sáp nhập Bắc Giang)
`;


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

D. ĐỊA LÍ CÁC VÙNG KINH TẾ - XÃ HỘI (Giảm còn 6 vùng, KHÔNG tính vùng KTTĐ):
Vùng 1 - TRUNG DU & MIỀN NÚI PHÍA BẮC:
  • Chứng minh được các thế mạnh để phát triển kinh tế của vùng về khoáng sản và thuỷ điện, cây trồng có nguồn gốc cận nhiệt và ôn đới (cây công nghiệp, rau quả), chăn nuôi gia súc lớn.
  
Vùng 2 - ĐỒNG BẰNG SÔNG HỒNG:
  • Phân tích được một số vấn đề về phát triển KT-XH của vùng: Vấn đề phát triển công nghiệp, dịch vụ, kinh tế biển (Bổ sung TT17).

Vùng 3 - BẮC TRUNG BỘ:
  • Đổi tên thành "Phát triển kinh tế - xã hội ở BTB".
  • Trình bày được một số thế mạnh và tình hình phát triển du lịch của vùng (Bổ sung TT17).
  
Vùng 4 - NAM TRUNG BỘ (THAY ĐỔI LỚN NHẤT: GỘP DUYÊN HẢI + TÂY NGUYÊN):
  • Trình bày vị trí địa lí, lãnh thổ, dân số.
  • Phân tích thế mạnh, hạn chế phát triển các ngành KT.
  • Trình bày tình hình phát triển KT biển; thủy điện, khoáng sản (bôxit); cây công nghiệp lâu năm, lâm nghiệp và du lịch.
  • Phân tích ý nghĩa của phát triển KT-XH với QPAN. Sử dụng bản đồ, số liệu chỉ rõ thế mạnh KT biển.

Vùng 5 - ĐÔNG NAM BỘ:
  • Trình bày được tình hình phát triển các ngành kinh tế: công nghiệp; dịch vụ; nông nghiệp; kinh tế biển của vùng.

Vùng 6 - ĐỒNG BẰNG SÔNG CỬU LONG:
  • Phát triển kinh tế gắn với ứng phó biến đổi khí hậu (vùng nông nghiệp lớn nhất). 


⚠️ CẤM HOÀN TOÀN — KHÔNG ĐƯỢC RA BẤT KỲ CÂU HỎI NÀO về "Vùng kinh tế trọng điểm" (KTTĐ):
   TT 17/2025 đã CẮT BỎ HOÀN TOÀN nội dung về: Vùng KTTĐ phía Bắc, Vùng KTTĐ miền Trung,
   Vùng KTTĐ phía Nam, Vùng KTTĐ ĐBSCL. Bất kỳ câu hỏi nào liên quan đến "vùng kinh tế trọng điểm",
   "KTTĐ", "tỉnh/thành nào thuộc vùng KTTĐ" đều SAI VỀ CHƯƠNG TRÌNH và BI CẤM TUYỆT ĐỐI.


E. ĐỊA LÍ ĐÔNG NAM Á (Địa 11 - bắt buộc có trong đề):
  11 quốc gia; diện tích 4,5 triệu km²; dân số 680 triệu (2024)
  Phân loại: ĐNÁ lục địa (Myanmar, Thái Lan, Lào, Campuchia, VN) và ĐNÁ hải đảo (Indonesia, Philippines, Malaysia, Singapore, Brunei, Đông Timor)
  Đặc điểm kinh tế: Indonesia GDP lớn nhất, Singapore GDP/người cao nhất, VN tăng trưởng nhanh
  ASEAN (1967): 10 thành viên, Đông Timor ứng viên, thương mại nội khối 25% tổng thương mại
  Dữ liệu so sánh phải dùng số liệu 2019-2024 (tránh số liệu trước 2019)
`;

      const systemInstruction = `Bạn là chuyên gia biên soạn đề thi Địa lí THPT Quốc gia cấp Bộ, GIỎI NHẤT Việt Nam.
      Nhiệm vụ: Tạo ĐÚNG 28 câu theo MA TRẬN DƯỚI ĐÂY. ĐỌC TOÀN BỘ TRƯỚC KHI SINH CÂU HỎI ĐẦU TIÊN.

${HANH_CHINH_2025}

${MA_TRAN_DE_THI}

${CHUONG_TRINH_TT17}

      QUY TẮC BIỂU ĐỒ — NGHIÊM NGẶT TUYỆT ĐỐI:
      • Mọi câu hỏi có từ "biểu đồ" / "bảng số liệu" / "hình" PHẢI có context là bảng Markdown đầy đủ.
      • Cột đơn vị BẮT BUỘC: | Chỉ tiêu | Đơn vị | 2015 | 2020 | 2024 |
      • Dòng đầu context phải ghi: "Biểu đồ: [tên loại]" (cột / đường / tròn / miền / kết hợp)
      • Câu 1 và Câu II.4 PHẢI dùng 2 loại biểu đồ KHÁC NHAU.
      • Số liệu trong bảng PHẢI khớp với phương án đúng / mệnh đề đúng/sai.
      • Nguồn số liệu: dòng cuối context là "(Nguồn: Tổng cục Thống kê, năm X)"
      • TUYỆT ĐỐI CẤM context = null/rỗng/chuỗi "null" khi câu tham chiếu biểu đồ.

      QUY TẮC KHÁC:
      A. correctAnswerIndex là số nguyên 0/1/2/3 — KHÔNG phải chữ A/B/C/D.
      B. Phần III correctAnswer PHẢI là con số (string số hoặc number).
      C. Mỗi câu phải có: id, type, text, context, topic, lesson, cognitiveLevel, explanation, tips, mnemonics.
      D. Phần II câu I/II/III: CẤM dùng "biểu đồ"/"bảng"/"số liệu" — chỉ hỏi lý thuyết.
      E. KHÔNG dùng tỉnh/thành đã sáp nhập làm đáp án đúng độc lập.
      F. CẤM TUYỆT ĐỐI ra câu hỏi về "Vùng kinh tế trọng điểm" hoặc "KTTĐ".
      ${fileContext ? `G. Ưu tiên dùng TÀI LIỆU THAM KHẢO được cung cấp làm nguồn kiến thức chính.` : ''}`;

      const prompt = `Tạo đề thi Địa lí THPT chuẩn Bộ 2025. SINH ĐỦ ĐÚNG 28 CÂU JSON, THEO ĐÚNG TỪNG VỊ TRÍ DƯỚI ĐÂY:

═══ PHẦN I — 18 CÂU TRẮC NGHIỆM (type=multiple_choice) ═══
Câu 1:  topic="Nhận xét biểu đồ"                          cognitiveLevel="Vận dụng"
        → context BẮT BUỘC: bảng Markdown + cột Đơn vị + dòng "Biểu đồ: Kết hợp cột và đường"
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

─── FORMAT CONTEXT BIỂU ĐỒ ───
Dòng 1: "Biểu đồ: [Tên loại]"
Dòng 2+: | Chỉ tiêu | Đơn vị | 2015 | 2019 | 2024 |
         |---|---|---|---|---|
         | ... | ... | ... | ... | ... |
         (Nguồn: Tổng cục Thống kê, 2024)

⚠️ KIỂM TRA CUỐI: đếm phải đủ 18+4+6=28. Câu có "biểu đồ" → context ≠ null. Câu 15 không hỏi KTTĐ.

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

      // ===== POST-PROCESSING: Auto-repair missing context for chart questions =====
      // AI may return context="", context=" ", or null despite prompt rules.
      // Detect these and call AI to generate a proper data table with unit column.
      const CHART_RE = /biểu đồ|bảng số liệu|bảng dưới đây|bảng trên|lược đồ|hình dưới|số liệu sau/i;
      const needsContext = examQuestions.filter((q: any) =>
        CHART_RE.test(q.text || '') && (!q.context || q.context.trim().length < 20)
      );

      if (needsContext.length > 0) {
        await Promise.all(needsContext.map(async (q: any) => {
          try {
            const isSEA = /đông nam á|asean|indonesia|singapore|malaysia|philippines|thái lan|myanmar/i.test(q.text);
            const ctxPrompt = `Tạo ngay một bảng số liệu Markdown đầy đủ cho câu hỏi địa lí sau.

CÂU HỎI: ${q.text}

YÊU CẦU CHÍNH XÁC:
- Dòng 1: "Biểu đồ: ${isSEA ? 'Cột nhóm' : 'Kết hợp cột và đường'}" (không có gì khác)
- Dòng 2 trở đi: bảng Markdown với CỘT ĐƠN VỊ bắt buộc:
  | Chỉ tiêu | Đơn vị | Cột năm 1 | Cột năm 2 | Cột năm 3 |
  |---|---|---|---|---|
  | ... | ... | ... | ... | ... |
- Ít nhất 3 hàng dữ liệu với số liệu thực tế 2019-2024
- ${isSEA ? 'Dùng 5-6 quốc gia ĐNÁ cụ thể' : 'Dùng số liệu Việt Nam cụ thể theo chủ đề câu hỏi'}
- Dòng cuối: "(Nguồn: Tổng cục Thống kê / World Bank, 2024)"
- CHỈ trả về bảng Markdown, không có text, giải thích khác`;
            const ctxRes = await generateContentWithFallback(ctxPrompt);
            const generated = ctxRes.text?.trim() || '';
            if (generated.includes('|') && generated.includes('---')) {
              q.context = generated;
            }
          } catch {
            // If repair fails, leave context — warning shown in UI
          }
        }));
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
      2. ĐỐI VỚI DẠNG TRẢ LỜI NGẮN (short_answer): BẮT BUỘC phải là các bài tập tính toán dựa trên công thức địa lí (ví dụ: mật độ dân số, năng suất, bình quân đầu người, biên độ nhiệt, v.v.). Đáp án correctAnswer PHẢI LÀ MỘT CON SỐ. Không ra câu hỏi lý thuyết cho dạng trả lời ngắn.
      3. SỐ LIỆU: Nếu câu hỏi cần bảng số liệu, đặt vào trường "context" dưới dạng MARKDOWN TABLE với số liệu cụ thể (không dùng URL).
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
