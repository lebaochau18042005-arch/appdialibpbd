/**
 * CÔNG THỨC TOÁN HỌC - Bảng tra nhanh cho hình học
 * Dùng kết hợp với MathJax/KaTeX để render
 * 
 * Mỗi entry gồm: name, formulas (dạng LaTeX), conditions
 */

const MATH_FORMULAS = {

  // =====================================================
  // TAM GIÁC
  // =====================================================
  triangle: {
    area: [
      { formula: "S = \\frac{1}{2} \\cdot a \\cdot h_a", desc: "Diện tích (đáy × cao)" },
      { formula: "S = \\frac{1}{2} \\cdot a \\cdot b \\cdot \\sin C", desc: "Diện tích (2 cạnh góc xen)" },
      { formula: "S = \\sqrt{p(p-a)(p-b)(p-c)}", desc: "Heron (p = nửa chu vi)" },
      { formula: "S = \\frac{abc}{4R}", desc: "Diện tích theo R ngoại tiếp" },
      { formula: "S = p \\cdot r", desc: "Diện tích theo r nội tiếp" }
    ],
    cosine: "c^2 = a^2 + b^2 - 2ab\\cos C",
    sine: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R",
    medians: {
      length: "m_a = \\frac{1}{2}\\sqrt{2b^2 + 2c^2 - a^2}",
      centroid: "G = \\left(\\frac{x_A+x_B+x_C}{3}, \\frac{y_A+y_B+y_C}{3}\\right)"
    },
    special: {
      equilateral: {
        height: "h = \\frac{a\\sqrt{3}}{2}",
        area: "S = \\frac{a^2\\sqrt{3}}{4}",
        R: "R = \\frac{a\\sqrt{3}}{3}",
        r: "r = \\frac{a\\sqrt{3}}{6}"
      },
      right: {
        pythagoras: "c^2 = a^2 + b^2",
        altitude: "AH^2 = BH \\cdot HC",
        projection: ["AB^2 = BH \\cdot BC", "AC^2 = HC \\cdot BC"],
        area: "S = \\frac{1}{2} \\cdot a \\cdot b"
      }
    }
  },

  // =====================================================
  // ĐƯỜNG TRÒN
  // =====================================================
  circle: {
    circumference: "C = 2\\pi R",
    area: "S = \\pi R^2",
    arc: "l = \\frac{\\pi R \\alpha}{180°}",
    sector: "S_{qt} = \\frac{\\pi R^2 \\alpha}{360°}",
    tangent: {
      property: "MA^2 = MO^2 - R^2",
      twoTangents: "MA = MB"
    },
    inscribed: "\\text{Góc nội tiếp} = \\frac{1}{2} \\cdot \\text{cung bị chắn}",
    power: "MA \\cdot MB = MC \\cdot MD"
  },

  // =====================================================
  // HÌNH KHÔNG GIAN
  // =====================================================
  solid: {
    prism: {
      volume: "V = S_{đáy} \\cdot h",
      lateral: "S_{xq} = p \\cdot l",
      total: "S_{tp} = S_{xq} + 2S_{đáy}"
    },
    pyramid: {
      volume: "V = \\frac{1}{3} S_{đáy} \\cdot h",
      lateral: "S_{xq} = \\frac{1}{2} p \\cdot d"
    },
    frustum: {
      volume: "V = \\frac{h}{3}(S_1 + S_2 + \\sqrt{S_1 S_2})"
    },
    cylinder: {
      volume: "V = \\pi R^2 h",
      lateral: "S_{xq} = 2\\pi R h",
      total: "S_{tp} = 2\\pi R(R + h)"
    },
    cone: {
      volume: "V = \\frac{1}{3}\\pi R^2 h",
      lateral: "S_{xq} = \\pi R l",
      slant: "l = \\sqrt{R^2 + h^2}"
    },
    sphere: {
      volume: "V = \\frac{4}{3}\\pi R^3",
      surface: "S = 4\\pi R^2",
      cap: "S_{chỏm} = 2\\pi R h_{chỏm}"
    }
  },

  // =====================================================
  // TỌA ĐỘ TRONG KHÔNG GIAN
  // =====================================================
  coordinate3D: {
    distance: "d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}",
    midpoint: "M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}, \\frac{z_1+z_2}{2}\\right)",
    plane: "ax + by + cz + d = 0",
    pointToPlane: "d = \\frac{|ax_0 + by_0 + cz_0 + d|}{\\sqrt{a^2+b^2+c^2}}",
    line: "\\frac{x-x_0}{a} = \\frac{y-y_0}{b} = \\frac{z-z_0}{c}",
    angle: {
      twoPlanes: "\\cos \\alpha = \\frac{|a_1a_2+b_1b_2+c_1c_2|}{\\sqrt{a_1^2+b_1^2+c_1^2}\\sqrt{a_2^2+b_2^2+c_2^2}}",
      lineAndPlane: "\\sin \\alpha = \\frac{|aa_1+bb_1+cc_1|}{\\sqrt{a^2+b^2+c^2}\\sqrt{a_1^2+b_1^2+c_1^2}}"
    }
  },

  // =====================================================
  // HÀM SỐ & ĐẠO HÀM
  // =====================================================
  calculus: {
    derivative: {
      power: "(x^n)' = nx^{n-1}",
      chain: "[f(g(x))]' = f'(g(x)) \\cdot g'(x)",
      product: "(uv)' = u'v + uv'",
      quotient: "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}"
    },
    extrema: {
      necessary: "f'(x_0) = 0",
      maximum: "f'(x) \\text{ đổi dấu } + \\to -",
      minimum: "f'(x) \\text{ đổi dấu } - \\to +"
    },
    inflection: "f''(x_0) = 0 \\text{ và } f'' \\text{ đổi dấu}",
    asymptotes: {
      vertical: "\\lim_{x \\to a} f(x) = \\pm\\infty",
      horizontal: "\\lim_{x \\to \\pm\\infty} f(x) = b",
      oblique: "y = kx + m, \\quad k = \\lim\\frac{f(x)}{x}, \\quad m = \\lim[f(x)-kx]"
    }
  }
};

// Export
if (typeof module !== 'undefined') {
  module.exports = MATH_FORMULAS;
}
