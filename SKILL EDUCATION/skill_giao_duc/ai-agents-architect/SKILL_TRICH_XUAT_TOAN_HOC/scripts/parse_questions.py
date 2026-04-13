"""
AI Parser - Phân tích markdown thành cấu trúc câu hỏi cho ngân hàng đề thi.
Hỗ trợ: Gemini, Claude, GPT
Usage: python parse_questions.py --input "extracted.md" --output "questions.json"
"""
import os, json, re, argparse
from pathlib import Path
from typing import Optional

QUESTION_PARSER_PROMPT = """
Bạn là chuyên gia phân tích đề thi toán học Việt Nam. Hãy phân tích nội dung markdown sau
và trích xuất thành cấu trúc JSON cho ngân hàng câu hỏi.

## QUY TẮC:
1. Nhận diện câu hỏi: "Câu 1", "Bài 1", "Question 1", số thứ tự...
2. Phân biệt: trắc nghiệm (có A,B,C,D) và tự luận
3. Giữ nguyên LaTeX: $...$ (inline) và $$...$$ (block)
4. Ghi nhận hình ảnh: ![caption](path)
5. Phân loại metadata: chủ đề, lớp, độ khó

## FORMAT JSON:
```json
{
  "source_file": "<tên file>",
  "total_questions": <số>,
  "questions": [
    {
      "id": "Q001",
      "type": "multiple_choice|essay",
      "content": "<đề bài giữ nguyên LaTeX>",
      "options": {"A":"...","B":"...","C":"...","D":"..."},
      "correct_answer": "A|B|C|D|null",
      "solution": "<lời giải>",
      "images": ["path/to/img.png"],
      "metadata": {
        "subject": "Toán học",
        "grade": "12",
        "topic": "Tích phân",
        "difficulty": "Nhận biết|Thông hiểu|Vận dụng|Vận dụng cao",
        "tags": ["tag1","tag2"]
      }
    }
  ]
}
```

## NỘI DUNG CẦN PHÂN TÍCH:
{markdown_content}
"""

def parse_with_gemini(markdown: str, source: str, api_key: str, model="gemini-2.0-flash"):
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    m = genai.GenerativeModel(model)
    prompt = QUESTION_PARSER_PROMPT.replace("{markdown_content}", markdown)
    resp = m.generate_content(prompt)
    return _extract_json(resp.text, source)

def parse_with_claude(markdown: str, source: str, api_key: str, model="claude-sonnet-4-20250514"):
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    prompt = QUESTION_PARSER_PROMPT.replace("{markdown_content}", markdown)
    resp = client.messages.create(model=model, max_tokens=8192,
        messages=[{"role":"user","content":prompt}])
    return _extract_json(resp.content[0].text, source)

def parse_with_openai(markdown: str, source: str, api_key: str, model="gpt-4o"):
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    prompt = QUESTION_PARSER_PROMPT.replace("{markdown_content}", markdown)
    resp = client.chat.completions.create(model=model, messages=[{"role":"user","content":prompt}])
    return _extract_json(resp.choices[0].message.content, source)

def _extract_json(text: str, source: str) -> dict:
    """Trích xuất JSON từ response AI."""
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
    if match:
        result = json.loads(match.group(1))
    else:
        # Thử parse trực tiếp
        start = text.find('{')
        end = text.rfind('}') + 1
        if start >= 0 and end > start:
            result = json.loads(text[start:end])
        else:
            result = {"raw_response": text, "error": "Cannot parse JSON"}
    result["source_file"] = source
    return result

def parse_questions(markdown_path: str, output_path: str, provider="gemini", api_key=None):
    """Parse markdown file thành question bank JSON."""
    md = open(markdown_path, 'r', encoding='utf-8').read()
    source = Path(markdown_path).name
    
    if not api_key:
        api_key = os.environ.get({
            "gemini": "GOOGLE_API_KEY",
            "claude": "ANTHROPIC_API_KEY",
            "openai": "OPENAI_API_KEY"
        }.get(provider, "API_KEY"))
    
    if not api_key:
        print(f"❌ Cần API key cho {provider}")
        return None
    
    print(f"🤖 Parsing với {provider}...")
    parsers = {"gemini": parse_with_gemini, "claude": parse_with_claude, "openai": parse_with_openai}
    result = parsers[provider](md, source, api_key)
    
    json.dump(result, open(output_path,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
    q_count = result.get('total_questions', len(result.get('questions',[])))
    print(f"✅ {q_count} câu hỏi → {output_path}")
    return result

if __name__=="__main__":
    ap=argparse.ArgumentParser(description="Parse markdown thành question bank")
    ap.add_argument("--input","-i",required=True, help="File markdown đầu vào")
    ap.add_argument("--output","-o",default="questions.json")
    ap.add_argument("--provider","-p",choices=["gemini","claude","openai"],default="gemini")
    ap.add_argument("--api-key",default=None)
    a=ap.parse_args()
    parse_questions(a.input, a.output, a.provider, a.api_key)
