---
name: Skill Mô Phỏng Phòng Thí Nghiệm Ảo
description: Hướng dẫn toàn diện để tạo app mô phỏng thí nghiệm Vật lý, Hóa học, Sinh học trực quan với HTML5/JavaScript
---

# 🔬 SKILL MÔ PHỎNG PHÒNG THÍ NGHIỆM ẢO

## 1. TỔNG QUAN

Skill này cung cấp framework hoàn chỉnh để tạo các ứng dụng mô phỏng thí nghiệm khoa học trực quan, bao gồm:
- **Vật lý**: Cơ học, Điện học, Quang học, Sóng & Nhiệt
- **Hóa học**: Phản ứng hóa học, Pha chế, Chuẩn độ, pH
- **Sinh học**: Tế bào, Phân bào, Quang hợp, Giải phẫu

## 2. KIẾN TRÚC ỨNG DỤNG

```
┌──────────────────────────────────────────┐
│              UI LAYER                     │
│  React/Vanilla JS + CSS Animations       │
├──────────────────────────────────────────┤
│           RENDERING ENGINE               │
│  HTML5 Canvas (2D) / Three.js (3D)       │
│  + Konva.js (Drag & Drop)                │
├──────────────────────────────────────────┤
│          SIMULATION ENGINE               │
│  Matter.js (2D Physics)                  │
│  Cannon.js/Rapier (3D Physics)           │
│  Custom Chemistry/Biology Logic          │
├──────────────────────────────────────────┤
│            DATA LAYER                    │
│  JSON Database (reactions, experiments)  │
│  State Management (Redux/Context)        │
└──────────────────────────────────────────┘
```

### Mô hình MVC cho Simulation:
```
Model (Logic)     → Tính toán vật lý/hóa học/sinh học
View (Renderer)   → Canvas 2D / WebGL / SVG  
Controller (UI)   → Drag-drop, sliders, buttons
```

## 3. CÔNG NGHỆ & THƯ VIỆN

### 3.1 Rendering (Hiển thị)
| Thư viện | Mục đích | CDN |
|----------|----------|-----|
| **HTML5 Canvas** | Vẽ 2D cơ bản | Có sẵn |
| **Konva.js** | Drag & Drop trên Canvas | `https://unpkg.com/konva@9/konva.min.js` |
| **Three.js** | 3D WebGL rendering | `https://unpkg.com/three@0.160.0/build/three.module.js` |
| **Pixi.js** | 2D hiệu suất cao | `https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.min.js` |

### 3.2 Physics Engine (Vật lý)
| Thư viện | Mục đích | CDN |
|----------|----------|-----|
| **Matter.js** | Vật lý 2D rigid-body | `https://unpkg.com/matter-js@0.19.0/build/matter.min.js` |
| **Cannon-es** | Vật lý 3D | `https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js` |

### 3.3 Hóa học
| Thư viện | Mục đích |
|----------|----------|
| **Kekule.js** | Cấu trúc phân tử, SMILES |
| **ChemDoodle Web** | Vẽ cấu trúc hóa học 2D/3D |
| **3Dmol.js** | Hiển thị phân tử 3D |

### 3.4 Sinh học
| Thư viện | Mục đích |
|----------|----------|
| **Artistoo** | Mô phỏng tế bào CPM |
| **BioJS** | Component sinh học |
| **iCn3D** | Protein/DNA 3D viewer |

## 4. QUY TRÌNH TẠO APP MÔ PHỎNG

### Bước 1: Chọn Thí Nghiệm
- Tham khảo file `data/experiments_catalog.json` để chọn thí nghiệm
- Xác định loại mô phỏng: 2D Canvas / 3D WebGL / Animation CSS

### Bước 2: Thiết kế Giao Diện
```
┌─────────────────────────────────────────────────┐
│  🔬 Tên Thí Nghiệm              [Hướng dẫn] [🔄] │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  KỆ DỤNG CỤ │      VÙNG MÔ PHỎNG              │
│              │      (Canvas/WebGL)              │
│  🧪 Ống nghiệm│                                │
│  ⚗️ Bình cầu  │                                │
│  🔥 Đèn cồn  │                                │
│  📏 Thước đo  │                                │
│              │                                  │
├──────────────┴──────────────────────────────────┤
│  📋 NHẬT KÝ THÍ NGHIỆM                         │
│  [timestamp] Sự kiện...                         │
├─────────────────────────────────────────────────┤
│  ▶️ Bắt đầu  ⏸ Tạm dừng  🔄 Đặt lại  📊 Kết quả │
└─────────────────────────────────────────────────┘
```

### Bước 3: Implement Simulation Loop
```javascript
// Vòng lặp mô phỏng chuẩn
class SimulationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.objects = [];
    this.running = false;
    this.lastTime = 0;
  }
  
  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000; // seconds
    this.lastTime = now;
    
    this.update(dt);  // Cập nhật logic
    this.render();     // Vẽ lại
    requestAnimationFrame(() => this.loop());
  }
  
  update(dt) {
    for (const obj of this.objects) {
      // Áp dụng lực: F = ma → a = F/m
      obj.vx += (obj.fx / obj.mass) * dt;
      obj.vy += (obj.fy / obj.mass) * dt;
      obj.x += obj.vx * dt;
      obj.y += obj.vy * dt;
    }
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const obj of this.objects) {
      obj.draw(this.ctx);
    }
  }
}
```

### Bước 4: Thêm Tương Tác Drag & Drop
```javascript
// Drag & Drop cho dụng cụ thí nghiệm
function setupDragDrop(canvas, objects) {
  let dragging = null;
  let offsetX, offsetY;
  
  canvas.addEventListener('mousedown', (e) => {
    const {x, y} = getMousePos(canvas, e);
    dragging = objects.find(obj => obj.hitTest(x, y));
    if (dragging) {
      offsetX = x - dragging.x;
      offsetY = y - dragging.y;
    }
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const {x, y} = getMousePos(canvas, e);
    dragging.x = x - offsetX;
    dragging.y = y - offsetY;
  });
  
  canvas.addEventListener('mouseup', () => {
    if (dragging) {
      checkInteraction(dragging); // Kiểm tra tương tác
      dragging = null;
    }
  });
}
```

### Bước 5: Logic Phản Ứng (Hóa học)
```javascript
// Tham khảo data/chemistry_reactions.json
function checkReaction(chemical1, chemical2) {
  const key = [chemical1.id, chemical2.id].sort().join('+');
  const reaction = REACTIONS_DB[key];
  if (reaction) {
    return {
      products: reaction.products,
      color: reaction.observable.color_final,
      gas: reaction.observable.gas_produced,
      temperature: reaction.observable.temperature_change,
      animation: reaction.animation_type // 'bubbles', 'precipitate', 'color_change'
    };
  }
  return null;
}
```

## 5. CẤU TRÚC THƯ MỤC DỮ LIỆU

```
SKILL MO PHONG/
├── SKILL.md                          ← File này
├── data/
│   ├── experiments_catalog.json      ← Danh mục tất cả thí nghiệm
│   ├── chemistry_reactions.json      ← CSDL phản ứng hóa học
│   ├── physics_formulas.json         ← Công thức vật lý
│   ├── biology_processes.json        ← Quy trình sinh học
│   └── lab_equipment.json            ← Dụng cụ thí nghiệm
├── templates/
│   ├── chemistry_lab.html            ← Template phòng TN hóa học
│   ├── physics_lab.html              ← Template phòng TN vật lý
│   └── biology_lab.html              ← Template phòng TN sinh học
├── examples/
│   └── acid_base_reaction.html       ← Ví dụ hoàn chỉnh
└── assets/
    └── equipment_icons.json          ← Icon SVG dụng cụ
```

## 6. HƯỚNG DẪN SỬ DỤNG CHO AI

Khi nhận yêu cầu tạo app mô phỏng:

1. **Đọc file này** để hiểu kiến trúc
2. **Tham khảo** `data/experiments_catalog.json` để chọn thí nghiệm phù hợp
3. **Sử dụng** dữ liệu từ các file JSON trong `data/` làm nguồn logic
4. **Áp dụng** template từ `templates/` làm khung giao diện
5. **Tham khảo** `examples/` để xem mẫu hoàn chỉnh
6. **Luôn tạo** giao diện đẹp, trực quan, có animation mượt mà
7. **Nhật ký thí nghiệm** phải luôn hiển thị các bước và kết quả
8. **Responsive** - hỗ trợ cả desktop và mobile (touch events)

## 7. NGUỒN THAM KHẢO

- **PhET Simulations**: https://phet.colorado.edu/ (mẫu vàng về mô phỏng)
- **ChemCollective**: https://chemcollective.org/ (phòng TN hóa học ảo)
- **Matter.js Docs**: https://brm.io/matter-js/docs/
- **Three.js Docs**: https://threejs.org/docs/
- **Konva.js**: https://konvajs.org/
- **SceneryStack (PhET)**: https://scenerystack.org/
