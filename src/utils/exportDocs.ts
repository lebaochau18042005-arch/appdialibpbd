import { Exam, Question } from "../types";
import { exportExamToDocx } from "../services/docxExportService";

export const exportExamToWord = async (exam: Exam) => {
  try {
    await exportExamToDocx(exam);
  } catch (error) {
    console.error("Lỗi khi tạo file word:", error);
    alert("Không thể tạo file Word, vui lòng thử lại.");
  }
};

// ─── Export Exam to PDF via browser print dialog ─────────────────────────────
export const exportExamToPdf = (exam: Exam): void => {
  const questions = exam.questions ?? [];

  const renderQ = (q: Question, idx: number): string => {
    let html = `<div class="question"><p class="q-text"><strong>Câu ${idx + 1}:</strong> ${q.text}</p>`;
    if (q.imageUrl) {
      html += `<img src="${q.imageUrl}" class="q-img" alt="Hình câu hỏi" />`;
    }
    if (q.type === 'multiple_choice' && q.options) {
      const labels = ['A', 'B', 'C', 'D'];
      html += '<div class="options">' + q.options.map((o, i) =>
        `<span class="opt">${labels[i]}. ${o}</span>`
      ).join('') + '</div>';
    } else if (q.type === 'true_false' && q.statements) {
      html += '<div class="options">' + q.statements.map((s, i) =>
        `<span class="opt">${i + 1}. ${s.text} &nbsp;□ Đúng &nbsp;□ Sai</span>`
      ).join('') + '</div>';
    } else if (q.type === 'short_answer') {
      html += '<div class="options"><span class="opt">Đáp án: ............................................................................</span></div>';
    }
    html += '</div>';
    return html;
  };

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${exam.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', serif; font-size: 13pt; color: #000; padding: 2cm; }
    h1 { text-align: center; font-size: 16pt; text-transform: uppercase; margin-bottom: 6pt; }
    .meta { text-align: center; font-size: 11pt; color: #555; margin-bottom: 18pt; }
    .info-line { font-size: 12pt; margin-bottom: 18pt; border-bottom: 1px dotted #000; padding-bottom: 6pt; }
    .question { margin-bottom: 14pt; page-break-inside: avoid; }
    .q-text { font-weight: bold; margin-bottom: 6pt; line-height: 1.6; }
    .options { margin-left: 20pt; display: flex; flex-wrap: wrap; gap: 4pt 24pt; }
    .opt { display: block; width: 45%; line-height: 1.8; }
    .q-img { max-width: 340pt; max-height: 180pt; display: block; margin: 6pt 0 6pt 20pt; object-fit: contain; }
    @media print { body { padding: 1.5cm; } button { display: none; } }
  </style>
</head>
<body>
  <h1>${exam.title}</h1>
  <p class="meta">Số câu: ${questions.length} &nbsp;|&nbsp; Ngày tạo: ${new Date(exam.createdAt).toLocaleDateString('vi-VN')}</p>
  <div class="info-line">Họ và tên: ............................................................. &nbsp;&nbsp; Lớp: .................... &nbsp;&nbsp; Ngày: ....................</div>
  ${questions.map((q, i) => renderQ(q, i)).join('')}
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }
  doc.open();
  doc.write(html);
  doc.close();
  // Wait for images to load then print
  const imgs = Array.from(doc.querySelectorAll('img'));
  const printAndRemove = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  };
  if (imgs.length === 0) {
    printAndRemove();
  } else {
    let loaded = 0;
    imgs.forEach(img => {
      const done = () => { loaded++; if (loaded === imgs.length) printAndRemove(); };
      img.onload = done;
      img.onerror = done;
    });
  }
};
