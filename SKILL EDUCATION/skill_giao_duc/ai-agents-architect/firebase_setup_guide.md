# 🔥 Hướng dẫn cấu hình Firebase (từ A đến Z)

> [!NOTE]
> Firebase là dịch vụ miễn phí của Google. Bạn chỉ cần 1 tài khoản Google (Gmail) để bắt đầu.
> Toàn bộ quá trình mất khoảng **5-7 phút**.

---

## Bước 1: Đăng nhập Firebase Console

1. Mở trình duyệt → vào 👉 **https://console.firebase.google.com/**
2. Đăng nhập bằng **tài khoản Google** (Gmail) của bạn
3. Nếu chưa có Gmail → tạo tại https://accounts.google.com/signup

---

## Bước 2: Tạo Firebase Project

1. Nhấn nút **"Create a project"** (hoặc "Tạo dự án")

2. **Đặt tên project**: nhập `edumanage-thcs` → nhấn **Continue**

3. **Google Analytics**: 
   - ❌ **Tắt** (gạt sang OFF) — không cần cho app này
   - Nhấn **Create Project**

4. Đợi khoảng 30 giây → Nhấn **Continue** khi hiện "Your new project is ready"

---

## Bước 3: Tạo Realtime Database

1. Ở menu bên trái, nhấn **Build** → **Realtime Database**

2. Nhấn nút **"Create Database"**

3. **Chọn vị trí server**:
   - Chọn: **`asia-southeast1 (Singapore)`** ← gần Việt Nam nhất
   - Nhấn **Next**

4. **Security rules**: 
   - ✅ Chọn **"Start in test mode"** (cho phép tất cả đọc/ghi trong 30 ngày)
   - Nhấn **Enable**

5. Bạn sẽ thấy database rỗng hiện ra — đây là nơi dữ liệu sẽ được lưu

> [!TIP]
> Test mode cho phép mọi người đọc/ghi trong 30 ngày. Sau khi app chạy ổn, tôi sẽ giúp bạn thêm security rules phù hợp.

---

## Bước 4: Đăng ký Web App

1. Nhấn vào **biểu tượng ⚙️ Settings** (cạnh "Project Overview" ở góc trên bên trái)

2. Chọn **"Project settings"**

3. Kéo xuống phần **"Your apps"** → Nhấn biểu tượng **`</>`** (Web)

4. **Đặt tên app**: nhập `EduManage Web`
   - ❌ KHÔNG tick "Firebase Hosting"
   - Nhấn **"Register app"**

5. 🎯 **Đây là bước quan trọng nhất!** Bạn sẽ thấy một đoạn code như sau:

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1234567890abcdefghijklmnop",
  authDomain: "edumanage-thcs.firebaseapp.com",
  databaseURL: "https://edumanage-thcs-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "edumanage-thcs",
  storageBucket: "edumanage-thcs.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

6. **COPY** toàn bộ đoạn `firebaseConfig` này (từ dấu `{` đến dấu `}`)

7. Nhấn **"Continue to console"**

> [!IMPORTANT]
> Nếu bạn không thấy `databaseURL` trong config, đừng lo! Nó sẽ có dạng:
> `https://TÊN-PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app`
> 
> Bạn có thể copy URL này từ trang Realtime Database (ở trên cùng của database).

---

## Bước 5: Dán config vào code

Sau khi copy được `firebaseConfig`, hãy **gửi cho tôi** đoạn config đó.

Tôi sẽ tự động dán vào file `src/lib/firebase.ts` cho bạn.

**Hoặc** bạn có thể tự dán: mở file `src/lib/firebase.ts`, tìm dòng 22-31 và thay thế:

```typescript
// ⚠️ THAY THẾ CÁC GIÁ TRỊ NÀY:
const firebaseConfig = {
  apiKey: "AIzaSy...",              // ← dán giá trị thật
  authDomain: "xxx.firebaseapp.com",
  databaseURL: "https://xxx-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "xxx",
  storageBucket: "xxx.firebasestorage.app",
  messagingSenderId: "123...",
  appId: "1:123...:web:abc..."
};
```

---

## Bước 6: Test thử

1. Mở app tại `http://localhost:3000`
2. Chọn **Giáo viên** → nhập mật khẩu → **Tạo phòng mới**
3. Nhận mã phòng VD: `ABC123`
4. Mở tab mới → chọn **Học sinh** → nhập mã `ABC123`
5. Ở tab GV: thêm điểm, điểm danh, etc.
6. ✅ Kiểm tra tab HS: dữ liệu phải tự động cập nhật!

---

## ❓ Câu hỏi thường gặp

**Q: Firebase có mất phí không?**
> Spark Plan (miễn phí) cho: 1GB storage, 10GB transfer/tháng, 100 kết nối đồng thời. Đủ cho hàng trăm lớp học.

**Q: Dữ liệu có an toàn không?**
> API Key Gemini KHÔNG được sync lên Firebase. Dữ liệu lớp học được mã hóa khi truyền (HTTPS/WSS).

**Q: Nếu mất mạng thì sao?**
> App tự động chuyển sang chế độ offline (dùng localStorage). Khi có mạng lại sẽ tự sync.

**Q: Test mode hết hạn sau 30 ngày thì sao?**
> Tôi sẽ giúp bạn viết Security Rules phù hợp trước khi hết hạn.
