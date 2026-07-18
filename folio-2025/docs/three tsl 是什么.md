Optimized tool selection`three/tsl` 是 Three.js 中 **TSL（Three Shader Language）** 的导入路径。

**TSL** 是 Three.js 提供的一种**基于 JavaScript 的可编程着色器系统**，它让你可以用 JavaScript 函数式的方式编写 GPU 着色器逻辑，而不用手写 GLSL 或 WGSL。

在你的 `MeshGridMaterial.js` 中，你正在大量使用 TSL：

```javascript
import { clamp, smoothstep, If, color, Fn, uniform, vec3, vec4, 
         positionWorld, normalWorld, mix, vec2, uv, step } from 'three/tsl'
```

**核心能力**：
- **`Fn()`** — 定义可复用的着色器函数（类似 GLSL 的 `vec4 func() { }`）
- **`uniform()`** — 创建可在 JS 中动态更新的 uniform 变量
- **`If()`** — 在着色器中使用条件分支（编译成 GPU 指令）
- **`positionWorld` / `normalWorld` / `uv`** — 访问顶点/片元着色器内置变量
- **数学运算** — `mix`, `clamp`, `smoothstep`, `step`, `dot` 等，自动构建计算图

**优点**：
1. **类型安全** — 通过 JS 函数链式调用，自动推导类型
2. **跨平台** — Three.js 会根据目标平台（WebGL / WebGPU）自动编译成 GLSL 或 WGSL
3. **可组合** — 函数可以像普通 JS 一样组合复用（如你的 `toMask`、`toGrid`、`toAntialiasedGrid`）
4. **动态更新** — `uniform()` 变量可以在 JS 中直接修改 `.value`，Three.js 会自动同步到 GPU

在你的 `MeshGridMaterial` 中，你本质上是在用 TSL 构建一个**程序化网格线材质**，通过 `NodeMaterial` + TSL 实现了抗锯齿网格、三平面映射等功能，完全不需要手写着色器字符串。