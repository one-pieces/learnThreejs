## `THREE.RenderPipeline` 是什么

`THREE.RenderPipeline` 是 Three.js 中用于自定义渲染管线的类，它允许你通过节点化（Node-based）的方式组合不同的后期处理效果，而不是传统的 `EffectComposer` 链式结构。

在你的代码中可以看到它的典型用法：

```javascript
this.postProcessing = new THREE.RenderPipeline(this.renderer)

const scenePass = pass(this.game.scene, this.game.view.camera)
const scenePassColor = scenePass.getTextureNode('output')

this.bloomPass = bloom(scenePassColor)
this.cheapDOFPass = cheapDOF(renderOutput(scenePass))

// 将 bloom 和 DOF 组合到最终的输出节点
this.postProcessing.outputNode = this.cheapDOFPass.add(this.bloomPass)
```

### 关键特性

1. **基于 TSL (Three.js Shading Language)** — 通过 `three/tsl` 的节点系统来定义渲染流程，比传统的 `EffectComposer` 更灵活。

2. **节点化组合** — 你可以像搭建乐高一样组合各种效果：
   - `pass()` — 创建场景渲染通道
   - `.add()` — 叠加效果（如 bloom + DOF）
   - `renderOutput()` — 最终的输出节点

3. **简化后期处理** — 替代了旧的 `EffectComposer` + `RenderPass` + `UnrealBloomPass` 等组合方式。

4. **按需更新** — 通过 `this.postProcessing.needsUpdate = true` 可以在质量等级变化时重新编译管线。

### 在你的项目中的作用

你目前使用 `RenderPipeline` 来组合两个后期效果：
- **Bloom**（泛光） — 发光效果
- **CheapDOF**（景深） — 模拟镜头聚焦模糊

并且根据质量等级（`quality.level`）有不同的组合策略：
- **level 0**（最高画质）：bloom + DOF 同时启用
- **level 1**：仅 bloom，跳过 DOF