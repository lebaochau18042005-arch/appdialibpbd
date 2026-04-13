"""Tiện ích chung cho pipeline trích xuất."""
import re, os
from pathlib import Path

def classify_equations(markdown: str) -> dict:
    """Phân loại công thức inline và block trong markdown."""
    inline = re.findall(r'(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)', markdown)
    block = re.findall(r'\$\$(.*?)\$\$', markdown, re.DOTALL)
    return {"inline_count":len(inline),"block_count":len(block),
            "inline":inline,"block":block,"total":len(inline)+len(block)}

def detect_question_pattern(text: str) -> str:
    """Nhận diện mẫu đánh số câu hỏi."""
    patterns = [
        (r'Câu\s+\d+', 'vietnam_cau'),
        (r'Bài\s+\d+', 'vietnam_bai'),
        (r'Question\s+\d+', 'english'),
        (r'\d+\.\s', 'numbered'),
        (r'[IVX]+\.\s', 'roman'),
    ]
    for pat, name in patterns:
        if re.search(pat, text): return name
    return 'unknown'

def split_by_questions(markdown: str) -> list:
    """Tách markdown thành các câu hỏi riêng lẻ."""
    pattern = detect_question_pattern(markdown)
    splitters = {
        'vietnam_cau': r'(?=Câu\s+\d+)',
        'vietnam_bai': r'(?=Bài\s+\d+)',
        'english': r'(?=Question\s+\d+)',
        'numbered': r'(?=\n\d+\.\s)',
        'roman': r'(?=\n[IVX]+\.\s)',
    }
    if pattern == 'unknown': return [markdown]
    parts = re.split(splitters.get(pattern, r'\n\n'), markdown)
    return [p.strip() for p in parts if p.strip()]

def is_multiple_choice(text: str) -> bool:
    """Kiểm tra câu hỏi có phải trắc nghiệm không."""
    return bool(re.search(r'[A-D]\s*[.):]\s*', text))

def ensure_dir(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return path

def safe_filename(name: str) -> str:
    return re.sub(r'[^\w\-.]', '_', name)
