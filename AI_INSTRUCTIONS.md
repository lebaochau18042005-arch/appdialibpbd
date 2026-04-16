# Các quy tắc phát triển và vận hành dự án (AI Instructions)

Tài liệu này ghi lại các quy tắc đã được thống nhất để AI hoặc các nhà phát triển sau này tuân thủ khi chỉnh sửa dự án.
Tôi đang triển khai ứng dụng từ github qua vercel, hãy kiểm tra giúp tôi các file vercel.json, index.html có tham chiếu đúng chưa và hướng dẫn tôi setup api key gemini để người dùng tự nhập API key của họ để chạy app

## 1. Cấu hình Model AI & Cơ chế Fallback
- **Model mặc định**: `gemini-2.5-flash` (model chính thức, ổn định, miễn phí trên AI Studio)
- **Model dự phòng**: Tự động chuyển đổi nếu model hiện tại gặp lỗi/quá tải:
  1. `gemini-2.5-flash` (mặc định — khuyên dùng)
  2. `gemini-2.5-pro` (chất lượng cao hơn, tư duy sâu)
  3. `gemini-2.5-flash-lite` (siêu nhẹ, tiết kiệm quota)
- **❌ CÁC MODEL ĐÃ BỊ XÓA (TUYỆT ĐỐI KHÔNG DÙNG)**:
  - `gemini-3-pro-preview`, `gemini-3-flash-preview` — chưa tồn tại/không hợp lệ
  - `gemini-1.5-pro` — đã bị Google xóa khỏi public API (HTTP 404)
  - `gemini-1.5-flash-8b` — không còn hỗ trợ rộng rãi
- **Cơ chế Retry**:
  - Nếu một model gặp lỗi API, hệ thống tự động thử model tiếp theo trong FALLBACK_MODELS.
  - Khi app khởi động, tự động xóa model ID cũ không hợp lệ khỏi localStorage.

## 2. Quản lý API Key
- **Cơ chế**:
  - Người dùng nhập API key vào Modal hoặc qua nút Settings trên Header.
  - Lưu vào `localStorage` của trình duyệt.
  - Ưu tiên sử dụng key từ `localStorage`.
- **Giao diện**:
  - **Thiết lập Model & API Key**: Hiển thị danh sách chọn Model AI (dạng thẻ/Cards).
  - Thứ tự hiển thị: `gemini-2.5-flash` (Mặc định), `gemini-2.5-pro`, `gemini-2.5-flash-lite`.

  - Nút **Settings (API Key)** kèm dòng chữ màu đỏ "Lấy API key để sử dụng app" phải luôn hiển thị trên Header để người dùng dễ dàng thay đổi key khi hết quota. 
  - Khi chưa có key, hiển thị Modal bắt buộc nhập.
  - Việc nhập key ban đầu trước khi dùng app, hướng dẫn người dùng vào https://aistudio.google.com/api-keys để lấy key API

## 3. Quản lý Trạng thái & Lỗi (State Management)
- **Hiển thị lỗi**:
  - Nếu tất cả các model đều thất bại -> Hiện thông báo lỗi màu đỏ, hiển thị nguyên văn lỗi từ API (VD: `429 RESOURCE_EXHAUSTED`).
  - Trạng thái các cột đang chờ phải chuyển thành **"Đã dừng do lỗi"**, tuyệt đối không được hiện "Hoàn tất" hoặc checkmark xanh nếu quy trình bị gián đoạn.
- **Tiến trình**:
  - Progress bar chỉ hiển thị trạng thái hoàn thành (xanh) khi bước đó thực sự thành công.

## 4. Triển khai (Deployment)
- **Nền tảng**: Vercel.
- **File bắt buộc**: `vercel.json` ở root để xử lý SPA routing.
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
