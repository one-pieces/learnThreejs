Optimized tool selectionLet me look at the relevant files to understand these two properties.

Read [](file:///Users/one-pieces/codes/github/folio-2025/sources/Game/Reveal.js#1-1), lines 1 to 50

Read [](file:///Users/one-pieces/codes/github/folio-2025/sources/Game/Respawns.js#1-1), lines 1 to 50

Read [](file:///Users/one-pieces/codes/github/folio-2025/sources/Game/Reveal.js#50-50), lines 50 to 150

Read [](file:///Users/one-pieces/codes/github/folio-2025/sources/Game/Respawns.js#50-50), lines 50 to 68

Read [](file:///Users/one-pieces/codes/github/folio-2025/sources/Game/Reveal.js#150-150), lines 150 to 237

## `this.game.respawns` (Respawns)

**作用：管理场景中的"重生点/出生点"位置集合**

- 从一个 3D 模型文件（`respawnsReferencesModel`）中加载所有的 `respawnXXX` 命名的子对象
- 每个重生点包含：`name`（名称）、`position`（坐标）、`rotation`（朝向角度）
- 提供三个方法：
  - `getDefault()` — 获取默认出生点（默认名为 `'landing'`）
  - `getByName(name)` — 按名称查找特定出生点
  - `getClosest(position)` — 查找离某位置最近的出生点

在 `Grid.js` 中，`this.game.respawns.getDefault()` 就是用来获取网格的初始放置位置。

---

## `this.game.reveal` (Reveal)

**作用：控制游戏开场时的"圆形展开揭示动画"效果**

它驱动一个以出生点为中心的圆形区域，从中心向外扩散：

- **Step 0**（开场载入完成后）：
  - 显示网格
  - 一个圆形从中心 **向外展开**（`back.out` 缓动），揭示世界
  - 相机拉近视角
  - 显示标签和声音按钮
  - 玩家可以通过点击/按键进入下一步

- **Step 1**（玩家交互后）：
  - 播放音效
  - 圆形 **向外完全扩散**（`back.in` 缓动），最终隐藏揭示遮罩
  - 相机拉远，切换到自由漫游模式
  - 隐藏开场标签

- **Step 2**（收尾）：
  - 销毁开场 UI 和网格
  - 启动服务器、预打开菜单
  - 停止 tick 更新

**关键属性**：
- `position2Uniform` — 揭示效果的位置（即出生点位置）
- `distance` — 当前揭示圆的半径（uniform 值，从 0 → 3.5 → 30 → 99999）
- `thickness`、`color`、`intensity` — 控制揭示圈边缘的外观样式
- 鼠标悬浮在揭示圆圈上时，`intensityMultiplier` 会增大（视觉反馈）

---

回到 `Grid.js` 第 65 行：

```javascript
this.game.respawns.getDefault()
```

它获取默认出生点的位置，然后把网格平移到该位置。同时 `Reveal` 也用了同一个出生点作为揭示动画的起始位置，两者配合使网格和揭示效果从同一点开始展开。