import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Exam, Question } from '../types';

/**
 * Xuất đề thi ra định dạng Microsoft Word (.docx) chuẩn cấu trúc Bộ GD&ĐT 2025
 * Kèm thông tin Trường THPT Bình Phú, đề thi 3 phần và bảng đáp án / hướng dẫn chấm chi tiết.
 */
export async function exportExamToDocx(exam: Exam, schoolName = 'TRƯỜNG THPT BÌNH PHÚ - BÌNH DƯƠNG'): Promise<void> {
  const questions = exam.questions || [];
  const mcQuestions = questions.filter(q => q.type === 'multiple_choice');
  const tfQuestions = questions.filter(q => q.type === 'true_false');
  const saQuestions = questions.filter(q => q.type === 'short_answer');

  const docChildren: any[] = [];

  // ── HEADER TRƯỜNG & TÊN ĐỀ ──────────────────────────────────────────────
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: schoolName.toUpperCase(), bold: true, size: 24, font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'KỲ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025', bold: true, size: 24, font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `BÀI THI: ĐỊA LÍ — ĐỀ BÀI: ${exam.title.toUpperCase()}`, bold: true, size: 26, color: '003366', font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Thời gian làm bài: 50 phút (không kể thời gian phát đề)', italics: true, size: 22, font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '────────────────────────────────────────────────────', color: '888888', size: 18 }),
      ],
      spacing: { after: 200 },
    })
  );

  // ── PHẦN I: TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN ──────────────────────
  if (mcQuestions.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.', bold: true, size: 24, font: 'Times New Roman' }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Thí sinh trả lời từ câu 1 đến câu ${mcQuestions.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`,
            italics: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
        spacing: { after: 150 },
      })
    );

    mcQuestions.forEach((q, idx) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: q.text, size: 22, font: 'Times New Roman' }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );

      // In context (bảng số liệu) nếu có
      if (q.context && q.context.trim()) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: q.context, italics: true, size: 20, font: 'Courier New', color: '333333' }),
            ],
            spacing: { after: 60 },
          })
        );
      }

      // In 4 phương án A, B, C, D
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          docChildren.push(
            new Paragraph({
              indent: { left: 400 },
              children: [
                new TextRun({ text: `${letter}. `, bold: true, size: 22, font: 'Times New Roman' }),
                new TextRun({ text: opt, size: 22, font: 'Times New Roman' }),
              ],
              spacing: { after: 40 },
            })
          );
        });
      }
    });
  }

  // ── PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI ─────────────────────────────────────
  if (tfQuestions.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'PHẦN II. Câu trắc nghiệm đúng sai.', bold: true, size: 24, font: 'Times New Roman' }),
        ],
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Thí sinh trả lời từ câu 1 đến câu ${tfQuestions.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.`,
            italics: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
        spacing: { after: 150 },
      })
    );

    tfQuestions.forEach((q, idx) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: q.text, size: 22, font: 'Times New Roman' }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );

      if (q.context && q.context.trim()) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: q.context, italics: true, size: 20, font: 'Courier New', color: '333333' }),
            ],
            spacing: { after: 60 },
          })
        );
      }

      if (q.statements && Array.isArray(q.statements)) {
        const letters = ['a', 'b', 'c', 'd'];
        q.statements.forEach((stmt, sIdx) => {
          const l = letters[sIdx] || `y${sIdx + 1}`;
          docChildren.push(
            new Paragraph({
              indent: { left: 400 },
              children: [
                new TextRun({ text: `${l}) `, bold: true, size: 22, font: 'Times New Roman' }),
                new TextRun({ text: stmt.text, size: 22, font: 'Times New Roman' }),
              ],
              spacing: { after: 40 },
            })
          );
        });
      }
    });
  }

  // ── PHẦN III: TRẢ LỜI NGẮN / TÍNH TOÁN ─────────────────────────────────
  if (saQuestions.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'PHẦN III. Câu trắc nghiệm trả lời ngắn.', bold: true, size: 24, font: 'Times New Roman' }),
        ],
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Thí sinh trả lời từ câu 1 đến câu ${saQuestions.length}. Điền con số kết quả tính toán vào phiếu trả lời.`,
            italics: true,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
        spacing: { after: 150 },
      })
    );

    saQuestions.forEach((q, idx) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: q.text, size: 22, font: 'Times New Roman' }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );

      if (q.context && q.context.trim()) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: q.context, italics: true, size: 20, font: 'Courier New', color: '333333' }),
            ],
            spacing: { after: 60 },
          })
        );
      }
    });
  }

  // ── PHẦN IV: ĐÁP ÁN VÀ LỜI GIẢI CHI TIẾT (DÀNH CHO GIÁO VIÊN) ────────────
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: '────────────────────────────────────────────────────', color: '888888', size: 18 }),
      ],
      spacing: { before: 300, after: 150 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT', bold: true, size: 26, color: '003366', font: 'Times New Roman' }),
      ],
      spacing: { after: 200 },
    })
  );

  // Đáp án Phần I
  if (mcQuestions.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '1. Đáp án Phần I (Trắc nghiệm):', bold: true, size: 22, font: 'Times New Roman' }),
        ],
        spacing: { before: 100, after: 80 },
      })
    );
    const mcKeys = mcQuestions.map((q, idx) => {
      const char = String.fromCharCode(65 + q.correctAnswerIndex);
      return `Câu ${idx + 1}: ${char}`;
    }).join('   |   ');

    docChildren.push(
      new Paragraph({
        indent: { left: 400 },
        children: [new TextRun({ text: mcKeys, bold: true, size: 20, font: 'Times New Roman', color: '006600' })],
        spacing: { after: 150 },
      })
    );
  }

  // Đáp án Phần II
  if (tfQuestions.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '2. Đáp án Phần II (Đúng/Sai):', bold: true, size: 22, font: 'Times New Roman' }),
        ],
        spacing: { before: 100, after: 80 },
      })
    );
    tfQuestions.forEach((q, idx) => {
      const letters = ['a', 'b', 'c', 'd'];
      const stmts = (q.statements || []).map((s, sIdx) => `${letters[sIdx]}) ${s.isTrue ? 'Đ' : 'S'}`).join('  -  ');
      docChildren.push(
        new Paragraph({
          indent: { left: 400 },
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, size: 20, font: 'Times New Roman' }),
            new TextRun({ text: stmts, bold: true, size: 20, font: 'Times New Roman', color: '006600' }),
          ],
          spacing: { after: 50 },
        })
      );
    });
  }

  // Đáp án Phần III
  if (saQuestions.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '3. Đáp án Phần III (Trả lời ngắn):', bold: true, size: 22, font: 'Times New Roman' }),
        ],
        spacing: { before: 100, after: 80 },
      })
    );
    saQuestions.forEach((q, idx) => {
      docChildren.push(
        new Paragraph({
          indent: { left: 400 },
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, size: 20, font: 'Times New Roman' }),
            new TextRun({ text: String(q.correctAnswer ?? ''), bold: true, size: 20, font: 'Times New Roman', color: '006600' }),
            q.unit ? new TextRun({ text: ` (${q.unit})`, size: 20, font: 'Times New Roman' }) : new TextRun({ text: '' }),
          ],
          spacing: { after: 50 },
        })
      );
    });
  }

  // Lời giải thích chi tiết
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: '4. Lời giải thích & Lưu ý sư phạm (Thông tư 17/2025/TT-BGDĐT):', bold: true, size: 22, font: 'Times New Roman' }),
      ],
      spacing: { before: 150, after: 80 },
    })
  );

  questions.forEach((q, idx) => {
    if (q.explanation || q.tips) {
      docChildren.push(
        new Paragraph({
          indent: { left: 400 },
          children: [
            new TextRun({ text: `Câu ${idx + 1} (${q.topic}): `, bold: true, size: 20, font: 'Times New Roman' }),
            new TextRun({ text: q.explanation || 'Không có giải thích kèm theo.', size: 20, font: 'Times New Roman' }),
            q.tips ? new TextRun({ text: ` [Mẹo: ${q.tips}]`, italics: true, color: '666666', size: 18, font: 'Times New Roman' }) : new TextRun({ text: '' }),
          ],
          spacing: { after: 60 },
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (exam.title || 'de_thi_dia_li')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim();
  saveAs(blob, `${cleanTitle}_THPT_Binh_Phu.docx`);
}
