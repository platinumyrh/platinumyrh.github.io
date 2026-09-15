# Unity 客户端个人作品集

纯白 + 克莱因蓝（`#002FA7`）的单页作品集，包含**自我介绍 / 学习记录 / 作品展示**三个板块，并且**所有内容都能在网页里直接增删改**。

无需服务器，无需构建工具，四个文件丢到 GitHub Pages 就能用。

---

## 一、先回答你最关心的问题

> 这是不是需要租个服务器？要不然只能在本地改然后重新上传？

**不需要租服务器。** 你现在的 `github.io` 就是 GitHub Pages 提供的免费静态托管，它没有后端，也不需要有后端。

但「静态托管」确实带来一个矛盾：网页是提前生成好的文件，浏览器里改的东西没法自己写回仓库。所以我给了你**三种持久化方案**，从简单到省事，你可以只用其中一种：

| 方案 | 怎么用 | 适合场景 | 缺点 |
| --- | --- | --- | --- |
| **① 本地草稿** | 在网页里改，自动存进浏览器 localStorage | 自己预览、反复调整 | 只有你这台电脑的浏览器看得到 |
| **② 导出 data.js 覆盖提交** | 改完点「导出 data.js」，用它覆盖仓库里的同名文件，commit | 偶尔更新，最稳妥 | 需要手动去 GitHub 提交一次 |
| **③ GitHub 直连同步** | 在「设置」里填一次仓库和 Token，以后改完点「GitHub 同步」 | 日常更新 | 需要配一次 Token |

**推荐组合**：日常用 ③，网页上改完点一下，GitHub Pages 约 1 分钟后自动重新部署，线上就更新了。完全不用碰命令行，也不用本地改再上传。

> 关于域名：`xxx.github.io` 是 GitHub Pages 的免费默认域名，不需要单独购买。以后想换成自己的域名（比如 `yourname.com`），在仓库 Settings → Pages → Custom domain 里填一下，再去域名服务商加一条 CNAME 记录即可，本网站代码不用改。

---

## 二、文件说明

```
index.html     页面结构
styles.css     全部样式（设计变量集中在文件开头的 :root）
app.js         渲染 + 编辑模式 + 导入导出 + GitHub 同步
data.js        ★ 网站的全部内容都在这里
README.md      本文件
```

**`data.js` 是唯一的内容来源。** 想批量改文字，直接改这个文件最方便；想边看边改，用网页里的编辑模式。

---

## 三、部署到 GitHub Pages

假设仓库名是 `yourname.github.io`（这样域名最干净）。

**方式 A：网页上传（最简单）**

1. 打开你的仓库，点 `Add file` → `Upload files`
2. 把 `index.html`、`styles.css`、`app.js`、`data.js` 四个文件拖进去，commit
3. 仓库 `Settings` → `Pages` → Source 选 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`，保存
4. 等 1~2 分钟，访问 `https://yourname.github.io`

**方式 B：命令行**

```bash
git clone https://github.com/yourname/yourname.github.io.git
cd yourname.github.io
# 把四个文件复制进来
git add .
git commit -m "添加作品集网站"
git push
```

> 如果站点放在子目录（比如 `https://yourname.github.io/portfolio/`），所有相对路径依然是通的，不用改代码。

---

## 四、怎么在网页里编辑

1. 打开网站，点右下角蓝色的 **「编辑」** 按钮
2. 输入编辑密码，默认是 **`admin`**（进去后可在「设置」里改）
3. 进入编辑模式后：
   - 每个学习记录卡片、作品卡片右上角会出现 **编辑 / 删除 / 前移后移** 按钮
   - 各板块会出现 **「＋ 新增」** 按钮
   - 「关于我」区块出现 **「编辑自我介绍」** 按钮
   - 点卡片本身仍可查看详情，弹层底部也能直接跳到编辑
4. 底部工具栏：

| 按钮 | 作用 |
| --- | --- |
| 导出 data.js | 下载最新的 data.js，用它覆盖仓库里的文件后提交 |
| 导出备份 JSON | 纯备份，也可用于导入到别的浏览器 |
| 导入数据 | 读取之前导出的 `.js` 或 `.json`，覆盖当前内容 |
| GitHub 同步 | 直接把当前内容提交到仓库（需先在「设置」里配置） |
| 设置 | 修改编辑密码、配置 GitHub |
| 恢复默认 | 丢弃本地改动，回到 `data.js` 里的内容 |
| 完成 | 退出编辑模式 |

**改动是即时保存的**：每改一处都会写入浏览器本地存储，刷新页面不会丢。但请注意 —— 本地改动**不会自动同步到线上**，需要走上面三种方案之一。

---

## 五、配置 GitHub 直连同步

在「设置」里填：

| 字段 | 填什么 |
| --- | --- |
| GitHub 用户名 | `yourname` |
| 仓库名 | `yourname.github.io` |
| 分支 | `main` |
| data.js 路径 | `data.js`（若在子目录则填 `portfolio/data.js`） |
| Personal Access Token | 见下方 |

### 生成 Token（推荐用细粒度 Token，权限最小）

1. GitHub → 右上头像 → `Settings` → `Developer settings` → `Personal access tokens` → **`Fine-grained tokens`** → `Generate new token`
2. `Repository access` 选 **Only select repositories**，只勾选你这个作品集仓库
3. `Permissions` → `Repository permissions` → 找到 **Contents**，设为 **Read and write**
4. 生成后复制，粘贴到网站的「设置」里保存

> 用经典 Token（Classic）也行，勾选 `repo` 权限，但那个 Token 能访问你所有仓库，不如细粒度的安全。

### 安全提示

Token 保存在**你自己浏览器的 localStorage** 里，只会发送给 `api.github.com`，不会上传到任何第三方。但要注意两点：

- **不要在公用电脑上配置 Token。** 同一台电脑上能打开浏览器开发者工具的人就能读到它。
- **网页上的「编辑密码」只是一道帘子，不是真正的安全措施。** 它是纯前端校验，防的是访客误点看到编辑界面。真正的安全边界是：没有 Token 的人改不了线上内容（改动只存在他自己的浏览器里）。所以 Token 千万别写进 `data.js` 或任何会提交的文件。

如果 Token 泄露了，去 GitHub 撤销并重新生成一个即可，网站里重新填一次就行。

---

## 六、内容格式说明

大部分字段直接写文字即可。少数几个是「一行一条」的结构化字段：

| 字段 | 格式 | 例子 |
| --- | --- | --- |
| 数据亮点 | `数值 \| 说明` | `3+ \| 年 Unity 开发经验` |
| 技能分组 | `分组名: 技能1, 技能2` | `引擎与语言: Unity, C#, Lua` |
| 联系方式 / 相关链接 | `标签 \| 网址` | `GitHub \| https://github.com/xxx` |
| 标签 | 逗号分隔 | `性能优化, C#, Profiler` |
| 亮点清单 | 一行一条 | `支持 Coyote Time` |

### Markdown

正文类字段支持简易 Markdown：

```markdown
## 二级标题
### 三级标题

**粗体**  *斜体*  `行内代码`  ~~删除线~~

- 无序列表
1. 有序列表

> 引用块

| 表头 | 表头 |
| --- | --- |
| 单元格 | 单元格 |

[链接文字](https://example.com)
![图片](https://example.com/a.png)

```csharp
// 代码块
var x = 1;
```
```

### 图片

- 在编辑表单里点「上传图片」，选本地文件即可，会自动压缩（长边 1400px、JPEG 质量 82%）
- 也可以直接粘贴图片网址
- 头像建议正方形，作品封面建议 16:9
- 作品封面留空时会自动用**克莱因蓝底 + 项目名首字**占位，不难看，可以先不配图

> 注意：浏览器本地存储上限约 5MB。如果你上传了很多大图，建议改为把图片放进仓库（比如 `images/` 目录），然后在字段里填相对路径 `images/cover.png`，这样更稳。

---

## 七、常见问题

**Q：改了内容，线上没变？**
A：本地改动不会自动上线。用「导出 data.js」覆盖提交，或点「GitHub 同步」。

**Q：我直接改了 `data.js`，打开 `index.html` 后内容还是旧的？**
A：浏览器里可能保存着网页编辑器生成的草稿（`localStorage`），它会优先于 `data.js`。页面顶部会提示「data.js 已更新或与草稿不一致」，点「加载文件内容」即可看到最新文件；也可以进编辑模式点「恢复默认」。如果没看到提示，可以强制刷新（Ctrl+F5），或在开发者工具里清空 `localStorage['portfolio:data:v1']`。

**Q：点了「GitHub 同步」报 401 / 403？**
A：Token 不对或权限不足。确认 Token 有 `Contents: Read and write`，且仓库名、用户名拼写正确。

**Q：报 404？**
A：仓库名或分支写错了；如果 `data.js` 在子目录，路径要写全，比如 `portfolio/data.js`。404 在首次同步时是正常的（文件还不存在，会自动新建）。

**Q：忘记编辑密码了？**
A：打开浏览器开发者工具 → Application → Local Storage → 删掉 `portfolio:cfg:v1`，密码就恢复成默认的 `admin`。

**Q：想让改动对访客生效，但不想每次都提交？**
A：静态站点做不到。要么接一个后端 / 无头 CMS（成本高），要么接受提交这一步。对个人作品集来说，「网页里改 + 一键同步」已经是最省事的方案了。

**Q：怎么换回自己的域名？**
A：仓库 Settings → Pages → Custom domain 填域名，然后在域名服务商加 CNAME 记录指向 `yourname.github.io`。代码不用动。

---

## 八、本地预览

直接双击 `index.html` 就能打开，所有功能都正常（包括编辑、导出）。

唯一例外是「GitHub 同步」——部分浏览器对 `file://` 协议下的跨域请求限制较严。如果同步失败，用本地起个静态服务即可：

```bash
# Python
python -m http.server 8000

# 或 Node
npx serve .
```

然后访问 `http://localhost:8000`。
