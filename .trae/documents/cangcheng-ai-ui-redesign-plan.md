# 苍城AI 高端智能对话系统 UI 重设计计划

## 一、项目现状分析

### 1.1 技术栈
| 技术 | 版本/方案 |
|------|-----------|
| 框架 | Next.js 16.2.6 (App Router) |
| React | 19.2.4 |
| 样式 | Tailwind CSS v4 + `@tailwindcss/postcss` + CSS Variables |
| 状态管理 | Zustand 5.x |
| 字体 | Geist Sans / Geist Mono（需替换） |
| 图标 | 内联 SVG + emoji（需替换为 Lucide） |
| 暗黑模式 | class 策略，`themeStore` + `ThemeScript` 防 FOUC |

### 1.2 当前设计令牌（位于 `app/globals.css`）
- 主色调：蓝紫 #6366f1（需替换为暖橙 #d97757）
- 背景：白/ slate-900（需替换为 #faf9f5 / #141413）
- 圆角：0.375-1.5rem 分散（需统一 12-16px）
- 阴影：当前偏重（需极淡阴影）
- 侧边栏：72（288px）接近目标 280px

### 1.3 需要修改的文件清单
| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `app/globals.css` | 重写设计令牌 | 色彩、字体、圆角、阴影、动画 |
| `app/layout.tsx` | 新增字体加载 | Google Fonts Poppins + Lora |
| `components/layout/Sidebar.tsx` | 样式重构 | 280px、16px 圆角、Lucide 图标 |
| `components/chat/ChatArea.tsx` | 样式重构 | 欢迎页、消息气泡、加载动画 |
| `components/chat/ChatInput.tsx` | 样式重构 | 16px 圆角、微阴影、Lucide 图标 |
| `components/chat/MarkdownRenderer.tsx` | 样式微调 | 匹配新主题色 |
| `package.json` | 新增依赖 | lucide-react |

---

## 二、设计令牌变更（`app/globals.css`）

### 2.1 色彩系统
```css
/* 主色调 - 暖橙 */
--color-primary: #d97757;
--color-primary-light: #e3a088;
--color-primary-dark: #c06845;
--color-primary-50 ~ 900: 基于 #d97757 的色阶

/* 辅助色 */
--color-accent-blue: #6a9bcc;    /* 静谧蓝 */
--color-accent-green: #788c5d;   /* 自然绿 */

/* 背景色 */
--color-surface: #faf9f5;           /* 浅色 */
--color-surface-secondary: #f3f1eb;
--color-surface-tertiary: #ebe8e0;

/* 暗黑模式背景 */
.dark {
  --color-surface: #141413;
  --color-surface-secondary: #1e1d1c;
  --color-surface-tertiary: #2a2927;
}

/* 文字色 */
--color-text-primary: #0f172a;
--color-text-secondary: #64748b;
--color-text-tertiary: #94a3b8;

/* 边框 */
--color-border: rgba(0,0,0,0.06);
--color-border-light: rgba(0,0,0,0.04);

/* 消息气泡 */
--color-bubble-user: #d97757;
--color-bubble-user-text: #ffffff;
--color-bubble-ai: #f3f1eb;
--color-bubble-ai-text: #0f172a;
```

### 2.2 字体系统
```css
--font-heading: 'Poppins', Arial, sans-serif;
--font-body: 'Lora', Georgia, serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 2.3 圆角与阴影
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;

--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg: 0 4px 12px rgba(0,0,0,0.08);
```

### 2.4 暗黑模式覆写
边框在暗黑模式下使用 `rgba(255,255,255,0.06)`，阴影加深。

---

## 三、各组件具体变更

### 3.1 `app/layout.tsx` — 新增 Google Fonts
- 在 `<head>` 中添加 Poppins 和 Lora 的 Google Fonts 链接
- 更新 `<body>` 默认字体为 `font-body`

### 3.2 `components/layout/Sidebar.tsx` — 侧边栏重构
**变更点：**
- 宽度：`w-72` (288px) → `w-[280px]`
- 整体容器添加 `rounded-2xl`（16px 圆角）和 `m-3`
- 品牌 Logo：将 `🏯 苍城 AI` 替换为精致文字 Logo + Lucide `Sparkles` 图标
- 新建对话按钮：添加微阴影，使用 `Plus` 图标
- 会话列表项：添加 12px 圆角，优化 hover 状态过渡
- 底部主题切换：使用 Lucide `Sun`/`Moon` 图标
- 删除按钮：使用 Lucide `Trash2` 图标
- 整体动画：添加滑入/滑出 transition

### 3.3 `components/chat/ChatArea.tsx` — 聊天区域重构
**欢迎页（空状态）变更：**
- 大面积留白，居中布局
- 品牌 Logo：更大的图标容器，使用品牌橙色
- Slogan：「苍城 AI」+ 「你的智能对话伙伴」
- 功能入口卡片：4 个卡片使用 Lucide 图标替代 emoji
  - `MessageSquare` → 智能对话
  - `Image` → 图片识别
  - `Code2` → 代码专项
  - `Palette` → 主题切换
- 卡片悬停：轻微上移 + 边框高亮

**消息气泡变更：**
- 用户消息：`rounded-2xl rounded-br-md`，暖橙背景，白色文字
- AI 消息：`rounded-2xl rounded-bl-md`，极淡背景 `bg-surface-secondary`，精致边框 `border border-border`
- AI 标识：小巧圆形头像 + 「苍城 AI」文字
- 流式输出光标：使用主题色，保持 blink 动画

**加载动画变更：**
- 三个点依次跳动（bounce 动画，依次延迟 0s / 0.15s / 0.3s）
- 使用主题色小圆点

### 3.4 `components/chat/ChatInput.tsx` — 输入框重构
**变更点：**
- 整体容器：`rounded-2xl`（16px），`shadow-sm`
- 代码快捷按钮：移除 emoji，使用 Lucide 图标
  - `Search` → 代码解释
  - `Bug` → 代码纠错
  - `Zap` → 代码优化
  - `FileCode` → 写代码
- 上传按钮：使用 Lucide `Paperclip` 或 `ImagePlus`
- 发送按钮：使用 Lucide `Send` / `ArrowUp`
- focus 状态边框高亮为品牌色

### 3.5 `components/chat/MarkdownRenderer.tsx` — 代码渲染微调
- 行内代码背景色匹配新主题
- 代码块工具栏颜色适配

### 3.6 `package.json` — 新增依赖
- 添加 `lucide-react` 依赖

---

## 四、动画效果细则

| 场景 | 动画 | 实现方式 |
|------|------|----------|
| 消息发送 | fade-in + translateY(4px→0) | 已有 `animate-fade-in`，保持 |
| 按钮悬停 | scale(1.02) + 颜色过渡 | `hover:scale-[1.02] transition-all` |
| 主题切换 | 颜色平滑过渡 | `transition-colors duration-300` 在全局 |
| 侧边栏 | 滑入/滑出 | 已有 translate-x 动画，保持 |
| 流式输出 | 闪烁光标 | 已有 `animate-blink-cursor`，保持 |
| 加载状态 | 三点依次弹跳 | 已有 bounce，保持 |

---

## 五、实现步骤

### Step 1：安装依赖
- 安装 `lucide-react`

### Step 2：重写全局样式
- 修改 `app/globals.css`：替换全部设计令牌，更新暗黑模式变量

### Step 3：更新字体加载
- 修改 `app/layout.tsx`：加载 Poppins + Lora Google Fonts

### Step 4：重构侧边栏
- 修改 `components/layout/Sidebar.tsx`：新样式、Lucide 图标、宽度/圆角

### Step 5：重构聊天区域
- 修改 `components/chat/ChatArea.tsx`：欢迎页、消息气泡、加载状态

### Step 6：重构输入框
- 修改 `components/chat/ChatInput.tsx`：输入框样式、Lucide 图标

### Step 7：微调代码渲染
- 修改 `components/chat/MarkdownRenderer.tsx`：颜色适配

### Step 8：验证
- 启动 dev server，测试浅色/暗黑模式切换
- 检查响应式布局
- 验证所有动画效果

---

## 六、不做的事项
- 不修改后端 API、数据库相关代码
- 不修改认证系统
- 不修改 store 状态管理逻辑
- 不修改 app/page.tsx 核心结构（仅极微调）
- 不修改 types 定义