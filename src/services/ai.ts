import { GoogleGenAI } from '@google/genai';
import { Question, UserProfile, QuizAttempt } from '../types';

const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash'
];

const DEFAULT_MODEL = 'gemini-3-pro-preview';

export async function generateContentWithFallback(prompt: string, config: any = {}) {
  // @ts-ignore
  const apiKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Chưa thiết lập API Key. Vui lòng cập nhật thông tin trong Cấu hình Google AI.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const preferredModel = localStorage.getItem('GEMINI_MODEL') || DEFAULT_MODEL;
  
  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];
  
  let lastError;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });
      return response;
    } catch (error: any) {
      console.warn(`[AI Fallback] Model ${model} thất bại do lỗi:`, error.message);
      lastError = error;
    }
  }

  throw new Error(`Tất cả các model đều thất bại. Lý do: ${lastError?.message || 'Lỗi không xác định'}`);
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

Hãy đóng vai một giáo viên Địa lí nhiệt tình. Bắt đầu bằng "${greeting}".
YÊU CẦU BẮT BUỘC (Trình bày bằng Markdown, SỬ DỤNG GẠCH ĐẦU DÒNG (bullet points) cho TẤT CẢ các phần để dễ đọc):
${isCorrect ? '- **Lời khen:** Khen ngợi học sinh vì đã trả lời đúng.' : '- **Phân tích lỗi sai của em:** Giải thích thật chi tiết TẠI SAO đáp án em chọn lại sai. Em đang bị nhầm lẫn ở khái niệm hay hiện tượng địa lí nào?'}
- **Giải thích chi tiết kiến thức:** Phân tích cặn kẽ TẠI SAO đáp án đúng lại là đáp án chính xác. Trích dẫn kiến thức Địa lí 12 (hoặc 11) liên quan.
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
    const prompt = `Bạn là một gia sư môn Địa lý cấp THPT nhiệt tình, am hiểu sâu sắc về kiến thức hướng tới kỳ thi tốt nghiệp THPT 2025. 
Hãy trả lời câu hỏi của học sinh một cách dễ hiểu, có căn cứ khoa học, sử dụng Markdown để làm nổi bật ý chính và ĐẶC BIỆT chú trọng vào mẹo giải nhanh hoặc cách nhớ lâu. Ngôn ngữ thân thiện, khích lệ.

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
  const prompt = `Bạn là một chuyên gia ra đề thi môn Địa lý cấp THPT. Vui lòng đọc ĐOẠN VĂN BẢN (TÀI LIỆU/TIN TỨC) sau đây và tạo ra một số câu hỏi trắc nghiệm Địa lý bám sát nội dung. 

Số lượng câu hỏi: Tùy thuộc vào độ dài nội dung, nhưng tạo tối đa 5 câu hỏi (Có thể là Trắc nghiệm nhiều lựa chọn, Đúng/Sai, hoặc Câu trả lời ngắn).
Cấu trúc JSON đầu ra phải CHÍNH XÁC như định dạng được yêu cầu trong ngân hàng đề thi.

[ĐOẠN VĂN BẢN]:
${context}

Trả về DUY NHẤT một mảng JSON chứa các câu hỏi, không kèm markdown \`\`\`json hay giải thích nào khác. Định dạng mỗi câu như sau:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "topic": "Từ văn bản",
    "text": "Nội dung câu hỏi Multiple Choice?",
    "options": ["A", "B", "C", "D"],
    "correctAnswerIndex": 0,
    "explanation": "Giải thích"
  },
  {
    "id": "q2",
    "type": "true_false",
    "topic": "Từ văn bản",
    "text": "Nội dung câu hỏi Đúng/Sai",
    "statements": [
      {"id": "s1", "text": "Ý 1", "isTrue": true},
      {"id": "s2", "text": "Ý 2", "isTrue": false}
    ],
    "explanation": "Giải thích"
  },
  {
    "id": "q3",
    "type": "short_answer",
    "topic": "Từ văn bản",
    "text": "Nội dung câu trả lời ngắn",
    "correctAnswer": "Đáp án",
    "explanation": "Giải thích"
  }
]`;

  try {
    const response = await generateContentWithFallback(prompt);
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json\n?/, '');
    if (text.startsWith('```')) text = text.replace(/```\n?/, '');
    if (text.endsWith('```')) text = text.substring(0, text.length - 3).trim();
    
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Lỗi tạo đề từ đoạn văn bản:", error);
    throw new Error('Không thể tạo câu hỏi từ đoạn văn bản này.');
  }
}
