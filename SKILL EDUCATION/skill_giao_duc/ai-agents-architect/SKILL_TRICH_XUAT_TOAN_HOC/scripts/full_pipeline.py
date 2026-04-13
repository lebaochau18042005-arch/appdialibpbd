"""
Full Pipeline - Trích xuất câu hỏi toán học từ DOCX/PDF
Kết hợp: extract_docx + extract_pdf + parse_questions
Usage: python full_pipeline.py --input "file.docx" --output "./output/" --provider gemini
"""
import os, json, argparse
from pathlib import Path

def run_pipeline(file_path, output_dir, provider="gemini", api_key=None, use_llm=False):
    ext = Path(file_path).suffix.lower()
    fn = Path(file_path).stem
    out = os.path.join(output_dir, fn)
    os.makedirs(out, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"🚀 FULL PIPELINE: {Path(file_path).name}")
    print(f"{'='*60}")
    
    # Step 1: Extract
    if ext == '.docx':
        from extract_docx import extract_docx_full
        result = extract_docx_full(file_path, out)
    elif ext == '.pdf':
        from extract_pdf import extract_pdf_full
        result = extract_pdf_full(file_path, out, use_llm=use_llm,
            api_key=api_key if use_llm else None)
    else:
        print(f"❌ Unsupported: {ext}"); return None
    
    if 'error' in result:
        print(f"❌ Extraction failed: {result['error']}"); return None
    
    # Step 2: Parse questions with AI
    if api_key or os.environ.get('GOOGLE_API_KEY'):
        from parse_questions import parse_questions
        md_file = result.get('markdown_file', os.path.join(out, f"{fn}_extracted.md"))
        q_file = os.path.join(out, f"{fn}_questions.json")
        parse_questions(md_file, q_file, provider, api_key)
        result['questions_file'] = q_file
    else:
        print("\n⚠️ Không có API key → bỏ qua AI parsing")
        print("  Chạy lại với --api-key hoặc set GOOGLE_API_KEY")
    
    print(f"\n{'='*60}")
    print(f"✅ HOÀN THÀNH: {out}")
    print(f"{'='*60}")
    return result

if __name__=="__main__":
    ap=argparse.ArgumentParser(description="Full pipeline trích xuất câu hỏi toán")
    ap.add_argument("--input","-i",required=True)
    ap.add_argument("--output","-o",default="./output")
    ap.add_argument("--provider","-p",choices=["gemini","claude","openai"],default="gemini")
    ap.add_argument("--api-key",default=None)
    ap.add_argument("--use-llm",action="store_true",help="Dùng LLM mode cho PDF (Marker)")
    a=ap.parse_args()
    run_pipeline(a.input, a.output, a.provider, a.api_key or os.environ.get('GOOGLE_API_KEY'), a.use_llm)
