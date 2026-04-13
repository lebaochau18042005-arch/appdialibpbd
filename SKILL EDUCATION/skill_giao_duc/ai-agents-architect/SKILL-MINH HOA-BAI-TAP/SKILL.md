---
name: Math Illustration Engine
description: Skill toàn diện để vẽ hình 2D/3D minh họa chính xác cho bài toán Toán học. Từ đề bài, AI phân tích và sinh code vẽ hình tương tác sử dụng JSXGraph và Three.js.
---

# 🎨 Math Illustration Engine - Skill Vẽ Hình Toán Học

## Tổng quan

Skill này cho phép AI **đọc hiểu đề bài toán → phân tích các đối tượng hình học → sinh code HTML/JS vẽ hình minh họa chính xác và tương tác**.

### Thư viện sử dụng

| Thư viện | Mục đích | CDN |
|----------|---------|-----|
| **JSXGraph** | Hình 2D + 3D tương tác (chính) | `https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js` |
| **Three.js** | Hình 3D nâng cao (khối đa diện phức tạp) | `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` |
| **MathJax** | Hiển thị công thức toán | `https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js` |

### Luồng xử lý

```
Đề bài toán → [1] Phân tích NLP → [2] Xác định đối tượng hình học 
→ [3] Tính toạ độ/kích thước → [4] Chọn engine phù hợp 
→ [5] Sinh code vẽ hình → [6] Thêm nhãn/annotation → [7] Output HTML
```

---

## 1. QUY TẮC PHÂN TÍCH ĐỀ BÀI

Khi nhận đề bài toán, AI phải trích xuất:

### 1.1 Đối tượng hình học cơ bản
- **Điểm**: tên (A, B, C...), toạ độ nếu cho
- **Đoạn thẳng/Đường thẳng**: 2 điểm xác định, độ dài nếu cho
- **Góc**: 3 điểm, số đo nếu cho
- **Đường tròn**: tâm, bán kính
- **Tam giác**: 3 đỉnh, loại (vuông, cân, đều...)
- **Tứ giác**: 4 đỉnh, loại (hình vuông, chữ nhật, thoi, bình hành...)
- **Đa giác đều**: số cạnh, cạnh
- **Hình 3D**: hình hộp, lăng trụ, chóp, cầu, trụ, nón...

### 1.2 Quan hệ hình học
- Song song, vuông góc
- Tiếp tuyến, cát tuyến
- Trung điểm, trọng tâm, tâm đường tròn ngoại/nội tiếp
- Giao điểm
- Đối xứng (trục, tâm)

### 1.3 Quy tắc đặt toạ độ tự động
Khi đề không cho toạ độ cụ thể, dùng các quy tắc sau:

```
- Tam giác ABC cạnh a: đặt B(0,0), C(a,0), tính A theo góc/cạnh
- Tam giác vuông tại A: đặt A(0,0), B(a,0), C(0,b) 
- Tam giác đều cạnh a: B(0,0), C(a,0), A(a/2, a*sqrt(3)/2)
- Hình vuông ABCD cạnh a: A(0,0), B(a,0), C(a,a), D(0,a)
- Hình chữ nhật: A(0,0), B(a,0), C(a,b), D(0,b)
- Đường tròn (O;R): tâm O(0,0), bán kính R -> scale boundingbox
- Hình 3D: đặt gốc ở trung tâm đáy
```

---

## 2. ENGINE 2D - JSXGRAPH

### 2.1 Template cơ bản

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Minh họa bài toán</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css">
    <script src="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #0f172a; color: #e2e8f0;
            display: flex; flex-direction: column; align-items: center;
            min-height: 100vh; padding: 20px;
        }
        h1 { font-size: 1.3rem; margin-bottom: 12px; color: #38bdf8; }
        .jxgbox { 
            border-radius: 12px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            background: #1e293b;
        }
        .info-panel {
            margin-top: 16px; padding: 16px 24px;
            background: #1e293b; border-radius: 10px;
            font-size: 0.95rem; max-width: 700px;
            border: 1px solid #334155;
        }
        .info-panel .label { color: #94a3b8; }
        .info-panel .value { color: #38bdf8; font-weight: 600; }
    </style>
</head>
<body>
    <h1>📐 [TÊN BÀI TOÁN]</h1>
    <div id="jxgbox" class="jxgbox" style="width:700px; height:700px;"></div>
    <div class="info-panel" id="info"></div>
    
    <script>
        // === CẤU HÌNH BOARD ===
        const board = JXG.JSXGraph.initBoard('jxgbox', {
            boundingbox: [-2, 8, 10, -2], // [xMin, yMax, xMax, yMin]
            axis: false,
            grid: false,
            showCopyright: false,
            showNavigation: true,
            keepAspectRatio: true
        });

        // === STYLE CHUNG ===
        const STYLE = {
            point: { size: 4, strokeColor: '#f59e0b', fillColor: '#fbbf24', fixed: true },
            pointDraggable: { size: 5, strokeColor: '#f59e0b', fillColor: '#fbbf24', fixed: false },
            segment: { strokeColor: '#38bdf8', strokeWidth: 2.5 },
            line: { strokeColor: '#64748b', strokeWidth: 1.5, dash: 2 },
            polygon: { fillColor: '#38bdf820', strokeColor: '#38bdf8', strokeWidth: 2, hasInnerPoints: false },
            circle: { strokeColor: '#a78bfa', strokeWidth: 2, fillColor: '#a78bfa10' },
            angle: { strokeColor: '#f472b6', fillColor: '#f472b640', strokeWidth: 1.5, radius: 0.6 },
            label: { fontSize: 16, cssClass: 'jsxgraph-label', highlightCssClass: 'jsxgraph-label' },
            auxiliary: { strokeColor: '#475569', strokeWidth: 1, dash: 3 }, // đường phụ
            highlight: { strokeColor: '#ef4444', strokeWidth: 3 } // đường cần tìm
        };

        // === VẼ HÌNH Ở ĐÂY ===
        // [CODE VẼ HÌNH CỤ THỂ]
    </script>
</body>
</html>
```

### 2.2 Các đối tượng JSXGraph thường dùng

#### Điểm
```js
// Điểm cố định
const A = board.create('point', [0, 0], {
    name: 'A', ...STYLE.point,
    label: { ...STYLE.label, offset: [-15, -15] }
});

// Điểm kéo được (tương tác)
const P = board.create('point', [3, 4], {
    name: 'P', ...STYLE.pointDraggable,
    label: { ...STYLE.label, offset: [10, 10] }
});

// Trung điểm
const M = board.create('midpoint', [A, B], {
    name: 'M', ...STYLE.point,
    label: { ...STYLE.label, offset: [5, 10] }
});
```

#### Đoạn thẳng & Đường thẳng
```js
// Đoạn thẳng
const AB = board.create('segment', [A, B], { ...STYLE.segment });

// Đường thẳng (kéo dài 2 phía)
const d = board.create('line', [A, B], { ...STYLE.line });

// Tia AB  
const ray = board.create('line', [A, B], { 
    ...STYLE.line, straightFirst: false, straightLast: true 
});

// Đường thẳng qua 1 điểm song song với đường d
const d2 = board.create('parallel', [d, C], { ...STYLE.auxiliary });

// Đường thẳng qua 1 điểm vuông góc với đường d  
const d3 = board.create('perpendicular', [d, C], { ...STYLE.auxiliary });
```

#### Đường tròn
```js
// Đường tròn tâm O bán kính r
const circle = board.create('circle', [O, r], { ...STYLE.circle });

// Đường tròn qua 3 điểm
const circumcircle = board.create('circumcircle', [A, B, C], { ...STYLE.circle });

// Đường tròn nội tiếp tam giác
const incircle = board.create('incircle', [A, B, C], { 
    ...STYLE.circle, strokeColor: '#10b981' 
});
```

#### Tam giác & Đa giác
```js
// Tam giác
const triangle = board.create('polygon', [A, B, C], { ...STYLE.polygon });

// Tứ giác
const quad = board.create('polygon', [A, B, C, D], { ...STYLE.polygon });
```

#### Góc
```js
// Góc BAC (đỉnh A, từ cạnh AB đến AC ngược chiều kim đồng hồ)
const angle = board.create('angle', [B, A, C], {
    ...STYLE.angle,
    name: function() {
        return (JXG.Math.Geometry.rad(B, A, C) * 180 / Math.PI).toFixed(1) + '°';
    }
});

// Góc vuông
const rightAngle = board.create('angle', [B, A, C], {
    ...STYLE.angle, type: 'square', radius: 0.4
});
```

#### Phép biến hình
```js
// Đối xứng trục
const A_sym = board.create('reflection', [A, d], { name: "A'" });

// Đối xứng tâm
const t = board.create('transform', [O], { type: 'reflect' });

// Phép quay góc alpha quanh tâm O
const rot = board.create('transform', [alpha, O], { type: 'rotate' });
const A_rot = board.create('point', [A, rot], { name: "A'" });

// Phép tịnh tiến
const trans = board.create('transform', [dx, dy], { type: 'translate' });
```

#### Đường conic
```js
// Parabol
const parab = board.create('curve', [
    function(t) { return t; },
    function(t) { return t*t; },
    -5, 5
], { strokeColor: '#a78bfa', strokeWidth: 2 });

// Ellipse: x²/a² + y²/b² = 1
const ellipse = board.create('curve', [
    function(t) { return a * Math.cos(t); },
    function(t) { return b * Math.sin(t); },
    0, 2 * Math.PI
], { strokeColor: '#f472b6', strokeWidth: 2 });

// Hàm số bất kỳ
const graph = board.create('functiongraph', [
    function(x) { return Math.sin(x); },
    -5, 5
], { strokeColor: '#38bdf8', strokeWidth: 2.5 });
```

#### Annotation & Đo lường
```js
// Hiển thị độ dài
const lengthText = board.create('text', [
    function() { return (A.X() + B.X()) / 2; },
    function() { return (A.Y() + B.Y()) / 2 + 0.3; },
    function() { return A.Dist(B).toFixed(2); }
], { fontSize: 14, color: '#94a3b8' });

// Nhãn cạnh vuông góc  
board.create('text', [
    function() { return (A.X() + B.X()) / 2 + 0.3; },
    function() { return (A.Y() + B.Y()) / 2; },
    'a'
], { fontSize: 15, color: '#f59e0b', fontStyle: 'italic' });
```

---

## 3. ENGINE 3D - JSXGRAPH VIEW3D

### 3.1 Template 3D cơ bản (JSXGraph)

JSXGraph hỗ trợ 3D trực tiếp với `view3d`. **Ưu tiên dùng cách này cho hình 3D thông thường**.

```html
<div id="jxgbox" class="jxgbox" style="width:700px; height:700px;"></div>
<script>
    const board = JXG.JSXGraph.initBoard('jxgbox', {
        boundingbox: [-8, 8, 8, -8],
        axis: false, showcopyright: false, shownavigation: false
    });
    
    const view = board.create('view3d', [
        [-6, -3],   // vị trí góc trên trái trên board 2D
        [8, 8],     // kích thước view
        [[-1, 5], [-1, 5], [-1, 5]]  // range [xMin,xMax], [yMin,yMax], [zMin,zMax]
    ], {
        xPlaneRear: { fillOpacity: 0.2, gradient: null },
        yPlaneRear: { fillOpacity: 0.2, gradient: null },
        zPlaneRear: { fillOpacity: 0.2, gradient: null },
        depthOrderPoints: true
    });

    // === Điểm 3D ===
    const A = view.create('point3d', [0, 0, 0], {
        name: 'A', size: 4, withLabel: true
    });
    
    // === Đoạn thẳng 3D ===
    const seg = view.create('line3d', [A, B]);
    
    // === Polygon 3D (mặt) ===
    const face = view.create('polygon3d', [[0,0,0], [4,0,0], [4,4,0], [0,4,0]], {
        fillColor: '#38bdf8', fillOpacity: 0.3,
        borders: { strokeColor: '#38bdf8' }
    });
    
    // === Mặt cầu ===
    const sphere = view.create('sphere3d', [center, point], {
        fillColor: '#a78bfa', fillOpacity: 0.3
    });
    
    // === Mặt tham số ===
    const surface = view.create('parametricsurface3d', [
        (u, v) => /* x(u,v) */,
        (u, v) => /* y(u,v) */,
        (u, v) => /* z(u,v) */,
        [uMin, uMax], [vMin, vMax]
    ], { stepsU: 40, stepsV: 40 });
</script>
```

### 3.2 Hướng dẫn vẽ các khối hình 3D phổ biến

#### Hình hộp chữ nhật (a × b × c)
```js
function drawBox(view, a, b, c) {
    const vertices = [
        [0,0,0], [a,0,0], [a,b,0], [0,b,0],  // đáy
        [0,0,c], [a,0,c], [a,b,c], [0,b,c]   // nắp
    ];
    const points = vertices.map((v, i) => 
        view.create('point3d', v, {
            name: ['A','B','C','D','A\'','B\'','C\'','D\''][i],
            size: 3, withLabel: true
        })
    );
    // Đáy
    view.create('polygon3d', [points[0],points[1],points[2],points[3]], {
        fillColor: '#38bdf8', fillOpacity: 0.2,
        borders: { strokeColor: '#38bdf8', strokeWidth: 2 }
    });
    // Nắp
    view.create('polygon3d', [points[4],points[5],points[6],points[7]], {
        fillColor: '#f59e0b', fillOpacity: 0.2,
        borders: { strokeColor: '#f59e0b', strokeWidth: 2 }
    });
    // Cạnh bên
    for (let i = 0; i < 4; i++) {
        view.create('line3d', [points[i], points[i+4]], {
            strokeColor: '#64748b', strokeWidth: 1.5
        });
    }
    return points;
}
```

#### Hình chóp tam giác đều S.ABC
```js
function drawPyramid(view, a, h) {
    const half = a / 2;
    const h3 = a * Math.sqrt(3) / 6; // tâm tam giác đều
    const H3 = a * Math.sqrt(3) / 2;
    
    const A = view.create('point3d', [0, 0, 0], { name: 'A', size: 3 });
    const B = view.create('point3d', [a, 0, 0], { name: 'B', size: 3 });
    const C = view.create('point3d', [half, H3, 0], { name: 'C', size: 3 });
    const S = view.create('point3d', [half, h3, h], { name: 'S', size: 4, 
        fillColor: '#ef4444' });
    
    // Đáy
    view.create('polygon3d', [A, B, C], {
        fillColor: '#38bdf8', fillOpacity: 0.15,
        borders: { strokeColor: '#38bdf8', strokeWidth: 2 }
    });
    // Mặt bên
    [[S,A,B], [S,B,C], [S,A,C]].forEach(face => {
        view.create('polygon3d', face, {
            fillColor: '#f59e0b', fillOpacity: 0.1,
            borders: { strokeColor: '#f59e0b', strokeWidth: 1.5 }
        });
    });
    return { A, B, C, S };
}
```

#### Hình chóp tứ giác đều S.ABCD
```js
function drawSquarePyramid(view, a, h) {
    const half = a / 2;
    const A = view.create('point3d', [0, 0, 0], { name: 'A', size: 3 });
    const B = view.create('point3d', [a, 0, 0], { name: 'B', size: 3 });
    const C = view.create('point3d', [a, a, 0], { name: 'C', size: 3 });
    const D = view.create('point3d', [0, a, 0], { name: 'D', size: 3 });
    const S = view.create('point3d', [half, half, h], { name: 'S', size: 4,
        fillColor: '#ef4444' });
    
    // Đáy 
    view.create('polygon3d', [A, B, C, D], {
        fillColor: '#38bdf8', fillOpacity: 0.15,
        borders: { strokeColor: '#38bdf8', strokeWidth: 2 }
    });
    // 4 mặt bên
    [[S,A,B],[S,B,C],[S,C,D],[S,D,A]].forEach(face => {
        view.create('polygon3d', face, {
            fillColor: '#f59e0b', fillOpacity: 0.1,
            borders: { strokeColor: '#f59e0b', strokeWidth: 1.5 }
        });
    });
    return { A, B, C, D, S };
}
```

#### Lăng trụ tam giác đều
```js
function drawTriangularPrism(view, a, h) {
    const H3 = a * Math.sqrt(3) / 2;
    const half = a / 2;
    const bottom = [
        [0, 0, 0], [a, 0, 0], [half, H3, 0]
    ];
    const top = bottom.map(v => [v[0], v[1], h]);
    
    const names = ['A','B','C','A\'','B\'','C\''];
    const pts = [...bottom, ...top].map((v, i) =>
        view.create('point3d', v, { name: names[i], size: 3 })
    );
    
    // Đáy dưới & trên
    view.create('polygon3d', [pts[0],pts[1],pts[2]], {
        fillColor: '#38bdf8', fillOpacity: 0.15,
        borders: { strokeColor: '#38bdf8', strokeWidth: 2 }
    });
    view.create('polygon3d', [pts[3],pts[4],pts[5]], {
        fillColor: '#f59e0b', fillOpacity: 0.15,
        borders: { strokeColor: '#f59e0b', strokeWidth: 2 }
    });
    // 3 cạnh bên
    for (let i = 0; i < 3; i++) {
        view.create('line3d', [pts[i], pts[i+3]], {
            strokeColor: '#64748b', strokeWidth: 1.5
        });
    }
    return pts;
}
```

#### Hình trụ
```js
function drawCylinder(view, R, h, steps) {
    steps = steps || 36;
    // Đáy dưỡi
    view.create('curve3d', [
        t => R * Math.cos(t), t => R * Math.sin(t), t => 0,
        [0, 2 * Math.PI]
    ], { strokeColor: '#38bdf8', strokeWidth: 2, numberPointsHigh: steps });
    // Đáy trên
    view.create('curve3d', [
        t => R * Math.cos(t), t => R * Math.sin(t), t => h,
        [0, 2 * Math.PI]
    ], { strokeColor: '#f59e0b', strokeWidth: 2, numberPointsHigh: steps });
    // Mặt bên (parametric surface)
    view.create('parametricsurface3d', [
        (u, v) => R * Math.cos(u),
        (u, v) => R * Math.sin(u),
        (u, v) => v,
        [0, 2*Math.PI], [0, h]
    ], {
        strokeColor: '#a78bfa', fillColor: '#a78bfa', fillOpacity: 0.1,
        stepsU: steps, stepsV: 2
    });
}
```

---

## 4. ENGINE 3D NÂNG CAO - THREE.JS

### Dùng khi nào?
- Cần render đa diện phức tạp (icosahedron, dodecahedron...)  
- Cần hiệu ứng ánh sáng, đổ bóng chân thực
- Cần animation xoay mượt mà
- JSXGraph view3d không đáp ứng đủ

### 4.1 Template Three.js

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Hình 3D - [Tên bài toán]</title>
    <style>
        * { margin: 0; padding: 0; }
        body { background: #0f172a; overflow: hidden; }
        canvas { display: block; }
        #info {
            position: absolute; top: 16px; left: 16px;
            color: #e2e8f0; font-family: 'Segoe UI', sans-serif;
            background: rgba(15,23,42,0.85); padding: 16px 20px;
            border-radius: 10px; border: 1px solid #334155;
            font-size: 14px; max-width: 300px;
        }
        #info h3 { color: #38bdf8; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div id="info">
        <h3>📐 [Tên hình]</h3>
        <p>[Thông số]</p>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <script>
        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);
        
        // Camera
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
        camera.position.set(5, 4, 6);
        camera.lookAt(0, 0, 0);
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);
        
        // Controls (xoay bằng chuột)
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        // Ánh sáng
        const ambientLight = new THREE.AmbientLight(0x404060);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);
        
        // Grid
        const grid = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b);
        scene.add(grid);
        
        // Axes
        const axes = new THREE.AxesHelper(3);
        scene.add(axes);
        
        // === TẠO HÌNH Ở ĐÂY ===
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
        
        // Responsive
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>
```

### 4.2 Hàm tiện ích Three.js

```js
// Vẽ cạnh (edge) giữa 2 điểm
function createEdge(v1, v2, color = 0x38bdf8) {
    const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...v1), new THREE.Vector3(...v2)
    ]);
    const mat = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geo, mat);
}

// Vẽ mặt (face) từ mảng vertices
function createFace(vertices, color = 0x38bdf8, opacity = 0.3) {
    const shape = new THREE.Shape();
    // ... triangulate
    const geo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 1; i < vertices.length - 1; i++) {
        positions.push(...vertices[0], ...vertices[i], ...vertices[i+1]);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhongMaterial({ 
        color, transparent: true, opacity, side: THREE.DoubleSide
    });
    return new THREE.Mesh(geo, mat);
}

// Vẽ nhãn điểm (CSS2D hoặc sprite)
function createLabel(text, position, color = '#e2e8f0') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128; canvas.height = 64;
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, 64, 45);
    
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(...position);
    sprite.scale.set(0.8, 0.4, 1);
    return sprite;
}
```

---

## 5. BẢNG MAPPING BÀI TOÁN → ENGINE

| Loại bài toán | Engine | Ghi chú |
|---------------|--------|---------|
| Hình phẳng (tam giác, tứ giác, đa giác) | JSXGraph 2D | Dùng board thường |
| Đường tròn, tiếp tuyến, cung | JSXGraph 2D | Có sẵn circumcircle, incircle |
| Hàm số, đồ thị | JSXGraph 2D | functiongraph, curve |
| Hệ toạ độ, vector | JSXGraph 2D | point, arrow, segment |
| Hình chiếu, phép biến hình 2D | JSXGraph 2D | transform |
| Hình hộp, chóp, lăng trụ đơn giản | JSXGraph 3D | view3d + polygon3d |
| Cầu, trụ, nón | JSXGraph 3D | parametricsurface3d |
| Đa diện phức tạp (20+ mặt) | Three.js | Cần render đẹp |
| Cần xoay 3D mượt + ánh sáng | Three.js | OrbitControls |
| Bài kết hợp 2D + công thức | JSXGraph 2D + MathJax | |

---

## 6. QUY TẮC STYLE & MÀU SẮC

### Bảng màu chuẩn
```
Primary (cạnh chính):     #38bdf8 (sky blue)
Secondary (đường phụ):    #a78bfa (purple)
Accent (điểm đặc biệt):  #f59e0b (amber)
Danger (kết quả/highlight): #ef4444 (red)
Success (đáp án):         #10b981 (emerald)
Muted (đường kẻ nền):     #475569 (slate)
Text:                     #e2e8f0 (light gray)
Background:               #0f172a (dark navy)
Surface:                  #1e293b (dark slate)
```

### Quy tắc đặt nhãn
1. **Đỉnh**: in hoa (A, B, C, S...), offset tránh đè lên cạnh
2. **Cạnh**: in thường nghiêng (a, b, c...), đặt giữa cạnh, dịch ra ngoài
3. **Góc**: ký hiệu góc hoặc số đo (α, 60°...)
4. **Đường phụ**: nét đứt, màu nhạt (#475569)
5. **Kết quả cần tìm**: highlight màu đỏ (#ef4444), nét đậm hơn

### Quy tắc tương tác
1. Cho phép kéo các điểm khi bài toán có tính tổng quát
2. Hiển thị đo lường động (độ dài, góc) khi kéo
3. Panel thông tin bên dưới hiển thị tóm tắt tính chất

---

## 7. VÍ DỤ ÁP DỤNG

### Ví dụ 1: "Cho tam giác ABC vuông tại A, AB = 3, AC = 4. Vẽ đường cao AH."

**Phân tích**: 
- Tam giác vuông tại A → A(0,0), B(3,0), C(0,4)
- Cần vẽ: tam giác + đường cao AH từ A xuống BC
- Engine: JSXGraph 2D

```js
const board = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-1, 5.5, 5, -1], keepAspectRatio: true,
    axis: false, grid: false, showCopyright: false
});

const A = board.create('point', [0, 0], { name:'A', fixed:true, size:4 });
const B = board.create('point', [3, 0], { name:'B', fixed:true, size:4 });  
const C = board.create('point', [0, 4], { name:'C', fixed:true, size:4 });

// Tam giác
board.create('polygon', [A, B, C], { 
    fillColor:'#38bdf820', borders:{ strokeColor:'#38bdf8', strokeWidth:2.5 }
});

// Góc vuông tại A
board.create('angle', [B, A, C], { type:'square', radius:0.35, strokeColor:'#f472b6' });

// Đường cao AH
const BC = board.create('line', [B, C], { visible: false });
const H = board.create('perpendicularpoint', [A, BC], { 
    name:'H', size:4, fillColor:'#ef4444' 
});
board.create('segment', [A, H], { strokeColor:'#ef4444', strokeWidth:2, dash:2 });

// Góc vuông tại H
board.create('angle', [A, H, B], { type:'square', radius:0.3, strokeColor:'#10b981' });

// Nhãn cạnh
board.create('text', [1.5, -0.4, 'a = 3'], { fontSize:14, color:'#94a3b8' });
board.create('text', [-0.6, 2, 'b = 4'], { fontSize:14, color:'#94a3b8' });
```

### Ví dụ 2: "Cho hình chóp S.ABCD, đáy ABCD là hình vuông cạnh a, SA ⊥ đáy, SA = a√2"

**Phân tích**:
- Hình chóp tứ giác, SA vuông góc đáy
- Engine: JSXGraph 3D (view3d)
- a = 4 (chuẩn hoá), SA = 4√2

```js
const a = 4, h = a * Math.sqrt(2);
const board = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-8, 8, 8, -8], axis: false, showcopyright: false
});
const view = board.create('view3d', [
    [-6, -3], [8, 8], [[-1, 6], [-1, 6], [-1, 8]]
], {
    xPlaneRear: { fillOpacity: 0.15 },
    yPlaneRear: { fillOpacity: 0.15 },
    zPlaneRear: { fillOpacity: 0.15 }
});

const A = view.create('point3d', [0,0,0], { name:'A', size:3 });
const B = view.create('point3d', [a,0,0], { name:'B', size:3 });
const C = view.create('point3d', [a,a,0], { name:'C', size:3 });
const D = view.create('point3d', [0,a,0], { name:'D', size:3 });
const S = view.create('point3d', [0,0,h], { name:'S', size:4 });

// Đáy
view.create('polygon3d', [A,B,C,D], { 
    fillColor:'#38bdf8', fillOpacity:0.15,
    borders: { strokeColor:'#38bdf8', strokeWidth:2 }
});
// Cạnh bên
[B,C,D].forEach(p => view.create('line3d', [S, p], { 
    strokeColor:'#f59e0b', strokeWidth:1.5 
}));
// SA đặc biệt (vuông góc)
view.create('line3d', [S, A], { strokeColor:'#ef4444', strokeWidth:2.5 });
```

---

## 8. CHECKLIST TRƯỚC KHI OUTPUT

- [ ] Hình vẽ **đúng** với đề bài (đúng tọa độ, đúng quan hệ)
- [ ] Tất cả đỉnh có **nhãn** rõ ràng, không bị đè
- [ ] Các cạnh/đường quan trọng được **phân biệt** bằng màu/nét
- [ ] Đường phụ dùng **nét đứt**, màu nhạt
- [ ] Kết quả cần tìm được **highlight** màu đỏ
- [ ] Góc vuông có **ký hiệu vuông**
- [ ] BoundingBox **vừa vặn**, không quá rộng/chật
- [ ] Có **panel thông tin** hiển thị dữ kiện
- [ ] Giao diện **dark theme**, đẹp mắt
- [ ] Hình có thể **tương tác** (zoom/kéo) khi phù hợp
