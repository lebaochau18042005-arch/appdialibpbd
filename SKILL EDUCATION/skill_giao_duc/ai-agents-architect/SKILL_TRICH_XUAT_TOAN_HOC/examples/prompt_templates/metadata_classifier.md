# Prompt: Phân loại Metadata cho câu hỏi toán

Sử dụng prompt này khi cần phân loại thêm metadata cho câu hỏi đã trích xuất.

---

## PROMPT

```
Cho câu hỏi toán học sau, hãy phân loại metadata:

Câu hỏi: {question_content}

Trả về JSON:
{
  "topic": "<chủ đề chính>",
  "subtopic": "<chủ đề phụ>",
  "difficulty": "Nhận biết|Thông hiểu|Vận dụng|Vận dụng cao",
  "bloom_level": 1-4,
  "tags": ["tag1", "tag2"],
  "grade": "6-12",
  "skills_required": ["kỹ năng 1", "kỹ năng 2"],
  "prerequisite_knowledge": ["kiến thức tiên quyết"]
}

Tiêu chí phân loại độ khó:
- Nhận biết (1): Nhớ công thức, nhận dạng dạng bài
- Thông hiểu (2): Áp dụng trực tiếp 1 công thức/phương pháp
- Vận dụng (3): Kết hợp nhiều kiến thức, bài toán nhiều bước
- Vận dụng cao (4): Bài toán sáng tạo, tối ưu, chứng minh phức tạp
```
