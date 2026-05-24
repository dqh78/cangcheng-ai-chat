# UI Redesign Plan: 苍城 AI — Premium Modern Chat Interface

## Summary

将现有的暖橙复古风 UI 彻底重写为一套高端现代科技风格（参考 Linear、Vercel、ChatGPT Plus），采用玻璃态/微渐变背景、大留白、Inter 无衬线字体、柔和气泡差异化设计、悬浮输入框、细腻微交互动画。

---

## 1. Current State Analysis

### Tech Stack (unchanged)
| 项目 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 (`@theme` + `@utility`) |
| 状态管理 | Zustand (4 stores: chatStore, conversationStore, uiStore, themeStore) |
| 图标 | lucide-react (v1.16, 已安装) |
| 字体 | Poppins + Lora via `next/font/google` (自托管) |
| Markdown | react-markdown + react-syntax-highlighter |

### Existing Files to Modify
| 文件 | 改动范围 |
|------|----------|
| `app/globals.css` | 设计令牌全面重写、新动画关键帧、新 utility |
| `app/layout.tsx` | 字体从 Poppins+Lora 换为 Inter |
| `app/page.tsx` | 微调布局结构，新增侧边栏折叠按钮 |
| `components/layout/Sidebar.tsx` | 重写为玻璃态可折叠侧边栏 |
| `components/chat/ChatArea.tsx` | 重写欢迎页 + 消息气泡样式 |
| `components/chat/ChatInput.tsx` | 重写为底部悬浮输入框 |
| `components/chat/MarkdownRenderer.tsx` | 适配新主题色系 |
| `components/common/ErrorBoundary.tsx` | 适配新设计语言 |
| `components/common/Skeleton.tsx` | 适配新设计语言 |
| `store/uiStore.ts` | 新增 `sidebarCollapsed` 桌面端折叠状态 |
| `types/index.ts` | 无需改动 |

### Files NOT to Modify (keep as-is)
- `store/chatStore.ts` — 逻辑稳定
- `store/conversationStore.ts` — 逻辑稳定
- `store/themeStore.ts` — 逻辑稳定
- `hooks/useChat.ts`, `hooks/useImageUpload.ts` — 逻辑稳定
- `lib/conversation-service.ts`, `lib/auth.ts` — 后端交互
- `components/layout/ClientLayout.tsx` — 包装逻辑不变
- `components/layout/ThemeScript.tsx` — FOUC 防护逻辑不变

---

## 2. Proposed Changes

### Step 1: Design Tokens Overhaul (`app/globals.css`)

**What**: 彻底重写 `@theme` 块中的设计令牌和 CSS 自定义属性。

**Why**: 当前暖橙/复古色系不符合"高端科技感"定位，需替换为更现代、冷静、有质感的色彩体系。

**Changes**:
- **字体**: 移除 Poppins + Lora，改用 Inter（系统无衬线字体优先）
- **主色调**: 暖橙 `#d97757` → 科技蓝紫渐变系，主色 `#5B5EF7`（靛蓝紫），辅色 `#8B5CF6`、`#06B6D4`
- **背景色**: 米黄 `#faf9f5` → 冷灰白 `#FAFBFC` + 微渐变，深色模式 `#0A0A0B` → `#111113`
- **新增设计令牌**:
  - `--color-glass-bg` / `--color-glass-border` — 玻璃态背景/边框
  - `--color-glow-primary` — 辉光色（focus 边框用）
  - `--color-input-surface` — 悬浮输入框背景
  - `--color-bubble-user-gradient` / `--color-bubble-ai-gradient` — 气泡渐变
  - `--radius-bubble-user` / `--radius-bubble-ai` — 差异化气泡圆角
  - `--shadow-glow` — 辉光阴影
  - `--font-sans` → Inter, system-ui, sans-serif
- **暗黑模式**: 对应覆写所有新令牌
- **新增动画**:
  - `@keyframes fade-in-up` 保留但微调到 0.3s
  - `@keyframes slide-in-right` — 侧边栏切换
  - `@keyframes pulse-glow` — 输入框聚焦辉光脉冲
  - `@keyframes message-enter` — 消息淡入 + 上滑 (已存在但时间调整为 0.25s)
- **删除**: 暖橙色系全部令牌 (--color-primary-50 ~ --color-primary-900, accent-blue/green 等)
- **新增 utility**: `.animate-message-enter`, `.animate-slide-in`

### Step 2: Font Update (`app/layout.tsx`)

**What**: 字体替换 + metadata 调整。

**Changes**:
- `next/font/google` import Poppins+Lora → 直接 `import { Inter } from "next/font/google"`
- Inter 配置: `subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap"`
- `body` className `font-body` → `font-sans`
- 删除 `--font-heading` / `--font-body` CSS 变量赋值的 class
- metadata title/description 微调

### Step 3: ChatArea Redesign (`components/chat/ChatArea.tsx`)

**What**: 重写欢迎页 + 消息气泡 + 加载状态。

**Changes**:

**空状态欢迎页**:
- 删掉 4 个功能卡片网格
- 改为极简居中布局：大 Logo + Slogan + 一行功能标签（pill 形式）
- 背景使用微渐变或动态色块装饰

**消息气泡**:
- 用户气泡：
  - 背景: 主色渐变 `linear-gradient(135deg, #5B5EF7, #8B5CF6)`
  - 文字: 白色
  - 圆角: `rounded-2xl rounded-br-md`（右上16px，右下4px）
  - 右侧对齐，加微妙阴影
- AI 气泡:
  - 背景: `bg-glass`（半透明玻璃态）或 `#F4F5F7`
  - 文字: `text-text-primary`
  - 圆角: `rounded-2xl rounded-bl-md`
  - 左侧对齐，无阴影
  - 标题栏保留苍城 AI 图标但样式更简洁
- 呼吸空间: `space-y-6` 改为 `space-y-8`（更宽松的间距）
- 行距优化: 消息体 `leading-relaxed` (1.625)

**加载/思考状态**:
- 保留现有三点跳动动画（`dot-bounce`），但重新设计容器外观
- 加载骨架入口：不在 `isLoading && !messages[messages.length-1]?.content` 的条件下显示骨架，而是在 `isLoading` 时始终在底部显示优雅的"思考中"状态

**流式光标**:
- 保留 `animate-blink-cursor`，颜色改为 `bg-accent`

### Step 4: ChatInput Redesign (`components/chat/ChatInput.tsx`)

**What**: 重写为底部悬浮式输入框，玻璃态背景 + 辉光边框。

**Changes**:

**容器**:
- 移除 `border-t` 顶部分割线
- 输入区域容器改为悬浮卡片样式：`bg-glass backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-2xl shadow-lg`
- `max-w-[768px]` 保持，`px-4 py-3` 保持

**输入框**:
- 聚焦时: `focus-within:border-[rgba(91,94,247,0.5)] focus-within:shadow-[0_0_20px_rgba(91,94,247,0.15)]` 辉光效果
- 过渡: `transition-all duration-200 ease-out`
- `bg-surface-secondary` 换为半透明 `bg-white/60 dark:bg-white/5`

**发送按钮**:
- 改为渐变背景: `bg-gradient-to-r from-[#5B5EF7] to-[#8B5CF6]`
- 圆角: `rounded-xl`
- 禁用态: `opacity-30` → `opacity-40 grayscale`
- Hover: 亮度提升 + 阴影增强
- Active: `scale-95`

**快捷键标签**:
- 从 `bg-surface-secondary` 改为玻璃态 `bg-white/50 dark:bg-white/5`
- 删除 `Search, Bug, Zap, FileCode` 的代码专项快捷栏，改为通用提示标签 `💡 支持图片识别 · 多轮对话 · 代码优化`

**图标**:
- 发送图标 `ArrowUp` → `Send` (lucide-react)
- 图片上传 `ImagePlus` → `Paperclip` 或 `Image`
- 停止按钮改为更美观的圆形停止图标 `Square`

**删除**: `codeShortcuts` 数组及相关渲染

### Step 5: Sidebar Redesign (`components/layout/Sidebar.tsx`)

**What**: 重写为玻璃态可折叠侧边栏，更精致的高亮和交互。

**Changes**:

**整体容器**:
- 背景: `bg-glass backdrop-blur-xl`（玻璃态）
- 宽度: `w-[280px]` → `w-[300px]`（稍宽以提升阅读舒适度）
- 边框: `border-r border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]`
- 折叠动画: 桌面端左侧滑入滑出，移动端保持现有 overlay 模式

**头部区域**:
- Logo 图标放大，使用渐变背景 `bg-gradient-to-br from-[#5B5EF7] to-[#8B5CF6]`
- "苍城 AI" 文字加大到 `text-xl font-bold`
- 新建对话按钮: 改为 outline 风格 + 渐变文字边框，或保持实心渐变按钮
  - `border border-[rgba(91,94,247,0.3)] bg-white/50 hover:bg-[#5B5EF7] hover:text-white` 带过渡

**会话列表**:
- 圆角: `rounded-xl` → `rounded-2xl`
- 活跃态: `bg-[rgba(91,94,247,0.08)]` + 左侧指示条（竖线）
- Hover: `bg-[rgba(91,94,247,0.04)]`
- 删除确认: 适配新的玻璃态

**底部区域**:
- 主题切换: 改为 toggle switch 而非纯文字按钮
- 用户头像: 保持逻辑，圆角加大，适配新主色

**折叠按钮**:
- 在侧边栏与主内容区交界处新增一个圆形折叠/展开按钮（`PanelLeftClose`/`PanelLeftOpen` 图标）
- 状态存储: `uiStore.sidebarCollapsed` (新增字段)

### Step 6: UI Store Update (`store/uiStore.ts`)

**What**: 新增 `sidebarCollapsed` 桌面端折叠状态。

**Changes**:
- 新增字段: `sidebarCollapsed: boolean`
- 新增方法: `toggleDesktopSidebar()`, `setDesktopSidebarOpen(open: boolean)`
- 默认值: `false`（展开）

### Step 7: Minor Components Update

**MarkdownRenderer** (`components/chat/MarkdownRenderer.tsx`):
- 代码块: 顶部工具栏颜色适配新主色
- 行内代码: 颜色 `text-primary` → `text-accent`
- 链接: 下划线颜色适配

**ErrorBoundary** (`components/common/ErrorBoundary.tsx`):
- 图标从 emoji → lucide 图标
- 按钮颜色适配新主色渐变

**Skeleton** (`components/common/Skeleton.tsx`):
- 骨架颜色适配新 `bg-surface-tertiary`

### Step 8: Page Layout Update (`app/page.tsx`)

**What**: 集成侧边栏折叠功能。

**Changes**:
- 在 `main` 元素左侧新增折叠按钮（当侧边栏折叠时显示）
- 使用 `useUIStore` 的 `sidebarCollapsed` 控制 Sidebar 的显示/隐藏

---

## 3. Design Token Reference (New)

```
主色:     #5B5EF7 (靛蓝紫)
辅色1:   #8B5CF6 (紫罗兰)
辅色2:   #06B6D4 (青蓝)
背景:     #FAFBFC (浅色) / #0C0C0E (深色)
文字主:   #111113 (浅色) / #EDEDEF (深色)
文字辅:   #6B6F76 (浅色) / #9B9DA1 (深色)
玻璃背景: rgba(255,255,255,0.60) / rgba(255,255,255,0.04)
玻璃边框: rgba(0,0,0,0.06) / rgba(255,255,255,0.08)
辉光色:   rgba(91,94,247,0.40)
成功:     #22C55E
错误:     #EF4444
```

---

## 4. Assumptions & Decisions

1. **不引入新依赖**: lucide-react 已安装，使用其图标。不安装 framer-motion 或任何动画库，纯 CSS/Tailwind 动画。
2. **保留现有状态管理层**: Zustand stores 结构和 API 交互逻辑不变。
3. **保持 Next.js App Router 架构**: 不改变路由或目录结构。
4. **字体**: Inter 通过 `next/font/google` 自托管加载（与现有 Poppins 一样的方式，解决国内 CDN 被墙问题）。
5. **不创建新文件**: 仅在现有文件中修改，保持代码库整洁。
6. **暗黑模式完整支持**: 所有新设计令牌都提供 `html.dark` 覆写。
7. **保留现有功能**: 图片上传、代码高亮、流式输出、错误重试等功能全部保留。

---

## 5. Verification Steps

1. `npm run dev` 启动开发服务器，确认无编译错误
2. 检查浅色/暗黑模式切换，确认所有组件完美适配
3. 测试以下交互：
   - 新建对话 → 输入消息 → AI 流式回复 → 打字点动画
   - 上传图片 → 图片预览 → 发送并接收回复
   - Shift+Enter 换行 → Enter 发送
   - 侧边栏折叠/展开 → 桌面端和移动端
   - 侧边栏会话项 hover/active/删除确认
   - 输入框聚焦辉光 → 发送按钮渐变 → 停止按钮
4. `npm run lint` 确认无 lint 错误
5. 视觉检查：所有过渡 0.2s ease，无卡顿，消息入场动画自然