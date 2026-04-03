import * as mammoth from 'mammoth';

/**
 * Extracts raw text from a file URL.
 * Supports:
 *   - Word (.docx/.doc) → mammoth
 *   - PDF (.pdf) → pdfjs-dist
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
      // ── Word extraction via mammoth ──────────────────────────────────────────
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || '';
    } else {
      // ── PDF extraction via pdfjs-dist ────────────────────────────────────────
      // Dynamic import to avoid SSR issues and keep bundle smaller
      const pdfjsLib = await import('pdfjs-dist');

      // Point to the bundled worker (Vite serves /node_modules automatically)
      // Use a CDN fallback to avoid worker configuration issues
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
