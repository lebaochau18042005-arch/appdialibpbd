import * as mammoth from 'mammoth';

/**
 * Downloads a file from a URL and extracts raw text using mammoth.
 * Currently only supports .docx files.
 */
export async function extractTextFromUrl(url: string, fileType: string): Promise<string> {
  if (fileType !== 'word' && !url.includes('.doc')) {
    throw new Error('Tính năng này hiện tại chỉ hỗ trợ trích xuất văn bản từ tài liệu Word (.docx).');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Không thể tải file. Kết quả trả về HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // Mammoth handles arrayBuffer parsing directly
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (error) {
    console.error('File Extractor Error:', error);
    throw new Error('Lỗi xảy ra trong quá trình trích xuất văn bản từ file. Vui lòng kiểm tra lại định dạng hoặc quyền truy cập file.');
  }
}
