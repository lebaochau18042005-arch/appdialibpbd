import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { Exam } from "../types";

export const exportExamToWord = async (exam: Exam) => {
  const children: any[] = [
    new Paragraph({
      text: exam.title.toUpperCase() || 'ĐỀ THI ĐỊA LÝ',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "Họ và tên: .............................................................. Lớp: ....................",
      spacing: { after: 400 },
    })
  ];

  exam.questions.forEach((q, index) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Câu ${index + 1}: `, bold: true }),
          new TextRun(q.text || ''),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    if (q.type === 'multiple_choice' && q.options) {
      q.options.forEach((opt, oIndex) => {
        children.push(
          new Paragraph({
            text: `${String.fromCharCode(65 + oIndex)}. ${opt}`,
            indent: { left: 720 },
            spacing: { after: 50 },
          })
        );
      });
    } else if (q.type === 'true_false' && q.statements) {
      q.statements.forEach((stmt) => {
        children.push(
          new Paragraph({
            text: `- ${stmt.text} (Đúng/Sai)`,
            indent: { left: 720 },
            spacing: { after: 50 },
          })
        );
      });
    } else if (q.type === 'short_answer') {
      children.push(
        new Paragraph({
          text: "Đáp án: ........................................................................",
          indent: { left: 720 },
          spacing: { after: 100 },
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${exam.title ? exam.title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'de_thi'}.docx`);
  } catch (error) {
    console.error("Lỗi khi tạo file word:", error);
    alert("Không thể tạo file báo cáo, vui lòng thử lại.");
  }
};
