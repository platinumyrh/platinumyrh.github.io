/* ============================================================
   作品集内容数据  data.js
   由网页编辑器导出 · 2026/9/16 15:04:10
   ============================================================ */
window.PORTFOLIO_DATA = {
  "site": {
    "title": "你的名字 · Unity 客户端开发作品集",
    "footerNote": "用 Unity 与 C# 把想法做成能跑起来的东西。",
    "startYear": 2022,
    "build": "2026-09-16 15:04:10"
  },
  "profile": {
    "name": "杨日华",
    "handle": "",
    "eyebrow": "UNITY CLIENT DEVELOPER",
    "role": "Unity 客户端实习",
    "tagline": "把玩法想法，变成真正能跑起来的东西。",
    "avatar": "",
    "location": "中国 · 大连",
    "email": "2402010797@qq.com",
    "status": "正在寻找 Unity 客户端 / 游戏开发相关机会",
    "bio": "Unity 客户端开发方向，主语言 **C#**。\n\n不只是会用 API —— 理解 GC 机制、装箱拆箱、委托事件，也清楚 `List` / `Dictionary` 的底层实现，写代码时会顺着这些去考虑性能。\n\n日常主要做 **玩法系统** 与 **工程落地**：熟练使用 Unity，掌握 MonoBehaviour 生命周期、协程原理、Animator 与物理系统、UGUI 合批机制；资源侧熟悉 AssetBundle 打包、依赖管理与卸载，了解完整的热更新流程。\n\n网络方向理解 TCP/UDP，掌握快照同步、客户端预测与插值方案，实践过帧广播、断线重连与房间管理。工程上掌握单例、工厂、观察者、MVC 等设计模式，有事件驱动框架的落地实践；熟悉 Git 分支管理与冲突处理，日常借助 AI Agent 辅助开发。",
    "stats": "",
    "skills": "语言: C#, GC 机制, 装箱拆箱, 委托与事件, List / Dictionary 底层实现\n设计模式: 单例, 工厂, 观察者, MVC, 事件驱动框架落地实践\n引擎: Unity, MonoBehaviour 生命周期, 协程原理, Animator, 物理系统, UGUI 合批机制, 资源加载\n资源与热更: 热更新流程, AssetBundle 打包, 依赖管理, 资源卸载\n网络: TCP / UDP, 快照同步, 客户端预测与插值, 帧广播, 断线重连, 房间管理\n工程与工具: Git 分支管理, 冲突处理, AI Agent 辅助开发",
    "links": "GitHub | https://github.com/yourname\nBilibili | https://space.bilibili.com/000000\n知乎 | https://www.zhihu.com/people/yourname\n邮箱 | mailto:you@example.com"
  },
  "learning": [
    {
      "id": "l-mu3qyidb7l8o8",
      "title": "事件总线总结与写法",
      "date": "2026-09-16",
      "tags": [
        "设计模式"
      ],
      "summary": "事件总线通过发布订阅实现模块解耦，适合“通知”，不适合“编排流程”。本文总结事件总线的优缺点、核心流程与副作用的判断标准，并梳理常见写法，包括用 EventType 做键、传 EventData 的实现方式及其优化建议。",
      "content": "### 1.1 优点\n\n- 发布者和订阅者互不持有引用，模块解耦\n- 一对多广播，新增监听方不需要改发布方\n- 跨模块通信方便，适合松散的通知场景\n\n### 1.2 缺点\n\n| 缺点 | 说明 |\n|---|---|\n| **调试困难** | 调用链断裂，发布者不知道谁在听，事件顺序不保证 |\n| **生命周期难管** | 忘记退订会导致内存泄漏、MissingReferenceException |\n| **隐式依赖** | 依赖关系不可见，改事件名/参数编译器不报错 |\n| **类型安全弱** | 用 object 或统一基类传参，写错要到运行时才暴露 |\n| **顺序不确定** | 多个订阅者执行顺序不保证，逻辑依赖顺序时易出 bug |\n| **性能开销** | 频繁触发时遍历订阅者、装箱、分配参数对象会产生 GC |\n| **全局耦合** | 全局单例让所有模块隐式依赖总线，难以独立复用和测试 |\n| **事件泛滥** | 命名不统一、参数格式不一致、误订阅漏订阅 |\n| **循环触发** | A 触发 B，B 又触发 A，可能死循环 |\n| **测试困难** | 全局总线难以隔离，不易断言事件是否被发布 |\n\n---\n\n## 二、核心流程 vs 副作用：该不该走事件总线\n\n以“开火”为例，它包含两类东西：\n\n### 2.1 核心流程（不该走事件总线）\n\n- 判断能否开火（冷却、弹药、眩晕）\n- 扣弹药\n- 从对象池取子弹、设置方向、发射\n- 进入冷却\n\n**特点**：有严格顺序和条件，前一步失败后面不该执行。\n\n**为什么不该走事件总线**：\n\n- 顺序和条件无法保证（订阅者执行顺序不确定）\n- 失败无法中断（每个订阅者各自判断，逻辑散落）\n- 拿不到返回值（“能否开火”需要明确的布尔结果）\n- 高频调用，遍历订阅者开销累积\n\n### 2.2 副作用通知（适合走事件总线）\n\n- 播放开火音效\n- 播放枪口火焰特效\n- 播放开火动画\n- 相机后坐力\n- UI 弹药数更新\n- 成就系统统计\n\n**特点**：可有可无、互不依赖、一对多、不需要返回值。\n\n### 2.3 推荐拆分方式\n\n```text\n输入模块\n   ↓ 直接调用\n武器系统（核心流程）\n   ├─ 判断能否开火\n   ├─ 扣弹药\n   ├─ 从对象池取子弹并发射\n   └─ 进入冷却\n        ↓ 开火成功后，发一个事件\n   EventBus.Publish(new WeaponFiredEvent(...))\n        ↓\n   ├─ 音效模块订阅 → 播放音效\n   ├─ 特效模块订阅 → 播放枪口火焰\n   ├─ 相机模块订阅 → 后坐力\n   └─ UI 模块订阅 → 更新弹药数\n```\n\n### 2.4 判断标准\n\n| 问题 | 直接调用 | 事件总线 |\n|---|---|---|\n| 有严格顺序吗 | ✅ | ❌ |\n| 需要返回值吗 | ✅ | ❌ |\n| 某步失败要中断吗 | ✅ | ❌ |\n| 是高频操作吗 | ✅ | ❌ |\n| 订阅者可有无吗 | ❌ | ✅ |\n| 一对多广播吗 | ❌ | ✅ |\n| 发布者不关心结果吗 | ❌ | ✅ |\n\n> 结论：核心流程直接调用，副作用走事件总线，两者结合，而不是全走一边。\n\n---\n\n## 三、事件总线的常见写法\n\n### 3.1 写法一：EventType + EventData（统一键值）\n\n用 enum 做事件键，EventData 做统一参数基类：\n\n```csharp\npublic enum EventType\n{\n    PlayerDead,\n    WeaponFired,\n    GoldChanged,\n}\n\npublic class EventData\n{\n    // 基类，具体事件继承它\n}\n\npublic class WeaponFiredEventData : EventData\n{\n    public int weaponId;\n    public Vector3 position;\n}\n\npublic static class EventBus\n{\n    private static readonly Dictionary<EventType, Action<EventData>> events\n        = new Dictionary<EventType, Action<EventData>>();\n\n    public static void Subscribe(EventType type, Action<EventData> callback)\n    {\n        if (events.TryGetValue(type, out var action))\n            events[type] = action + callback;\n        else\n            events[type] = callback;\n    }\n\n    public static void Unsubscribe(EventType type, Action<EventData> callback)\n    {\n        if (events.TryGetValue(type, out var action))\n        {\n            events[type] = action - callback;\n            if (events[type] == null)\n                events.Remove(type);\n        }\n    }\n\n    public static void Publish(EventType type, EventData data = null)\n    {\n        if (events.TryGetValue(type, out var action))\n            action?.Invoke(data);\n    }\n}\n```\n\n**使用**：\n\n```csharp\n// 订阅\nEventBus.Subscribe(EventType.WeaponFired, OnWeaponFired);\n\nprivate void OnWeaponFired(EventData data)\n{\n    var e = data as WeaponFiredEventData;\n    if (e == null) return;\n    // 播放音效等\n}\n\n// 发布\nEventBus.Publish(EventType.WeaponFired, new WeaponFiredEventData\n{\n    weaponId = 1,\n    position = transform.position,\n});\n```\n\n**优点**：\n\n- 统一入口，扩展新事件只需加 enum 和 EventData 子类\n- 使用简单，适合快速开发\n- 一个 enum 就能看到所有事件类型\n\n**缺点**：\n\n- **类型不安全**：需要 `as` 强转，写错类型运行时才暴露\n- **装箱与 GC**：每次发布都 new 一个 EventData，高频时产生 GC\n- **一个事件只能有一种参数**：所有订阅者共享同一个 EventData 结构\n- **订阅者要自己判空和转型**：样板代码多\n- **调试时看不出具体类型**：断点里只能看到 EventData 基类\n\n### 3.2 写法二：强类型泛型（推荐）\n\n用事件类型本身做键，不走 enum：\n\n```csharp\npublic static class EventBus<T>\n{\n    private static Action<T> handlers;\n\n    public static void Subscribe(Action<T> callback)\n    {\n        handlers += callback;\n    }\n\n    public static void Unsubscribe(Action<T> callback)\n    {\n        handlers -= callback;\n    }\n\n    public static void Publish(T evt)\n    {\n        handlers?.Invoke(evt);\n    }\n}\n\n// 事件定义\npublic struct WeaponFiredEvent\n{\n    public int weaponId;\n    public Vector3 position;\n}\n```\n\n**使用**：\n\n```csharp\n// 订阅\nEventBus<WeaponFiredEvent>.Subscribe(OnWeaponFired);\n\nprivate void OnWeaponFired(WeaponFiredEvent e)\n{\n    // 直接用，无需强转\n}\n\n// 发布\nEventBus<WeaponFiredEvent>.Publish(new WeaponFiredEvent\n{\n    weaponId = 1,\n    position = transform.position,\n});\n```\n\n**优点**：\n\n- **类型安全**：编译期检查，写错直接报错\n- **无需强转**：回调参数类型明确\n- **每个事件独立参数**：不同事件互不干扰\n- **struct 事件可避免 GC**：值类型传递，不产生堆分配\n- **调试清晰**：断点里能看到具体事件类型\n\n**缺点**：\n\n- 事件类型分散，没有统一列表（可以额外维护一份文档或注册表）\n- 泛型静态类会为每个 T 生成一份，类型很多时类数量增加（通常不是问题）\n\n### 3.3 两种写法对比\n\n| 维度 | EventType + EventData | 强类型泛型 |\n|---|---|---|\n| 类型安全 | 弱，需强转 | 强，编译期检查 |\n| GC 开销 | 高，每次 new EventData | 低，struct 可零分配 |\n| 扩展性 | 加 enum + 子类 | 加一个事件类型 |\n| 样板代码 | 多，订阅者要判空转型 | 少 |\n| 统一管理 | 集中，一个 enum 看全 | 分散，需额外维护列表 |\n| 调试友好度 | 差 | 好 |\n| 适合场景 | 快速开发、事件少 | 中大型项目、事件多 |\n\n---\n\n## 四、写法上的优化建议\n\n### 4.1 如果坚持用 EventType + EventData\n\n- **用对象池复用 EventData**，避免高频 new 产生 GC\n- **给 EventData 加一个 Type 字段或枚举**，方便调试时识别\n- **统一命名规范**，比如事件名后缀 `Event`、EventData 后缀 `EventData`\n- **订阅和退订成对出现**，或用 `OnDestroy`/`OnDisable` 统一退订\n- **封装一层订阅助手**，减少样板代码，比如 `Subscribe<T>(EventType, Action<T>)` 内部自动转型\n\n### 4.2 如果换成强类型泛型\n\n- **事件用 struct 定义**，避免 GC\n- **维护一份事件类型清单**（文档或注册表），方便查找\n- **统一放在一个命名空间或文件夹**，避免散落\n- **订阅/退订用 using 或 IDisposable 封装**，防止忘记退订\n\n### 4.3 通用建议\n\n- **控制使用范围**：只用于副作用通知，不用于核心流程编排\n- **避免全局泛滥**：可以按模块拆分多个总线（战斗总线、UI 总线），而不是一个全局总线包打天下\n- **加调试工具**：比如记录事件发布日志、订阅者数量统计，方便排查\n- **弱引用可选**：如果生命周期难管，考虑弱引用事件，但会增加复杂度\n\n---\n\n## 五、一句话总结\n\n> 事件总线适合“通知”，不适合“编排流程”。开火这类操作，核心流程直接调用，副作用走事件总线。写法上，`EventType + EventData` 简单统一但类型不安全、GC 高；强类型泛型 `EventBus<T>` 编译期检查、可零 GC、调试友好，更适合中大型项目。无论哪种写法，都要注意订阅退订成对、控制使用范围、避免全局泛滥。",
      "link": ""
    },
    {
      "id": "l-mu3qmqcr4s9oq",
      "title": "MVC 与 MVP 结构总结",
      "date": "2026-09-16",
      "tags": [
        "设计模式"
      ],
      "summary": "MVC 把数据（Model）、表现（View）、控制（Controller）分开，核心分界线是 **View 和 Model 之间有没有直接联系**。经典 MVC 里 View 直接持有 Model、自己订阅事件更新 UI；MVP 里 View 完全不认识 Model，全靠 Presenter 转发。本文梳理两者的结构、职责与区别。",
      "content": "## 一、MVC 三部分的职责\n\n### Model（数据层）\n\n- 只存数据\n- 提供与数据变化有关的方法（如 `SetHp`、`AddItem`）\n- 数据变化时发事件（如 `OnHpChanged`）\n\n### View（表现层）\n\n- 引用场景里的 UI 组件（Text、Image、Button 等）\n- 提供设置 UI 组件数值的方法（如 `SetHpText`）\n- 在经典 MVC 里，**直接持有 Model 引用**，自己订阅 Model 事件\n\n### Controller（控制层）\n\n- 持有 Model 和 View 的引用\n- **接收用户输入**（按钮点击、输入框变化）\n- 把输入转换成对 Model 方法的调用\n- 在经典 MVC 里**不负责把 Model 数据推给 View**\n\n---\n\n## 二、经典 MVC 的结构\n\n```text\n用户输入 → Controller → 修改 Model\n↓\nModel 变化\n↓\nView 拉取数据\n↓\n更新显示\n```\n\n关键点：\n\n- **View 持有 Model 的引用**，可以直接读 Model 数据，也可以订阅 Model 事件\n- **Controller 不负责把 Model 数据推给 View**，只处理输入、调用 Model 的方法\n- **Model 变化后，View 自己感知并更新**，不需要 Controller 中转\n\n---\n\n## 三、经典 MVC vs MVP\n\n| 维度 | 经典 MVC | MVP |\n|---|---|---|\n| **View 是否持有 Model** | **持有**，可直接读数据、订阅事件 | **不持有**，完全不认识 Model |\n| **谁订阅 Model 事件** | View 自己订阅 | Presenter 订阅 |\n| **Controller / Presenter 的职责** | 处理输入，调用 Model | 处理输入 + 把 Model 变化转发给 View |\n| **View 的角色** | 主动拉数据、主动更新 | 完全被动，只暴露 Set 接口 |\n| **M 和 V 的耦合** | 有直接依赖 | 完全解耦 |\n\n> 分界线：**View 和 Model 之间有没有直接联系**。有直接依赖偏 MVC，完全靠中间人转发偏 MVP。\n\n---\n\n## 四、一个具体例子（血量显示）\n\n### 经典 MVC\n\n```text\nModel：Hp 字段 + OnHpChanged 事件 + SetHp 方法\nView：持有 Model 引用，订阅 OnHpChanged，事件触发时更新 Text\nController：监听“受伤按钮”点击，调用 Model.SetHp()\n```\n\n流程：点击按钮 → Controller 调 `Model.SetHp()` → Model 发 `OnHpChanged` → **View 自己收到事件** → 更新 Text。\n\n### MVP\n\n```text\nModel：Hp 字段 + OnHpChanged 事件 + SetHp 方法\nView：只暴露 SetHpText 方法，不认识 Model\nPresenter：订阅 Model 的 OnHpChanged，收到后调用 View.SetHpText()\n```\n\n流程：点击按钮 → Presenter 调 `Model.SetHp()` → Model 发 `OnHpChanged` → **Presenter 收到事件** → 调 `View.SetHpText()` → 更新 Text。\n\n**区别就在中间那一步**：MVC 里 View 自己监听 Model，MVP 里 Presenter 监听并转发。\n\n---\n\n## 五、经典 MVC 在 Unity 里的现实\n\n纯经典 MVC 在 Unity 里其实**不常见**，原因：\n\n- View 直接持有 Model，耦合较高，View 复用性差\n- Unity 的 UI 组件（Text、Image）本身就是 View，让它们直接订阅 Model 事件，代码会散落在各处\n- 实际项目更常见的是 **MVP 或 MVVM**，或者“View 直接监听 Model”的简化 MVC 变体\n\n所以经典 MVC 更多是**概念上的标准形态**，实际工程里会根据需求做取舍。\n\n---\n\n## 六、一句话总结\n\n> 经典 MVC 的结构是：View **直接持有 Model**，自己订阅 Model 事件并更新 UI；Controller 只负责接收用户输入、调用 Model 的方法，**不在 M 和 V 之间做转发**。这正是它和 MVP 的分界线——MVP 里 View 完全不认识 Model，全靠 Presenter 转发。",
      "link": ""
    },
    {
      "id": "l-mu3q01fq2zx6k",
      "title": "单例模式总结",
      "date": "2026-09-16",
      "tags": [
        "设计模式"
      ],
      "summary": "单例模式是一个可以全局访问的唯一对象，方便其他模块直接调用，减少耦合。本文梳理饿汉式与懒汉式的定义、优缺点、线程安全问题，以及 Unity 环境下单例的常见写法与注意事项。",
      "content": "## 一、单例模式是什么\n\n单例模式就是一个**可以全局访问的唯一对象**，方便其他模块直接调用它，从而减少耦合性。\n\n---\n\n## 二、饿汉式与懒汉式\n\n### 2.1 定义\n\n- **饿汉式**：**程序一启动就创建**实例。因为“饿”，迫不及待。\n- **懒汉式**：**第一次用到时才创建**实例。因为“懒”，能拖就拖。\n\n> 注意：这两个名字很容易记反。\n\n### 2.2 优缺点对比\n\n| 维度 | 饿汉式 | 懒汉式 |\n|---|---|---|\n| **创建时机** | 程序启动 / 类加载时 | 第一次访问时 |\n| **线程安全** | 天然安全（类加载阶段完成初始化） | 需要额外加锁，否则可能创建多个实例 |\n| **内存占用** | 无论用不用都占着 | 用到才占，按需分配 |\n| **启动速度** | 启动时集中创建，可能拖慢启动 | 启动快，首次访问有延迟 |\n| **实现复杂度** | 简单 | 需处理线程安全，稍复杂 |\n| **适用场景** | 一定会用到、创建开销小 | 可能用不到、创建开销大 |\n\n---\n\n## 三、懒汉式的线程安全问题\n\n懒汉式在多线程下的问题**不是内存泄漏，而是可能创建出多个实例**。\n\n比如两个线程同时判断 `instance == null`，都判定为真，就会各自 new 一个，导致单例不再唯一。\n\n解决办法：\n\n- 加锁（`lock`）\n- 双重检查锁定（Double-Check Locking）\n- 用 `Lazy<T>`（C# 推荐）\n\n---\n\n## 四、Unity 主线程与加锁\n\n### 4.1 为什么说“部分正确”\n\nUnity 的绝大多数 API（GameObject、Transform、MonoBehaviour 等）**只能在主线程调用**，所以如果单例只在主线程访问，确实不会有多线程竞争问题，懒汉式不加锁也能正常用。\n\n### 4.2 为什么不能一概而论\n\n1. **单例本身可能被非主线程访问**。比如开了 `Thread`、`Task`，或者用了异步 IO 回调，这些地方访问单例就可能触发竞争。\n2. **C# 的普通单例不依赖 Unity API**。一个纯 C# 的管理类单例，完全可能被后台线程调用。\n3. **编辑器下情况更复杂**。Unity Editor 有多个线程在跑，某些回调时机不确定。\n\n> 准确说法：如果单例**确定只在主线程访问**，懒汉式不加锁也能正常工作；但一旦可能被非主线程访问，就必须做线程安全处理。不能因为“Unity 脚本跑在主线程”就默认所有单例都安全。\n\n---\n\n## 五、Unity 里单例的常见写法\n\nUnity 里更常见的其实不是纯 C# 单例，而是 **MonoBehaviour 单例**：\n\n```csharp\npublic class GameManager : MonoBehaviour\n{\n    public static GameManager Instance { get; private set; }\n\n    private void Awake()\n    {\n        if (Instance != null && Instance != this)\n        {\n            Destroy(gameObject);\n            return;\n        }\n        Instance = this;\n        DontDestroyOnLoad(gameObject);\n    }\n}\n这种写法本质上是饿汉式——Awake 时就把自己注册进去。它依赖 Unity 的生命周期，不需要考虑线程安全，因为 Awake 一定在主线程执行。\n\n六、一句话总结\n饿汉式是启动就创建、天然线程安全但占内存；懒汉式是用到才创建、按需分配但需处理线程安全。懒汉式多线程的问题是可能创建多个实例，不是内存泄漏。Unity 单例如果确定只在主线程访问，不加锁没问题；但不能默认所有单例都只在主线程，纯 C# 单例仍可能被后台线程访问。",
      "link": ""
    },
    {
      "id": "l-mu3pp8c40epyh",
      "title": "TCP 分包与粘包问题总结",
      "date": "2026-09-16",
      "tags": [
        "网络相关"
      ],
      "summary": "分包和粘包都是 TCP 字节流没有消息边界导致的：分包是收不全，粘包是收多了。解决办法是在包头加**长度 + 消息 ID**，接收方先读包头、再按长度读包体，不够就等、多了就留。UDP 自带消息边界，不存在这个问题。",
      "content": "## 一、概念厘清\n\n**分包（拆包）**：发送方发的是一个完整包，但接收方**一次没读完**，只收到了其中一部分。\n\n**粘包**：发送方发了两个或多个包，接收方**一次全收到了**，几个包粘在一起。\n\n两者都是 **TCP 字节流没有消息边界**导致的，本质是同一个问题的两种表现。\n\n---\n\n## 二、两种现象的具体表现\n\n### 2.1 分包\n\n- 接收方 `Recv` 一次只拿到一部分字节\n- 如果直接当成一个完整包去解析，就会解析失败或数据错乱\n\n### 2.2 粘包\n\n- 接收方 `Recv` 一次拿到了两个包的数据拼在一起\n- 如果只按一个包解析，第二个包的内容就会被当成第一个包的一部分\n\n---\n\n## 三、处理方式\n\n### 3.1 长度 + 消息 ID（最通用）\n\n在包头加：\n\n- **长度字段**：告诉接收方这个包有多长\n- **消息 ID**：告诉接收方这是什么类型的消息\n\n接收方处理流程：\n\n1. 先读固定长度的包头\n2. 解析出长度\n3. 按长度去读包体\n4. 数据不够就等下一次 `Recv`\n5. 数据多了就留给下一个包处理\n\n### 3.2 其他常见方案\n\n| 方案 | 说明 | 缺点 |\n|---|---|---|\n| **固定长度** | 每个包长度固定，不够就补位 | 简单但浪费带宽 |\n| **分隔符** | 用特殊字符（如 `\\n`）标记包尾 | 适合文本协议，但包体里不能出现分隔符 |\n| **长度 + ID + 包体** | 最通用，二进制协议基本都用这套 | 需要自己实现解析逻辑 |\n\n---\n\n## 四、UDP 的情况\n\n**UDP 不存在粘包和分包问题**，因为它是数据报协议，每个包自带边界，收多少次发多少次是一一对应的。\n\n但 UDP 包如果超过 MTU，会在 IP 层被分片，那是另一回事：分片会放大丢包风险，一个分片丢了整个包就废了。所以实践中 UDP 包通常控制在 MTU 以内。\n\n---\n\n## 五、一句话总结\n\n> 分包和粘包都是 TCP 字节流没有消息边界导致的：分包是收不全，粘包是收多了。解决办法是在包头加**长度 + 消息 ID**，接收方先读包头、再按长度读包体，不够就等、多了就留。UDP 自带消息边界，不存在这个问题。",
      "link": ""
    },
    {
      "id": "l-mu3mag3sd2t86",
      "title": "TCP/UDP 与状态同步/帧同步总结",
      "date": "2026-09-16",
      "tags": [
        "网络相关"
      ],
      "summary": "本文分两部分：一是 TCP 与 UDP 的核心差异，二是状态同步与帧同步的对比。",
      "content": "## 一、TCP 与 UDP\n\n### 1.1 核心差异\n\n| 维度 | TCP | UDP |\n|---|---|---|\n| 连接 | 面向连接，需三次握手 | 无连接，直接发 |\n| 可靠性 | 协议层保证有序、完整（确认 + 重传） | 协议层不保证，需应用层自己实现 |\n| 消息边界 | 字节流，无边界，需应用层切分 | 数据报，自带边界 |\n| 丢包 | 底层会丢，但上层感知不到 | 上层直接感知到丢包 |\n| 分片 | 不存在“分片”，只有字节流切分问题 | 超 MTU 会被 IP 分片，丢包概率放大 |\n| 典型场景 | 文件传输、HTTP、需要可靠有序 | 实时对战、音视频、KCP/QUIC 底层 |\n\n### 1.2 关键点说明\n\n**TCP 的可靠性**\n\nTCP 本身也会丢包，底层网络传输照样会丢。它的“可靠”是通过**确认 + 重传**机制，让上层应用**感知不到丢包**。TCP 保证数据**最终有序、完整地到达**，但不代表底层没有丢包。\n\n**TCP 的消息边界**\n\nTCP 是**字节流协议**，它不保留消息边界。发送方连发两次数据，接收方可能一次收到，也可能分几次收到。所谓“粘包/分包”本质上不是 TCP 的问题，而是**应用层没有自己定义消息边界**。解决方式是应用层加**长度字段或分隔符**。\n\n**UDP 的消息边界与分片**\n\n- **应用层消息边界**：UDP 是**数据报协议**，每个包自带边界，收多少次发多少次一一对应，不存在 TCP 那种粘包问题。\n- **网络层 IP 分片**：UDP 包超过 MTU，IP 层照样会分片，接收端重组。分片会放大丢包风险（一个分片丢了整个包就废了）。\n- 实践中 UDP 包通常控制在 MTU 以内。\n\n**UDP 的可靠性**\n\nUDP 协议本身不提供重传，但完全可以在**应用层自己做重传、序号、确认**——KCP、QUIC 就是这么干的。UDP 协议层不保证重传，可靠性需要应用层自己实现。\n\n---\n\n## 二、状态同步与帧同步\n\n### 2.1 状态同步\n\n服务器权威，客户端只负责表现，逻辑运算都在服务器，防作弊简单，对服务器要求高，适合 MMO。\n\n- **客户端不是完全没逻辑**：通常也会跑一部分预测和插值，否则操作会明显延迟。只是**权威结果以服务器为准**。\n- **同步的是“状态”**：服务器定期把角色位置、血量等状态广播给客户端，客户端做插值、平滑。\n- **防作弊强**：客户端改了也没用，服务器不认。\n- **服务器压力大**：所有逻辑都在服务器算，同屏人越多压力越大。\n- **适合**：MMO、MOBA（部分）、需要强权威的场景。\n\n### 2.2 帧同步\n\n服务器只转发玩家输入，逻辑运算在客户端本地按确定性规则运算，流畅感来自输入即时生效和确定性锁步。\n\n- **服务器只转发输入**：所有客户端用**相同的输入 + 相同的确定性逻辑**算出相同结果。\n- **防作弊靠确定性与校验**：服务器校验输入合法性，以及**关键帧校验（哈希对比）**。如果某个客户端算出的结果和其他人不一致，就会被判定异常。\n- **客户端预测在状态同步里同样常用**（比如 FPS、MOBA 里的移动预测）。帧同步的流畅感主要来自**输入即时生效**和**确定性锁步**。\n- **客户端压力大**：要跑完整逻辑。\n\n### 2.3 对比\n\n| 维度 | 状态同步 | 帧同步 |\n|---|---|---|\n| 同步内容 | 服务器广播状态（位置、血量等） | 服务器转发玩家输入 |\n| 逻辑运算位置 | 服务器 | 各客户端本地 |\n| 权威方 | 服务器 | 确定性规则 + 服务器校验 |\n| 防作弊 | 强，客户端改了没用 | 靠输入校验 + 关键帧哈希对比，门槛更高 |\n| 服务器压力 | 大，所有逻辑都算 | 小，只转发输入 |\n| 客户端压力 | 小，主要做表现 | 大，要跑完整逻辑 |\n| 流畅感来源 | 插值 + 预测 | 输入即时生效 + 确定性锁步 |\n| 典型场景 | MMO、MOBA、需要强权威 | RTS、格斗、部分 MOBA（如王者荣耀） |\n| 回放/观战 | 较难 | 天然支持，只需记录输入 |\n\n---\n\n## 三、一句话总结\n\n> TCP 可靠但无消息边界、需应用层切分；UDP 有边界但不可靠、超 MTU 会被分片，可靠性可在应用层实现。状态同步以服务器为权威、防作弊强、服务器压力大；帧同步服务器只转发输入、逻辑在客户端、防作弊靠确定性与校验、流畅感来自输入即时生效。",
      "link": ""
    },
    {
      "id": "l-mu3lz2tqo63pd",
      "title": "UGUI 合批相关：Text 打断合批与 Image / RawImage 区别",
      "date": "2026-09-16",
      "tags": [
        "性能优化",
        "UGUI"
      ],
      "summary": "UGUI 合批并非只看“材质引用是否相同”，而是判断一整套渲染状态是否一致。Text 打断合批的首要原因是它使用的**字体纹理**与普通 UI 元素的纹理不同。在此基础上，本文进一步对比 `Image` 与 `RawImage` 的差异：前者面向 Sprite、支持图集与九宫格、合批友好；后者面向任意 Texture、灵活但易打断合批，适合显示 RenderTexture、视频、动态纹理等场景。",
      "content": "## 一、UGUI Text 打断合批的原因\n\n### 1.1 常见误解\n\n“Text 打断合批就是因为它的材质和别人不一样”——这个理解方向对，但不够准确。\n\n- 材质不同只是可能原因之一\n- 更核心的是**纹理不同**\n- UGUI 合批条件比“同材质”更细\n\n### 1.2 UGUI 合批的实际判断条件\n\nUGUI 合批不是简单看“材质引用是否相同”，而是看一组渲染状态是否一致：\n\n1. **材质（Material）**\n2. **纹理（Texture）**\n3. **渲染层级 / 深度**\n4. **是否被遮挡层切断**（如 Mask、RectMask2D）\n5. **顶点属性布局是否一致**\n\n其中任何一项不同，就会打断合批，产生新的 DrawCall。\n\n### 1.3 为什么 Text 容易打断合批\n\n**根本原因是字体图集（Font Texture）和普通 UI 用的纹理不是同一张。**\n\n- 普通 `Image` 用的是 Sprite 的纹理（可能是图集，也可能是单张图）\n- `Text` 用的是 **Font Texture**，这是字体渲染时生成的字符图集，是一张完全独立的纹理\n\n所以即使 `Image` 和 `Text` 用的是同一个材质（比如都用了 UI/Default），只要**纹理不同**，Unity 就没法把它们合到同一个 DrawCall 里。\n\n### 1.4 材质不同的情况\n\n如果 Text 用了自定义材质（比如加了描边、阴影的 Shader），那材质本身就不同，自然也会打断。但**即使材质相同，纹理不同照样打断**。\n\n### 1.5 更准确的结论\n\n> Text 打断 UGUI 合批，**首要原因是它使用的字体纹理和普通 UI 元素的纹理不同**，导致渲染状态不一致。材质不同是可能的原因之一，但不是根本原因。本质上 UGUI 合批看的是**完整渲染状态**，纹理、材质、层级、遮挡关系等任一不同都会打断。\n\n### 1.6 补充：TextMeshPro 的表现\n\n`TextMeshPro` 在合批上通常比传统 `Text` 表现更好：\n\n- TMP 用的是**动态字体图集**\n- 通过合理设置图集大小，可以让更多文字共用同一张纹理，减少打断次数\n- 但 TMP 同样受纹理、材质等渲染状态约束，并不是“一定能合批”\n\n---\n\n## 二、Image 与 RawImage 的区别\n\n### 2.1 核心区别\n\n| 维度 | Image | RawImage |\n|---|---|---|\n| **显示对象** | **Sprite**（精灵） | **Texture**（任意纹理） |\n| **图集支持** | 支持，可自动合并到 Sprite Atlas | **不支持**，直接显示整张纹理 |\n| **九宫格拉伸** | 支持（Sprite 设置 Border 即可） | 不支持 |\n| **填充模式** | 支持（Filled，做进度条、CD 遮罩等） | 不支持 |\n| **图片形状** | 支持 Simple / Sliced / Tiled / Filled 四种 | 只有简单拉伸 |\n| **合批友好度** | 高，同一图集内可合批 | 低，每张纹理通常独立 DrawCall |\n| **性能** | 相对更优（可图集、可合批） | 相对更差（无法图集、易打断合批） |\n| **典型用途** | UI 图标、按钮背景、进度条、边框 | 显示 RenderTexture、视频画面、相机预览、动态生成的纹理 |\n\n### 2.2 深入解析\n\n**Image：为 UI 而生**\n\n- 源数据是 `Sprite`，Sprite 本身可以打包进 Sprite Atlas，多个 Image 只要来自同一图集就能合批，DrawCall 少。\n- Sprite 支持 Border（九宫格），可以只拉伸中间区域而保持边角不变形，非常适合可缩放的 UI 背景和边框。\n- `Type` 属性提供四种模式：Simple（普通）、Sliced（九宫格）、Tiled（平铺）、Filled（填充），其中 Filled 常用于做技能 CD 遮罩、进度条。\n\n**RawImage：为任意纹理而生**\n\n- 源数据是 `Texture`，可以是任意 2D 纹理，包括 `RenderTexture`。\n- 不经过 Sprite 系统，直接把整张纹理画出来，所以**无法使用图集，也无法设置九宫格和填充模式**。\n- 优势在于**灵活性**：可以显示相机渲染到 RenderTexture 的画面、视频解码后的纹理、运行时动态生成的纹理。`UV Rect` 属性还能让你只显示纹理的一部分，或做简单的 UV 滚动。\n\n### 2.3 选择建议\n\n- **常规 UI 元素**（图标、按钮、背景、边框、进度条）→ 优先用 `Image`，能享受图集合批和九宫格。\n- **显示 RenderTexture、视频、相机画面、动态纹理** → 用 `RawImage`，这是 Image 做不到的。\n- **如果只是显示一张普通图片，且不在图集里** → 两者都能用，但 `Image` 在合批和功能上通常更优。\n\n### 2.4 一句话总结\n\n> `Image` 面向 **Sprite**，支持图集、九宫格、填充，适合常规 UI，合批友好；`RawImage` 面向 **任意 Texture**，灵活但无法图集和九宫格，适合显示 RenderTexture、视频、动态纹理等 Image 覆盖不了的场景。\n\n---\n\n## 三、整体结论\n\n> UGUI 合批看的是**完整渲染状态**（材质、纹理、层级、遮挡、顶点布局）。Text 因为使用独立的**字体纹理**而容易打断合批；`Image` 因支持图集而合批友好，`RawImage` 因直接使用任意纹理而不支持图集、易打断合批。实际项目中，常规 UI 优先用 `Image`，需要显示 RenderTexture、视频或动态纹理时再用 `RawImage`。",
      "link": ""
    },
    {
      "id": "l-mu3lq0bzccag1",
      "title": "AssetBundle 卸载时机总结",
      "date": "2026-09-16",
      "tags": [
        "热更新"
      ],
      "summary": "AB 包的卸载核心取决于 `Unload(true)` 与 `Unload(false)` 的选择。前者彻底卸载但会销毁资源实例，后者保留实例但可能造成内存泄漏。本文梳理两种方式的差异、推荐策略以及配套的引用计数和资源清理手段。",
      "content": "## 一、两种卸载方式\n\n### `Unload(true)`：彻底卸载\n\n- 不仅 AB 包自身被卸载，**所有从它加载出来的资源实例也会被一并销毁**。\n- 如果场景里还有对象引用这些资源，引用会直接变成 Missing。\n- **适用场景**：明确的清理节点，比如关卡切换、进入加载界面时。\n\n### `Unload(false)`：只卸包体，保留资源实例\n\n- AB 包的文件头信息被释放，但**已加载到内存中的资源实例（材质、纹理等）继续保留**，场景中正在使用的对象不受影响。\n- **代价**：之后再次加载同一个 AB 并重新加载资源时，旧实例不会自动复用，内存里会出现两份同样的资源，造成泄漏。\n\n## 二、推荐的卸载策略\n\n**优先推荐 `Unload(true)`**，因为它不会产生内存泄漏。但直接调用有风险，关键是要配合**引用计数**确保包内所有资源都真的不再被使用。\n\n具体做法有两种：\n\n1. **在明确的节点统一卸载**：如关卡切换、加载界面期间，此时整个关卡的所有 AB 包都可安全 `Unload(true)`。\n2. **为每个 AB 包维护引用计数**：只有当包内所有资源都没有任何引用时，才调用 `Unload(true)`。这是更精细的做法，允许按需卸载单个包，而不会误删正在使用的东西。\n\n## 三、如果必须用 Unload(false)\n\n全局所有未引用资源的释放只能靠 **`Resources.UnloadUnusedAssets()`**。\n\n- **原理**：扫描所有资源，把“没有任何引用”的对象清理掉。\n- **注意**：开销较大，通常只在**场景切换时**调用，不适合频繁触发。\n- **Editor 测试提示**：在 Editor 里测试 `Unload(false)` 可能遇到 Mipmap Streaming 报错，建议用条件编译在 Editor 下传 `true`，构建版本里传 `false`。\n\n## 四、一句话结论\n\n> AB 包卸载优先用 `Unload(true)` 配合引用计数，在确保包内资源无引用时安全释放；`Unload(false)` 只在需要保留资源实例时使用，并靠 `Resources.UnloadUnusedAssets()` 在场景切换时统一清理，避免内存泄漏。",
      "link": ""
    },
    {
      "id": "l-mu3ll8rdhvqsv",
      "title": "Unity 动态合批与静态合批总结",
      "date": "2026-09-16",
      "tags": [
        "Unity",
        "性能优化"
      ],
      "summary": "动态合批和静态合批是 Unity 两种内置的 Draw Call 优化手段，目标都是合并相同材质的网格以减少绘制命令开销，但实现路径和适用场景完全不同。本文对比两者机制、开销与适用条件，并补充现代管线下的现实建议。",
      "content": "## 一、核心区别对比\n\n| 维度 | 静态合批 (Static Batching) | 动态合批 (Dynamic Batching) |\n|---|---|---|\n| **适用对象** | **不移动**的静态物体 | **可移动**的物体，但网格需足够小 |\n| **核心机制** | 构建时或运行时，将网格顶点**转换到世界空间**并合并成一个大网格 | **运行时每帧**，将网格顶点转换到世界空间并合并到公共缓冲区 |\n| **性能开销** | **内存/存储开销**：合并网格需额外内存，重复网格会创建副本 | **CPU 开销**：每帧遍历顶点做空间变换，现代硬件上可能得不偿失 |\n| **触发方式** | 手动标记 `Batching Static`，或运行时调用 API | 需手动开启开关，开启后自动对满足条件的物体生效 |\n\n## 二、深入解析\n\n### 静态合批：以空间换时间\n\n- 在**构建阶段**（或运行时手动调用）把静态物体合并成一个巨大网格，直接在**世界空间**烘焙顶点数据。\n- 运行时无需再做顶点变换，效率高。\n- **代价是内存**：多个相同物体（如一堆一样的石头）会各自创建网格副本塞进合并网格，内存成倍增加。植被茂密的森林场景盲目标记静态可能带来严重内存问题。\n\n### 动态合批：以 CPU 换 Draw Call\n\n- **每帧**在 CPU 上把所有参与合批的网格顶点转换到世界空间，填充到公共缓冲区，很耗 CPU。\n- 限制很多：只适合顶点数很少的网格（顶点属性不超过 900，顶点数通常不超过 300），不支持镜像缩放（负缩放）的物体。\n\n## 三、动态合批是“自动”的吗？\n\n需要澄清一个常见误解：\n\n- **动态合批本身需要手动开启**：\n  - **内置管线**：`Edit > Project Settings > Player > Other Settings` 勾选 `Dynamic Batching`\n  - **URP**：打开 URP Asset 文件，勾选 `Dynamic Batching`（默认用更高效的 SRP Batcher）\n  - **HDRP**：**不支持**动态合批\n- 开启后，Unity 会在运行时**自动尝试**对满足条件的移动物体合批，不需要为每个物体额外操作。\n\n## 四、现代项目中的现实建议\n\n- Unity 官方指出：**大多数现代硬件（尤其 Metal 等现代 API 平台）上，动态合批的 CPU 开销往往大于节省的 Draw Call 开销**，通常只在**低端移动设备**上才可能有收益。\n- **URP / HDRP 项目更推荐 SRP Batcher**，能更高效处理大量使用不同材质的物体，通常优于动态合批。\n- 使用 `MaterialPropertyBlock` 修改属性时，内置管线虽能保持合批，但会破坏 SRP Batcher 兼容性，新管线项目应避免。\n\n## 五、一句话结论\n\n> 静态合批用**内存换运行时效率**，适合不动的物体；动态合批用**CPU 换 Draw Call**，需手动开启且限制多，现代硬件上收益有限。新管线项目优先考虑 **SRP Batcher**，动态合批更多是低端移动设备上的备选手段。",
      "link": ""
    },
    {
      "id": "l-mu3lciwccoqjk",
      "title": "AssetBundle 循环依赖问题处理总结",
      "date": "2026-09-16",
      "tags": [
        "热更新"
      ],
      "summary": "AB 包循环依赖是指 Bundle A 引用 Bundle B 的资源，Bundle B 又反过来引用 Bundle A，形成闭环。本文梳理循环依赖的成因、核心处理方案，以及检测工具和高发场景。",
      "content": "## 一、循环依赖怎么来的\n\nUnity 的 AssetBundle 依赖关系是单向的：Bundle A 里的对象引用 Bundle B 里的对象，则 A 依赖 B。当 A 和 B 互相引用时，就形成循环依赖。\n\n**带来的问题**：\n\n1. **加载顺序无法确定**：A 需要 B，B 也需要 A，无论先加载哪个都会失败。\n2. **资源重复或引用丢失**：Unity 打包时若检测到循环，可能将依赖对象复制到多个包中，造成冗余。\n\n## 二、核心处理方式\n\n### 方案一：合并到一个 Bundle（最直接）\n\n- **做法**：把互相引用的 A、B 合并成同一个 Bundle，循环自然消失。\n- **适用场景**：两个包确实需要频繁互相引用，拆开反而增加管理成本。\n- **代价**：包体变大，无法精细控制加载粒度。\n\n### 方案二：提取公共依赖到独立 Bundle（推荐）\n\n- **做法**：把被多个包共享的资源（材质、纹理、图集）提取到独立的公共 Bundle。\n- **效果**：A 和 B 都只依赖公共 Bundle，不再互相依赖。\n- **运行时**：先加载公共 Bundle，再加载 A 和 B。\n- **来源**：Unity 官方推荐做法。\n\n### 方案三：重新规划资源归属\n\n- **做法**：把互相引用的那一小部分单独拆出来，或将 A 里被 B 引用的资源移到 B，反之亦然。\n- **核心目标**：让依赖关系变成单向的，而不是互相缠绕。\n\n## 三、检测工具与手段\n\n| 工具/手段 | 说明 |\n|---|---|\n| **AssetBundle Browser** | Unity 官方工具，`Window > AssetBundle Browser`，可视化查看依赖关系图，直接定位循环引用 |\n| **自研 Editor 脚本** | 用 `AssetDatabase.GetDependencies` 获取直接依赖，递归找出间接依赖，构建有向图后检测环 |\n| **运行时依赖表** | 打包后加载 `AssetBundleManifest`，通过 `GetAllDependencies` / `GetDirectDependencies` 拿到依赖关系，写入运行时配置表，按正确顺序加载 |\n\n## 四、高发场景提醒\n\n**Sprite Atlas 是循环依赖的高发区**。\n\n- 多个 Bundle 引用同一图集里的不同 Sprite 时，图集可能被复制到每个包里，或出现循环引用。\n- **建议**：把同一图集的所有 Sprite 分配到同一个 AssetBundle，并考虑打包时 `SetIncludeInBuild(false)` 来避免冗余。\n\n## 五、一句话结论\n\n> 处理 AB 包循环依赖的核心是**打破闭环**：优先提取公共依赖到独立 Bundle，其次合并强耦合的包，最后重新规划资源归属让依赖单向化。打包前用 AssetBundle Browser 或自研脚本检测，运行时用 AssetBundleManifest 按依赖表顺序加载。",
      "link": ""
    },
    {
      "id": "l-mu3l5tmpaqggy",
      "title": "Unity Prefab 本质总结",
      "date": "2026-09-16",
      "tags": [
        "Unity"
      ],
      "summary": "Prefab 本质是一个 YAML 格式的序列化文件，内部用 fileID 维护自身对象结构，用 guid 引用外部资源和其他 Prefab。本文梳理它的存储格式、两个核心标识符的分工、加载流程，以及容易混淆的细节。",
      "content": "## 一、Prefab 是什么\n\n- 一个 **YAML 格式的序列化文件**（`.prefab`）\n- 记录：**有哪些 GameObject、每个挂哪些组件、每个组件的序列化字段值**\n- 不是“指向组件的引用”，而是**组件自身的序列化数据 + 标识符**\n\n## 二、两个核心标识符\n\n| 标识 | 作用范围 | 用途 |\n|---|---|---|\n| **fileID** | 单个文件内部 | 文件内对象互相引用（GameObject ↔ Component） |\n| **guid** | 整个项目 | 跨文件引用外部资源（脚本、贴图、材质、其他 Prefab） |\n\n> 更准确的说法：Prefab 内部用 fileID 维护自身结构，用 guid 引用外部资源。\n\n## 三、加载 Prefab 时的流程\n\n1. 读取 `.prefab` 文件，反序列化出所有 GameObject 和 Component\n2. 解析 guid，去资源数据库找到外部资源（脚本、材质、贴图等）\n3. 在场景里实例化对象，建立父子关系，恢复字段值\n4. 形成 Prefab 实例，保留指向源 Prefab 的引用（通过 guid），实现“改一处、同步所有实例”\n\n## 四、容易混淆的点\n\n- **不是组件引用，而是序列化数据 + 标识符**：运行时才解析成真正的对象引用\n- **`fileID: 11500000`**：MonoBehaviour 的固定约定，真正脚本靠后面的 guid 区分\n- **Prefab 嵌套**：靠被引用 Prefab 的 guid + 内部对象的 fileID\n- **`.unity` 场景文件和 `.prefab` 同源**：都是 YAML，都用 fileID + guid，区别只是场景是根、Prefab 是模板\n\n## 五、一句话结论\n\n> Prefab 是一个 YAML 序列化文件，内部用 **fileID** 维护自身对象结构，用 **guid** 引用外部资源和其他 Prefab。加载时反序列化文件、解析 guid、实例化对象，并在场景里建立指向源 Prefab 的引用，从而实现“改一处、同步所有实例”。",
      "link": ""
    },
    {
      "id": "l-mu3l02hbjxvyu",
      "title": "Unity 协程原理与运作流程",
      "date": "2026-09-16",
      "tags": [
        "Unity"
      ],
      "summary": "协程是 Unity 中基于 C# 迭代器和单线程调度器实现的“分步执行”机制，不是多线程。本文梳理其本质、迭代器状态机、调度器运作流程、常见 yield 指令时机，以及使用中容易踩的坑。",
      "content": "## 一、协程的本质\n\n协程**不是线程**，也不涉及任何多线程调度。它完全跑在主线程上，依赖的是 **C# 迭代器（`IEnumerator`）** + **Unity 的协程调度器（`CoroutineScheduler`）**。\n\n核心机制：**迭代器把一段逻辑拆成多个“步骤”，调度器决定每一步在什么时机执行。**\n\n> 注意：协程是**分步执行**，不是**分时抢占**。同一帧内多个协程依次推进，不会真正并行。\n\n## 二、迭代器的角色：状态机\n\nC# 的 `yield return` 会被编译器展开成一个**状态机类**。它记录：\n\n- 当前执行到哪一步（`state`）\n- 局部变量的值\n- 下一步该返回什么\n\n每次调用 `MoveNext()`，就从上一次暂停的地方继续执行，直到遇到下一个 `yield return` 或方法结束。\n\n## 三、调度器怎么运作\n\nUnity 在每帧的特定阶段（`Update` 之后、`LateUpdate` 之后等）会去检查所有活跃的协程：\n\n1. 调用当前 `yield return` 返回的 **YieldInstruction**\n2. 判断这个指令是否满足继续条件\n3. 条件满足就调用 `MoveNext()`，推进到下一个 `yield return`\n\n### 常见 yield 指令的继续条件\n\n| yield 指令 | 继续时机 |\n|---|---|\n| `yield return null` | 本帧 `Update` 之后 |\n| `WaitForSeconds(t)` | 计时器到点（受 `Time.timeScale` 影响） |\n| `WaitForSecondsRealtime(t)` | 计时器到点（不受 `timeScale` 影响） |\n| `WaitForEndOfFrame()` | 本帧渲染结束后 |\n| `WaitForFixedUpdate()` | 下一次物理更新时 |\n| 嵌套 `IEnumerator` | 压入栈，先跑子协程 |\n\n## 四、完整流程\nStartCoroutine(MyCoroutine())\n↓\n创建 Coroutine 对象，交给调度器\n↓\n每帧在指定时机检查：\n当前 yield return 的条件满足了吗？\n↓ 满足\n调用 MoveNext() → 执行到下一个 yield return\n↓ 不满足\n本帧跳过，等下一帧再检查\n↓ 迭代器返回 false（方法结束）\n协程结束，从调度器移除\n\ntext\n\n## 五、几个容易踩的点\n\n**1. 协程不是并行的**\n同一帧内多个协程是**依次推进**的，不会真正同时执行。一个协程里写了死循环且不 `yield`，会直接卡死主线程。\n\n**2. `yield return` 的时机取决于返回类型**\n不同指令对应不同的恢复时机，见上表。\n\n**3. 协程依附于 MonoBehaviour**\n`StartCoroutine` 是 `MonoBehaviour` 的方法。**GameObject 被禁用或销毁时，它身上的协程会停止**（`SetActive(false)` 会停，销毁也会停）。如果希望协程独立于对象生命周期，需要用不依附 MonoBehaviour 的调度方式。\n\n**4. 迭代器是“惰性”的**\n`StartCoroutine` 传入的 `IEnumerator` 不会立刻执行，而是等调度器第一次 `MoveNext()` 才开始。所以方法体里 `yield` 之前的代码，是在第一次推进时才跑的。\n\n**5. 异常处理的限制**\n`yield return` 不能放在 `try-catch` 的 `catch` 或 `finally` 块里（C# 语法限制），异常处理需要额外封装。\n\n## 六、一句话总结\n\n> 协程是**单线程**的，靠 C# **迭代器状态机**把逻辑拆成多步，再由 Unity 的**协程调度器**在每帧的固定时机检查 `yield return` 的条件，满足就 `MoveNext()` 推进一步。它实现的是**分步执行**，不是分时抢占，所有协程共享主线程，同一帧内顺序推进。",
      "link": ""
    },
    {
      "id": "l-mu3kp9jzo3ehn",
      "title": "Unity Canvas Rebuild 机制总结",
      "date": "2026-09-16",
      "tags": [
        "Unity",
        "UGUI"
      ],
      "summary": "Canvas 是合批边界，频繁变化的 UI 元素应隔离到独立子 Canvas，并避免跨 Canvas 传播的 Layout 组件。",
      "content": "## 一、Rebuild 的三种类型\n\n| 类型 | 触发条件 | 负责组件 |\n|---|---|---|\n| **Layout Rebuild** | 尺寸、位置、锚点、Text 内容等影响布局的属性变化 | `LayoutRebuilder` |\n| **Graphic Rebuild** | 顶点、颜色、材质等影响渲染的数据变化 | `Graphic.Rebuild()` |\n| **Batch Rebuild** | 网格变化后，重新合并 DrawCall 批次 | `CanvasUpdateRegistry` |\n\n同一帧内多个元素变脏，会在 `WillRenderCanvases` 阶段**统一处理一次**，不会每个元素各跑一遍。\n\n## 二、核心机制：Canvas 是合批边界\n\n- 同一 Canvas 下的 Graphic 会尽量合并成少量 DrawCall。\n- **不同 Canvas 之间不合批**。\n- 所以任何一个元素变化，都会导致**整个 Canvas** 的批次重新计算，哪怕其他元素没动。\n\n## 三、拆 Canvas 的本质与代价\n\n**本质**：把“会脏”和“不会脏”的元素分到不同合批单元，让重建范围最小化。\n\n**代价**：每个 Canvas 至少一个独立批次，拆得越多，DrawCall 越多。\n\n**策略**：\n\n| 情况 | 建议 |\n|---|---|\n| 每帧都在变（血条、倒计时） | 拆独立 Canvas，收益最大 |\n| 偶尔变一次（按钮文字） | 差别不大，看整体 DrawCall 压力 |\n| 静态多 + 动态少 | 只把动态的拆出去 |\n| 界面本来就简单 | 拆了反而亏 |\n\n## 四、嵌套 Canvas\n\n- 子 Canvas 继承父 Canvas 渲染层级，但**独立参与合批**。\n- 子 Canvas 内的变化**不会触发父 Canvas 重建**——这是隔离生效的底层原因。\n- 子 Canvas 一般**不挂** `Graphic Raycaster`，射线检测交给父 Canvas。\n\n## 五、隐藏杀手：Layout 组件\n\n`LayoutGroup`、`ContentSizeFitter`、`AspectRatioFitter` 等组件变化时，布局重建会**跨 Canvas 传播**，光拆 Canvas 可能不够。\n\n**解法**：\n- 动态元素尽量不用 LayoutGroup，手动算位置；\n- 或把带 LayoutGroup 的整块区域连同父级一起隔离；\n- 慎用 `LayoutRebuilder.ForceRebuildLayoutImmediate`。\n\n## 六、一句话结论\n\n> 把频繁触发 **Graphic Rebuild** 的元素隔离到独立子 Canvas，避免污染静态元素的合批；同时确保这些动态元素不携带会**跨 Canvas 传播的 Layout 组件**。拆的粒度要在“减少重建范围”和“控制 DrawCall 数量”之间取平衡。",
      "link": ""
    },
    {
      "id": "l-mu2fxlqn3fo6x",
      "title": "Unity AB 包资源热更新总结",
      "date": "2026-09-15",
      "tags": [
        "Unity",
        "热更新"
      ],
      "summary": "本文总结 Unity AB 包热更新的原理与流程：资源压缩上传服务器，客户端对比版本后下载更新，压缩方式常用 LZ4。AB 包会自动生成依赖关系，加载时需先加载被依赖包。加载方式有 `LoadFromFile`、`LoadFromMemory`、`LoadFromStream` 三种；卸载时 `Unload(true)` 会销毁实例，`Unload(false)` 不会。引用计数需要自行维护，避免提前卸载或内存泄漏。",
      "content": "## 一、热更新原理\n\n- 把资源文件压缩后上传到服务器，客户端下载下来更新。\n- 压缩方式有好几种，通常使用 **LZ4**。\n  - **LZ4**：压缩和解压速度快，块级压缩，支持随机读取，Unity 推荐用于大多数 AB 包。\n  - **LZMA**：压缩率高，包体更小，但解压慢，适合下载场景（下载完再解压）。\n  - **不压缩**：加载最快，但包体最大。\n  - Unity 打包时通常选 **ChunkBasedCompression（LZ4）**，兼顾速度和体积。\n- **补充**：AB 包热更新只解决**资源热更新**，代码热更新是另一套方案（Lua、ILRuntime、HybridCLR 等），面试时最好分开说。\n\n---\n\n## 二、热更新流程\n\n1. 开发者给资源打成 AB 包。\n2. 生成对比文件（版本清单、哈希值、依赖关系等），通常是一份 manifest。\n3. 上传到服务器 / CDN。\n4. 客户端启动时拉取最新清单，和本地版本对比。\n5. 找出需要更新的包，下载差异部分。\n6. 下载完成后加载新 AB 包，替换旧资源。\n\n**补充**：\n- 对比文件一般包含：包名、哈希值（MD5/SHA）、大小、依赖关系、版本号。\n- 对比方式：本地版本号 vs 服务器版本号，或者逐包比对哈希值。\n- 增量更新：只下载变化的包，不是全部重下，这是热更新节省流量的关键。\n\n---\n\n## 三、AB 包依赖\n\n- AB 包会自己生成各个包体之间的依赖关系。\n- 加载的时候会先加载被依赖的包。\n- **补充**：\n  - 依赖关系记录在 manifest 里，可以用 `AssetBundleManifest.GetAllDependencies()` 获取。\n  - 如果不先加载依赖包，会出现资源丢失、材质变粉、引用断裂等问题。\n  - 依赖包只需加载一次，多个包共享同一依赖时要注意引用计数。\n\n---\n\n## 四、AB 包加载方式\n\n| API | 说明 | 特点 |\n|-----|------|------|\n| `LoadFromFile` | 从本地文件路径加载 | 最常用，速度快、内存占用低 |\n| `LoadFromMemory` | 从内存字节数组加载 | 需要先把整个包读进内存，占用高，但可加密 |\n| `LoadFromStream` | 从流加载 | 适合大包，流式读取，但注意仍需分配内存，速度受流影响 |\n\n**补充**：\n- 还有 `LoadFromFileAsync`、`LoadFromMemoryAsync`、`LoadFromStreamAsync` 异步版本。\n- 从网络下载通常用 `UnityWebRequestAssetBundle.GetAssetBundle`，下载完再走 `LoadFromFile` 或 `LoadFromMemory`。\n- `LoadFromMemory` 一般用于**加密包**：先解密成 `byte[]`，再加载。\n\n---\n\n## 五、AB 包卸载与引用计数\n\n- **`Unload(true)`**：卸载包时会把所有从这个包加载的实例也都销毁。\n- **`Unload(false)`**：不会销毁实例。\n- **引用计数**：标记当前包是不是还有别的地方要用，这个计数在 AB 包里需要自己维护。\n\n**补充和修正**：\n- `Unload(true)`：会销毁所有从该 AB 包加载出来的 Asset 实例，包括正在使用的。如果还有引用没断，会出现**丢失引用、变粉、报错**。所以一般只在确定没人用了才调 `true`。\n- `Unload(false)`：只卸载 AB 包本身，已加载的 Asset 实例会留在内存里，但会失去和包的关联。如果这些实例还在用，问题不大；但如果之后想彻底释放，就需要手动 `Resources.UnloadUnusedAssets()`。\n- **引用计数**：Unity 的 AB 包**没有自动引用计数**，需要自己维护。通常做法：\n  - 每个包维护一个计数器；\n  - 加载一次 +1，卸载一次 -1；\n  - 计数归零时才真正 `Unload`；\n  - 依赖包也要计数，被依赖时 +1。\n- **常见坑**：\n  - 依赖包没计数，导致被提前卸载，引用断裂。\n  - `Unload(true)` 时还有实例在用，导致资源丢失。\n  - 忘记卸载，导致内存泄漏。\n\n---\n\n\n\n## 七、一句话总结\n\nAB 包热更新通过资源压缩上传、客户端对比下载实现；加载时注意依赖顺序，卸载时注意 `Unload` 参数与引用计数，避免资源丢失或内存泄漏。",
      "link": ""
    },
    {
      "id": "l-mu2f96e20qnki",
      "title": "C# 几种重要数据类型总结",
      "date": "2026-09-15",
      "tags": [
        "C#"
      ],
      "summary": "本文总结了 C# 中几种重要数据类型：`struct` 与 `class` 的区别、`Array` / `ArrayList` / `List` 的对比、`delegate` 与 `event` 的机制、`Dictionary` 的底层实现。重点包括值类型与引用类型的差异、泛型与非泛型的拆装箱问题、委托多播顺序、事件封装，以及字典的哈希冲突解决方式。",
      "content": "## 一、struct 和 class\n\n- **结构体是值类型，类是引用类型** \n- **传参赋值时**：\n  - 结构体直接复制整个结构体；\n  - 类复制引用（指向同一块堆内存），修改一个变量会影响另一个。\n- **继承**：\n  - 结构体不能继承（隐式继承自 `System.ValueType`，不能继承其他结构体或类）；\n  - 类可以继承。\n- **无参构造函数**：\n  - C# 10 之前，结构体不能定义无参构造函数。原因：CLR 要求所有值类型都有默认构造函数，保证实例字段全部初始化为零值；值类型常在数组、栈中批量分配，CLR 直接清零内存，不调用自定义构造函数。\n  - C# 10 之后放宽：结构体可以显式定义无参构造函数，但**必须初始化所有字段**。\n- **成员变量初始值**：\n  - C# 10 之前，结构体实例字段不能手动赋初值，默认零值；类可以。\n  - C# 10 之后，若写了显式无参构造函数或字段初始化器，结构体字段也可赋初值。\n- **其他**：\n  - 结构体可以实现接口。\n\n---\n\n## 二、Array、ArrayList、List\n\n- **三者都是引用类型** \n- **Array**：\n  - 普通无泛型数组，固定长度，不能扩容。\n- **ArrayList**：\n  - 无泛型，可扩容，内部存 `object`；\n  - 可以存不同类型，但会导致大量**拆装箱**。\n- **List<T>**：\n  - 泛型，可扩容，不会拆装箱；\n  - 超过容量后，自动声明一个**二倍长度**的新数组，复制旧值，原数组等待 GC；\n  - 默认初始容量为 4，每次翻倍。\n\n---\n\n## 三、delegate 和 event\n\n- **委托**：\n  - 是一种函数指针，可以存储函数，在合适的地方触发；\n  - 有多播机制，可以存多个函数。\n- **多播执行顺序**：\n  - **有序**。内部维护调用列表（`InvocationList`），执行顺序为**注册顺序**（先进先出）。\n  - 例如 `d += A; d += B; d += C;`，调用 `d()` 时执行顺序为 `A → B → C`。\n  - 若某个方法抛出异常，后面的方法不会执行。\n- **event**：\n  - 是对委托的封装；\n  - 主要差别：`event` 只能在声明它的类内触发（`Invoke`）和直接赋值（包括 `= null`）；\n  - 外部类只能进行订阅（`+=`）和退订（`-=`）。\n\n---\n\n## 四、Dictionary\n\n- **底层实现**：桶数组 + 链表。\n- **添加流程**：\n  - `key` 经过哈希运算和取余（实际是 `hashCode & (buckets.Length - 1)`）得到索引；\n  - 该索引指向桶数组，桶数组指向保存数据的链表节点。\n- **哈希冲突**：\n  - 两个数据的哈希值相同时，使用**链式法**（拉链法）解决；\n  - 新节点指向原节点，桶数组指向新节点（头插法，插入 O(1)）。\n- **补充**：\n  - `key` 为 `null` 会抛 `ArgumentNullException`；\n  - `Add` 重复 key 会抛异常，用索引器 `dict[key] = value` 会覆盖；\n  - .NET Core 3.0+ 中，链表长度超过 8 且桶数组长度大于 64 时，链表会转成**红黑树**，查找从 O(n) 降为 O(log n)；\n  - 扩容时桶数组扩大，重新哈希所有元素。\n\n---\n\n## 五、面试速记\n\n| 知识点 | 关键结论 |\n|--------|---------|\n| struct / class | 值类型 vs 引用类型；结构体不继承；C# 10 前不能有无参构造 |\n| Array / ArrayList / List | 固定 vs 非泛型扩容 vs 泛型扩容；拆装箱问题 |\n| delegate / event | 多播有序；event 封装，外部只能 += / -= |\n| Dictionary | 桶数组 + 链表；哈希取余；链式法解决冲突；扩容翻倍 |\n\n---\n\n## 六、一句话总结\n\n`struct` 是值类型、`class` 是引用类型；`List<T>` 泛型无拆装箱，`ArrayList` 存 `object` 有拆装箱；`delegate` 多播有序，`event` 封装限制外部触发；`Dictionary` 用桶数组 + 链表（或红黑树）解决哈希冲突。",
      "link": ""
    },
    {
      "id": "l-mu2eme5u90bds",
      "title": "Unity 生命周期知识点总结",
      "date": "2026-09-15",
      "tags": [
        "Unity"
      ],
      "summary": "nity 生命周期大致分为初始化、物理更新、游戏逻辑更新、渲染几个阶段。核心顺序为 `Awake → OnEnable → Start → FixedUpdate → Update → LateUpdate → 渲染相关`。面试重点在于分清 `Awake` 与 `Start`、`FixedUpdate` 与 `Update` 的区别，以及 `LateUpdate` 的典型用途（如摄像机跟随）。",
      "content": "## 一、主要执行顺序\n\n`Awake → OnEnable → Start → FixedUpdate → Update → LateUpdate → 渲染相关`\n\n> 在 `FixedUpdate` 之前还有一些输入相关的回调（如 `OnMouseDown` 等）。\n\n---\n\n## 二、各阶段说明\n\n### 1. Awake\n\n- 在一次运行中，对象只触发一次。\n- 主要用于初始化引用、获取组件、初始化数据。\n\n### 2. OnEnable / OnDisable\n\n- `OnEnable`：对象 `SetActive(true)` 时触发，可以反复触发。\n- `OnDisable`：对象 `SetActive(false)` 或销毁时触发，同样可以反复触发。\n- 常用于注册/注销事件、重置状态。\n\n### 3. Start\n\n- 在第一次 `Update` 之前执行，只在脚本启用时调用。\n- 用于初始化那些依赖其他对象 `Awake` 完成后的逻辑。\n\n### 4. FixedUpdate\n\n- 物理帧更新，固定时间刷新，默认 `0.02s`。\n- 可以在编辑器里修改：`Edit → Project Settings → Time → Fixed Timestep`。\n- 物理相关操作放这里，比如 `Rigidbody`、力、碰撞检测。\n\n### 5. Update\n\n- 每帧执行，更新频率和帧率有关。\n- 大部分游戏逻辑、输入检测、非物理移动都放在这里。\n\n### 6. LateUpdate\n\n- 每帧最后执行的更新。\n- 主要用于摄像机跟随，因为此时玩家对象的位置已经更新完毕，不会出现位置抖动。\n- 也可以处理 UI 跟随 3D 物体等“后置逻辑”。\n\n---\n\n## 三、面试重点对比\n\n### 1. Awake 与 Start 的区别\n\n- **Awake**：对象实例化后立即调用，无论脚本是否启用（`enabled = false` 也会调用）。\n- **Start**：第一次 `Update` 之前调用，且只在脚本启用时调用。\n- **执行顺序**：`Awake → OnEnable → Start`。\n- 所有对象的 `Awake` 都执行完之后，才会开始执行 `Start`。\n- 所以 `Awake` 适合做自身初始化，`Start` 适合做依赖其他对象初始化结果的逻辑。\n\n### 2. FixedUpdate 与 Update 的区别\n\n- **FixedUpdate**：固定时间步长执行，和物理系统同步，一帧内可能执行 0 次、1 次或多次；适合物理计算。\n- **Update**：每帧执行一次，频率随帧率变化；适合游戏逻辑、输入检测、非物理移动。\n- 物理相关操作必须放在 `FixedUpdate` 里，否则物理表现会不稳定。\n- 如果帧率高于物理帧率，物理系统会在两个固定帧之间做插值，让运动看起来平滑。\n\n---\n\n\n## 四、一句话总结\n\n`Awake` 做自身初始化，`Start` 做依赖初始化；`FixedUpdate` 跑物理，`Update` 跑逻辑；`LateUpdate` 收尾，常用于摄像机跟随。",
      "link": ""
    },
    {
      "id": "l-mu2dp1qo42w6q",
      "title": "Unity 协程原理与 yield return 执行顺序",
      "date": "2026-09-15",
      "tags": [
        "Unity"
      ],
      "summary": "Unity 协程本质仍是单线程，通过迭代器把一个长任务拆分成多帧执行。`StartCoroutine` 会为迭代器方法生成状态机对象，产生 GC 消耗。`yield return` 的不同返回值决定了协程在 Unity 生命周期（PlayerLoop）的哪个阶段恢复执行。理解这一点，就能解释 `WaitForEndOfFrame` 与 `yield return null` 等行为的差异。",
      "content": "## 一、协程的本质\n\n- **单线程**：协程不是多线程，仍在主线程执行。\n- **迭代器分时执行**：通过 `IEnumerator` 把长任务拆成多个步骤，每帧执行一部分。\n- **调度器驱动**：Unity 内部有一个协程调度器，在 PlayerLoop 的特定时机调用 `MoveNext()` 推进协程。\n- **GC 消耗**：\n  - `StartCoroutine(MyCoroutine())` 会为迭代器方法生成一个**状态机对象**，分配在托管堆上。\n  - 协程内部每次 `yield return new WaitForSeconds(1f)` 也会 `new` 一个对象，产生额外 GC。\n  - 因此协程并非零成本，热路径中需注意。\n\n---\n\n## 二、yield return 的常见返回值\n\n| 返回值 | 含义 | 是否受 `Time.timeScale` 影响 |\n|--------|------|----------------------------|\n| `null` / `0` / 任意数字 | 等待到当前帧结束（下一帧 Update 前恢复） | 否 |\n| `WaitForSeconds` | 等待指定时间 | **是** |\n| `WaitForSecondsRealtime` | 等待指定真实时间 | 否 |\n| `WaitForEndOfFrame` | 等待当前帧渲染结束 | 否 |\n| `WaitForFixedUpdate` | 等待物理帧结束（每个 FixedUpdate 之后） | 否 |\n| `WaitUntil` / `WaitWhile` | 每帧检查条件，满足时恢复 | 否 |\n\n> **注意**：`yield return 0` 会导致 `int` 装箱为 `object`，产生不必要的 GC。能写 `null` 就不要写 `0`。\n\n---\n\n## 三、Unity 生命周期与 yield return 执行顺序\n\n`yield return` 的恢复时机完全由 Unity 的 PlayerLoop（生命周期）决定。一帧的简化流程如下：\n\n```text\n[帧开始]\n  ↓\nFixedUpdate()                       ← 物理帧\n  ↓\nyield return WaitForFixedUpdate 恢复点\n  ↓\nUpdate()\n  ↓\nyield return null 恢复点             ← 在 Update 之后，LateUpdate 之前\n  ↓\nLateUpdate()\n  ↓\nOnGUI()\n  ↓\n渲染（Camera.Render、OnRenderImage 等）\n  ↓\nyield return WaitForEndOfFrame 恢复点\n  ↓\n[帧结束，画面呈现到屏幕]\n```\n\n### 各返回值的恢复时机\n\n- **`yield return null`**：在 `Update` 执行完之后、`LateUpdate` 之前恢复。这是最轻量的等待方式，不产生 GC（除了状态机本身）。\n- **`WaitForFixedUpdate`**：在每个 `FixedUpdate` 之后恢复。一帧内可能执行多次 `FixedUpdate`，因此该协程一帧内也可能恢复多次。\n- **`WaitForEndOfFrame`**：在渲染和 `OnGUI` 都执行完毕之后、帧呈现到屏幕之前恢复。\n- **`WaitForSeconds` / `WaitForSecondsRealtime`**：在 `Update` 阶段检查计时器，时间到了就恢复。\n- **`WaitUntil` / `WaitWhile`**：在 `Update` 阶段每帧检查条件。\n\n### WaitForEndOfFrame 与 yield return null 的区别\n\n这是最容易混淆的一点：\n\n| 对比项 | `yield return null` | `WaitForEndOfFrame` |\n|--------|---------------------|---------------------|\n| 恢复时机 | Update 之后，LateUpdate 之前 | 渲染和 GUI 结束之后，帧呈现之前 |\n| 一帧内位置 | 靠前 | 非常靠后 |\n| 是否产生 GC | 否 | 否（但每次 new 该对象会产生 GC，通常初始化时 new 一次） |\n| 典型用途 | 逐帧逻辑、延迟一帧 | 截图、`ReadPixels`、等待所有渲染完成 |\n\n\n\n### 补充：StartCoroutine 的执行细节\n\n- `StartCoroutine` 会**立刻执行**协程方法，直到遇到第一个 `yield return` 才暂停。\n- 之后的恢复才按照上述 PlayerLoop 时机进行。\n- 因此，在 `Update` 里 `StartCoroutine`，协程的第一段代码是同步执行的，而不是等到下一帧。\n\n---\n\n## 四、协程的 GC 优化建议\n\n- **避免在 `Update` 里 `StartCoroutine`**：会导致每帧生成状态机对象。\n- **用 `yield return null` 代替 `yield return 0`**：避免装箱。\n- **缓存 `WaitForSeconds`**：例如声明字段 `private WaitForSeconds wait1s = new WaitForSeconds(1f);`，避免每次 `new`。\n- **减少协程内 `new` 对象**：如 `new WaitForEndOfFrame()` 可缓存。\n- **考虑替代方案**：对于简单延迟，可用 `Invoke`；对于复杂异步，可用 `UniTask` 等库减少状态机分配。\n\n---\n\n## 五、一句话总结\n\nUnity 协程是单线程下基于迭代器的分时执行机制；`yield return` 的恢复时机由 PlayerLoop 决定，`null` 在 `Update` 后恢复，`WaitForEndOfFrame` 在渲染后恢复，二者用途不同。`StartCoroutine` 和 `new WaitForSeconds` 都会产生 GC，热路径中需缓存和复用。",
      "link": ""
    },
    {
      "id": "l-mu2dj2he1vb0l",
      "title": "C# / Unity GC 机制与优化笔记",
      "date": "2026-09-15",
      "tags": [
        "C#",
        "Unity",
        "GC",
        "性能优化"
      ],
      "summary": "C# 的 GC 采用分代机制，并且会压缩内存；Unity 的 GC 不存在分代机制，也不会压缩内存。减少无用 GC 的本质是减少托管堆分配，包括显式 `new` 和隐式分配（装箱、字符串拼接、闭包、LINQ、Unity API 等）。热路径中应尽量缓存、复用、使用泛型与非分配 API。",
      "content": "## 一、C# 的 GC 机制\n\n- **有分代机制**：分为 0 代、1 代、2 代，以及大对象堆 LOH。\n- **新声明的对象**会先放在 **0 代内存**。\n- **0 代已满**时触发 **0 代 GC**：\n  1. 扫描 0 代中不再使用的对象；\n  2. 回收这些对象；\n  3. 压缩幸存对象，让它们位于连续内存；\n  4. 幸存对象从 0 代晋升到 1 代。\n- **1 代内存满了之后**，触发 1 代 GC，通常会**连带回收 0 代和 1 代**，幸存对象晋升到 2 代。\n- **2 代内存满了之后**，触发 Full GC，回收 0、1、2 代。\n- **大对象堆 LOH**：\n  - 大于约 85KB 的对象直接进入 LOH；\n  - LOH 属于 2 代；\n  - LOH **默认不压缩**，除非显式设置 `GCSettings.LargeObjectHeapCompactionMode`。\n- **0 代预算不是固定的**：GC 会根据分配速率和存活率动态调整 0 代预算。\n- **特点**：分代回收 + 内存压缩，能减少内存碎片，但 Full GC 仍可能造成卡顿。\n\n---\n\n## 二、Unity 的 GC 机制\n\n- **不存在分代机制**。\n- **不会压缩内存**。\n- Unity 使用的 GC：\n  - Mono 后端：Boehm GC；\n  - IL2CPP 后端：非分代 GC；\n  - 较新版本支持 **增量式 GC**（Incremental GC），把一次 GC 分摊到多帧，减少单帧卡顿，但依然**不分代、不压缩**。\n- **Boehm GC 是保守式 GC**：扫描栈和寄存器中“看起来像指针”的值，可能误判某些内存为可达，导致该回收的没回收。\n- **非增量模式下是 stop-the-world**：触发时会暂停主线程，这是卡顿来源。\n- **容易产生内存碎片**，因为不压缩。\n\n---\n\n## 三、Unity 中触发 GC 的方式\n\n1. **内存不足时自动触发**。\n2. **手动调用** `GC.Collect()`。\n3. **场景切换时自动触发**（本质是场景卸载时调用 `Resources.UnloadUnusedAssets()`，内部触发完整 GC）。\n\n> 频繁手动调用 `GC.Collect()` 会带来性能开销和卡顿，应尽量避免。\n\n---\n\n## 四、C# GC 与 Unity GC 对比\n\n| 对比项 | C# GC | Unity GC |\n|--------|-------|----------|\n| 分代机制 | 有（0/1/2 代 + LOH） | 无 |\n| 内存压缩 | 会压缩（LOH 默认不压缩） | 不压缩 |\n| 内存碎片 | 较少 | 容易产生 |\n| GC 类型 | 精确式 GC | 保守式 GC（Boehm） |\n| 触发方式 | 代满触发 | 内存不足、手动、场景切换 |\n| 常见卡顿 | Full GC 时 | 每次 GC 都可能卡顿 |\n| 增量式 GC | 不适用 | 较新版本支持，分摊到多帧 |\n\n---\n\n## 五、哪些操作会导致无用 GC\n\n无用 GC 的本质是**托管堆分配**，包括显式 `new` 和隐式分配。热路径（Update、循环、每帧）中尤其要警惕。\n\n### 1. 字符串相关\n\n- 每帧拼接字符串：`text = \"HP: \" + hp;`\n- `string.Format`、`$\"{a}{b}\"`（旧版本可能装箱/分配）\n- `Replace`、`Substring`、`ToUpper`、`Trim` 等，都会返回新字符串\n- `gameObject.name`、`gameObject.tag == \"Player\"`（推荐 `CompareTag`）\n- 每帧更新 UI `Text` 内容\n\n### 2. 装箱拆箱\n\n- 值类型赋给 `object`、接口\n- 非泛型集合：`ArrayList.Add(1)`、`Hashtable[key] = 1`\n- 调用 `object` 的非重写方法：`i.GetType()`\n- 协程 `yield return 0`\n- `Enum.HasFlag`、`Enum.GetName` 等\n- 字符串插值在旧版本中装箱值类型\n- 拆装箱的隐式场景：switch 匹配值类型、调用 object 的方法、协程的返回值类型、Unity 的 Instantiate 方法\n\n### 3. LINQ 和闭包\n\n- `list.Where(x => x > 0).ToList()` 在 Update 里每帧调用\n- lambda 捕获局部变量生成闭包类\n- `Sort` 传入匿名比较器，每次分配委托\n\n### 4. Unity API 分配\n\n- `GetComponents<T>()` 返回新数组\n- `Physics.RaycastAll` 返回新数组\n- `Camera.main` 旧版内部查找，开销大\n- `Instantiate` / `Destroy` 频繁生成销毁 GameObject\n- `Resources.Load` 在运行时反复调用\n\n### 5. 集合和数组\n\n- 每帧 `new List<T>()`、`new Dictionary<K,V>()`\n- `ToArray()`、`ToList()` 在热路径\n- `params` 数组：`Debug.LogFormat(\"{0}\", a, b)`\n\n### 6. 协程\n\n- `yield return new WaitForSeconds(1f)` 每次分配\n- `yield return 0` 装箱\n- 每帧 `yield return null` 不分配，可以放心用\n\n### 7. foreach 的分配情况\n\n`foreach` 不一定分配迭代器，要分情况：\n\n| 集合类型 | foreach 是否分配 |\n|---------|----------------|\n| 数组 `int[]`、`T[]` | 不分配，编译成 for |\n| `List<T>` | 不分配，`List<T>.Enumerator` 是 struct |\n| `Dictionary<K,V>` | 不分配，枚举器是 struct |\n| `HashSet<T>` | 不分配，struct 枚举器 |\n| 接口类型 `IEnumerable<T>` | 可能分配/装箱 |\n| 非泛型 `IEnumerable` / `ArrayList` | 通常分配/装箱 |\n| 自定义返回 class 枚举器的集合 | 分配 |\n| `yield return` 迭代器方法 | 分配状态机对象 |\n\n> 数组和泛型集合的 `foreach` 通常不产生 GC；只有走接口、非泛型集合、自定义类枚举器、迭代器方法时才分配。\n\n---\n\n## 六、怎么避免无用 GC\n\n### 1. 对象池\n\n- GameObject / 组件池：子弹、特效、敌人\n- 普通 C# 对象池：临时数据对象\n- 集合池：`List<T>`、`Dictionary<K,V>` 复用，`Clear()` 而不是 `new`\n- StringBuilder 池：避免每次 new StringBuilder\n\n### 2. 字符串\n\n- 频繁变化用 `StringBuilder`，并且**复用**：`sb.Clear()` 或 `sb.Length = 0`\n- 能缓存就缓存：`WaitForSeconds`、颜色字符串、格式化结果\n- UI 文本不要每帧赋值，变化时才更新\n- 比较 tag 用 `CompareTag(\"Player\")`，不要 `tag == \"Player\"`\n- 少量拼接编译器可能优化成 `String.Concat`，不一定比 StringBuilder 差；StringBuilder 更适合循环内大量拼接\n\n### 3. 循环\n\n- 数组、`List<T>` 热路径可以用 `for`，减少枚举器开销\n- 但 GC 角度，`List<T>` 的 foreach 本身不分配\n- 真正要避免的是：把集合当接口用、非泛型集合、迭代器方法\n\n### 4. 避免装箱\n\n- 用泛型集合 `List<T>`、`Dictionary<K,V>`\n- 值类型重写 `ToString`、`Equals`、`GetHashCode`\n- 协程用 `yield return null`，`WaitForSeconds` 缓存\n- 避免把值类型传给 `object` 参数\n\n### 5. 缓存和非分配 API\n\n- 缓存 `GetComponent`、`Camera.main`、`Transform`\n- 用 `Physics.RaycastNonAlloc` 替代 `RaycastAll`\n- 用 `GetComponents(List<T>)` 重载替代返回数组的版本\n- 用 `Mesh.SetVertices(List<Vector3>)` 等接收 List 的 API\n\n### 6. 避免 LINQ 和闭包\n\n- 热路径手写 for 循环\n- 缓存委托，避免每次 new\n- 避免在 Update 里捕获局部变量的 lambda\n\n### 7. 预分配和复用\n\n- 集合初始化时给容量：`new List<T>(capacity)`\n- 复用数组：`ArrayPool<T>`、Unity 的 `ArrayPool`\n- 避免 `ToArray`、`ToList`，直接传 List 或 Span\n\n### 8. 工具\n\n- Unity Profiler 看 **GC Alloc** 列\n- Deep Profile 定位具体函数\n- Memory Profiler 看托管堆\n- 真机上测试，编辑器数据不完全准\n\n---\n\n## 七、一句话总结\n\nC# GC 分代 + 压缩，Unity GC 不分代 + 不压缩；C# 按代满触发，Unity 按内存不足、手动调用、场景切换触发。减少无用 GC 的本质是减少托管堆分配：能缓存就缓存，能复用就复用，能用结构体/泛型就避免装箱，能用非分配 API 就别用返回数组的 API。热路径中任何托管堆分配都要警惕。",
      "link": ""
    },
    {
      "id": "l-mu2cqng1i7kdx",
      "title": "C# 值类型与引用类型及装箱拆箱机制",
      "date": "2026-09-15",
      "tags": [
        "C#"
      ],
      "summary": "值类型和引用类型的核心区别在于内存分配位置和 GC 管理方式；值类型不一定都在栈上，取决于声明上下文。装箱拆箱是两者转换的桥梁，但会带来堆分配和拷贝的性能开销，在 Unity 中尤其需要警惕。",
      "content": "## 一、类型分类\n\n### 值类型\n\n- 简单类型：`int`、`float`、`double`、`bool`、`char`、`byte` 等\n- 枚举：`enum`\n- 结构体：`struct`\n- 可空类型：`int?`、`bool?`（本质是 `Nullable<T>` 结构体）\n\n### 引用类型\n\n- `string`、`object`\n- 类：`class`\n- 接口：`interface`\n- 数组：`int[]`、`string[]`\n- 委托：`delegate`、`Action`、`Func`\n- 集合：`List<T>`、`Dictionary<K,V>` 等\n\n---\n\n## 二、存储位置（重点纠正）\n\n“值类型在栈上，引用类型在堆上”是**简化说法**，更准确的规则：\n\n| 情况 | 存储位置 |\n|------|---------|\n| 值类型作为**局部变量** | 栈 |\n| 值类型作为**类的字段** | 堆（跟随所属对象） |\n| 值类型作为**数组元素** | 堆 |\n| 值类型被**装箱** | 堆 |\n| 引用类型的**引用本身**（局部变量） | 栈 |\n| 引用类型指向的**对象实例** | 堆 |\n\n> 结论：值类型不一定在栈上，只有“方法内的局部值类型变量”才在栈上。\n\n---\n\n## 三、分配速度与 GC\n\n- **栈分配快**：仅移动栈指针，方法结束自动释放，无需 GC。\n- **堆分配慢**：需要找合适内存块，可能触发 GC。\n- **GC 只管堆**：栈上的内存由方法调用栈自动管理，GC 不参与。\n- 因此“值类型由 GC 管理”不准确——栈上的值类型随栈帧释放；只有被装箱或作为对象字段时，才由 GC 间接管理。\n\n---\n\n## 四、装箱与拆箱（Boxing / Unboxing）\n\n### 定义\n\n- **装箱**：把值类型转成引用类型（`object` 或值类型实现的接口）\n- **拆箱**：把引用类型转成值类型\n\n```csharp\nint i = 42;\nobject o = i;      // 装箱：在堆上分配，拷贝值\nint j = (int)o;    // 拆箱：从堆拷贝回栈\n```\n\n### 过程细节\n\n1. **装箱**：在堆上分配内存 → 将值类型字段拷贝到堆对象 → 返回对象引用。\n2. **拆箱**：检查对象类型是否匹配 → 将堆中的值拷贝回栈上的值类型变量。\n\n### 性能影响\n\n- 装箱涉及**堆分配 + 内存拷贝**，拆箱涉及**类型检查 + 内存拷贝**。\n- 频繁装箱拆箱是性能杀手，尤其在循环中，会加剧 GC 压力。\n\n### 拆装箱的隐式场景\n\n拆装箱的隐式场景：switch 匹配值类型、调用 object 的方法、协程的返回值类型、Unity 的 Instantiate 方法。\n\n---\n\n## 五、拆装箱的隐式场景\n\n以下场景看起来没有显式转 `object`，但底层发生了装箱：\n\n1. **switch 匹配值类型**\n2. **调用 object 的方法**\n3. **协程的返回值类型**\n4. **Unity 的 Instantiate 方法**\n\n### 1. switch 匹配值类型\n\n```csharp\nobject obj = 5;\nswitch (obj)\n{\n    case int i:  // 涉及装箱/拆箱\n        break;\n}\n```\n\n`switch` 基于 `object` 比较时，值类型参与会触发装箱；C# 7+ 的模式匹配已做优化，但混用 `object` 时仍需注意。\n\n### 2. 调用 object 的方法\n\n```csharp\nint i = 42;\ni.ToString();        // 不装箱，int 有重写的 ToString\ni.GetType();         // 装箱！GetType 是 object 的非虚方法\ni.Equals(42);        // 可能装箱，取决于重载解析\n```\n\n任何值类型没有重写、只能走 `object` 实现的方法调用，都会先装箱再调用。\n\n### 3. 协程的返回值类型\n\n```csharp\nIEnumerator Coroutine()\n{\n    yield return 0;   // int 被装箱成 object\n}\n```\n\nUnity 协程的 `yield return` 接受的类型是 `object`，返回任何值类型（如 `int`、`float`）都会被装箱。推荐：\n\n- 尽量 `yield return null`（不装箱）\n- 用 `WaitForSeconds` 等引用类型替代手写数值\n- 热路径中避免每帧 `yield return 0`\n\n### 4. Unity 的 Instantiate 方法\n\n```csharp\nObject.Instantiate(prefab);            // 不装箱\nObject.Instantiate(prefab, pos, rot);  // pos/rot 是 Vector3/Quaternion 结构体\n```\n\n`Instantiate` 有多个重载，其中涉及 `object` 参数或泛型版本时，把 `Vector3`、`Quaternion` 等结构体传入可能触发装箱。热路径（如子弹、粒子频繁生成）要留意：\n\n- 优先用参数类型明确的重载\n- 避免把结构体传给 `object` 参数\n- 对象池替代频繁 `Instantiate` / `Destroy`\n\n### 5. 其他高频隐式装箱场景\n\n- 将值类型赋给 `object` 变量、`object[]` 数组\n- 值类型作为非泛型集合的元素：`ArrayList.Add(1)`、`Hashtable[key] = 1`\n- `string.Format(\"{0}\", 1)`、早期版本的字符串插值 `$\"{1}\"`\n- 值类型实现接口后赋给接口引用：`IComparable c = 42;`\n- `Enum` 相关操作（`Enum.HasFlag` 等）\n\n---\n\n## 六、避免装箱的方式\n\n- 使用泛型集合 `List<T>`、`Dictionary<K,V>` 替代 `ArrayList`、`Hashtable`\n- 使用泛型方法 / 泛型约束\n- 热路径中避免 `yield return 值类型`\n- 使用 `Span<T>`、`ref struct` 等零分配手段（进阶）\n- 值类型重写 `ToString` / `Equals` / `GetHashCode`，避免走 `object` 实现\n- 用 `i.ToString()` 替代 `$\"{i}\"`（部分版本仍装箱）\n\n---\n\n## 七、特例：string\n\n`string` 是引用类型，但具有**不可变性**（immutable），且 `==` 比较的是内容而非引用，表现得有点像值类型。这是特例，不要被误导。",
      "link": ""
    },
    {
      "id": "l-mu0q77xtkuvfd",
      "title": "Unity UGUI合批机制",
      "date": "2026-09-14",
      "tags": [
        "UGUI"
      ],
      "summary": "梳理 UGUI 合批的核心流程：Depth 决定渲染顺序，但最终能否合批取决于排序后材质与纹理是否相邻。纠正“同 Depth 才能合批”的常见误区，并总结实际开发中统一图集、控制 Hierarchy 顺序等优化要点。",
      "content": "## 一、UGUI 合批的基本流程\n\nUGUI 的合批并不是简单地把相同 Depth 的元素分到一组，而是分两步走：\n\n1. **计算 Depth**：Unity 根据 Hierarchy 顺序和网格重叠关系，为每个 UI 元素计算出一个 Depth 值，用于确定全局的渲染先后顺序（谁盖住谁）。\n2. **全局排序**：将所有元素按以下优先级排序：\n   - Depth（从小到大）\n   - Material ID\n   - Texture ID\n   - Renderer Order（Hierarchy 中的顺序）\n3. **相邻检查**：排序完成后，从头到尾遍历列表，只要相邻两个元素的材质和纹理相同，就合并成一个批次。\n\n## 二、关键误区：Depth 不同也能合批\n\n很多人误以为“Depth 不同就不能合批”，其实不然。合批的检查只关注**材质和纹理是否相同**，并不检查 Depth 是否相等。\n\n举个例子：\n- A: Depth=1, 材质M1, 纹理T1\n- C: Depth=2, 材质M1, 纹理T1\n- B: Depth=3, 材质M2, 纹理T2\n\n排序后为 A, C, B。检查 A 和 C 时，材质纹理相同，直接合批。虽然 A 和 C 的 Depth 不同，但它们依然在同一个 Draw Call 里。\n\n**结论**：Depth 只负责把元素按顺序摆好，最终哪些能一起画，由排序后的邻接关系决定。\n\n## 三、实际开发中的优化建议\n\n与其纠结 Depth，不如关注以下几点：\n\n1. **统一图集**：尽量把所有 UI 图片打进同一个 Sprite Atlas，材质和纹理统一后合批概率大幅提升。\n2. **减少材质种类**：避免混用不同 Shader 或 Material，Text 和 Image 默认材质不同，交替出现会不断打断合批。\n3. **注意 Hierarchy 顺序**：同图集的元素尽量连续排列，避免中间插入不同图集的元素。\n4. **合理拆分 Canvas**：把频繁变化的 UI（血条、倒计时）和静态 UI 分到不同 Canvas 或 Sub-Canvas，优先避免 Canvas 重建带来的性能开销。\n5. **不要为了合批牺牲层级**：遮挡关系优先，该不同的 Depth 就让它不同，只要材质纹理统一，很多时候依然能合批。\n\n## 四、一句话总结\n\n**合批的目标不是“同 Depth”，而是让材质和纹理相同的元素在最终排序列表里尽量连续相邻。** Depth 只是影响排序的一个因素，图集统一和 Hierarchy 顺序往往更可控、更值得优化。",
      "link": ""
    }
  ],
  "works": []
};
