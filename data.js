/* ============================================================
   作品集内容数据  data.js
   由网页编辑器导出 · 2026/9/15 17:02:04
   ============================================================ */
window.PORTFOLIO_DATA = {
  "site": {
    "title": "你的名字 · Unity 客户端开发作品集",
    "footerNote": "用 Unity 与 C# 把想法做成能跑起来的东西。",
    "startYear": 2022,
    "build": "2026-09-15 17:02:04"
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
        "垃圾回收"
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
