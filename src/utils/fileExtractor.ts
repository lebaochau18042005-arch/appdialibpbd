import * as mammoth from 'mammoth';

// ── HTML table → Markdown table converter ───────────────────────────────────
/**
 * Chuyển đổi tất cả <table> trong HTML sang Markdown pipe-table.
 * Giữ nguyên nội dung text trong cell, bỏ tag HTML trong cell.
 */
function htmlTablesToMarkdown(html: string): string {
  // Parse all <table>...</table> blocks
  return html.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    const rows: string[][] = [];

    // Extract all rows
    const rowMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    for (const rowHtml of rowMatches) {
      // Extract th or td cells
      const cellMatches = rowHtml.match(/<(?:th|td)[\s\S]*?<\/(?:th|td)>/gi) || [];
      const cells = cellMatches.map(cell => {
        // Strip HTML tags, decode entities
        const text = cell
          .replace(/<[^>]+>/g, '')          // remove tags
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ')
          .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
          .replace(/\s+/g, ' ')
          .trim();
        return text || ' ';
      });
      if (cells.length > 0) rows.push(cells);
    }

    if (rows.length === 0) return '';

    const colCount = Math.max(...rows.map(r => r.length));

    // Pad rows to same width
    const padded = rows.map(row => {
      while (row.length < colCount) row.push(' ');
      return row;
    });

    // First row = header
    const header = `| ${padded[0].join(' | ')} |`;
    const separator = `|${Array(colCount).fill('---').map(s => ` ${s} `).join('|')}|`;
    const body = padded.slice(1).map(row => `| ${row.join(' | ')} |`);

    return [header, separator, ...body].join('\n');
  });
}

/**
 * Lấy text thuần từ HTML (dùng cho phần ngoài bảng).
 */
function htmlToPlainText(html: string): string {
  // Remove tables first (already converted), then strip remaining tags
  const withoutTables = html.replace(/<table[\s\S]*?<\/table>/gi, '');
  return withoutTables
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts rich text (including tables as Markdown) from a file URL.
 * Supports:
 *   - Word (.docx/.doc) → mammoth convertToHtml, then tables → Markdown
 *   - PDF (.pdf) → pdfjs-dist (text only; PDFs rarely embed structured tables)
 *   - Falls back to empty string for unsupported types
 */
export async function extractTextFromUrl(url: string, fileType: string): Promise<string> {
  const isWord = fileType === 'word' || url.toLowerCase().includes('.doc');
  const isPDF = fileType === 'pdf' || url.toLowerCase().includes('.pdf');

  if (!isWord && !isPDF) {
    throw new Error('Định dạng tài liệu không được hỗ trợ. Chỉ hỗ trợ Word (.docx) và PDF (.pdf).');
  }

  // Download the file
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không thể tải file từ thư viện. Lỗi HTTP ${response.status}.`);
  }
  const arrayBuffer = await response.arrayBuffer();

  try {
    if (isWord) {
      // ── Word extraction via mammoth (HTML mode to preserve tables) ───────────
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value || '';

      // Convert HTML tables → Markdown tables
      const markdownTables = htmlTablesToMarkdown(html);
      // Plain text for non-table content
      const plainText = htmlToPlainText(html);

      // Interleave: replace table placeholders back into text
      // Strategy: rebuild by replacing each <table> with its Markdown version
      // We already have both separately; concatenate plain + tables as a merged doc.
      // Better: merge by processing the html top-to-bottom
      const merged = mergeHtmlToMarkdown(html);
      return merged || plainText;
    } else {
      // ── PDF extraction via pdfjs-dist ────────────────────────────────────────
      const pdfjsLib = await import('pdfjs-dist');

      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item: any) => item.str)
          .join(' ');
        pages.push(text);
      }
      return pages.join('\n\n');
    }
  } catch (error: any) {
    console.error('File Extractor Error:', error);
    throw new Error(
      `Lỗi trích xuất văn bản từ ${isPDF ? 'PDF' : 'Word'}: ${error?.message || 'Không xác định'}. Vui lòng kiểm tra định dạng file.`
    );
  }
}

/**
 * Hàm chính: merge HTML thành Markdown bằng cách xử lý từng block theo thứ tự:
 *   - <table> → Markdown pipe table
 *   - mọi thứ còn lại → text thuần
 */
function mergeHtmlToMarkdown(html: string): string {
  const parts: string[] = [];
  let remaining = html;

  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  tableRegex.lastIndex = 0;
  while ((match = tableRegex.exec(html)) !== null) {
    // Text before this table
    const before = html.slice(lastIndex, match.index);
    const beforeText = htmlToPlainText(before);
    if (beforeText) parts.push(beforeText);

    // The table itself → Markdown
    const mdTable = htmlTablesToMarkdown(match[0]);
    if (mdTable) parts.push(mdTable);

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last table
  const after = html.slice(lastIndex);
  const afterText = htmlToPlainText(after);
  if (afterText) parts.push(afterText);

  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}
