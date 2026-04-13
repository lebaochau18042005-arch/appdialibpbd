---
name: Three.js 3D Math Reference
description: Hướng dẫn sử dụng Three.js cho hình học 3D nâng cao (khối đa diện, mặt cong, animation)
---

# 🎲 Three.js - Hình 3D Nâng Cao

## Khi nào dùng Three.js thay vì JSXGraph 3D?
- Cần render nhiều mặt phức tạp (dodecahedron, icosahedron...)
- Cần ánh sáng, đổ bóng chân thực
- Cần animation xoay mượt liên tục
- Cần hiệu ứng material (metallic, glass...)
- JSXGraph view3d bị giật/chậm

## CDN
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
```

## Các khối hình có sẵn trong Three.js

```js
// Hình hộp chữ nhật
new THREE.BoxGeometry(width, height, depth);

// Hình cầu
new THREE.SphereGeometry(radius, widthSegments, heightSegments);

// Hình trụ
new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);

// Hình nón
new THREE.ConeGeometry(radius, height, radialSegments);

// Hình xuyến (donut)
new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);

// Tứ diện đều
new THREE.TetrahedronGeometry(radius);

// Bát diện đều
new THREE.OctahedronGeometry(radius);

// Mười hai mặt đều
new THREE.DodecahedronGeometry(radius);

// Hai mươi mặt đều
new THREE.IcosahedronGeometry(radius);
```

## Vẽ khối hình theo đỉnh (vertices + faces)

```js
function createPolyhedron(vertices, faces, color, opacity) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    
    faces.forEach(face => {
        // Triangulate: mỗi face là mảng indices
        for (let i = 1; i < face.length - 1; i++) {
            positions.push(
                ...vertices[face[0]],
                ...vertices[face[i]],
                ...vertices[face[i+1]]
            );
        }
    });
    
    geometry.setAttribute('position', 
        new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshPhongMaterial({
        color: color || 0x38bdf8,
        transparent: true,
        opacity: opacity || 0.5,
        side: THREE.DoubleSide,
        flatShading: true,
        shininess: 80
    });
    
    return new THREE.Mesh(geometry, material);
}
```

## Vẽ cạnh (wireframe riêng)

```js
function createEdges(vertices, edges, color) {
    const group = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ 
        color: color || 0x64748b, linewidth: 1 
    });
    
    edges.forEach(([i, j]) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...vertices[i]),
            new THREE.Vector3(...vertices[j])
        ]);
        group.add(new THREE.Line(geometry, material));
    });
    
    return group;
}
```

## Vẽ nhãn đỉnh (Sprite)

```js
function createVertexLabels(vertices, names, color) {
    const group = new THREE.Group();
    
    vertices.forEach((v, i) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 128; canvas.height = 64;
        
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = color || '#fbbf24';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(names[i] || String.fromCharCode(65 + i), 64, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        // Đặt vị trí nhãn lệch ra ngoài 1 chút
        const dir = new THREE.Vector3(...v).normalize();
        sprite.position.set(v[0] + dir.x * 0.3, v[1] + dir.y * 0.3, v[2] + dir.z * 0.3);
        sprite.scale.set(0.6, 0.3, 1);
        
        group.add(sprite);
    });
    
    return group;
}
```

## Ví dụ: Hình chóp S.ABCD hoàn chỉnh

```js
// Đỉnh
const a = 4, h = 5;
const vertices = [
    [0, 0, 0],      // A - 0
    [a, 0, 0],      // B - 1
    [a, a, 0],      // C - 2
    [0, a, 0],      // D - 3
    [a/2, a/2, h]   // S - 4
];

// Mặt
const faces = [
    [0, 1, 2, 3],   // đáy ABCD
    [4, 0, 1],      // SAB
    [4, 1, 2],      // SBC
    [4, 2, 3],      // SCD
    [4, 3, 0]       // SDA
];

// Mặt đáy
const base = createPolyhedron(
    vertices, [[0,1,2,3]], 0x38bdf8, 0.2
);
scene.add(base);

// Mặt bên
const sides = createPolyhedron(
    vertices, [[4,0,1],[4,1,2],[4,2,3],[4,3,0]], 0xf59e0b, 0.15
);
scene.add(sides);

// Cạnh
const edges = [
    [0,1],[1,2],[2,3],[3,0], // đáy
    [4,0],[4,1],[4,2],[4,3]  // bên
];
scene.add(createEdges(vertices, edges, 0x94a3b8));

// Nhãn
scene.add(createVertexLabels(vertices, ['A','B','C','D','S']));
```

## Animation xoay chậm

```js
function animate() {
    requestAnimationFrame(animate);
    
    // Xoay nhẹ
    mesh.rotation.y += 0.003;
    
    controls.update();
    renderer.render(scene, camera);
}
```

## Highlight một cạnh / mặt đặc biệt

```js
// Đường đặc biệt (SA vuông góc đáy)
function createHighlightEdge(v1, v2, color) {
    const curve = new THREE.CurvePath();
    const line = new THREE.LineCurve3(
        new THREE.Vector3(...v1), new THREE.Vector3(...v2)
    );
    const geometry = new THREE.TubeGeometry(line, 1, 0.03, 8);
    const material = new THREE.MeshPhongMaterial({ 
        color: color || 0xef4444, emissive: color || 0xef4444, 
        emissiveIntensity: 0.3 
    });
    return new THREE.Mesh(geometry, material);
}
```

## Mặt cong tham số

```js
function createParametricSurface(fx, fy, fz, uRange, vRange, steps) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const [uMin, uMax] = uRange;
    const [vMin, vMax] = vRange;
    const du = (uMax - uMin) / steps;
    const dv = (vMax - vMin) / steps;
    
    for (let i = 0; i < steps; i++) {
        for (let j = 0; j < steps; j++) {
            const u = uMin + i * du;
            const v = vMin + j * dv;
            const u1 = u + du;
            const v1 = v + dv;
            
            // Triangle 1
            positions.push(fx(u,v), fy(u,v), fz(u,v));
            positions.push(fx(u1,v), fy(u1,v), fz(u1,v));
            positions.push(fx(u,v1), fy(u,v1), fz(u,v1));
            
            // Triangle 2
            positions.push(fx(u1,v), fy(u1,v), fz(u1,v));
            positions.push(fx(u1,v1), fy(u1,v1), fz(u1,v1));
            positions.push(fx(u,v1), fy(u,v1), fz(u,v1));
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: 0xa78bfa, transparent: true, opacity: 0.4,
        side: THREE.DoubleSide
    }));
}

// Ví dụ: mặt cầu x² + y² + z² = R²
scene.add(createParametricSurface(
    (u,v) => R * Math.sin(v) * Math.cos(u),
    (u,v) => R * Math.sin(v) * Math.sin(u),
    (u,v) => R * Math.cos(v),
    [0, 2*Math.PI], [0, Math.PI], 40
));
```
