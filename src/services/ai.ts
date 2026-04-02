import { GoogleGenAI } from '@google/genai';
import { Question, UserProfile, QuizAttempt } from '../types';

const FALLBACK_MODELS = [
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b'
];

const DEFAULT_MODEL = 'gemini-2.5-flash-preview-04-17';

// ===== KIẾN THỨC HÀNH CHÍNH SAU SÁP NHẬP 1/7/2025 (NQ 202/2025/QH15) =====
// Được nhúng vào TẤT CẢ các prompt AI để mọi giải thích đều dùng thông tin hành chính MỚI NHẤT
const KIEN_THUC_HANH_CHINH_2025 = `
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
- Vùng Nam Trung Bộ: Đà Nẵng (đã gồm Quảng Nam), Quảng Ngãi (đã gồm Kon Tum), Gia Lai (đã gồm Bình Định), Khánh Hòa (đã gồm Ninh Thuận)
- Vùng Tây Nguyên: Đắk Lắk, Lâm Đồng (đã gồm Đắk Nông + Bình Thuận)

### Thông tư 17/2025/TT-BGDĐT (Bộ GDĐT, hiệu lực 12/9/2025):
- Sửa đổi Chương trình GDPT 2018, yêu cầu cập nhật nội dung Địa lý 12 theo 34 đơn vị hành chính mới.
- Cập nhật: ranh giới vùng kinh tế, tên tỉnh/thành, số liệu diện tích, dân số, phân bố kinh tế.
- Giáo viên tiếp tục dùng SGK hiện hành nhưng phải chủ động điều chỉnh ngữ liệu cho phù hợp.

LƯU Ý: Khi giải thích bất kỳ câu hỏi nào về tỉnh thành, vùng kinh tế, dân cư, kinh tế địa phương — PHẢI dùng tên và dữ liệu THEO ĐƠN VỊ HÀNH CHÍNH MỚI SAU 1/7/2025. Không dùng tên tỉnh cũ đã sáp nhập như một đơn vị độc lập (ví dụ: không nói "tỉnh Hải Dương" mà nói "khu vực Hải Dương thuộc TP Hải Phòng").
`;

export async function generateContentWithFallback(prompt: string, config: any = {}) {
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
      console.warn(`[AI Fallback] Model ${model} failed:`, msg);
      if (!firstError) firstError = `${model}: ${msg}`;
      lastError = error;
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

${KIEN_THUC_HANH_CHINH_2025}

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

${KIEN_THUC_HANH_CHINH_2025}

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

${KIEN_THUC_HANH_CHINH_2025}

QUY TẮC BẮT BUỘC:
1. TRÍCH XUẤT ĐẦY ĐỦ TẤT CẢ câu hỏi có trong đề - KHÔNG BỎ SÓT câu nào.
2. Với câu trắc nghiệm nhiều lựa chọn (4 đáp án A/B/C/D): dùng type "multiple_choice".
3. Với câu Đúng/Sai (có các ý a, b, c, d): dùng type "true_false" với 4 statements.
4. Với câu tự luận/điền số/tính toán ngắn: dùng type "short_answer".
5. Phải xác định đáp án đúng dựa trên kiến thức Địa lý hoặc ghi chú trong đề. Nếu đề thi đề cập đến tỉnh/thành đã sáp nhập, hãy ghi chú trong explanation về tên mới sau 1/7/2025.
6. id phải là "q1", "q2", "q3",... theo thứ tự câu trong đề.
7. KHÔNG thêm câu mới - chỉ chuyển đổi câu có sẵn sang JSON.

[ĐỀ THI CẦN PHÂN TÍCH]:
${context}

Trả về DUY NHẤT một mảng JSON chứa TẤT CẢ câu hỏi, không kèm markdown hay giải thích. Định dạng:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "topic": "Địa lý",
    "text": "Nội dung câu hỏi?",
    "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
    "correctAnswerIndex": 0,
    "explanation": "Giải thích đáp án đúng"
  },
  {
    "id": "q2",
    "type": "true_false",
    "topic": "Địa lý",
    "text": "Nội dung câu hỏi Đúng/Sai",
    "statements": [
      {"id": "s1", "text": "Ý a", "isTrue": true},
      {"id": "s2", "text": "Ý b", "isTrue": false},
      {"id": "s3", "text": "Ý c", "isTrue": true},
      {"id": "s4", "text": "Ý d", "isTrue": false}
    ],
    "explanation": "Giải thích"
  },
  {
    "id": "q3",
    "type": "short_answer",
    "topic": "Địa lý",
    "text": "Nội dung câu tự luận/tính toán?",
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

