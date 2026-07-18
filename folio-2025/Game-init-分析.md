# `Game.init()` 启动流程深度分析

> 基于 folio-2025 项目的 `Game.js` 源码分析

---

## 一、整体启动流水线

`init()` 是一个**异步多阶段初始化方法**，整个流程分为 12 个阶段，通过 `await` 形成清晰的屏障。

```
时间 →
├── 阶段 1-2: DOM + 26 个系统实例化 (同步)
├── await ─── setRenderer() (异步创建 WebGPU Context)
├── await ─── 首批资源加载 (4 项)
├── 阶段 5: 16 个系统实例化 (同步)
├── 并发 ──┬── 核心资源加载 (30+ 项, 带进度回调)
│          └── Rapier WASM 动态 import
├── await ─── Promise.all(资源, Rapier)
├── 阶段 7: 14 个系统实例化 (同步)
├── world.step(1) + overlay
├── 条件预渲染 (WebGPU 高画质)
└── ticker.wait(3s) → reveal 动画启动
```

---

## 二、完整初始化顺序（共 64 步）

### 第 1 步：DOM 与 Scene

| 顺序 | 代码 | 说明 |
|:---:|------|------|
| 1 | `this.domElement = document.querySelector('.game')` | DOM 容器 |
| 2 | `this.canvasElement = this.domElement.querySelector('.js-canvas')` | Canvas 元素 |
| 3 | `document.documentElement.classList.add('is-started')` | 标记页面启动 |
| 4 | `this.scene = new THREE.Scene()` | Three.js 场景 |

### 第 2 步：首批系统（同步，无依赖）

| 顺序 | 代码 | 说明 |
|:---:|------|------|
| 5 | `this.debug = new Debug()` | 调试系统 |
| 6 | `this.resourcesLoader = new ResourcesLoader()` | 资源加载器 |
| 7 | `this.quality = new Quality()` | 画质等级 |
| 8 | `this.server = new Server()` | 服务器通信 |
| 9 | `this.ticker = new Ticker()` | Tick 循环调度器 |
| 10 | `this.time = new Time()` | 时间管理 |
| 11 | `this.dayCycles = new DayCycles()` | 日夜循环 |
| 12 | `this.yearCycles = new YearCycles()` | 四季循环 |
| 13 | `this.inputs = new Inputs([], ['intro'])` | 输入系统（仅 intro 阶段） |
| 14 | `this.audio = new Audio()` | 音频系统 |
| 15 | `this.notifications = new Notifications()` | 通知系统 |
| 16 | `this.rayCursor = new RayCursor()` | 射线光标 |
| 17 | `this.viewport = new Viewport(this.domElement)` | 视口管理 |
| 18 | `this.modals = new Modals()` | 弹窗系统 |
| 19 | `this.menu = new Menu()` | 菜单系统 |
| 20 | `this.rendering = new Rendering()` | 渲染器 |

### 第 3 步：设置渲染器

| 顺序 | 代码 | 说明 |
|:---:|------|------|
| 21 | `await this.rendering.setRenderer()` | **异步**初始化 WebGPU/WebGL 渲染器 |

### 第 4 步：首批资源加载 + Options

| 顺序 | 代码 | 说明 |
|:---:|------|------|
| 22 | 计算压缩相关变量 | `compressed`, `compressedModelSuffix` 等 |
| 23 | `await this.resourcesLoader.load([...4项资源...])` | **异步**加载首批 4 个资源 |
| 24 | `this.options = new Options()` | 选项系统 |

首批 4 个资源：

| Key | 路径 | 格式 | 特点 |
|-----|------|------|------|
| `respawnsReferencesModel` | `respawns/...glb` | glTF | 重生点参考模型 |
| `behindTheSceneStarsTexture` | `behindTheScene/stars.*` | KTX/PNG | Nearest 过滤, SRGB, Repeat |
| `soundTexture` | `intro/sound.*` | KTX/PNG | Linear 过滤, repeat.x=0.5 |
| `paletteTexture` | `palette.*` | KTX/PNG | Nearest 过滤, SRGB |

### 第 5 步：依赖首批资源的系统

| 顺序 | 代码 | 说明 |
|:---:|------|------|
| 25 | `this.respawns = new Respawns(...)` | 重生点系统（依赖模型） |
| 26 | `this.view = new View()` | 相机视图 |
| 27 | `this.rendering.setPostprocessing()` | 后处理管线 |
| 28 | **`this.rendering.start()`** | **渲染循环在此启动** |
| 29 | `this.reveal = new Reveal()` | 场景揭示动画 |
| 30 | `this.noises = new Noises()` | 噪声系统 |
| 31 | `this.weather = new Weather()` | 天气系统 |
| 32 | `this.wind = new Wind()` | 风系统 |
| 33 | `this.tracks = new Tracks()` | 轨道系统 |
| 34 | `this.lighting = new Lighting()` | 光照系统 |
| 35 | `this.fog = new Fog()` | 雾效 |
| 36 | `this.water = new Water()` | 水体 |
| 37 | `this.materials = new Materials()` | 材质管理 |
| 38 | `this.objects = new Objects()` | 物体管理 |
| 39 | `this.explosions = new Explosions()` | 爆炸效果 |
| 40 | **`this.world = new World()`** | **世界系统** |

### `World` 构造函数内部

```js
constructor()
{
    this.game = Game.getInstance()
    this.step(0)  // → 创建 Grid 和 Intro
}

step(step)
{
    if(step === 0)
    {
        this.grid = new Grid()   // 网格系统
        this.intro = new Intro() // Intro 加载动画
    }
}
```

### 第 6 步：并行加载（核心资源 + 物理引擎）

| 顺序 | 代码 | 说明 |
|:---:|------|------|
| 41 | `const rapierPromise = import('@dimforge/rapier3d')` | 动态导入 Rapier WASM |
| 42 | `const resourcesPromise = this.resourcesLoader.load([...30+项...], progressCallback)` | 加载全部核心资源 |
| 43 | `const [newResources, RAPIER] = await Promise.all([resourcesPromise, rapierPromise])` | **并行等待**两者完成 |
| 44 | `this.RAPIER = RAPIER` | 保存 Rapier 实例 |
| 45 | `this.resources = { ...newResources, ...this.resources }` | 合并资源（首批优先） |

**进度回调**：每加载完一个资源就调用一次：

```js
(toLoad, total) =>
{
    this.world.intro.updateProgress(1 - toLoad / total)
}
```

驱动 Intro 的环形 shader 进度条。

### 第 7 步：依赖核心资源的系统

| 顺序 | 代码 | 说明 |
|:---:|------|------|
| 46 | `this.terrain = new Terrain()` | 地形系统 |
| 47 | `this.physics = new Physics()` | 物理世界 |
| 48 | `this.wireframe = new PhysicsWireframe()` | 物理线框可视化 |
| 49 | `this.physicalVehicle = new PhysicsVehicle()` | 物理车辆 |
| 50 | `this.zones = new Zones()` | 区域系统 |
| 51 | `this.player = new Player()` | 玩家控制器 |
| 52 | `this.closingManager = new ClosingManager()` | 关闭管理器 |
| 53 | `this.interactivePoints = new InteractivePoints()` | 交互点系统 |
| 54 | `this.konamiCode = new KonamiCode()` | 科乐美秘技 |
| 55 | `this.achievements = new Achievements()` | 成就系统 |
| 56 | `this.tornado = new Tornado()` | 龙卷风 |
| 57 | `this.map = new Map()` | 小地图 |
| 58 | `this.title = new Title()` | 标题系统 |
| 59 | `// this.monitoring = new Monitoring()` | 🔒 被注释掉 |

### 第 8-12 步：收尾

| 顺序 | 代码 | 说明 |
|:---:|------|------|
| 60 | `this.world.step(1)` | World 首次 tick → 创建所有场景物体 |
| 61 | `this.overlay = new Overlay()` | 覆盖层 |
| 62 | `PreRenderer.render()` | 高画质 + WebGPU 时预渲染 |
| 63 | `this.ticker.wait(3, () => { this.reveal.updateStep(0) })` | 3 秒后触发 reveal |
| 64 | `this.achievements.setProgress('debug', 1)` | 调试成就自动解锁 |

---

## 三、渲染从何时开始？

### 真正起点：`this.rendering.start()`

在 `Rendering.start()` 中：

```js
start()
{
    this.setStats()
    this.game.ticker.events.on('tick', () =>
    {
        this.render()   // ← 每帧都在渲染
    }, 998)
}
```

**从此刻开始每一帧都在执行 `render()`**，渲染循环一直运行着。

### `this.reveal.updateStep(0)` 的职责

它控制的是一个**视觉效果过渡**（shader-based reveal 效果）：

```js
updateStep(step)
{
    if(step === 0)
    {
        this.game.world.intro.circle.hide(() =>
        {
            this.game.world.grid.show()
            this.distance.value = 0
        })
    }
}
```

| 事件 | 时机 | 作用 |
|------|------|------|
| `this.rendering.start()` | init 早期（第 28 步） | **启动渲染循环**，每帧调用 `render()` |
| `this.reveal.updateStep(0)` | 3 秒延迟后（第 63 步） | **触发视觉过渡动画**（intro 遮罩消失 → 场景显现） |

**渲染一直没停过**，但用户看到的画面从"intro 加载界面"切换到"实际场景"，是由 `reveal.updateStep(0)` 触发的 shader 动画驱动的。

---

## 四、Intro 加载动画分析

### 创建链路

```
Game.init()
  └── this.world = new World()           ← 第 40 步
        └── constructor()
              └── this.step(0)
                    ├── this.grid = new Grid()
                    └── this.intro = new Intro()    ← Intro 在此创建
```

### Intro 的构成

| 组件 | 说明 |
|------|------|
| `setCircle()` | 环形加载进度动画（RingGeometry + Shader），`smoothedProgress` uniform 控制进度 |
| `setLabel()` | 3D 标签组，位置在重生点附近，画质不同位置微调 |
| `updateProgress()` | 被外部调用的进度更新方法 |

### 进度回调串联

```js
const resourcesPromise = this.resourcesLoader.load(
    [...30+项资源...],
    (toLoad, total) =>
    {
        this.world.intro.updateProgress(1 - toLoad / total)
    }
)
```

### Intro 完整生命周期

| 顺序 | 发生的事 | Intro 状态 |
|:---:|----------|-----------|
| 1 | `new World()` → `step(0)` → `new Intro()` | Intro 创建，圆圈进度条显示 |
| 2 | `rendering.start()` | 渲染循环启动，Intro 的 shader 开始渲染 |
| 3 | 第二批资源加载中 | 每加载一项 → `intro.updateProgress(progress)` 驱动圆圈 |
| 4 | 资源加载完成 | 圆圈进度 100% |
| 5 | 3 秒延迟后 `reveal.updateStep(0)` | 调用 `intro.circle.hide()` → 圆圈缩小消失 → 场景显现 |

---

## 五、架构设计亮点

| 特点 | 说明 |
|------|------|
| **单例模式** | `getInstance()` + 构造函数防重复创建 |
| **分阶段加载** | 首批轻量 → 核心批量，渐进式体验 |
| **并行化** | 资源加载与 WASM 物理引擎并行执行 |
| **压缩支持** | 通过 `VITE_COMPRESSED` 环境变量切换压缩模型/纹理 |
| **WebGPU 优先** | 使用 `three/webgpu` 入口，适配现代图形 API |
| **模块化** | 30+ 类各司其职，职责单一 |
| **画质自适应** | `Quality` 系统控制渲染复杂度和位置精度 |
| **回调进度** | 加载进度实时反馈给 Intro UI |
| **异步屏障** | `await` 将初始化切成清晰阶段，保证依赖关系 |

---

## 六、World.step() 分步初始化

```js
step(0)  // World 构造函数调用
├── Grid      — 网格辅助
└── Intro     — 加载动画

step(1)  // 资源加载完成后调用
├── VisualVehicle  — 可视化车辆
├── Floor          — 地面
├── WaterSurface   — 水面
├── Grass          — 草地
├── WindLines      — 风线
├── Confetti       — 彩纸
├── Leaves         — 树叶
├── Rain           — 雨线
├── Lightnings     — 闪电
├── Fireballs      — 火球
├── Snow           — 雪
├── VisualTornado  — 龙卷风可视化
├── Bushes         — 灌木
├── Trees ×3       — 桦树/橡树/樱花树
├── Flowers        — 花
├── Bricks         — 砖块
├── Fences         — 围栏
├── Benches        — 长椅
├── ExplosiveCrates — 爆炸箱
├── PoleLights     — 灯杆
├── Lanterns       — 灯笼
├── Scenery        — 场景装饰
└── Areas          — 区域系统

step(2)  // 最后
└── Whispers       — 低语系统
```
