Optimized tool selection`MeshGridMaterial` 是一个基于 Three.js **NodeMaterial** 的自定义网格线材质，用于在物体表面绘制程序化网格/栅格线。下面分解它的核心机制：

---

## 整体功能

它可以在物体的 **UV 空间** 或 **世界/局部空间** 上绘制一个或多个层的网格线，支持抗锯齿、三平面映射和逐层的颜色/粗细/十字交叉控制。

---

## 核心组成部分

### 1. `MeshGridMaterialLine` — 单层网格线配置
每层网格线可以独立设置：
- **color** — 线条颜色
- **scale** — 网格缩放（密度）
- **thickness** — 线条粗细
- **cross** — 十字交叉点的保留程度（`1`=完全保留交叉点，`0`=交叉点处线条断开）
- **offset** — UV 偏移

### 2. `toMask(normal)` — 法线方向掩码
用于**三平面映射**时，根据世界/局部法线判断当前像素主要朝向哪个轴向（X/Y/Z），返回对应的掩码向量。

### 3. `toTriplanarUv(position, mask)` — 三平面 UV
将三维位置根据法线掩码映射到对应的 2D UV 平面，从而实现从任何角度观察都有无缝的网格。

### 4. `toGrid(...)` — 基础网格（无抗锯齿）
用 `step` 函数做硬边缘的网格计算，产生像素化的网格线。

### 5. `toAntialiasedGrid(...)` — 抗锯齿网格
基于 [bgolus 的网格着色器技术](https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8)，使用 `fwidth` 和 `smoothstep` 计算亚像素级的线条宽度，使网格线在远处或倾斜角度下不会产生摩尔纹或闪烁。

---

## MeshGridMaterial 主类的工作流程

1. **选择 UV 参考系** — 根据 `this.reference` 属性决定使用哪种 UV：
   - `'uv'` — 模型自带 UV
   - `'worldTriplanar'` / `'localTriplanar'` — 三平面映射
   - `'worldX/Y/Z'` / `'localX/Y/Z'` — 固定轴向投影

2. **叠加所有网格层** — 遍历 `this.lines` 数组，对每一层计算网格图案，通过 `mix` 逐层叠加颜色

3. **输出** — `vec4(gridColor, 1)` 最终输出不透明的纯色网格

---

## 使用示例

```javascript
const material = new MeshGridMaterial({
  color: 0x1a1a1a,        // 底色
  reference: 'worldTriplanar', // 世界空间三平面映射
  antialiased: true,
  lines: [
    new MeshGridMaterialLine(0xffffff, 1, 0.02, 0.5),  // 主网格
    new MeshGridMaterialLine(0xff4444, 5, 0.04, 1),     // 每 5 单位一条红色粗线
  ]
})
```

这样就可以在任意形状的物体上生成干净、抗锯齿的程序化网格线效果，常用于技术美术中的可视化调试、赛博朋克风格 UI、或建筑线框效果。