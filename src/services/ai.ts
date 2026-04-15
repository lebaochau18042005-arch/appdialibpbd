import { GoogleGenAI } from '@google/genai';
import { Question, UserProfile, QuizAttempt } from '../types';

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

const DEFAULT_MODEL = 'gemini-2.5-flash';

// ===== KIẾN THỨC HÀNH CHÍNH SAU SÁP NHẬP 1/7/2025 (NQ 202/2025/QH15) =====
// Được nhúng vào TẤT CẢ các prompt AI để mọi giải thích đều dùng thông tin hành chính MỚI NHẤT
export const KIEN_THUC_HANH_CHINH_2025_EXPORT = `
## KIẾN THỨC BẮT BUỘC VỀ ĐƠN VỊ HÀNH CHÍNH VIỆT NAM SAU SÁP NHẬP (HIỆU LỰC 1/7/2025)

Nghị quyết 202/2025/QH15 của Quốc hội (hiệu lực 1/7/2025) sắp xếp lại đơn vị hành chính cấp tỉnh:
- Từ 63 tỉnh/thành → còn 34 đơn vị hành chính cấp tỉnh (6 thành phố TW + 28 tỉnh), giảm 29 đơn vị.
- Chuyển từ mô hình 3 cấp sang MÔ HÌNH 2 CẤP chính quyền địa phương (bỏ cấp huyện, giữ cấp tỉnh và cấp xã/phường).

### 6 Thành phố trực thuộc Trung ương (sau sáp nhập):
1. Hà Nội (giữ nguyên)
2. TP Huế (giữ nguyên)
3. Hải Phòng = Hải Phòng cũ + Hải Dương
4. Đà Nẵng = Đà Nẵng cũ + Quảng Nam
5. TP Hồ Chí Minh = HCM cũ + Bình Dương + Bà Rịa – Vũng Tàu
6. Cần Thơ = Cần Thơ cũ + Hậu Giang + Sóc Trăng

### 28 tỉnh (sau sáp nhập):
- Quảng Ninh (giữ nguyên), Cao Bằng (giữ nguyên), Lạng Sơn (giữ nguyên)
- Lai Châu (giữ nguyên), Điện Biên (giữ nguyên), Sơn La (giữ nguyên)
- Thanh Hóa (giữ nguyên), Nghệ An (giữ nguyên), Hà Tĩnh (giữ nguyên)
- Đắk Lắk (giữ nguyên), Đồng Nai (giữ nguyên), Tây Ninh (giữ nguyên)
- Vĩnh Long (giữ nguyên), Đồng Tháp (giữ nguyên)
- Tuyên Quang = Tuyên Quang cũ + Hà Giang
- Lào Cai = Lào Cai cũ + Yên Bái
- Thái Nguyên = Thái Nguyên cũ + Bắc Kạn
- Phú Thọ = Phú Thọ cũ + Hòa Bình + Vĩnh Phúc
- Bắc Ninh = Bắc Ninh cũ + Bắc Giang
- Hưng Yên = Hưng Yên cũ + Thái Bình
- Ninh Bình = Ninh Bình cũ + Hà Nam + Nam Định
- Quảng Trị = Quảng Trị cũ + Quảng Bình
- Quảng Ngãi = Quảng Ngãi cũ + Kon Tum
- Gia Lai = Gia Lai cũ + Bình Định
- Khánh Hòa = Khánh Hòa cũ + Ninh Thuận
- Lâm Đồng = Lâm Đồng cũ + Đắk Nông + Bình Thuận
- Cà Mau = Cà Mau cũ + Bạc Liêu
- An Giang = An Giang cũ + Kiên Giang

### Thay đổi vùng kinh tế - xã hội (theo TT 17/2025/TT-BGDĐT):
- Vùng Đông Nam Bộ: TP HCM (đã gồm Bình Dương + BRVT), Đồng Nai, Tây Ninh
- Vùng Đồng bằng sông Hồng: Hà Nội, Hải Phòng (đã gồm Hải Dương), Quảng Ninh, Bắc Ninh (đã gồm Bắc Giang), Hưng Yên (đã gồm Thái Bình), Ninh Bình (đã gồm Hà Nam + Nam Định)
- Vùng Đồng bằng sông Cửu Long: Cần Thơ (đã gồm Hậu Giang + Sóc Trăng), Vĩnh Long, Đồng Tháp, An Giang (đã gồm Kiên Giang), Cà Mau (đã gồm Bạc Liêu)
- Vùng Trung du và miền núi phía Bắc: Tuyên Quang (đã gồm Hà Giang), Lào Cai (đã gồm Yên Bái), Thái Nguyên (đã gồm Bắc Kạn), Phú Thọ (đã gồm Hòa Bình + Vĩnh Phúc), Cao Bằng, Lạng Sơn, Lai Châu, Điện Biên, Sơn La
- Vùng Bắc Trung Bộ: Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Trị (đã gồm Quảng Bình), TP Huế
- Vùng Nam Trung Bộ: (Bao gồm Duyên hải Nam Trung Bộ cũ + khu vực Tây Nguyên cũ): Đà Nẵng (đã gồm Quảng Nam), Quảng Ngãi (đã gồm Kon Tum), Gia Lai (đã gồm Bình Định), Khánh Hòa (đã gồm Ninh Thuận), Đắk Lắk, Lâm Đồng (đã gồm Đắk Nông + Bình Thuận).
⚠️ KHÁI NIỆM "VÙNG TÂY NGUYÊN" ĐÃ BỊ BỘ GIÁO DỤC XÓA BỎ HOÀN TOÀN TỪ 1/7/2025 (GỘP VÀO NAM TRUNG BỘ). CẤM SỬ DỤNG "TÂY NGUYÊN" LÀM ĐÁP ÁN ĐÚNG TRONG MỌI CÂU HỎI VỀ VÙNG.

### Thông tư 17/2025/TT-BGDĐT (Bộ GDĐT, hiệu lực 12/9/2025):
- Sửa đổi Chương trình GDPT 2018, yêu cầu cập nhật nội dung Địa lý 12 theo 34 đơn vị hành chính mới.
- Cập nhật: ranh giới vùng kinh tế, tên tỉnh/thành, số liệu diện tích, dân số, phân bố kinh tế.
- Giáo viên tiếp tục dùng SGK hiện hành nhưng phải chủ động điều chỉnh ngữ liệu cho phù hợp.

LƯU Ý: Khi giải thích bất kỳ câu hỏi nào về tỉnh thành, vùng kinh tế, dân cư, kinh tế địa phương — PHẢI dùng tên và dữ liệu THEO ĐƠN VỊ HÀNH CHÍNH MỚI SAU 1/7/2025. Không dùng tên tỉnh cũ đã sáp nhập như một đơn vị độc lập (ví dụ: không nói "tỉnh Hải Dương" mà nói "khu vực Hải Dương thuộc TP Hải Phòng").
`;

export async function generateContentWithFallback(prompt: any, config: any = {}) {
  // @ts-ignore
  const apiKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Chưa thiết lập API Key. Vui lòng cập nhật thông tin trong Cấu hình Google AI.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const storedModel = localStorage.getItem('GEMINI_MODEL');
  // Clear stored model if it's an old/invalid name
  const VALID_MODELS = new Set(FALLBACK_MODELS);
  const preferredModel = (storedModel && VALID_MODELS.has(storedModel))
    ? storedModel
    : DEFAULT_MODEL;
  if (storedModel && !VALID_MODELS.has(storedModel)) {
    console.warn(`[AI] Xóa model cũ không hợp lệ: ${storedModel}, dùng ${DEFAULT_MODEL}`);
    localStorage.removeItem('GEMINI_MODEL');
  }
  
  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];
  
  let lastError;
  let firstError: string | undefined;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });
      return response;
    } catch (error: any) {
      const msg = error?.message || String(error);
      const code = error?.code || error?.status || '';
      console.warn(`[AI Fallback] Model ${model} failed (${code}):`, msg);
      if (!firstError) firstError = `${model}: ${msg}`;
      lastError = error;
      // For 503 (server overload), wait 2s before trying next model
      if (String(code) === '503' || msg.includes('UNAVAILABLE') || msg.includes('overloaded')) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  throw new Error(`Tất cả model thất bại. Lỗi đầu tiên: ${firstError}`);
}

export async function getExplanation(question: Question, userAnswer: any, isCorrect: boolean, profile?: UserProfile) {
  try {
    const greeting = profile?.name ? `Chào em **${profile.name}**, ` : 'Chào em, ';
    const encouragement = profile?.targetScore ? `Cố gắng ôn luyện để đạt mục tiêu **${profile.targetScore} điểm** nhé!` : 'Chúc em ôn tập thật tốt và đạt điểm cao!';
    
    let questionContext = `Câu hỏi: "${question.text}"\n`;
    
    if (question.type === 'multiple_choice') {
      questionContext += `Các đáp án:\n`;
      question.options.forEach((opt, i) => {
        questionContext += `${String.fromCharCode(65 + i)}. ${opt}\n`;
      });
      questionContext += `Học sinh đã chọn đáp án: "${question.options[userAnswer as number]}".\n`;
      questionContext += `Đáp án đúng là: "${question.options[question.correctAnswerIndex]}".\n`;
    } else if (question.type === 'true_false') {
      questionContext += `Các ý:\n`;
      question.statements.forEach(stmt => {
        questionContext += `- ${stmt.text} (Đúng/Sai)\n`;
      });
      questionContext += `Học sinh đã trả lời: ${JSON.stringify(userAnswer)}.\n`;
      questionContext += `Đáp án đúng là:\n`;
      question.statements.forEach(stmt => {
        questionContext += `- ${stmt.text}: ${stmt.isTrue ? 'ĐÚNG' : 'SAI'}\n`;
      });
    } else if (question.type === 'short_answer') {
      questionContext += `Học sinh đã điền đáp án: "${userAnswer}".\n`;
      questionContext += `Đáp án đúng là: "${question.correctAnswer}".\n`;
    }

    const performanceStatus = isCorrect ? 'làm ĐÚNG' : 'làm SAI';

    const prompt = `Học sinh đang ôn thi THPT Quốc gia môn Địa lí (theo cấu trúc đề tham khảo 2025 mới nhất và bám sát Thông tư 17/2025/TT-BGDĐT sửa đổi, bổ sung Chương trình GDPT môn Địa lí cấp THPT) và vừa ${performanceStatus} câu hỏi sau:
${questionContext}

${KIEN_THUC_HANH_CHINH_2025_EXPORT}

Hãy đóng vai một giáo viên Địa lí nhiệt tình. Bắt đầu bằng "${greeting}".
YÊU CẦU BẮT BUỘC (Trình bày bằng Markdown, SỬ DỤNG GẠCH ĐẦU DÒNG (bullet points) cho TẤT CẢ các phần để dễ đọc):
${isCorrect ? '- **Lời khen:** Khen ngợi học sinh vì đã trả lời đúng.' : '- **Phân tích lỗi sai của em:** Giải thích thật chi tiết TẠI SAO đáp án em chọn lại sai. Em đang bị nhầm lẫn ở khái niệm hay hiện tượng địa lí nào?'}
- **Giải thích chi tiết kiến thức:** Phân tích cặn kẽ TẠI SAO đáp án đúng lại là đáp án chính xác. Trích dẫn kiến thức Địa lí 12 (hoặc 11) liên quan. Nếu câu hỏi liên quan đến tỉnh/thành, vùng kinh tế — sử dụng đúng tên và cấu trúc hành chính MỚI sau 1/7/2025.
- **💡 Mẹo ghi nhớ / Lưu ý:** Cung cấp mẹo ghi nhớ ngắn gọn, dễ hiểu hoặc từ khóa quan trọng để lần sau không sai nữa.
- **Lời khuyên:** Dành một lời khuyên ngắn gọn và kết thúc bằng câu: "${encouragement}"

Trình bày bằng tiếng Việt, thân thiện, dễ hiểu và khích lệ.`;

    const response = await generateContentWithFallback(prompt);
    
    return response.text;
  } catch (error) {
    console.error("Error fetching AI explanation:", error);
    return "Xin lỗi, tổng đài AI đang bận chút việc. Bạn có thể tự mình tìm hiểu thêm nhé!";
  }
}

export async function chatWithTutor(message: string, history: {role: 'user' | 'model', text: string}[]) {
  try {
    const formattedHistory = history.map(h => `${h.role === 'user' ? 'Học sinh' : 'Gia sư AI'}: ${h.text}`).join('\n');
    const prompt = `Bạn là một gia sư môn Địa lý cấp THPT nhiệt tình, am hiểu sâu sắc về kiến thức hướng tới kỳ thi tốt nghiệp THPT 2025, đặc biệt nắm vững các thay đổi theo Thông tư 17/2025/TT-BGDĐT.
Hãy trả lời câu hỏi của học sinh một cách dễ hiểu, có căn cứ khoa học, sử dụng Markdown để làm nổi bật ý chính và ĐẶC BIỆT chú trọng vào mẹo giải nhanh hoặc cách nhớ lâu. Ngôn ngữ thân thiện, khích lệ.

${KIEN_THUC_HANH_CHINH_2025_EXPORT}

${formattedHistory ? `Lịch sử trò chuyện:\n${formattedHistory}\n` : ''}Học sinh: ${message}
Gia sư AI:`;

    const response = await generateContentWithFallback(prompt);
    
    return response.text;
  } catch (error: any) {
    console.error("Error chatting with AI tutor:", error);
    return `Xin lỗi, hệ thống AI đang quá tải hoặc gặp lỗi kết nối. (${error.message || 'Thử lại sau'})`;
  }
}

export async function generateLearningPath(attempts: QuizAttempt[], profile?: UserProfile) {
  try {
    const prompt = `Dưới đây là lịch sử làm bài thi môn Địa lý cấp THPT của học sinh ${profile?.name || ''} (Mục tiêu: ${profile?.targetScore || 'Chưa rõ'} điểm).
    
Lịch sử làm bài:
${JSON.stringify(attempts.map(a => ({
  tên_đề_thi: a.examTitle,
  điểm_số: a.score,
  tổng_số_câu: a.totalQuestions,
  ngày_thi: new Date(a.date).toLocaleDateString('vi-VN')
})), null, 2)}

Hãy đóng vai một chuyên gia giáo dục phân tích dữ liệu trên và đưa ra:
1. **Phân tích tổng quan**: Đánh giá năng lực hiện tại của học sinh.
2. **Nhận diện điểm yếu**: Dựa trên điểm số (nếu điểm thấp, khả năng hổng kiến thức ở đâu).
3. **Lộ trình học tập cá nhân hóa**: Đề xuất kế hoạch học tập cụ thể theo từng giai đoạn (tuần 1, tuần 2...) để giúp học sinh nâng cao điểm số và đạt mục tiêu. Trình bày dưới dạng Markdown, sử dụng bullet points và in đậm rõ ràng, lời văn khích lệ và sinh động.`;

    const response = await generateContentWithFallback(prompt);
    return response.text;
  } catch (error) {
    console.error("Error generating learning path:", error);
    return "Xin lỗi, hệ thống AI đang quá tải. Hãy thử lại lúc khác để xem lộ trình nhé!";
  }
}

export async function generateExamFromContext(context: string): Promise<Question[]> {
  const prompt = `Bạn là một chuyên gia phân tích đề thi môn Địa lý THPT, nắm vững cấu trúc đề 2025 và các thay đổi theo TT 17/2025/TT-BGDĐT. Nhiệm vụ của bạn là TRÍCH XUẤT TOÀN BỘ câu hỏi từ ĐỀ THI được cung cấp bên dưới.

${KIEN_THUC_HANH_CHINH_2025_EXPORT}

QUY TẮC BẮT BUỘC:
1. TRÍCH XUẤT ĐẦY ĐỦ TẤT CẢ câu hỏi có trong đề - KHÔNG BỎ SÓT câu nào.
2. Với câu trắc nghiệm nhiều lựa chọn (4 đáp án A/B/C/D): dùng type "multiple_choice".
3. Với câu Đúng/Sai (có các ý a, b, c, d): dùng type "true_false" với 4 statements.
4. Với câu tự luận/điền số/tính toán ngắn: dùng type "short_answer".
5. Phải xác định đáp án đúng dựa trên kiến thức Địa lý hoặc ghi chú trong đề. Nếu đề thi đề cập đến tỉnh/thành đã sáp nhập, hãy ghi chú trong explanation về tên mới sau 1/7/2025.
5b. ⚠️ SAI LẦM THƯỜNG GẶP: TUYỆT ĐỐI KHÔNG ĐƯỢC MẶC ĐỊNH correctAnswerIndex = 0. Đáp án đúng có thế là A(0), B(1), C(2) hoặc D(3). Phải đọc kỹ từng câu hỏi và logic chọn đúng phương án chính xác.
6. id phải là "q1", "q2", "q3",... theo thứ tự câu trong đề.
7. KHÔNG thêm câu mới - chỉ chuyển đổi câu có sẵn sang JSON.

⚠️ QUY TẮC VÀNG VỀ BẢNG SỐ LIỆU / BIỂU ĐỒ:
- Nếu câu hỏi tham chiếu đến bảng số liệu, biểu đồ, hình, lược đồ (text có chứa "bảng", "biểu đồ", "hình", "lược đồ", "số liệu dưới đây", "theo bảng") → trường "context" BẮT BUỘC phải chứa toàn bộ bảng dưới dạng MARKDOWN TABLE (cú pháp pipe |...|).
- Nếu trong đề thi đã có bảng số liệu (Markdown table hoặc bảng plain-text), hãy chuyển đổi nguyên si sang Markdown table và đặt vào "context".
- Nếu câu hỏi KHÔNG tham chiếu bảng/biểu đồ → "context" để null hoặc bỏ qua.
- KHÔNG BAO GIỜ để "context" rỗng khi text câu hỏi có từ "biểu đồ" hay "bảng số liệu".

[ĐỀ THI CẦN PHÂN TÍCH]:
${context}

Trả về DUY NHẤT một mảng JSON chứa TẤT CẢ câu hỏi, không kèm markdown hay giải thích. Định dạng:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "topic": "Địa lý",
    "text": "Nội dung câu hỏi?",
    "context": null,
    "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
    "correctAnswerIndex": 2,
    "explanation": "Giải thích đáp án đúng — correctAnswerIndex phải được chọn theo kiến thức thực tế, có thể là 0/1/2/3"
  },
  {
    "id": "q2",
    "type": "true_false",
    "topic": "Địa lý",
    "text": "Cho bảng số liệu sau đây về GDP các nước Đông Nam Á:",
    "context": "| Quốc gia | 2019 | 2021 | 2024 |\n|---|---|---|---|\n| Indonesia | 1.119 | 1.186 | 1.475 |\n| Việt Nam | 261 | 271 | 430 |\n(Nguồn: World Bank)",
    "statements": [
      {"id": "stmt_a", "text": "Ý a", "isTrue": true},
      {"id": "stmt_b", "text": "Ý b", "isTrue": false},
      {"id": "stmt_c", "text": "Ý c", "isTrue": true},
      {"id": "stmt_d", "text": "Ý d", "isTrue": false}
    ],
    "explanation": "Giải thích"
  },
  {
    "id": "q3",
    "type": "short_answer",
    "topic": "Địa lý",
    "text": "Nội dung câu tự luận/tính toán?",
    "context": null,
    "correctAnswer": "Đáp án",
    "explanation": "Giải thích"
  }
]`;

  try {
    const response = await generateContentWithFallback(prompt);
    let text = response.text.trim();
    // Strip markdown code fences
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    text = text.replace(/\s*```\s*$/i, '').trim();
    // Find the JSON array in the response
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx === -1) {
      throw new Error(`AI không trả về JSON hợp lệ. Nội dung nhận được: ${text.substring(0, 200)}`);
    }
    if (endIdx === -1 || endIdx < startIdx) {
      // Try to close truncated JSON
      text = text.substring(startIdx) + ']';
    } else {
      text = text.substring(startIdx, endIdx + 1);
    }
    return JSON.parse(text) as Question[];
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Lỗi trích xuất câu hỏi:', msg);
    throw new Error(msg);
  }
}

function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string, mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      let mimeType = file.type;
      if (!mimeType) {
        if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
        else if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
        else mimeType = 'image/jpeg';
      }
      resolve({
        inlineData: {
          data: base64,
          mimeType
        }
      });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Upload PDF via Gemini File API (required for PDF — inline base64 is NOT supported)
async function uploadPDFViaFileAPI(file: File): Promise<{ fileData: { mimeType: string, fileUri: string } }> {
  // @ts-ignore
  const apiKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('Chưa thiết lập API Key.');

  const mimeType = 'application/pdf';
  const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;

  // Step 1: Resumable upload initiation
  const initRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': String(file.size),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: { display_name: file.name } }),
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`File API init thất bại: ${errText}`);
  }

  const uploadSessionUrl = initRes.headers.get('X-Goog-Upload-URL');
  if (!uploadSessionUrl) throw new Error('Không nhận được upload URL từ File API.');

  // Step 2: Upload file bytes
  const uploadRes = await fetch(uploadSessionUrl, {
    method: 'POST',
    headers: {
      'Content-Length': String(file.size),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Upload file thất bại: ${errText}`);
  }

  const uploadData = await uploadRes.json();
  let fileUri: string = uploadData?.file?.uri;
  let state: string = uploadData?.file?.state;

  if (!fileUri) throw new Error('Không nhận được file URI từ File API.');

  // Step 3: Poll until file is ACTIVE (usually instant for small files)
  const fileApiBase = `https://generativelanguage.googleapis.com/v1beta/files`;
  const fileName = fileUri.split('/files/')[1];
  let attempts = 0;
  while (state !== 'ACTIVE' && attempts < 10) {
    await new Promise(r => setTimeout(r, 1500));
    const statusRes = await fetch(`${fileApiBase}/${fileName}?key=${apiKey}`);
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      state = statusData?.state;
      fileUri = statusData?.uri || fileUri;
    }
    attempts++;
  }

  if (state !== 'ACTIVE') throw new Error('File PDF chưa sẵn sàng sau khi upload. Vui lòng thử lại.');

  return { fileData: { mimeType, fileUri } };
}

export async function extractQuestionsFromMedia(file: File): Promise<Question[]> {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  // PDF: must use File API (inline base64 is not supported by Gemini for PDF)
  // Images: can use fast inline base64
  let mediaPart: any;
  if (isPDF) {
    mediaPart = await uploadPDFViaFileAPI(file);
  } else {
    mediaPart = await fileToGenerativePart(file);
  }
  const promptText = `Bạn là một chuyên gia phân tích tài liệu và cấu trúc đề thi. Hãy đọc MỌI CÂU HỎI TRONG TÀI LIỆU cung cấp và trích xuất TOÀN BỘ ra thành danh sách JSON.

${KIEN_THUC_HANH_CHINH_2025_EXPORT}

QUY TẮC BẮT BUỘC:
1. TRÍCH XUẤT ĐẦY ĐỦ TẤT CẢ câu hỏi có trong ảnh - KHÔNG BỎ SÓT câu nào.
2. Với câu trắc nghiệm nhiều lựa chọn (4 đáp án A/B/C/D): dùng type "multiple_choice". ĐẶC BIỆT LƯU Ý: Mảng "options" BẮT BUỘC phải chứa CHÍNH XÁC 4 phần tử tách biệt cho A, B, C, D. Tuyệt đối không gộp 2 đáp án (ví dụ A và B) vào chung một chuỗi!
3. Với câu Đúng/Sai (có các ý a, b, c, d): dùng type "true_false" với 4 statements.
4. Với câu tự luận/điền số/tính toán ngắn: dùng type "short_answer".
5. ⚠️ NẾU TRONG ĐỀ KHÔNG CÓ ĐÁP ÁN (Bản thân thí sinh phải tự giải): 
   - Với multiple_choice: để "correctAnswerIndex": -1
   - Với true_false: để tất cả "isTrue": false (kèm ghi chú ở explanation "Cần tạo đáp án")
   - Với short_answer: để "correctAnswer": ""
6. NẾU TRONG ĐỀ CÓ ĐÁP ÁN, hãy trích xuất chính xác đáp án đó.
7. id phải là "q_up_1", "q_up_2",... theo thứ tự câu.

⚠️ QUY TẮC VÀNG VỀ BẢNG SỐ LIỆU / BIỂU ĐỒ (BẮT BUỘC TUÂN THỦ TẠI MỌI CÂU):
- Nếu bài thi CÓ BẢNG SỐ LIỆU HOẶC BIỂU ĐỒ (được vẽ hoặc chụp trong file): Bạn PHẢI chuyển đổi toàn bộ số liệu đó thành BẢNG MARKDOWN (sử dụng cú pháp |..|..|) và GHI VÀO TRƯỜNG "context".
- Tuyệt đối KHÔNG gộp chung Bảng số liệu vào trường "text". Thân câu hỏi ở "text", bảng số liệu ở "context".
- Nếu là BẢNG: sao chép y hệt thành Markdown. Nếu là BIỂU ĐỒ: Đọc các giá trị trên cột/đường/tròn và lập thành Bảng Markdown.
- LỖI NGHIÊM TRỌNG HẬU QUẢ LỚN: Nếu để "context": null, học sinh sẽ không thấy bảng dữ liệu và phần mềm sẽ sụp đổ. Bạn bắt buộc phải chuyển mọi dữ liệu dạng bảng/hình thành bảng Markdown vào "context"!

Vui lòng trả về định dạng mảng JSON chứa các câu hỏi tương tự cấu trúc sau, CHỈ BAO GỒM mảng JSON, không có code block quotes hay văn bản nào khác.
[
  {
    "id": "q_up_1",
    "type": "multiple_choice",
    "topic": "Địa lý",
    "text": "Thân câu hỏi trắc nghiệm ở đây?",
    "context": "| Năm | Giá trị |\n|---|---|\n| 2020 | 100 |\n| 2023 | 150 |",
    "options": ["Đáp án A chỉ riêng A", "Đáp án B chỉ riêng B", "Đáp án C chỉ riêng C", "Đáp án D chỉ riêng D"],
    "correctAnswerIndex": -1,
    "explanation": ""
  },
  {
    "id": "q_up_2",
    "type": "true_false",
    "topic": "Địa lý",
    "text": "Thân câu hỏi Đúng/Sai chung được đặt tại đây.",
    "context": "| Chỉ tiêu | Năm 2020 | Năm 2023 |\n|---|---|---|\n| Dân số (triệu) | 96.2 | 99.1 |",
    "statements": [
      { "id": "stmt_q_up_2_a", "text": "Nội dung phát biểu ý a được trích nguyên văn từ đề.", "isTrue": false },
      { "id": "stmt_q_up_2_b", "text": "Nội dung phát biểu ý b được trích nguyên văn từ đề.", "isTrue": false },
      { "id": "stmt_q_up_2_c", "text": "Nội dung phát biểu ý c được trích nguyên văn từ đề.", "isTrue": false },
      { "id": "stmt_q_up_2_d", "text": "Nội dung phát biểu ý d được trích nguyên văn từ đề.", "isTrue": false }
    ],
    "explanation": ""
  },
  {
    "id": "q_up_3",
    "type": "short_answer",
    "topic": "Địa lý",
    "text": "Căn cứ vào bảng số liệu, hãy tính...",
    "context": "| Cây trồng | Diện tích (nghìn ha) | Sản lượng (nghìn tấn) |\n|---|---|---|\n| Lúa | 7500 | 43000 |",
    "correctAnswer": "",
    "explanation": ""
  }
]`;

  try {
    // IMPORTANT: responseMimeType CANNOT be used with inlineData (PDF/image) — causes HTTP 400!
    const response = await generateContentWithFallback([promptText, mediaPart]);
    let text = response.text.trim();
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    text = text.replace(/\s*```\s*$/i, '').trim();
    
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx === -1) {
      throw new Error("AI không trả về mảng JSON.");
    }
    text = text.substring(startIdx, endIdx !== -1 ? endIdx + 1 : undefined);
    if (!text.endsWith(']')) text += ']';

    return JSON.parse(text) as Question[];
  } catch (error: any) {
    console.error("Lỗi trích xuất đa phương tiện:", error);
    const msg = error?.message || String(error);
    throw new Error("Không thể đọc tài liệu: " + msg);
  }
}

export async function generateAnswersForQuestions(questions: Question[]): Promise<Question[]> {
  // Extract ONLY needed fields for solving, protecting complex fields like 'imageUrl' but REQUIRE 'context' to be passed so AI can solve math!
  const simpleQuestionsForAI = questions.map(q => {
    const brief: any = { id: q.id, type: q.type, text: q.text };
    if ('context' in q && q.context) brief.context = q.context; // Cực kỳ quan trọng để AI đọc được bảng/tính toán
    if ('options' in q) brief.options = q.options;
    if ('statements' in q) brief.statements = q.statements.map((s:any) => ({ id: s.id, text: s.text }));
    return brief;
  });

  const promptText = `Dưới đây là một danh sách câu hỏi Địa lý (định dạng JSON). Hãy đóng vai chuyên gia Địa lý 12, giải TẤT CẢ câu hỏi và trả về đáp án.

${KIEN_THUC_HANH_CHINH_2025_EXPORT}

QUY TẮC QUAN TRỌNG TỰ TẠO BẢNG SỐ LIỆU (MỚI KHẨN CẤP):
Nếu nội dung câu hỏi nói "Cho biểu đồ sau" / "Theo bảng số liệu" / "Căn cứ vào Atlat" HOẶC yêu cầu tính toán dựa vào số liệu MÀ trường "context" bị rỗng/thiếu/null:
-> BẠN PHẢI THỂ HIỆN SỰ THÔNG MINH! Hãy tự bịa ra/tạo ra 1 bảng dữ liệu Markdown HỢP LÝ nhất khớp với nội dung câu hỏi và TRẢ VỀ TRONG TRƯỜNG "context" của câu đó. 
-> Ví dụ: nếu câu hỏi yêu cầu tính GDP thì bạn tự tạo ra 1 bảng GDP. Điều này giúp hệ thống tự vẽ biểu đồ thay thế bảng bị lỗi gốc.

QUY TẮC JSON:
- Với câu multiple_choice: trả về "correctAnswerIndex": (0-3)
- Với câu short_answer: trả về "correctAnswer": "..."
  ⚠️ QUY TẮC PHIẾU BGD 4 Ô — BẮT BUỘC: Phiếu trả lời BGD chỉ có 4 ô (chữ số + dấu "," + dấu "-").
  correctAnswer PHẢI là chuỗi TỐI ĐA 4 KÝ TỰ, dùng dấu phẩy "," (không dùng dấu chấm "."):
  - Làm tròn đến hàng đơn vị → số nguyên: "803", "1234"
  - Làm tròn đến 1 thập phân → "80,3", "12,5"
  - Làm tròn đến 2 thập phân → "8,03", "0,25"
  - Số âm → bắt đầu bằng "-": "-8,3", "-803"
  VÍ DỤ ĐÚNG: "803" (3 ký tự) ✓, "80,3" (4 ký tự) ✓
  VÍ DỤ SAI: "803,2" (5 ký tự) ✗, "803.28" (dấu chấm) ✗
- Với câu true_false: trả về "statements": mảng { id, isTrue }
- BẮT BUỘC trả về "context" nếu bạn vừa tạo thêm bảng. KHÔNG trả về "context" nếu không cần.
- Trả về "explanation" giải thích ngắn gọn dựa trên kiến thức thật hoặc bảng bạn tự tạo.

ĐỊNH DẠNG OUTPUT BẮT BUỘC – CHỈ JSON THUẦN TÚY:
[
  {
    "id": "q_up_1",
    "correctAnswerIndex": 2,
    "context": "| Năm | GDP |\n|---|---|\n| 2020 | 100 |",
    "explanation": "Dựa vào bảng tôi vừa tạo..."
  }
]

Dữ liệu đầu vào:
${JSON.stringify(simpleQuestionsForAI, null, 2)}

CHỈ xuất ra mảng JSON, BẮT ĐẦU bằng [ và KẾT THÚC bằng ].`;

  const promptParts: any[] = [promptText];

  questions.forEach(q => {
    if (q.imageUrl && q.imageUrl.startsWith('data:image/')) {
      const match = q.imageUrl.match(/^data:(image\/[a-zA-Z0-9+-.]+);base64,(.+)$/);
      if (match) {
        promptParts.push(`\nẢnh minh họa phía trên thuộc về câu hỏi có id: "${q.id}":`);
        promptParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }
  });

  try {
    // Note: responseMimeType cannot be used together with inlineData image parts — they conflict.
    const response = await generateContentWithFallback(promptParts);
    const rawText = response.text;
    if (!rawText || rawText.trim() === '') {
      throw new Error('AI trả về nội dung rỗng. Vui lòng thử lại.');
    }
    let text = rawText.trim();
    // Strip markdown code fences
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    text = text.replace(/\s*```\s*$/i, '').trim();

    // CRITICAL: Strip JS-style // line comments that AI sometimes adds (invalid JSON)
    // Example: "correctAnswerIndex": 2, // với multiple_choice
    text = text.replace(/\/\/[^\n\r"]*/g, '');
    // Strip /* block comments */ as well
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    // Clean up any trailing commas before } or ] caused by comment removal
    text = text.replace(/,(\s*[}\]])/g, '$1');
    
    let answerKeys;
    try {
      // Try direct parse first
      answerKeys = JSON.parse(text);
    } catch {
      // Fallback: find array boundaries and try to fix truncated JSON
      const startIdx = text.indexOf('[');
      let endIdx = text.lastIndexOf(']');
      if (startIdx !== -1) {
        if (endIdx === -1 || endIdx < startIdx) {
          // JSON truncated — try to close it
          text = text.substring(startIdx) + ']}]';
        } else {
          text = text.substring(startIdx, endIdx + 1);
        }
        try {
          answerKeys = JSON.parse(text);
        } catch {
          throw new Error('AI trả về JSON không hợp lệ — không thể phân tích đáp án. Hãy thử lại.');
        }
      } else {
        throw new Error('AI không trả về mảng JSON đáp án. Vui lòng thử lại.');
      }
    }

    if (!Array.isArray(answerKeys)) {
      throw new Error('Dữ liệu đáp án không phải mảng hợp lệ.');
    }

    // Merge generated answers securely back into Original Questions (preserving EVERYTHING including context and imageUrl)
    return questions.map(originalQ => {
      const ans = answerKeys.find((a: any) => a.id === originalQ.id);
      if (!ans) return originalQ;
      
      let statements = (originalQ as any).statements;
      if (originalQ.type === 'true_false' && statements && ans.statements) {
        statements = statements.map((origStmt: any) => {
          const ansStmt = ans.statements.find((s: any) => s.id === origStmt.id);
          return ansStmt ? { ...origStmt, isTrue: ansStmt.isTrue } : origStmt;
        });
      }

      return {
        ...originalQ,
        context: ans.context ?? originalQ.context,
        correctAnswerIndex: ans.correctAnswerIndex ?? (originalQ as any).correctAnswerIndex,
        correctAnswer: ans.correctAnswer ?? (originalQ as any).correctAnswer,
        explanation: ans.explanation ?? originalQ.explanation,
        statements
      } as unknown as Question;
    });
  } catch (error: any) {
    console.error("Lỗi tạo đáp án:", error);
    throw new Error("Có lỗi xảy ra khi tạo đáp án: " + (error?.message || String(error)));
  }
}



