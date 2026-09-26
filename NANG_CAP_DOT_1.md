# Nâng cấp đợt 1 — Địa Lí BP

## Cách sử dụng

### Học sinh

- Mở **Trang chủ**, **Luyện tập** hoặc **Thi thử** để thấy **Góc ôn tập của bạn**.
- Chọn **Sổ câu sai** để xem câu cần ôn, lọc theo chủ đề và xem đáp án. Chọn **Luyện lại** để làm lại những câu chưa nắm vững.
- Trả lời đúng khi ôn sẽ chuyển câu sang **Đã ôn đúng**. Có thể bật bộ lọc để xem lại các câu này. Nếu trả lời sai lần sau, câu được đưa lại vào danh sách cần ôn.
- Bài luyện tập và bài thi tự lưu bộ câu hỏi, đáp án, vị trí câu đang làm và giờ bắt đầu. Khi quay lại, dùng nút **Tiếp tục** hoặc mở lại đúng địa chỉ bài đó.
- Đồng hồ vẫn chạy khi rời trang. Bài hết giờ sẽ kết thúc khi được mở lại; thời gian không được cộng thêm khi tải lại trang.

### Giáo viên

- Mở **Giáo viên → Tổng quan → Mức độ nắm vững theo chủ đề**.
- Lọc theo lớp và bài thi/tự luyện. Chủ đề có tỷ lệ đúng thấp xuất hiện trước.
- Bảng hiển thị số học sinh, số lượt trả lời đúng và tỷ lệ đúng. Nhiều lần làm bài của một học sinh được tính là nhiều lượt trả lời.
- Câu đúng/sai chỉ được tính là đúng toàn câu khi đúng tất cả mệnh đề. Bảng này không phải bảng điểm từng mệnh đề.
- Bài cũ không có dữ liệu chủ đề được bỏ qua, kèm số bài có dữ liệu để giáo viên biết phạm vi báo cáo.

## Phạm vi lưu trữ của đợt này

- Sổ câu sai và bản nháp lưu **trên trình duyệt hiện tại**, tách theo tài khoản; người chưa đăng nhập được tách theo tên, lớp và trường trong hồ sơ.
- Chưa đồng bộ sổ câu sai và bản nháp giữa các thiết bị. Xóa dữ liệu trình duyệt sẽ làm mất dữ liệu này.
- Sổ giữ tối đa 200 câu được cập nhật gần nhất, bắt đầu từ các bài làm mới. Không khôi phục câu hỏi từ lịch sử cũ vốn chỉ lưu đáp án.
- Giữ bản nháp mới nhất cho mỗi loại: một bài luyện tập và một bài thi. Bản nháp quá 30 ngày không được khôi phục.
- Nếu trình duyệt chặn lưu trữ hoặc hết dung lượng, ứng dụng hiện thông báo. Tài liệu hoặc câu hỏi có ảnh lớn có thể làm đầy dung lượng sớm hơn.
- Kết quả bài làm được lưu trên máy trước khi gửi lên hệ thống. Đồng bộ kết quả với giáo viên vẫn cần kết nối; đây chưa phải phiên bản hỗ trợ ngoại tuyến đầy đủ hoặc hàng đợi đồng bộ bền vững.

## Giao diện và sửa lỗi liên quan

- Làm rõ tiêu đề Thư viện và Thi thử trên nền tối; sửa màu chữ trong ô tìm kiếm và công thức toán trên thẻ sáng.
- Các nút tài liệu xuống hàng trên điện thoại; ô thống kê giáo viên linh hoạt theo chiều rộng.
- Thêm nhãn truy cập cho các bộ lọc và viền khi dùng bàn phím.
- Sửa tìm kiếm trò chơi khi nhãn là danh sách; không hiển thị điểm trung bình không hợp lệ khi thiếu điểm.
- Đáp án số có ký tự thừa, ví dụ `12abc`, không còn được chấm đúng như `12`.
- Ngăn phản hồi giải thích AI của câu trước xuất hiện ở câu tiếp theo.

## Kiểm tra và chạy thử

```sh
npm run lint
npm run test:learning
npm run build
npm run preview:learning
```

Trang thử nghiệm: `http://127.0.0.1:4178/tests/learning-preview.html`.

Trang này dùng thành phần giao diện thật với dịch vụ dữ liệu giả lập. Không gửi kết quả lên dữ liệu lớp học thật và không gọi AI. Cấu hình thử nghiệm được tách khỏi cấu hình đóng gói sản phẩm.

Kiểm thử tương tác bổ sung nằm tại `tests/learning-browser.cjs`, cần Playwright và Microsoft Edge. Có thể đặt biến `PLAYWRIGHT_MODULE` tới thư viện Playwright nếu dùng thư viện được cài bên ngoài dự án, rồi chạy `node tests/learning-browser.cjs` khi bản thử nghiệm đang mở.

Đã kiểm tra: khôi phục câu hỏi/đáp án/thời gian, trở lại qua nút Tiếp tục, bài hết giờ, câu bỏ trống, ôn lại câu sai, nộp bài xóa bản nháp, bộ lọc báo cáo, giao diện rộng 390px và lỗi hết dung lượng. Kiểm tra trình duyệt dùng dữ liệu giả lập; chưa kiểm thử đăng nhập, AI hoặc đồng bộ với hệ thống thật.

Các thay đổi được thực hiện trong thư mục dự án cục bộ. Chưa phát hành lên Vercel.
