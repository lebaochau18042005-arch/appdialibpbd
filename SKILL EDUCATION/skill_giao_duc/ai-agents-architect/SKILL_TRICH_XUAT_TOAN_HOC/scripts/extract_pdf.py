"""
Pipeline Trich Xuat PDF - Marker / Pix2Text / PyMuPDF
Usage: python extract_pdf.py --input "file.pdf" --output "./output/"
"""
import os, sys, json, argparse
from pathlib import Path
from typing import Optional

def extract_with_marker(pdf_path, output_dir, use_llm=False, gemini_api_key=None, force_ocr=False):
    from marker.converters.pdf import PdfConverter
    from marker.models import create_model_dict
    from marker.output import text_from_rendered
    from marker.config.parser import ConfigParser
    os.makedirs(output_dir, exist_ok=True)
    config = {"output_format":"markdown","output_dir":output_dir}
    if force_ocr: config["force_ocr"]=True
    if use_llm:
        config["use_llm"]=True; config["redo_inline_math"]=True
        if gemini_api_key: config["gemini_api_key"]=gemini_api_key
    cp = ConfigParser(config)
    conv = PdfConverter(config=cp.generate_config_dict(),artifact_dict=create_model_dict(),
        processor_list=cp.get_processors(),renderer=cp.get_renderer(),llm_service=cp.get_llm_service())
    rendered = conv(pdf_path)
    text, meta, images = text_from_rendered(rendered)
    saved=[]
    if images:
        idir=os.path.join(output_dir,"images"); os.makedirs(idir,exist_ok=True)
        for n,d in images.items():
            p=os.path.join(idir,n)
            if isinstance(d,bytes): open(p,'wb').write(d)
            else: d.save(p)
            saved.append({"filename":n,"path":p})
    return {"markdown":text,"method":"marker","metadata":meta,"images":saved}

def extract_with_pix2text(pdf_path, output_dir):
    from pix2text import Pix2Text
    os.makedirs(output_dir, exist_ok=True)
    p2t = Pix2Text.from_config()
    result = p2t.recognize_pdf(pdf_path)
    md = result.to_markdown() if hasattr(result,'to_markdown') else str(result)
    return {"markdown":md,"method":"pix2text","metadata":{},"images":[]}

def extract_images_from_pdf(pdf_path, output_dir, min_size=100):
    import fitz
    os.makedirs(output_dir, exist_ok=True)
    images=[]
    doc=fitz.open(pdf_path)
    for pn in range(len(doc)):
        for ii,img in enumerate(doc[pn].get_images(full=True)):
            try:
                pix=fitz.Pixmap(doc,img[0])
                if pix.width<min_size or pix.height<min_size: continue
                if pix.n>=5: pix=fitz.Pixmap(fitz.csRGB,pix)
                nm=f"page{pn+1}_img{ii+1}.png"; p=os.path.join(output_dir,nm)
                pix.save(p)
                images.append({"filename":nm,"path":p,"page":pn+1,"width":pix.width,"height":pix.height})
            except: pass
    doc.close()
    return images

def analyze_pdf(pdf_path):
    import fitz
    doc=fitz.open(pdf_path); meta=doc.metadata or {}
    pages=[]; ti=0
    for i in range(len(doc)):
        pg=doc[i]; t=pg.get_text("text").strip(); imgs=pg.get_images(full=True); ti+=len(imgs)
        pages.append({"page":i+1,"has_text":bool(t),"text_len":len(t),"images":len(imgs)})
    tp=sum(1 for p in pages if p['has_text'])
    doc.close()
    return {"filename":Path(pdf_path).name,"pages":len(pages),"type":"digital" if tp>len(pages)*0.5 else "scanned",
        "text_pages":tp,"total_images":ti,"meta":meta}

def extract_pdf_full(pdf_path, output_dir, use_llm=False, api_key=None, force_ocr=False, method="marker"):
    os.makedirs(output_dir, exist_ok=True)
    fn=Path(pdf_path).name
    print(f"\n{'='*50}\n📄 PDF: {fn}\n{'='*50}")
    analysis=analyze_pdf(pdf_path)
    print(f"  Pages:{analysis['pages']} Type:{analysis['type']} Images:{analysis['total_images']}")
    if analysis['type']=='scanned': force_ocr=True
    result=None
    if method=="marker":
        try: result=extract_with_marker(pdf_path,output_dir,use_llm,api_key,force_ocr); print("  ✅ Marker OK")
        except Exception as e: print(f"  ⚠️ Marker fail: {e}"); method="pix2text"
    if method=="pix2text" and not result:
        try: result=extract_with_pix2text(pdf_path,output_dir); print("  ✅ Pix2Text OK")
        except Exception as e: print(f"  ❌ Fail: {e}"); return {"error":str(e)}
    md_path=os.path.join(output_dir,f"{Path(fn).stem}_extracted.md")
    open(md_path,'w',encoding='utf-8').write(result['markdown'])
    out={"source":fn,"method":result['method'],"markdown_file":md_path,"markdown":result['markdown'],
        "images":result.get('images',[]),"analysis":analysis}
    meta_path=os.path.join(output_dir,f"{Path(fn).stem}_metadata.json")
    json.dump({k:v for k,v in out.items() if k!='markdown'},open(meta_path,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
    print(f"  ✅ Done: {md_path}")
    return out

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--input","-i",required=True)
    ap.add_argument("--output","-o",default="./output")
    ap.add_argument("--method","-m",choices=["marker","pix2text"],default="marker")
    ap.add_argument("--use-llm",action="store_true")
    ap.add_argument("--api-key",default=None)
    ap.add_argument("--force-ocr",action="store_true")
    ap.add_argument("--analyze-only",action="store_true")
    a=ap.parse_args()
    if a.analyze_only: print(json.dumps(analyze_pdf(a.input),ensure_ascii=False,indent=2))
    else: extract_pdf_full(a.input,a.output,a.use_llm,a.api_key or os.environ.get('GOOGLE_API_KEY'),a.force_ocr,a.method)
