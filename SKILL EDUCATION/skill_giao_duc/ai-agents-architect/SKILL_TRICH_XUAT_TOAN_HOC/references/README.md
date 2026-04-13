# References

Thư mục này chứa các thư viện/công cụ tham khảo đã được phân tích.
Các thư mục gốc nằm tại cùng cấp với `SKILL_TRICH_XUAT_TOAN_HOC/`.

## Danh sách references

| Thư mục | Mục đích | Loại file | Ghi chú |
|---------|----------|-----------|---------|
| `MathTypeLib-main/` | MathType DLL wrapper (Python) | .docx (OLE) | Windows only, cần MT6.dll |
| `WordToLaTeX-Converter-main/` | MathType OLE → KaTeX (C#) | .docx (OLE) | Tham khảo, cần Visual Studio |
| `docxlatex-main/` | DOCX → Text + LaTeX (Python) | .docx (OMML) | pip install docxlatex |
| `eqword2llm-main/` | DOCX → Markdown + LaTeX (Python) | .docx (OMML) | pip install eqword2llm |
| `marker-master/` | PDF/DOCX → Markdown (AI) | .pdf, .docx | pip install marker-pdf[full] |

## Cách sử dụng

Các thư viện này được sử dụng bởi scripts trong `scripts/` folder.
Xem `SKILL.md` để biết thứ tự ưu tiên và hướng dẫn chi tiết.

## Đường dẫn gốc

```
c:\Users\admin\Downloads\SKILL TRICH XUAT CONG THUC TOAN\
├── MathTypeLib-main\
├── WordToLaTeX-Converter-main\
├── docxlatex-main\
├── eqword2llm-main\
├── marker-master\
└── SKILL_TRICH_XUAT_TOAN_HOC\    ← Thư mục skill này
```
