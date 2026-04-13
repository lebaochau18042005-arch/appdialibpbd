---
name: Math Problem Analyzer
description: Bảng phân loại bài toán và mapping tự động sang kiểu hình vẽ phù hợp
---

# 🧠 Bộ Phân Tích Bài Toán → Hình Vẽ

## Quy trình phân tích

Khi nhận đề bài toán, thực hiện 5 bước:

### Bước 1: Phân loại bài toán

| Từ khóa trong đề | Phân loại | Engine |
|-------------------|-----------|--------|
| tam giác, ba cạnh, ba đỉnh | Tam giác 2D | JSXGraph 2D |
| tứ giác, hình vuông, hình thoi, hình bình hành | Tứ giác 2D | JSXGraph 2D |
| đường tròn, tâm, bán kính, tiếp tuyến | Đường tròn 2D | JSXGraph 2D |
| hàm số, đồ thị, khảo sát, cực trị | Đồ thị hàm số | JSXGraph 2D |
| tọa độ, véc tơ, phương trình đường thẳng | Hình giải tích 2D | JSXGraph 2D |
| hình hộp, hình chóp, lăng trụ | Hình không gian | JSXGraph 3D |
| mặt cầu, hình trụ, hình nón | Khối tròn xoay | JSXGraph 3D / Three.js |
| đa diện đều, icosahedron | Đa diện phức tạp | Three.js |
| phép biến hình, đối xứng, quay | Biến hình | JSXGraph 2D |
| xác suất, thống kê, biểu đồ | Biểu đồ | JSXGraph 2D (chart) |

### Bước 2: Trích xuất dữ kiện

Tìm trong đề:
- **Các điểm**: tên (chữ in hoa), tọa độ
- **Các cạnh/đoạn**: tên, độ dài
- **Các góc**: ký hiệu, số đo (độ/radian)
- **Quan hệ**: vuông góc (⊥), song song (//), bằng nhau (=), trung điểm
- **Đường đặc biệt**: đường cao, trung tuyến, phân giác, trung trực
- **Bán kính**: giá trị cụ thể
- **Hàm số**: biểu thức f(x)

### Bước 3: Tính toạ độ

#### Tam giác
```
Cho tam giác ABC:
- Vuông tại A, AB=a, AC=b → A(0,0), B(a,0), C(0,b)
- Vuông tại B, AB=a, BC=b → B(0,0), A(-a,0), C(0,b)
- Đều cạnh a → A(0,0), B(a,0), C(a/2, a√3/2)
- Cân tại A, AB=AC=b, BC=a → B(-a/2,0), C(a/2,0), A(0, √(b²-a²/4))
- Cho 3 cạnh a,b,c → B(0,0), C(a,0), A tính theo cos rule
  cosB = (a²+c²-b²)/(2ac), A = (c·cosB, c·sinB)
```

#### Tứ giác
```
- Hình vuông ABCD cạnh a → A(0,0), B(a,0), C(a,a), D(0,a)
- Hình chữ nhật a×b → A(0,0), B(a,0), C(a,b), D(0,b)
- Hình thoi cạnh a, góc A=α → A(0,0), B(a,0), D(a·cosα, a·sinα), C(B+D-A)
- Hình bình hành ABCD → A(0,0), B(a,0), D(d·cosα, d·sinα), C(B+D-A)
- Hình thang ABCD (AB//CD) → A(0,0), B(a,0), D(dx,h), C(dx+c,h)
```

#### Đường tròn
```
- (O; R) → O(0,0), boundingbox [-R-2, R+2, R+2, -R-2]
- Tại điểm cụ thể → O(x0,y0), mở rộng boundingbox
```

#### Hình 3D
```
- Hình hộp a×b×c → A(0,0,0), cạnh dọc theo trục
- Chóp S.ABC đều cạnh a, h → đáy Oxy, S trên Oz
- Chóp SA⊥đáy → A là gốc tọa độ, SA dọc Oz
- Lăng trụ → đáy Oxy, dịch lên theo Oz
```

### Bước 4: Scale boundingbox

```
2D: 
  padding = max(width, height) * 0.25
  boundingbox = [xMin-padding, yMax+padding, xMax+padding, yMin-padding]

3D:
  range = max(xRange, yRange, zRange) * 1.3
  view range = [[-pad, range+pad], [-pad, range+pad], [-pad, range+pad]]
```

### Bước 5: Chọn yếu tố highlight

- **Đường cần tìm** → strokeColor: #ef4444, strokeWidth: 3, dash: 3
- **Điểm cần tìm** → fillColor: #ef4444, size: 6
- **Góc cần tìm** → fillColor: #ef444440, strokeColor: #ef4444
- **Dữ kiện cho** → strokeColor: #38bdf8 (bình thường)
- **Đường phụ** → strokeColor: #475569, dash: 2

---

## Mẫu câu lệnh gợi ý cho copilot

Khi AI nhận bài toán, nên sinh comment giải thích rõ:

```js
// === PHÂN TÍCH ĐỀ BÀI ===
// Bài toán: [đề bài]
// Loại: [tam giác vuông 2D / hình chóp 3D / ...]
// Dữ kiện: AB = 3, AC = 4, vuông tại A
// Cần vẽ: đường cao AH từ A đến BC
// Engine: JSXGraph 2D
// Tọa độ: A(0,0), B(3,0), C(0,4)
// BoundingBox: [-1.5, 5.5, 5, -1.5]

// === BẮT ĐẦU VẼ ===
```

---

## Bảng đối chiếu Toán Việt → JSXGraph

| Thuật ngữ Việt | JSXGraph element |
|-----------------|------------------|
| Điểm | `point` |
| Đoạn thẳng | `segment` |
| Đường thẳng | `line` |
| Tia | `line` + `straightFirst: false` |
| Đường tròn | `circle` |
| Cung | `arc` |
| Tam giác | `polygon` (3 đỉnh) |
| Tứ giác | `polygon` (4 đỉnh) |
| Góc | `angle` |
| Góc vuông | `angle` + `type: 'square'` |
| Trung điểm | `midpoint` |
| Trung tuyến | `segment` ([đỉnh, trung điểm đối diện]) |
| Đường cao | `segment` + `perpendicularpoint` |
| Phân giác | `bisector` |
| Trung trực | `perpendicularbisector` |
| Đường tròn ngoại tiếp | `circumcircle` |
| Đường tròn nội tiếp | `incircle` |
| Trọng tâm | `point` = trung bình 3 đỉnh |
| Trực tâm | giao 2 đường cao |
| Đường thẳng song song | `parallel` |
| Đường thẳng vuông góc | `perpendicular` |
| Tiếp tuyến | `tangent` |
| Hình chiếu | `perpendicularpoint` |
| Đối xứng trục | `reflection` |
| Đối xứng tâm | `transform` (reflect) |
| Phép quay | `transform` (rotate) |
| Phép tịnh tiến | `transform` (translate) |
| Véc tơ | `arrow` |
| Hàm số | `functiongraph` |
| Cực đại/cực tiểu | `point` tại x₀ + dấu hiệu |
| Tiệm cận ngang | `line` ngang dash |
| Tiệm cận đứng | `line` đứng dash |
| Bảng biến thiên | render bằng HTML table |
