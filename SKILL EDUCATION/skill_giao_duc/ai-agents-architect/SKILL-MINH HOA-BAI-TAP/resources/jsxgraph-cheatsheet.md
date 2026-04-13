---
name: JSXGraph Quick Reference
description: Bảng tra cứu nhanh API JSXGraph cho vẽ hình toán học 2D và 3D
---

# 📋 JSXGraph - Bảng Tra Cứu Nhanh

## CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css">
<script src="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js"></script>
```

## Khởi tạo Board

```js
// Board 2D
const board = JXG.JSXGraph.initBoard('id', {
    boundingbox: [xMin, yMax, xMax, yMin],  // CHÚ Ý THỨ TỰ!
    axis: true/false,
    grid: true/false,
    keepAspectRatio: true,
    showCopyright: false,
    showNavigation: true
});

// Board 3D
const view = board.create('view3d', [
    [posX, posY],         // vị trí trên board 2D
    [width, height],      // kích thước
    [[xMin,xMax], [yMin,yMax], [zMin,zMax]]  // range 3 trục
], { depthOrderPoints: true });
```

## Đối tượng cơ bản

| Tạo | Cú pháp | Tham số |
|-----|---------|---------|
| Điểm | `board.create('point', [x,y])` | name, size, fillColor, fixed |
| Đoạn thẳng | `board.create('segment', [P1,P2])` | strokeColor, strokeWidth |
| Đường thẳng | `board.create('line', [P1,P2])` | straightFirst, straightLast |
| Tia | `board.create('line', [P1,P2], {straightFirst:false})` | |
| Mũi tên | `board.create('arrow', [P1,P2])` | |
| Đường tròn (tâm+bk) | `board.create('circle', [O, r])` | |
| Đường tròn (tâm+điểm) | `board.create('circle', [O, P])` | |
| Cung tròn | `board.create('arc', [O, P1, P2])` | |
| Tam giác/Đa giác | `board.create('polygon', [A,B,C])` | fillColor, fillOpacity |
| Góc | `board.create('angle', [P1,vertex,P2])` | type:'square', radius |
| Hình ảnh | `board.create('image', [url,[x,y],[w,h]])` | |
| Text | `board.create('text', [x, y, 'nội dung'])` | fontSize, color |

## Đối tượng dựng hình

| Tạo | Cú pháp |
|-----|---------|
| Trung điểm | `board.create('midpoint', [A,B])` |
| Đường trung trực | `board.create('perpendicularbisector', [A,B])` |
| Đường phân giác | `board.create('bisector', [A,B,C])` |
| Chân đường vuông góc | `board.create('perpendicularpoint', [P, line])` |
| Đường vuông góc | `board.create('perpendicular', [line, P])` |
| Đường song song | `board.create('parallel', [line, P])` |
| Giao điểm | `board.create('intersection', [obj1, obj2, index])` |
| Đường tròn ngoại tiếp | `board.create('circumcircle', [A,B,C])` |
| Tâm ngoại tiếp | `board.create('circumcenter', [A,B,C])` |
| Đường tròn nội tiếp | `board.create('incircle', [A,B,C])` |
| Tâm nội tiếp | `board.create('incenter', [A,B,C])` |
| Tiếp tuyến | `board.create('tangent', [glider])` |
| Hình chiếu (reflection) | `board.create('reflection', [P, line])` |

## Hàm số & Đường cong

```js
// Hàm số y = f(x)
board.create('functiongraph', [x => x*x - 2*x + 1, xMin, xMax]);

// Đường cong tham số
board.create('curve', [
    t => Math.cos(t),   // x(t)
    t => Math.sin(t),   // y(t)
    tMin, tMax
]);

// Điểm trượt trên đồ thị
const glider = board.create('glider', [x0, y0, curve]);

// Tích phân Riemann
board.create('riemannsum', [f, n, 'left', a, b]);
```

## 3D Objects

```js
// Điểm 3D
view.create('point3d', [x,y,z], { name:'A', size:3 });

// Đoạn/Đường 3D
view.create('line3d', [P1, P2]);

// Mặt phẳng
view.create('plane3d', [point, dir1, dir2]);

// Đa giác 3D
view.create('polygon3d', [P1,P2,P3,...]);

// Mặt cầu
view.create('sphere3d', [center, pointOnSphere]);

// Đường tròn 3D
view.create('circle3d', [center, normal, radius]);

// Mặt tham số
view.create('parametricsurface3d', [
    (u,v) => x, (u,v) => y, (u,v) => z,
    [uMin,uMax], [vMin,vMax]
], { stepsU: 40, stepsV: 40 });
```

## Phép biến hình

```js
// Phép tịnh tiến
const t = board.create('transform', [dx, dy], {type: 'translate'});

// Phép quay
const r = board.create('transform', [angle, center], {type: 'rotate'});

// Phép đối xứng trục
const s = board.create('transform', [line], {type: 'reflect'});

// Phép vị tự
const h = board.create('transform', [k, center], {type: 'scale'});

// Áp dụng
const P_new = board.create('point', [P_old, transform]);
```

## Sự kiện & Cập nhật

```js
// Lắng nghe cập nhật board
board.on('update', () => { /* ... */ });

// Cập nhật thủ công
board.update();

// Animation
point.startAnimation(direction, steps);
point.stopAnimation();

// Khoảng cách
const d = A.Dist(B);

// Toạ độ
const x = A.X();
const y = A.Y();
// 3D
const z = A.Z();

// Góc (radian)
const rad = JXG.Math.Geometry.rad(P1, vertex, P2);
```

## Mẹo Style

```js
// Nét đứt
{ dash: 2 }  // 1-6, tăng dần mật độ đứt

// Gradient
{ gradient: 'radial', gradientSecondColor: '#ff0000' }

// Ẩn
{ visible: false }

// Cố định (không kéo được)
{ fixed: true }

// Nhãn
{ name: 'A', label: { fontSize: 16, offset: [10, 10], color: '#fff' } }

// Trace (để lại vết)
{ trace: true }
```
