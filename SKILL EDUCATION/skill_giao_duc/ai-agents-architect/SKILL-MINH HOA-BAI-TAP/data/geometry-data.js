/**
 * DỮ LIỆU HÌNH HỌC 3D - Các khối thường gặp trong Toán THCS/THPT
 * Mỗi khối gồm: name, vertices, edges, faces
 * Toạ độ đã chuẩn hoá, có thể scale theo a (cạnh) bất kỳ
 * 
 * Sử dụng:
 *   const shape = POLYHEDRA.tetrahedron;
 *   shape.vertices.forEach(v => { ... });
 */

const POLYHEDRA = {

  // =====================================================
  // TỨ DIỆN ĐỀU (4 mặt tam giác đều)
  // =====================================================
  tetrahedron: {
    name: "Tứ diện đều",
    nameVi: "Tứ diện đều",
    formula: { V: "a³√2/12", S: "a²√3", slant: "a√3/2" },
    vertices: [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1]
    ],
    edges: [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],
    faces: [[0,1,2],[0,2,3],[0,1,3],[1,2,3]],
    labels: ["A","B","C","D"]
  },

  // =====================================================
  // HÌNH LẬP PHƯƠNG (6 mặt vuông)
  // =====================================================
  cube: {
    name: "Hình lập phương",
    nameVi: "Hình lập phương",
    formula: { V: "a³", S: "6a²", diagonal: "a√3" },
    vertices: [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
    ],
    edges: [
      [0,1],[1,2],[2,3],[3,0],  // đáy
      [4,5],[5,6],[6,7],[7,4],  // nắp
      [0,4],[1,5],[2,6],[3,7]   // cạnh bên
    ],
    faces: [
      [0,1,2,3], [4,5,6,7],    // đáy, nắp
      [0,1,5,4], [1,2,6,5],    // mặt bên
      [2,3,7,6], [3,0,4,7]
    ],
    labels: ["A","B","C","D","A'","B'","C'","D'"]
  },

  // =====================================================
  // HÌNH HỘP CHỮ NHẬT (a × b × c)
  // =====================================================
  cuboid: {
    name: "Hình hộp chữ nhật",
    nameVi: "Hình hộp chữ nhật",
    formula: { V: "a·b·c", S: "2(ab+bc+ac)", diagonal: "√(a²+b²+c²)" },
    vertices: [
      [0, 0, 0], [1, 0, 0], [1, 0.75, 0], [0, 0.75, 0],
      [0, 0, 1.25], [1, 0, 1.25], [1, 0.75, 1.25], [0, 0.75, 1.25]
    ],
    edges: [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ],
    faces: [
      [0,1,2,3], [4,5,6,7],
      [0,1,5,4], [1,2,6,5],
      [2,3,7,6], [3,0,4,7]
    ],
    labels: ["A","B","C","D","A'","B'","C'","D'"]
  },

  // =====================================================
  // BÁT DIỆN ĐỀU (8 mặt tam giác đều)
  // =====================================================
  octahedron: {
    name: "Bát diện đều",
    nameVi: "Bát diện đều",
    formula: { V: "a³√2/3", S: "2a²√3" },
    vertices: [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1]
    ],
    edges: [
      [0,2],[0,3],[0,4],[0,5],
      [1,2],[1,3],[1,4],[1,5],
      [2,4],[2,5],[3,4],[3,5]
    ],
    faces: [
      [0,2,4],[0,4,3],[0,3,5],[0,5,2],
      [1,2,4],[1,4,3],[1,3,5],[1,5,2]
    ],
    labels: ["A","B","C","D","E","F"]
  },

  // =====================================================
  // HÌNH CHÓP TAM GIÁC ĐỀU S.ABC
  // =====================================================
  triangularPyramid: {
    name: "Hình chóp tam giác đều",
    nameVi: "Chóp tam giác đều S.ABC",
    formula: { V: "⅓·S_đáy·h", S: "S_đáy + 3·S_bên" },
    vertices: [
      [0, 0, 0],                          // A
      [1, 0, 0],                          // B
      [0.5, Math.sqrt(3)/2, 0],           // C
      [0.5, Math.sqrt(3)/6, Math.sqrt(6)/3] // S (đỉnh)
    ],
    edges: [[0,1],[1,2],[2,0],[0,3],[1,3],[2,3]],
    faces: [[0,1,2],[0,1,3],[1,2,3],[2,0,3]],
    labels: ["A","B","C","S"]
  },

  // =====================================================
  // HÌNH CHÓP TỨ GIÁC ĐỀU S.ABCD
  // =====================================================
  squarePyramid: {
    name: "Hình chóp tứ giác đều",
    nameVi: "Chóp tứ giác đều S.ABCD",
    formula: { V: "⅓·a²·h", S: "a² + 2a·l" },
    vertices: [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], // đáy ABCD
      [0.5, 0.5, 1]                                  // đỉnh S
    ],
    edges: [
      [0,1],[1,2],[2,3],[3,0],  // đáy
      [0,4],[1,4],[2,4],[3,4]   // cạnh bên
    ],
    faces: [
      [0,1,2,3],    // đáy
      [0,1,4],[1,2,4],[2,3,4],[3,0,4]  // mặt bên
    ],
    labels: ["A","B","C","D","S"],
    special: { center: [0.5, 0.5, 0], heightLine: [[0.5,0.5,0],[0.5,0.5,1]] }
  },

  // =====================================================
  // LĂNG TRỤ TAM GIÁC ĐỀU ABC.A'B'C'
  // =====================================================
  triangularPrism: {
    name: "Lăng trụ tam giác đều",
    nameVi: "Lăng trụ tam giác đều ABC.A'B'C'",
    formula: { V: "S_đáy·h", S: "2·S_đáy + S_xq" },
    vertices: [
      [0, 0, 0], [1, 0, 0], [0.5, Math.sqrt(3)/2, 0],     // đáy
      [0, 0, 1], [1, 0, 1], [0.5, Math.sqrt(3)/2, 1]      // nắp
    ],
    edges: [
      [0,1],[1,2],[2,0],   // đáy
      [3,4],[4,5],[5,3],   // nắp
      [0,3],[1,4],[2,5]    // cạnh bên
    ],
    faces: [
      [0,1,2], [3,4,5],           // đáy, nắp
      [0,1,4,3], [1,2,5,4], [2,0,3,5]  // mặt bên
    ],
    labels: ["A","B","C","A'","B'","C'"]
  },

  // =====================================================
  // LĂNG TRỤ LỤC GIÁC ĐỀU
  // =====================================================
  hexagonalPrism: {
    name: "Lăng trụ lục giác đều",
    nameVi: "Lăng trụ lục giác đều",
    formula: { V: "3a²√3/2·h", S: "3a²√3 + 6ah" },
    vertices: (function() {
      const v = [];
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        v.push([Math.cos(angle), Math.sin(angle), 0]);
      }
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        v.push([Math.cos(angle), Math.sin(angle), 1]);
      }
      return v;
    })(),
    edges: (function() {
      const e = [];
      for (let i = 0; i < 6; i++) { e.push([i, (i+1)%6]); }           // đáy
      for (let i = 6; i < 12; i++) { e.push([i, 6+(i+1-6)%6]); }      // nắp
      for (let i = 0; i < 6; i++) { e.push([i, i+6]); }               // cạnh bên
      return e;
    })(),
    faces: (function() {
      const f = [[0,1,2,3,4,5], [6,7,8,9,10,11]];
      for (let i = 0; i < 6; i++) {
        f.push([i, (i+1)%6, (i+1)%6+6, i+6]);
      }
      return f;
    })(),
    labels: ["A","B","C","D","E","F","A'","B'","C'","D'","E'","F'"]
  },

  // =====================================================
  // HÌNH MƯỜI HAI MẶT ĐỀU (Dodecahedron)
  // =====================================================
  dodecahedron: {
    name: "Hình mười hai mặt đều",
    nameVi: "Thập nhị diện đều",
    formula: { V: "(15+7√5)/4·a³", faces: 12, edges: 30, vertices: 20 },
    vertices: (function() {
      const phi = (1 + Math.sqrt(5)) / 2;
      const v = [];
      // 8 vertices of cube
      for (let x of [-1,1]) for (let y of [-1,1]) for (let z of [-1,1])
        v.push([x, y, z]);
      // 12 vertices on faces
      for (let x of [-1/phi, 1/phi]) for (let y of [-phi, phi])
        v.push([0, x, y]);
      for (let x of [-1/phi, 1/phi]) for (let y of [-phi, phi])
        v.push([y, 0, x]);
      for (let x of [-1/phi, 1/phi]) for (let y of [-phi, phi])
        v.push([x, y, 0]);
      return v;
    })(),
    edges: [], // Complex - use Three.js DodecahedronGeometry instead
    faces: []
  },

  // =====================================================
  // HÌNH HAI MƯƠI MẶT ĐỀU (Icosahedron)
  // =====================================================
  icosahedron: {
    name: "Hình hai mươi mặt đều",
    nameVi: "Nhị thập diện đều",
    formula: { V: "5(3+√5)/12·a³", faces: 20, edges: 30, vertices: 12 },
    vertices: (function() {
      const phi = (1 + Math.sqrt(5)) / 2;
      return [
        [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
        [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
        [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
      ];
    })(),
    edges: [], // Use Three.js IcosahedronGeometry
    faces: []
  }
};

// =====================================================
// HÌNH TRÒN XOAY - Tham số sinh toạ độ
// =====================================================
const REVOLUTION_BODIES = {

  // Hình trụ: (R, h) → parametric
  cylinder: {
    name: "Hình trụ",
    parametric: (R, h) => ({
      x: (u, v) => R * Math.cos(u),
      y: (u, v) => R * Math.sin(u),
      z: (u, v) => v * h,
      uRange: [0, 2 * Math.PI],
      vRange: [0, 1]
    }),
    formula: { V: "πR²h", Sxq: "2πRh", Stp: "2πR(R+h)" }
  },

  // Hình nón: (R, h) → parametric
  cone: {
    name: "Hình nón",
    parametric: (R, h) => ({
      x: (u, v) => R * (1 - v) * Math.cos(u),
      y: (u, v) => R * (1 - v) * Math.sin(u),
      z: (u, v) => v * h,
      uRange: [0, 2 * Math.PI],
      vRange: [0, 1]
    }),
    formula: { V: "⅓πR²h", Sxq: "πRl", l: "√(R²+h²)" }
  },

  // Hình nón cụt: (R1, R2, h) → parametric
  frustum: {
    name: "Hình nón cụt",
    parametric: (R1, R2, h) => ({
      x: (u, v) => (R1 + (R2 - R1) * v) * Math.cos(u),
      y: (u, v) => (R1 + (R2 - R1) * v) * Math.sin(u),
      z: (u, v) => v * h,
      uRange: [0, 2 * Math.PI],
      vRange: [0, 1]
    }),
    formula: { V: "⅓πh(R₁²+R₁R₂+R₂²)", Sxq: "π(R₁+R₂)l" }
  },

  // Mặt cầu: R → parametric
  sphere: {
    name: "Mặt cầu",
    parametric: (R) => ({
      x: (u, v) => R * Math.sin(v) * Math.cos(u),
      y: (u, v) => R * Math.sin(v) * Math.sin(u),
      z: (u, v) => R * Math.cos(v),
      uRange: [0, 2 * Math.PI],
      vRange: [0, Math.PI]
    }),
    formula: { V: "4/3·πR³", S: "4πR²" }
  },

  // Hình xuyến (Torus): (R, r) → parametric
  torus: {
    name: "Hình xuyến",
    parametric: (R, r) => ({
      x: (u, v) => (R + r * Math.cos(v)) * Math.cos(u),
      y: (u, v) => (R + r * Math.cos(v)) * Math.sin(u),
      z: (u, v) => r * Math.sin(v),
      uRange: [0, 2 * Math.PI],
      vRange: [0, 2 * Math.PI]
    }),
    formula: { V: "2π²Rr²", S: "4π²Rr" }
  }
};

// =====================================================
// HELPERS
// =====================================================

/**
 * Scale tất cả vertices theo hệ số k
 */
function scaleVertices(vertices, k) {
  return vertices.map(v => v.map(c => c * k));
}

/**
 * Translate tất cả vertices theo vector [dx, dy, dz]
 */
function translateVertices(vertices, offset) {
  return vertices.map(v => v.map((c, i) => c + offset[i]));
}

/**
 * Tính trung tâm (centroid) của các vertices
 */
function centroid(vertices) {
  const n = vertices.length;
  return [0, 1, 2].map(i => 
    vertices.reduce((s, v) => s + v[i], 0) / n
  );
}

/**
 * Tính khoảng cách 2 điểm
 */
function distance(a, b) {
  return Math.sqrt(
    (a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2
  );
}

/**
 * Tính trung điểm
 */
function midpoint(a, b) {
  return [(a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2];
}

// Export (nếu dùng module)
if (typeof module !== 'undefined') {
  module.exports = { POLYHEDRA, REVOLUTION_BODIES, scaleVertices, translateVertices, centroid, distance, midpoint };
}
