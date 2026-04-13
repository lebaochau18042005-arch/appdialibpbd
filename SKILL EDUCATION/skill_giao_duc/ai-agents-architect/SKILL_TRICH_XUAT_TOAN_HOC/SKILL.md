---
name: Trích Xuất Câu Hỏi & Công Thức Toán Học từ DOCX/PDF
description: Skill hướng dẫn AI trích xuất chính xác câu hỏi, lời giải toán học (bao gồm hình ảnh và công thức MathType/OMML) từ file Word (.docx) và PDF, phục vụ xây dựng ngân hàng câu hỏi cho ứng dụng giáo dục.
---

# 📘 SKILL: TRÍCH XUẤT CÂU HỎI & CÔNG THỨC TOÁN HỌC TỪ DOCX/PDF

## 🎯 Mục tiêu

Trích xuất **chính xác** nội dung từ file Word (.docx) và PDF chứa câu hỏi toán học, bao gồm:
- **Văn bản** (đề bài, đáp án, lời giải)
- **Công thức toán học** (MathType OLE, OMML/Office Math, LaTeX)
- **Hình ảnh** (đồ thị, hình vẽ minh họa)

Đầu ra cuối cùng là **cấu trúc JSON chuẩn** cho ngân hàng câu hỏi của ứng dụng.

---

## 📋 TỔNG QUAN KIẾN TRÚC

```
┌─────────────────────────────────────────────────────────┐
│                    FILE ĐẦU VÀO                         │
│              (.docx / .pdf)                              │
└────────────┬──────────────────────┬─────────────────────┘
             │                      │
    ┌────────▼────────┐   ┌────────▼────────┐
    │  PIPELINE DOCX  │   │  PIPELINE PDF   │
    │                  │   │                  │
    │ 1. Giải nén ZIP  │   │ 1. Marker/P2T   │
    │ 2. Parse XML     │   │ 2. OCR + MFD    │
    │ 3. OMML→LaTeX    │   │ 3. MFR→LaTeX    │
    │ 4. MathType→LaTeX│   │ 4. Extract img  │
    │ 5. Extract images│   │                  │
    └────────┬────────┘   └────────┬────────┘
             │                      │
    ┌────────▼──────────────────────▼────────┐
    │         MARKDOWN + LaTeX + Images       │
    └────────────────────┬───────────────────┘
                         │
    ┌────────────────────▼───────────────────┐
    │     AI PARSER (Gemini/Claude/GPT)       │
    │  - Nhận diện cấu trúc câu hỏi          │
    │  - Phân loại: Trắc nghiệm / Tự luận    │
    │  - Tách: Đề bài / Đáp án / Lời giải    │
    │  - Gán metadata (chủ đề, độ khó,...)    │
    └────────────────────┬───────────────────┘
                         │
    ┌────────────────────▼───────────────────┐
    │       JSON NGÂN HÀNG CÂU HỎI           │
    │  (question_bank.json)                   │
    └────────────────────────────────────────┘
```

---

## 🔧 CÔNG CỤ & THƯ VIỆN ĐƯỢC SỬ DỤNG

### Bảng so sánh toàn diện

| Công cụ | Mục đích | Loại file | Công thức | Hình ảnh | Ngôn ngữ | License |
|---------|----------|-----------|-----------|----------|-----------|---------|
| **eqword2llm** | DOCX → Markdown+LaTeX | .docx | OMML ✅ | ❌ | Python | MIT |
| **docxlatex** | DOCX → Text+LaTeX | .docx | OMML ✅ | ❌ | Python | MIT |
| **MathTypeLib** | MathType DLL → LaTeX/MathML | .docx (OLE) | MathType ✅ | ❌ | Python+DLL | - |
| **WordToLaTeX-Converter** | MathType OLE → KaTeX | .docx (OLE) | MathType ✅ | ❌ | C#.NET | Proprietary |
| **Marker** | PDF/DOCX → Markdown | .pdf, .docx | ✅ (OCR+AI) | ✅ | Python | GPL |
| **Pix2Text (P2T)** | Image/PDF → Markdown+LaTeX | .pdf, image | ✅ (MFD+MFR) | ✅ | Python | Apache 2.0 |
| **PDF-Extract-Kit** | PDF → Structured data | .pdf | ✅ (MFD+MFR) | ✅ | Python | Apache 2.0 |
| **MinerU** | PDF/DOCX → Markdown/JSON | .pdf, .docx | ✅ | ✅ | Python | AGPL |

### 📌 Chiến lược kết hợp được đề xuất

#### Cho file DOCX:
```
Ưu tiên 1: eqword2llm (OMML → LaTeX, zero-dependency, LLM-ready)
Ưu tiên 2: docxlatex   (backup cho OMML đơn giản)
Ưu tiên 3: MathTypeLib (cho MathType OLE objects - cần Windows + MT6.dll)
Fallback:  Marker      (chuyển đổi toàn bộ DOCX → Markdown)
```

#### Cho file PDF:
```
Ưu tiên 1: Marker + --use_llm (chính xác nhất, hỗ trợ inline math)
Ưu tiên 2: Pix2Text           (open-source, hỗ trợ tiếng Việt)
Ưu tiên 3: PDF-Extract-Kit    (modular, tùy chỉnh cao)
```

---

## 📖 HƯỚNG DẪN CHI TIẾT TỪNG PIPELINE

### PIPELINE 1: TRÍCH XUẤT TỪ DOCX

#### Bước 1.1: Cài đặt dependencies

```bash
# Cài đặt eqword2llm (ưu tiên chính cho DOCX)
pip install eqword2llm

# Cài đặt docxlatex (backup)
pip install docxlatex

# Cài đặt python-docx (trích xuất hình ảnh)
pip install python-docx Pillow

# (Tùy chọn) Marker cho fallback
pip install marker-pdf[full]
```

#### Bước 1.2: Trích xuất văn bản + công thức OMML

```python
"""
Pipeline trích xuất DOCX sử dụng eqword2llm
- Chuyển đổi OMML equations → LaTeX
- Markdown output tối ưu cho LLM
"""
from eqword2llm import WordToMarkdownConverter

def extract_docx_with_eqword2llm(docx_path: str) -> dict:
    """Trích xuất nội dung DOCX với equations dạng LaTeX."""
    converter = WordToMarkdownConverter(docx_path)
    
    # Lấy markdown cơ bản
    markdown = converter.convert()
    
    # Lấy structured output với metadata
    result = converter.convert_structured()
    
    return {
        "markdown": markdown,
        "metadata": {
            "equation_count": result.metadata.equation_count,
            "equations": [
                {
                    "id": eq.id,
                    "latex": eq.latex,
                    "type": eq.type  # "inline" hoặc "block"
                }
                for eq in result.metadata.equations
            ]
        }
    }
```

#### Bước 1.3: Trích xuất hình ảnh từ DOCX

```python
"""
Trích xuất tất cả hình ảnh nhúng trong file DOCX.
File DOCX thực chất là ZIP chứa thư mục word/media/
"""
import zipfile
import os
from pathlib import Path

def extract_images_from_docx(docx_path: str, output_dir: str) -> list:
    """Trích xuất hình ảnh từ DOCX."""
    images = []
    os.makedirs(output_dir, exist_ok=True)
    
    with zipfile.ZipFile(docx_path, 'r') as z:
        for file_info in z.filelist:
            if file_info.filename.startswith('word/media/'):
                # Lấy tên file gốc
                img_name = os.path.basename(file_info.filename)
                output_path = os.path.join(output_dir, img_name)
                
                # Trích xuất
                with z.open(file_info) as src, open(output_path, 'wb') as dst:
                    dst.write(src.read())
                
                images.append({
                    "filename": img_name,
                    "path": output_path,
                    "original_path": file_info.filename,
                    "size_bytes": file_info.file_size
                })
    
    return images
```

#### Bước 1.4: Xử lý MathType OLE Objects (Windows only)

```python
"""
Xử lý MathType OLE Objects sử dụng MathTypeLib.
CHÚ Ý: Chỉ hoạt động trên Windows, cần MT6.dll
"""
import sys
import os

# Thêm đường dẫn MathTypeLib
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'references', 'MathTypeLib-main'))

from math_type import MathTypeLib, MTAPIConnectOptions, MTXFormSetTranslatorOptions
from ctypes import create_string_buffer

def convert_mathtype_to_latex(mtef_data: bytes) -> str:
    """Chuyển đổi MathType MTEF binary → LaTeX string."""
    mt = MathTypeLib()
    mt.LoadLibrary()
    
    # Kết nối API
    status = mt.APIConnect(MTAPIConnectOptions.mtinitLAUNCH_AS_NEEDED, 30)
    if status != 0:
        raise RuntimeError(f"Không thể kết nối MathType API: status={status}")
    
    try:
        # Reset transform options
        mt.MTXFormReset()
        
        # Đặt translator sang LaTeX
        mt.XFormSetTranslator(
            MTXFormSetTranslatorOptions.mtxfmTRANSL_INC_MTDEFAULT,
            b"LaTeX2e.tdl"
        )
        
        # Chuyển đổi MTEF → LaTeX
        dst_data = create_string_buffer(4096)
        result = mt.MTXFormEqn(
            -3,  # mtxfmLOCAL (source)
            4,   # mtxfmMTEF (source format)
            mtef_data,
            len(mtef_data),
            -3,  # mtxfmLOCAL (destination)
            7,   # mtxfmTEXT (destination format)
            dst_data,
            4096,
            None,
            None
        )
        
        if result == 0:
            return dst_data.value.decode('utf-8', errors='replace')
        else:
            return f"[MathType Error: {result}]"
    finally:
        mt.APIDisconnect()
```

#### Bước 1.5: Fallback - Sử dụng docxlatex

```python
"""
Fallback: Sử dụng docxlatex khi eqword2llm không đủ.
"""
from docxlatex import Document

def extract_with_docxlatex(docx_path: str) -> dict:
    """Trích xuất text + equations bằng docxlatex."""
    doc = Document(docx_path)
    text = doc.get_text()
    equations = doc.equations  # List of LaTeX strings
    
    return {
        "text": text,
        "equations": equations,
        "equation_count": len(equations)
    }
```

---

### PIPELINE 2: TRÍCH XUẤT TỪ PDF

#### Bước 2.1: Cài đặt dependencies

```bash
# Marker (ưu tiên chính cho PDF)
pip install marker-pdf[full]

# Hoặc Pix2Text (alternative)
pip install pix2text

# PyMuPDF cho trích xuất hình ảnh trực tiếp
pip install PyMuPDF
```

#### Bước 2.2: Sử dụng Marker (Khuyến nghị)

```python
"""
Pipeline trích xuất PDF sử dụng Marker.
- Hỗ trợ OCR tự động
- Chuyển đổi equations → LaTeX
- Trích xuất hình ảnh
- Hỗ trợ LLM mode cho độ chính xác cao nhất
"""
from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered
from marker.config.parser import ConfigParser

def extract_pdf_with_marker(
    pdf_path: str, 
    output_dir: str,
    use_llm: bool = False,
    gemini_api_key: str = None
) -> dict:
    """Trích xuất PDF với Marker."""
    
    config = {
        "output_format": "markdown",
        "force_ocr": True,  # Đảm bảo inline math được chuyển đổi
        "output_dir": output_dir,
    }
    
    if use_llm and gemini_api_key:
        config["use_llm"] = True
        config["gemini_api_key"] = gemini_api_key
        config["redo_inline_math"] = True  # Chất lượng inline math cao nhất
    
    config_parser = ConfigParser(config)
    
    converter = PdfConverter(
        config=config_parser.generate_config_dict(),
        artifact_dict=create_model_dict(),
        processor_list=config_parser.get_processors(),
        renderer=config_parser.get_renderer(),
        llm_service=config_parser.get_llm_service()
    )
    
    rendered = converter(pdf_path)
    text, metadata, images = text_from_rendered(rendered)
    
    # Lưu hình ảnh
    saved_images = []
    for img_name, img_data in images.items():
        img_path = os.path.join(output_dir, img_name)
        with open(img_path, 'wb') as f:
            f.write(img_data)
        saved_images.append({"filename": img_name, "path": img_path})
    
    return {
        "markdown": text,
        "metadata": metadata,
        "images": saved_images
    }
```

#### Bước 2.3: Trích xuất hình ảnh từ PDF bằng PyMuPDF

```python
"""
Trích xuất hình ảnh trực tiếp từ PDF sử dụng PyMuPDF (fitz).
"""
import fitz  # PyMuPDF

def extract_images_from_pdf(pdf_path: str, output_dir: str) -> list:
    """Trích xuất tất cả hình ảnh từ PDF."""
    os.makedirs(output_dir, exist_ok=True)
    images = []
    
    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            
            if pix.n < 5:  # RGB hoặc grayscale
                img_name = f"page{page_num+1}_img{img_index+1}.png"
            else:  # CMYK → chuyển sang RGB
                pix = fitz.Pixmap(fitz.csRGB, pix)
                img_name = f"page{page_num+1}_img{img_index+1}.png"
            
            img_path = os.path.join(output_dir, img_name)
            pix.save(img_path)
            
            images.append({
                "filename": img_name,
                "path": img_path,
                "page": page_num + 1,
                "index": img_index + 1
            })
    
    doc.close()
    return images
```

#### Bước 2.4: Alternative - Pix2Text (Open Source)

```python
"""
Pipeline trích xuất PDF sử dụng Pix2Text.
- Free & open source
- Hỗ trợ tiếng Việt
- Tích hợp MFD (Math Formula Detection) + MFR (Math Formula Recognition)
"""
from pix2text import Pix2Text

def extract_pdf_with_pix2text(pdf_path: str) -> dict:
    """Trích xuất PDF với Pix2Text."""
    p2t = Pix2Text.from_config()
    
    # Nhận diện toàn bộ PDF
    result = p2t.recognize_pdf(pdf_path)
    
    return {
        "markdown": result.to_markdown(),
        "pages": len(result.pages) if hasattr(result, 'pages') else 0
    }
```

---

### PIPELINE 3: AI PARSER - PHÂN TÍCH CẤU TRÚC CÂU HỎI

#### Bước 3.1: Prompt Template cho AI Parser

```python
"""
Prompt template để AI phân tích markdown thành cấu trúc câu hỏi.
Hỗ trợ: Gemini, Claude, GPT
"""

QUESTION_PARSER_PROMPT = """
Bạn là chuyên gia phân tích đề thi toán học. Hãy phân tích nội dung markdown sau 
và trích xuất thành cấu trúc JSON cho ngân hàng câu hỏi.

## QUY TẮC PHÂN TÍCH:

1. **Nhận diện câu hỏi**: 
   - Bắt đầu bằng: "Câu 1", "Bài 1", "Question 1", số thứ tự, v.v.
   - Phân biệt trắc nghiệm (có A, B, C, D) và tự luận

2. **Công thức toán học**:
   - Giữ nguyên LaTeX: `$...$` (inline) và `$$...$$` (block)
   - KHÔNG chuyển đổi sang text thuần

3. **Hình ảnh**:
   - Ghi nhận đường dẫn hình ảnh liên kết
   - Format: `![caption](path/to/image.png)`

4. **Metadata**:
   - Chủ đề/chương (nếu có)
   - Lớp/cấp độ (nếu có)  
   - Độ khó: Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao

## FORMAT ĐẦU RA (JSON):

```json
{
  "source_file": "<tên file gốc>",
  "total_questions": <số lượng>,
  "questions": [
    {
      "id": "Q001",
      "type": "multiple_choice" | "essay",
      "content": "<nội dung đề bài, giữ nguyên LaTeX>",
      "options": {
        "A": "<đáp án A>",
        "B": "<đáp án B>",
        "C": "<đáp án C>",
        "D": "<đáp án D>"
      },
      "correct_answer": "A" | "B" | "C" | "D",
      "solution": "<lời giải chi tiết, giữ nguyên LaTeX>",
      "images": ["path/to/image1.png"],
      "metadata": {
        "subject": "Toán học",
        "grade": "12",
        "topic": "Tích phân",
        "subtopic": "Nguyên hàm",
        "difficulty": "Thông hiểu",
        "tags": ["tích phân", "nguyên hàm", "đổi biến"]
      }
    }
  ]
}
```

## NỘI DUNG MARKDOWN CẦN PHÂN TÍCH:

{markdown_content}
"""

def parse_questions_with_ai(
    markdown_content: str,
    source_filename: str,
    ai_client,
    model: str = "gemini-2.0-flash"
) -> dict:
    """Sử dụng AI để phân tích markdown thành cấu trúc câu hỏi."""
    
    prompt = QUESTION_PARSER_PROMPT.replace("{markdown_content}", markdown_content)
    
    # Gọi API (ví dụ với Gemini)
    response = ai_client.generate_content(prompt)
    
    # Parse JSON từ response
    import json
    import re
    
    # Tìm JSON block trong response
    json_match = re.search(r'```json\s*(.*?)\s*```', response.text, re.DOTALL)
    if json_match:
        result = json.loads(json_match.group(1))
    else:
        result = json.loads(response.text)
    
    result["source_file"] = source_filename
    return result
```

---

### PIPELINE 4: TỔNG HỢP - FULL PIPELINE

```python
"""
Full pipeline: File đầu vào → JSON ngân hàng câu hỏi
"""
import os
import json
from pathlib import Path

def full_extraction_pipeline(
    file_path: str,
    output_dir: str,
    ai_client=None,
    use_llm_for_pdf: bool = False,
    gemini_api_key: str = None
) -> dict:
    """
    Pipeline hoàn chỉnh trích xuất câu hỏi toán học.
    
    Args:
        file_path: Đường dẫn file .docx hoặc .pdf
        output_dir: Thư mục đầu ra
        ai_client: Client API cho AI parser
        use_llm_for_pdf: Sử dụng LLM mode cho Marker (PDF)
        gemini_api_key: API key cho Gemini (nếu dùng LLM mode)
    
    Returns:
        dict: Ngân hàng câu hỏi dạng JSON
    """
    os.makedirs(output_dir, exist_ok=True)
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    file_ext = Path(file_path).suffix.lower()
    filename = Path(file_path).name
    
    # ===== BƯỚC 1: TRÍCH XUẤT NỘI DUNG =====
    
    if file_ext == '.docx':
        # Pipeline DOCX
        print(f"📄 Đang xử lý DOCX: {filename}")
        
        # 1a. Trích xuất text + equations
        try:
            result = extract_docx_with_eqword2llm(file_path)
            markdown = result["markdown"]
            print(f"  ✅ eqword2llm: {result['metadata']['equation_count']} công thức")
        except Exception as e:
            print(f"  ⚠️ eqword2llm thất bại: {e}, thử docxlatex...")
            result = extract_with_docxlatex(file_path)
            markdown = result["text"]
            print(f"  ✅ docxlatex: {result['equation_count']} công thức")
        
        # 1b. Trích xuất hình ảnh
        images = extract_images_from_docx(file_path, images_dir)
        print(f"  🖼️ Trích xuất {len(images)} hình ảnh")
        
    elif file_ext == '.pdf':
        # Pipeline PDF
        print(f"📄 Đang xử lý PDF: {filename}")
        
        try:
            result = extract_pdf_with_marker(
                file_path, output_dir,
                use_llm=use_llm_for_pdf,
                gemini_api_key=gemini_api_key
            )
            markdown = result["markdown"]
            images = result["images"]
            print(f"  ✅ Marker: Trích xuất thành công")
        except Exception as e:
            print(f"  ⚠️ Marker thất bại: {e}, thử Pix2Text...")
            result = extract_pdf_with_pix2text(file_path)
            markdown = result["markdown"]
            images = extract_images_from_pdf(file_path, images_dir)
        
        print(f"  🖼️ {len(images)} hình ảnh")
    else:
        raise ValueError(f"Định dạng file không được hỗ trợ: {file_ext}")
    
    # ===== BƯỚC 2: LƯU MARKDOWN TRUNG GIAN =====
    
    md_path = os.path.join(output_dir, f"{Path(filename).stem}_extracted.md")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(markdown)
    print(f"  💾 Lưu markdown: {md_path}")
    
    # ===== BƯỚC 3: PHÂN TÍCH CẤU TRÚC CÂU HỎI =====
    
    if ai_client:
        print("  🤖 Đang phân tích cấu trúc câu hỏi bằng AI...")
        question_bank = parse_questions_with_ai(markdown, filename, ai_client)
    else:
        # Không có AI → trả về markdown thô
        question_bank = {
            "source_file": filename,
            "raw_markdown": markdown,
            "images": images,
            "note": "Cần AI parser để phân tích cấu trúc câu hỏi"
        }
    
    # ===== BƯỚC 4: LƯU KẾT QUẢ =====
    
    json_path = os.path.join(output_dir, f"{Path(filename).stem}_questions.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(question_bank, f, ensure_ascii=False, indent=2)
    print(f"  ✅ Lưu ngân hàng câu hỏi: {json_path}")
    
    return question_bank
```

---

## 🗂️ CẤU TRÚC OUTPUT JSON CHO NGÂN HÀNG CÂU HỎI

### Schema chi tiết

```json
{
  "$schema": "question_bank_v1.0",
  "source_file": "de_thi_toan_12_hk1.docx",
  "extraction_date": "2026-04-07T11:00:00+07:00",
  "total_questions": 40,
  "summary": {
    "multiple_choice": 35,
    "essay": 5,
    "with_images": 8,
    "topics": ["Hàm số", "Tích phân", "Hình học không gian"]
  },
  "questions": [
    {
      "id": "Q001",
      "type": "multiple_choice",
      "content": "Tìm nguyên hàm của hàm số $f(x) = 2x + 3$.",
      "content_html": "<p>Tìm nguyên hàm của hàm số <math>f(x) = 2x + 3</math>.</p>",
      "options": {
        "A": "$x^2 + 3x + C$",
        "B": "$x^2 + 3 + C$",
        "C": "$2x^2 + 3x + C$",
        "D": "$x^2 + 3x$"
      },
      "correct_answer": "A",
      "solution": "Ta có: $\\int (2x + 3) dx = x^2 + 3x + C$",
      "images": [],
      "metadata": {
        "subject": "Toán học",
        "grade": "12",
        "topic": "Nguyên hàm - Tích phân",
        "subtopic": "Nguyên hàm cơ bản",
        "difficulty": "Nhận biết",
        "bloom_level": 1,
        "tags": ["nguyên hàm", "tích phân", "cơ bản"],
        "exam_source": "Đề thi HK1 2024-2025"
      }
    },
    {
      "id": "Q002",
      "type": "essay",
      "content": "Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = a\\sqrt{2}$.\n\n![Hình chóp SABCD](images/page2_img1.png)\n\na) Chứng minh $BD \\perp SC$.\nb) Tính khoảng cách từ $A$ đến mặt phẳng $(SBD)$.",
      "options": null,
      "correct_answer": null,
      "solution": "a) Ta có $BD \\perp AC$ (tính chất hình vuông)...\n\nb) Gọi $H$ là hình chiếu...\n$$d(A, (SBD)) = \\frac{3V_{S.ABD}}{S_{\\triangle SBD}} = \\frac{a\\sqrt{6}}{3}$$",
      "images": ["images/page2_img1.png"],
      "metadata": {
        "subject": "Toán học",
        "grade": "12",
        "topic": "Hình học không gian",
        "subtopic": "Khoảng cách",
        "difficulty": "Vận dụng",
        "bloom_level": 3,
        "tags": ["hình chóp", "khoảng cách", "mặt phẳng"],
        "sub_questions": ["a", "b"],
        "points": 1.0
      }
    }
  ]
}
```

---

## ⚠️ XỬ LÝ CÁC TRƯỜNG HỢP ĐẶC BIỆT

### 1. MathType OLE Objects trong DOCX

Khi file DOCX chứa công thức MathType (OLE object), eqword2llm **KHÔNG** trích xuất được.

**Cách kiểm tra:**
```python
import zipfile
import os

def check_mathtype_ole(docx_path: str) -> bool:
    """Kiểm tra file DOCX có chứa MathType OLE objects không."""
    with zipfile.ZipFile(docx_path, 'r') as z:
        for name in z.namelist():
            if name.startswith('word/embeddings/') and name.endswith('.bin'):
                # Đọc header để kiểm tra MathType signature
                with z.open(name) as f:
                    header = f.read(100)
                    if b'Equation' in header or b'MathType' in header:
                        return True
    return False
```

**Giải pháp theo thứ tự ưu tiên:**
1. **MathTypeLib + MT6.dll** (Windows only) - xem Bước 1.4
2. **Chuyển đổi thủ công trong Word**: Mở file → chọn tất cả → Convert to OMML
3. **Screenshot + Pix2Text**: Chụp ảnh công thức → OCR
4. **Marker fallback**: Hỗ trợ đọc DOCX bằng OCR

### 2. PDF dạng scan (ảnh)

```python
# Marker với force_ocr
config = {"force_ocr": True, "use_llm": True}
```

### 3. Công thức inline vs block

```python
import re

def classify_equations(markdown: str) -> dict:
    """Phân loại công thức inline và block."""
    inline = re.findall(r'(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)', markdown)
    block = re.findall(r'\$\$(.*?)\$\$', markdown, re.DOTALL)
    
    return {
        "inline_count": len(inline),
        "block_count": len(block),
        "inline_equations": inline,
        "block_equations": block
    }
```

---

## 📁 CẤU TRÚC THƯ MỤC SKILL

```
SKILL_TRICH_XUAT_TOAN_HOC/
├── SKILL.md                          ← File này (hướng dẫn chính)
├── scripts/
│   ├── extract_docx.py               ← Pipeline trích xuất DOCX
│   ├── extract_pdf.py                ← Pipeline trích xuất PDF
│   ├── parse_questions.py            ← AI parser cho câu hỏi
│   ├── full_pipeline.py              ← Pipeline hoàn chỉnh
│   └── utils.py                      ← Tiện ích chung
├── examples/
│   ├── sample_output.json            ← Ví dụ output JSON
│   └── prompt_templates/
│       ├── question_parser.md        ← Prompt phân tích câu hỏi
│       └── metadata_classifier.md    ← Prompt phân loại metadata
├── references/
│   ├── MathTypeLib-main/             ← Thư viện MathType DLL
│   ├── WordToLaTeX-Converter-main/   ← C# converter (tham khảo)
│   ├── docxlatex-main/               ← Thư viện docxlatex
│   ├── eqword2llm-main/             ← Công cụ eqword2llm
│   └── marker-master/               ← Marker PDF converter
└── data/
    ├── schema/
    │   └── question_bank_schema.json ← JSON Schema cho ngân hàng câu hỏi
    └── mappings/
        ├── math_topics_vi.json       ← Danh sách chủ đề toán (tiếng Việt)
        └── difficulty_levels.json    ← Bảng mức độ khó
```

---

## 🚀 HƯỚNG DẪN SỬ DỤNG NHANH

### Bước 1: Cài đặt

```bash
pip install eqword2llm docxlatex python-docx marker-pdf[full] PyMuPDF Pillow
```

### Bước 2: Chạy pipeline

```python
# Trích xuất từ DOCX
result = full_extraction_pipeline(
    file_path="de_thi_toan_12.docx",
    output_dir="./output/de_thi_toan_12",
    ai_client=gemini_client  # hoặc None nếu chỉ cần markdown
)

# Trích xuất từ PDF  
result = full_extraction_pipeline(
    file_path="de_thi_toan_12.pdf",
    output_dir="./output/de_thi_toan_12",
    ai_client=gemini_client,
    use_llm_for_pdf=True,
    gemini_api_key="YOUR_API_KEY"
)
```

### Bước 3: Sử dụng kết quả

```python
import json

with open("./output/de_thi_toan_12/de_thi_toan_12_questions.json", 'r', encoding='utf-8') as f:
    bank = json.load(f)

print(f"Tổng số câu hỏi: {bank['total_questions']}")
for q in bank['questions']:
    print(f"  {q['id']}: {q['content'][:50]}...")
```

---

## 📌 LƯU Ý QUAN TRỌNG

1. **eqword2llm** chỉ hỗ trợ **OMML** (Office Math), KHÔNG hỗ trợ MathType OLE
2. **MathTypeLib** cần **Windows** + **MT6.dll** + MathType đã cài đặt
3. **Marker** với `--use_llm` cho kết quả tốt nhất nhưng cần API key Gemini
4. **Pix2Text** là lựa chọn open-source tốt, hỗ trợ **tiếng Việt**
5. Luôn **kiểm tra thủ công** một số câu hỏi đầu tiên để đảm bảo chất lượng
6. Với file DOCX cũ (MathType), nên **convert sang OMML** trong Word trước khi xử lý
