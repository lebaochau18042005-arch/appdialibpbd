import pptxgen from 'pptxgenjs';
import { Exam, Question } from '../types';

export const generatePptx = async (exam: Exam) => {
  const pres = new pptxgen();
  
  // Set layout
  pres.layout = 'LAYOUT_16x9';

  // Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: 'F4F6F6' };
  
  titleSlide.addText(exam.title, {
    x: '10%',
    y: '30%',
    w: '80%',
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: '1C2833',
    align: 'center',
  });

  titleSlide.addText(`Số câu hỏi: ${exam.questions.length}\nNgày tạo: ${new Date(exam.createdAt).toLocaleDateString('vi-VN')}`, {
    x: '10%',
    y: '55%',
    w: '80%',
    h: 1,
    fontSize: 24,
    color: '2E4053',
    align: 'center',
  });

  // Loop through questions
  exam.questions.forEach((q, index) => {
    // 1. Question Slide
    const qSlide = pres.addSlide();
    qSlide.background = { color: 'FFFFFF' };

    // Header Question Number
    qSlide.addText(`Câu hỏi ${index + 1}:`, {
      x: '5%',
      y: '5%',
      w: '90%',
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: 'E74C3C',
    });

    // Content
    qSlide.addText(q.text, {
      x: '5%',
      y: '15%',
      w: '90%',
      h: 1.5,
      fontSize: 28,
      bold: true,
      color: '1C2833',
      valign: 'top',
    });

    // Options or other
    let currentY = 3.5;
    
    if (q.type === 'multiple_choice' && q.options) {
      const labels = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, optIdx) => {
        qSlide.addText(`${labels[optIdx]}. ${opt}`, {
          x: '10%',
          y: currentY + (optIdx * 0.8),
          w: '80%',
          h: 0.6,
          fontSize: 24,
          color: '2C3E50',
          fill: { color: 'F8F9F9' },
          bullet: true
        });
      });
    } else if (q.type === 'true_false' && q.statements) {
      q.statements.forEach((stmt, stmtIdx) => {
        qSlide.addText(`${stmtIdx + 1}. ${stmt.text}`, {
          x: '10%',
          y: currentY + (stmtIdx * 0.8),
          w: '80%',
          h: 0.6,
          fontSize: 24,
          color: '2C3E50',
          bullet: true
        });
      });
    } else if (q.type === 'short_answer') {
      qSlide.addText('Trả lời ngắn gọn (Điền đáp án chính xác):', {
        x: '10%',
        y: currentY,
        w: '80%',
        h: 0.6,
        fontSize: 24,
        color: '7F8C8D',
        italic: true
      });
    }

    // 2. Format Answer Slide
    const aSlide = pres.addSlide();
    aSlide.background = { color: 'F4F6F6' };

    aSlide.addText(`Đáp án - Câu ${index + 1}`, {
      x: '5%',
      y: '5%',
      w: '90%',
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: '27AE60',
    });

    aSlide.addText(q.text, {
      x: '5%',
      y: '15%',
      w: '90%',
      h: 1.0,
      fontSize: 20,
      color: '7F8C8D',
      valign: 'top',
    });

    let answerText = '';
    if (q.type === 'multiple_choice') {
      answerText = `Đáp án đúng: ${['A', 'B', 'C', 'D'][q.correctAnswerIndex as number]}\n${q.options?.[q.correctAnswerIndex as number]}`;
    } else if (q.type === 'true_false' && q.statements) {
      answerText = q.statements.map((s, idx) => `${idx + 1}. ${s.isTrue ? 'Đúng' : 'Sai'}`).join('\n');
    } else if (q.type === 'short_answer') {
      answerText = `Đáp án đúng: ${q.correctAnswer}`;
    }

    aSlide.addText(answerText, {
      x: '10%',
      y: '30%',
      w: '80%',
      h: 2.0,
      fontSize: 32,
      bold: true,
      color: '27AE60',
      fill: { color: 'E9F7EF' },
      valign: 'middle',
      align: 'center' // Use a proper align property and correct formatting
    });

    if (q.explanation) {
      aSlide.addText('Giải thích:', {
        x: '10%',
        y: '55%',
        w: '80%',
        h: 0.5,
        fontSize: 20,
        bold: true,
        color: '2980B9'
      });
      aSlide.addText(q.explanation, {
        x: '10%',
        y: '65%',
        w: '80%',
        h: 2.5,
        fontSize: 20,
        color: '34495E',
        valign: 'top'
      });
    }
  });

  const finalSlide = pres.addSlide();
  finalSlide.background = { color: '1C2833' };
  finalSlide.addText('Hết đề thi!', {
    x: '20%',
    y: '40%',
    w: '60%',
    h: 1,
    fontSize: 48,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });

  // Save the presentation
  const fileName = `De_thi_${exam.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pptx`;
  await pres.writeFile({ fileName });
};
