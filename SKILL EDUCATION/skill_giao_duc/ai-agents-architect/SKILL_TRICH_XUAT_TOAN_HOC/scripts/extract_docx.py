"""
📄 Pipeline Trích Xuất Nội Dung từ File DOCX
==============================================
Trích xuất văn bản, công thức toán học (OMML/MathType), và hình ảnh
từ file Word (.docx) phục vụ xây dựng ngân hàng câu hỏi.

Supports:
- OMML equations → LaTeX (via eqword2llm / docxlatex)
- MathType OLE → LaTeX (via MathTypeLib, Windows only)
- Embedded images → PNG/JPEG files
- Text content → Markdown

Usage:
    python extract_docx.py --input "de_thi.docx" --output "./output/"
"""

import os
import sys
import json
import zipfile
import argparse
import re
from pathlib import Path
from typing import Optional


# ============================================================
# 1. TRÍCH XUẤT BẰNG eqword2llm (ƯU TIÊN CHÍNH)
# ============================================================

def extract_with_eqword2llm(docx_path: str) -> dict:
    """
    Trích xuất nội dung DOCX sử dụng eqword2llm.
    Chuyển đổi OMML equations → LaTeX, output Markdown.
    
    Args:
        docx_path: Đường dẫn đến file .docx
        
    Returns:
        dict với keys: markdown, metadata, equations
    """
    try:
        from eqword2llm import WordToMarkdownConverter
    except ImportError:
        raise ImportError(
            "Cần cài đặt eqword2llm: pip install eqword2llm"
        )
    
    converter = WordToMarkdownConverter(docx_path)
    
    # Lấy markdown cơ bản
    markdown = converter.convert()
    
    # Lấy structured output với metadata
    result = converter.convert_structured()
    
    equations = []
    if hasattr(result, 'metadata') and hasattr(result.metadata, 'equations'):
        for eq in result.metadata.equations:
            equations.append({
                "id": getattr(eq, 'id', None),
                "latex": getattr(eq, 'latex', ''),
                "type": getattr(eq, 'type', 'unknown')  # inline or block
            })
    
    return {
        "markdown": markdown,
        "method": "eqword2llm",
        "metadata": {
            "equation_count": len(equations),
        },
        "equations": equations
    }


# ============================================================
# 2. TRÍCH XUẤT BẰNG docxlatex (BACKUP)
# ============================================================

def extract_with_docxlatex(docx_path: str) -> dict:
    """
    Trích xuất nội dung DOCX sử dụng docxlatex.
    Nhẹ hơn eqword2llm, tốt cho trường hợp đơn giản.
    
    Args:
        docx_path: Đường dẫn đến file .docx
        
    Returns:
        dict với keys: text, equations, equation_count
    """
    try:
        from docxlatex import Document
    except ImportError:
        raise ImportError(
            "Cần cài đặt docxlatex: pip install docxlatex"
        )
    
    doc = Document(docx_path)
    text = doc.get_text()
    equations = doc.equations  # List of LaTeX strings
    
    return {
        "markdown": text,
        "method": "docxlatex",
        "metadata": {
            "equation_count": len(equations),
        },
        "equations": [
            {"id": i + 1, "latex": eq, "type": "unknown"}
            for i, eq in enumerate(equations)
        ]
    }


# ============================================================
# 3. TRÍCH XUẤT HÌNH ẢNH TỪ DOCX
# ============================================================

def extract_images_from_docx(docx_path: str, output_dir: str) -> list:
    """
    Trích xuất tất cả hình ảnh nhúng trong file DOCX.
    File DOCX thực chất là một file ZIP chứa thư mục word/media/.
    
    Args:
        docx_path: Đường dẫn đến file .docx
        output_dir: Thư mục lưu hình ảnh
        
    Returns:
        list of dict: Thông tin các hình ảnh đã trích xuất
    """
    images = []
    os.makedirs(output_dir, exist_ok=True)
    
    with zipfile.ZipFile(docx_path, 'r') as z:
        for file_info in z.filelist:
            if file_info.filename.startswith('word/media/'):
                img_name = os.path.basename(file_info.filename)
                if not img_name:
                    continue
                    
                output_path = os.path.join(output_dir, img_name)
                
                with z.open(file_info) as src, open(output_path, 'wb') as dst:
                    dst.write(src.read())
                
                # Xác định loại hình ảnh
                ext = Path(img_name).suffix.lower()
                img_type = {
                    '.png': 'PNG', '.jpg': 'JPEG', '.jpeg': 'JPEG',
                    '.gif': 'GIF', '.bmp': 'BMP', '.tiff': 'TIFF',
                    '.emf': 'EMF', '.wmf': 'WMF', '.svg': 'SVG'
                }.get(ext, 'UNKNOWN')
                
                images.append({
                    "filename": img_name,
                    "path": output_path,
                    "original_path": file_info.filename,
                    "size_bytes": file_info.file_size,
                    "type": img_type
                })
    
    return images


# ============================================================
# 4. KIỂM TRA MATHTYPE OLE OBJECTS
# ============================================================

def check_mathtype_ole(docx_path: str) -> dict:
    """
    Kiểm tra file DOCX có chứa MathType OLE objects không.
    
    Args:
        docx_path: Đường dẫn đến file .docx
        
    Returns:
        dict: Kết quả kiểm tra
    """
    ole_objects = []
    has_omml = False
    
    with zipfile.ZipFile(docx_path, 'r') as z:
        # Kiểm tra OLE embeddings
        for name in z.namelist():
            if name.startswith('word/embeddings/'):
                with z.open(name) as f:
                    header = f.read(200)
                    is_mathtype = (
                        b'Equation' in header or 
                        b'MathType' in header or
                        b'DSMT' in header
                    )
                    ole_objects.append({
                        "filename": name,
                        "is_mathtype": is_mathtype,
                        "header_preview": header[:50].hex()
                    })
        
        # Kiểm tra OMML trong document.xml
        if 'word/document.xml' in z.namelist():
            with z.open('word/document.xml') as f:
                content = f.read().decode('utf-8', errors='replace')
                has_omml = 'm:oMath' in content or 'm:oMathPara' in content
    
    mathtype_count = sum(1 for obj in ole_objects if obj['is_mathtype'])
    
    return {
        "has_omml": has_omml,
        "has_mathtype_ole": mathtype_count > 0,
        "mathtype_ole_count": mathtype_count,
        "total_ole_objects": len(ole_objects),
        "ole_details": ole_objects,
        "recommendation": _get_recommendation(has_omml, mathtype_count)
    }


def _get_recommendation(has_omml: bool, mathtype_count: int) -> str:
    """Đề xuất phương pháp trích xuất."""
    if has_omml and mathtype_count == 0:
        return "Sử dụng eqword2llm (OMML only) - phương pháp tốt nhất"
    elif has_omml and mathtype_count > 0:
        return (
            "File chứa cả OMML và MathType OLE. "
            "Sử dụng eqword2llm + MathTypeLib, "
            "hoặc convert MathType→OMML trong Word trước."
        )
    elif mathtype_count > 0:
        return (
            f"File chứa {mathtype_count} MathType OLE objects. "
            "Cần MathTypeLib (Windows) hoặc convert sang OMML trong Word."
        )
    else:
        return "Không phát hiện công thức toán học. Kiểm tra lại file."


# ============================================================
# 5. TRÍCH XUẤT MATHTYPE OLE (WINDOWS ONLY)
# ============================================================

def extract_mathtype_ole(docx_path: str) -> list:
    """
    Trích xuất MathType OLE objects và chuyển sang LaTeX.
    CHÚ Ý: Chỉ hoạt động trên Windows với MathType đã cài đặt.
    
    Args:
        docx_path: Đường dẫn đến file .docx
        
    Returns:
        list: Danh sách công thức LaTeX
    """
    if sys.platform != 'win32':
        print("⚠️ MathType extraction chỉ hỗ trợ trên Windows")
        return []
    
    try:
        # Thử import MathTypeLib
        references_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'references', 'MathTypeLib-main'
        )
        if references_dir not in sys.path:
            sys.path.insert(0, references_dir)
        
        from math_type import (
            MathTypeLib, MTAPIConnectOptions, 
            MTXFormSetTranslatorOptions, MTEFData
        )
        from ctypes import create_string_buffer
    except ImportError as e:
        print(f"⚠️ Không thể import MathTypeLib: {e}")
        return []
    
    equations = []
    
    # Đọc OLE objects từ DOCX
    with zipfile.ZipFile(docx_path, 'r') as z:
        for name in z.namelist():
            if not name.startswith('word/embeddings/'):
                continue
                
            with z.open(name) as f:
                data = f.read()
                
            # Kiểm tra MathType signature
            if b'DSMT' not in data and b'Equation' not in data:
                continue
            
            try:
                # Extract MTEF data
                mtef = MTEFData.fromWmf(data)
                
                # Initialize MathType
                mt = MathTypeLib()
                mt.LoadLibrary()
                status = mt.APIConnect(
                    MTAPIConnectOptions.mtinitLAUNCH_AS_NEEDED, 30
                )
                
                if status != 0:
                    print(f"⚠️ MathType API connect failed: {status}")
                    continue
                
                try:
                    mt.MTXFormReset()
                    mt.XFormSetTranslator(
                        MTXFormSetTranslatorOptions.mtxfmTRANSL_INC_MTDEFAULT,
                        b"LaTeX2e.tdl"
                    )
                    
                    mtef_bytes = mtef.getBytes()
                    dst = create_string_buffer(8192)
                    
                    result = mt.MTXFormEqn(
                        -3, 4, mtef_bytes, len(mtef_bytes),
                        -3, 7, dst, 8192, None, None
                    )
                    
                    if result == 0:
                        latex = dst.value.decode('utf-8', errors='replace')
                        equations.append({
                            "source": name,
                            "latex": latex.strip(),
                            "method": "MathTypeLib"
                        })
                finally:
                    mt.APIDisconnect()
                    
            except Exception as e:
                print(f"⚠️ Lỗi xử lý {name}: {e}")
    
    return equations


# ============================================================
# 6. PIPELINE TỔNG HỢP DOCX
# ============================================================

def extract_docx_full(
    docx_path: str,
    output_dir: str,
    try_mathtype: bool = True
) -> dict:
    """
    Pipeline đầy đủ trích xuất từ DOCX.
    
    Args:
        docx_path: Đường dẫn file .docx
        output_dir: Thư mục đầu ra
        try_mathtype: Thử trích xuất MathType OLE
        
    Returns:
        dict: Kết quả trích xuất hoàn chỉnh
    """
    os.makedirs(output_dir, exist_ok=True)
    images_dir = os.path.join(output_dir, "images")
    
    filename = Path(docx_path).name
    print(f"\n{'='*60}")
    print(f"📄 TRÍCH XUẤT DOCX: {filename}")
    print(f"{'='*60}")
    
    # Bước 1: Kiểm tra loại công thức
    print("\n🔍 Bước 1: Kiểm tra loại công thức...")
    check = check_mathtype_ole(docx_path)
    print(f"  - OMML: {'✅ Có' if check['has_omml'] else '❌ Không'}")
    print(f"  - MathType OLE: {'✅ ' + str(check['mathtype_ole_count']) + ' objects' if check['has_mathtype_ole'] else '❌ Không'}")
    print(f"  💡 {check['recommendation']}")
    
    # Bước 2: Trích xuất văn bản + công thức
    print("\n📝 Bước 2: Trích xuất văn bản + công thức...")
    extraction_result = None
    
    # Thử eqword2llm
    try:
        extraction_result = extract_with_eqword2llm(docx_path)
        print(f"  ✅ eqword2llm: {extraction_result['metadata']['equation_count']} công thức OMML")
    except Exception as e:
        print(f"  ⚠️ eqword2llm thất bại: {e}")
    
    # Fallback sang docxlatex
    if extraction_result is None:
        try:
            extraction_result = extract_with_docxlatex(docx_path)
            print(f"  ✅ docxlatex: {extraction_result['metadata']['equation_count']} công thức")
        except Exception as e:
            print(f"  ⚠️ docxlatex thất bại: {e}")
    
    # Fallback cuối: đọc XML raw
    if extraction_result is None:
        print("  ⚠️ Tất cả phương pháp thất bại. Thử đọc XML raw...")
        extraction_result = _extract_raw_text(docx_path)
    
    # Bước 3: Trích xuất MathType OLE (nếu có)
    mathtype_equations = []
    if try_mathtype and check['has_mathtype_ole']:
        print("\n🧮 Bước 3: Trích xuất MathType OLE...")
        mathtype_equations = extract_mathtype_ole(docx_path)
        print(f"  {'✅' if mathtype_equations else '⚠️'} "
              f"Trích xuất {len(mathtype_equations)} công thức MathType")
    
    # Bước 4: Trích xuất hình ảnh
    print("\n🖼️ Bước 4: Trích xuất hình ảnh...")
    images = extract_images_from_docx(docx_path, images_dir)
    print(f"  📸 {len(images)} hình ảnh trích xuất")
    
    # Bước 5: Tổng hợp kết quả
    print("\n📦 Bước 5: Tổng hợp kết quả...")
    
    # Lưu markdown
    md_path = os.path.join(output_dir, f"{Path(filename).stem}_extracted.md")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(extraction_result['markdown'])
    
    result = {
        "source_file": filename,
        "source_path": str(Path(docx_path).resolve()),
        "output_dir": str(Path(output_dir).resolve()),
        "extraction_method": extraction_result['method'],
        "markdown_file": md_path,
        "markdown": extraction_result['markdown'],
        "equations": {
            "omml": extraction_result['equations'],
            "mathtype": mathtype_equations,
            "total": len(extraction_result['equations']) + len(mathtype_equations)
        },
        "images": images,
        "analysis": check
    }
    
    # Lưu metadata JSON
    meta_path = os.path.join(output_dir, f"{Path(filename).stem}_metadata.json")
    meta_copy = {k: v for k, v in result.items() if k != 'markdown'}
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(meta_copy, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ HOÀN THÀNH!")
    print(f"  📄 Markdown: {md_path}")
    print(f"  📊 Metadata: {meta_path}")
    print(f"  🧮 Tổng công thức: {result['equations']['total']}")
    print(f"  🖼️ Tổng hình ảnh: {len(images)}")
    
    return result


def _extract_raw_text(docx_path: str) -> dict:
    """Fallback: đọc raw text từ document.xml."""
    text_parts = []
    
    with zipfile.ZipFile(docx_path, 'r') as z:
        if 'word/document.xml' in z.namelist():
            with z.open('word/document.xml') as f:
                content = f.read().decode('utf-8', errors='replace')
                # Loại bỏ XML tags, giữ text
                text = re.sub(r'<[^>]+>', ' ', content)
                text = re.sub(r'\s+', ' ', text).strip()
                text_parts.append(text)
    
    return {
        "markdown": '\n'.join(text_parts),
        "method": "raw_xml",
        "metadata": {"equation_count": 0},
        "equations": []
    }


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="Trích xuất nội dung toán học từ file DOCX"
    )
    parser.add_argument(
        "--input", "-i", required=True,
        help="Đường dẫn file .docx đầu vào"
    )
    parser.add_argument(
        "--output", "-o", default="./output",
        help="Thư mục đầu ra (mặc định: ./output)"
    )
    parser.add_argument(
        "--no-mathtype", action="store_true",
        help="Không thử trích xuất MathType OLE"
    )
    parser.add_argument(
        "--check-only", action="store_true",
        help="Chỉ kiểm tra loại công thức, không trích xuất"
    )
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"❌ File không tồn tại: {args.input}")
        sys.exit(1)
    
    if args.check_only:
        result = check_mathtype_ole(args.input)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        extract_docx_full(
            args.input,
            args.output,
            try_mathtype=not args.no_mathtype
        )


if __name__ == "__main__":
    main()
