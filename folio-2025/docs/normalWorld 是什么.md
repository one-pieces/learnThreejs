`normalWorld` 是 Three.js TSL 中的一个**内置着色器变量**，表示**世界空间中的法线向量**（即顶点法线经过模型矩阵变换到世界空间后的结果）。

## 详细说明

| 属性 | 说明 |
|------|------|
| **类型** | `vec3`（三维向量） |
| **空间** | 世界空间（World Space） |
| **来源** | 从模型的局部法线经过模型矩阵变换得到 |
| **用途** | 光照计算、三平面映射、边缘检测等 |

## 在你的代码中的作用

在你的 `MeshGridMaterial.js` 中，`normalWorld` 被用于**三平面映射（Triplanar Mapping）**：

```javascript
const mask = toMask(normalWorld)       // 根据法线方向判断面朝向
const maskDerivate = mask.fwidth().length().oneMinus().clamp(0, 1)
```

### `toMask(normalWorld)` 在做的事：

根据法线方向确定当前像素所在的**面朝向**（X/Y/Z 轴的哪个方向占比最大），然后生成一个面遮罩（mask），用于选择正确的 UV 映射平面。

### 为什么需要它？

网格的 UV 只对原始拓扑有效，如果你要在**世界空间**或**局部空间**画网格线（比如地面、墙壁、不规则物体），直接使用 `uv()` 会导致拉伸。三平面映射通过检测法线方向，自动从 X、Y、Z 三个平面中选取最合适的 UV 投影：

```
normalWorld → 计算 dot 值 → 确定面朝向 → 生成 mask → 选择 UV 平面
```

### 其他相关的内置变量对比

| 变量 | 空间 | 说明 |
|------|------|------|
| `normalWorld` | 世界 | 模型法线转换到世界空间 |
| `normalLocal` | 局部 | 模型原始法线（未变换） |
| `positionWorld` | 世界 | 顶点在世界空间的位置 |
| `positionLocal` | 局部 | 顶点在模型局部空间的位置 |
| `uv()` | UV | 模型的 UV 坐标 |