# Tasks

## 阶段一：项目初始化与基础布局

- [ ] Task 1: 初始化 Next.js latest stable 项目并安装所有依赖
  - [ ] 使用 create-next-app 创建 Next.js latest stable + TypeScript 项目
  - [ ] 安装核心依赖：tailwindcss、zustand、react-markdown、react-syntax-highlighter、uuid
  - [ ] 安装开发依赖：@types/node、@types/uuid、eslint-config-prettier
  - [ ] 配置 tsconfig.json 路径别名 @/
  - [ ] 配置 next.config.ts（图片域名白名单等）
  - [ ] 配置 .env.local 示例文件

- [ ] Task 2: 搭建项目目录结构与 Tailwind 主题系统
  - [ ] 创建完整目录结构：app/、components/、lib/、store/、types/、hooks/
  - [ ] 配置 tailwind.config.ts：自定义颜色、暗黑模式 class 策略、动画
  - [ ] 创建 globals.css：CSS 变量定义主题色、基础样式重置、滚动条美化
  - [ ] 创建全局类型定义文件 types/index.ts

- [ ] Task 3: 实现 Zustand 状态管理 Store
  - [ ] 创建 chatStore：管理消息列表、发送消息、流式追加、加载状态
  - [ ] 创建 conversationStore：管理会话列表、当前会话、CRUD 操作、localStorage 持久化
  - [ ] 创建 themeStore：管理暗黑/浅色主题切换、localStorage 持久化
  - [ ] 创建 uiStore：管理侧边栏展开/收起、全局 loading、错误状态

- [ ] Task 4: 实现基础 UI 布局与响应式骨架
  - [ ] 创建 RootLayout：HTML 结构、主题 class 绑定、全局 Provider
  - [ ] 创建侧边栏 Sidebar 组件：会话列表、新建对话按钮、主题切换、用户区域
  - [ ] 创建主聊天区域 ChatArea 组件：消息列表 + 输入框区域骨架
  - [ ] 创建底部输入区 ChatInput 组件：文本输入框 + 发送按钮骨架
  - [ ] 实现移动端响应式：侧边栏抽屉式展开、汉堡菜单按钮

## 阶段二：AI 对话核心与流式输出

- [ ] Task 5: 实现服务端 API 代理与流式聊天接口
  - [ ] 创建 app/api/chat/route.ts：POST 接口，接收消息列表，服务端附加密钥调用大模型
  - [ ] 实现 SSE Streaming：使用 ReadableStream 逐块返回大模型响应
  - [ ] 封装 lib/ai-client.ts：大模型 API 调用封装，支持 OpenAI 兼容接口
  - [ ] 封装 lib/api-utils.ts：统一错误处理、超时控制、请求日志

- [ ] Task 6: 实现前端流式聊天功能
  - [ ] 创建 hooks/useChat.ts：封装发送消息、读取流式响应、中止请求逻辑
  - [ ] 完善 ChatInput 组件：回车发送、Shift+Enter 换行、自动高度、发送禁用态
  - [ ] 实现 MessageList 消息列表组件：用户消息/AI 消息气泡、流式文字动画
  - [ ] 实现 MarkdownRenderer 组件：react-markdown 渲染、代码高亮、复制按钮
  - [ ] 实现消息上下文记忆：多轮对话带上历史消息

## 阶段三：会话管理

- [ ] Task 7: 实现完整会话管理功能
  - [ ] 完善 Sidebar 会话列表：按时间排序、当前会话高亮、删除确认
  - [ ] 实现新建对话：自动切换、默认标题（取首条消息摘要）
  - [ ] 实现删除对话：二次确认弹窗、自动切换到相邻会话
  - [ ] 实现会话切换：切换时恢复历史消息
  - [ ] 实现 localStorage 持久化中间件：自动保存/恢复会话和消息

## 阶段四：多模态图片能力

- [ ] Task 8: 实现图片上传与多模态对话
  - [ ] 创建 ImageUpload 组件：拖拽上传、点击上传、图片预览、删除图片
  - [ ] 实现客户端图片压缩：lib/image-compress.ts，限制尺寸和质量
  - [ ] 实现服务端图片上传接口：app/api/upload/route.ts，格式校验与存储
  - [ ] 修改聊天接口支持多模态：图片 base64 或 URL 传入大模型 vision API
  - [ ] 实现识图问答流程：上传图片 → 输入问题 → AI 解析图片内容并回答

## 阶段五：代码专项能力

- [ ] Task 9: 实现代码专项功能入口
  - [ ] 创建 CodeToolbar 组件：代码解释/纠错/优化三个快捷按钮
  - [ ] 实现 Prompt 模板系统：lib/prompts.ts，不同模式注入不同系统指令
  - [ ] 修改聊天流程集成代码模式：选中模式后消息携带特殊标记
  - [ ] 优化 MarkdownRenderer 代码块：语法高亮、行号、一键复制、语言标签

## 阶段六：全局功能完善

- [ ] Task 10: 实现全局 UI 增强功能
  - [ ] 实现骨架屏 Skeleton 组件：侧边栏骨架、消息列表骨架
  - [ ] 实现 ErrorBoundary 错误边界组件：全局错误兜底、重试按钮
  - [ ] 实现 Toast 消息提示组件：成功/错误/警告通知
  - [ ] 实现请求容错：超时重试、网络断开提示、请求队列管理
  - [ ] 优化加载状态：AI 思考动画、按钮 loading 态

- [ ] Task 11: 实现暗黑/浅色主题切换
  - [ ] 完善 ThemeToggle 组件：太阳/月亮图标切换动画
  - [ ] 实现主题切换无闪烁：使用 next-themes 或 script 注入避免 FOUC
  - [ ] 适配所有组件的暗黑模式样式

## 阶段七：收尾与优化

- [ ] Task 12: 项目收尾与工程化完善
  - [ ] 代码 Review：清理 console.log、统一注释风格、类型完整性检查
  - [ ] 性能优化：React.memo、useMemo、useCallback 合理使用
  - [ ] 创建 README.md：项目介绍、技术栈、启动方式、功能特性
  - [ ] 最终全流程测试：文字对话、流式输出、图片识别、代码模式、主题切换、响应式

# Task Dependencies

- Task 2 依赖 Task 1（先初始化项目再搭建目录）
- Task 3 依赖 Task 2（类型定义完成后创建 Store）
- Task 4 依赖 Task 3（Store 完成后创建 UI 组件）
- Task 5 依赖 Task 1（项目基础就绪后可并行开发服务端）
- Task 6 依赖 Task 4、Task 5（UI 骨架和服务端 API 就绪后实现聊天）
- Task 7 依赖 Task 3、Task 6（Store + 聊天功能就绪后完善会话管理）
- Task 8 依赖 Task 5、Task 6（API 和聊天功能就绪后添加多模态）
- Task 9 依赖 Task 6（聊天功能就绪后添加代码专项）
- Task 10 依赖 Task 6（聊天功能就绪后完善全局 UI）
- Task 11 依赖 Task 3、Task 4（Store + UI 就绪后完善主题）
- Task 12 依赖所有前序任务