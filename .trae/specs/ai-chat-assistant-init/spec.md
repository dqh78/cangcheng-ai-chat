# AI 多模态智能对话助手 Spec

## Why
打造一套高颜值、商业化、完整可上线的 AI 多模态智能对话助手全栈项目，面向简历加分与面试拔高，涵盖文字对话、流式输出、多模态识别、会话管理、代码专项能力等核心功能，采用 Next.js latest stable + TypeScript 全栈架构，代码规范、工程化完整。

## What Changes
- 从零搭建 Next.js latest stable App Router + TypeScript 项目骨架
- 集成 Tailwind CSS 精致现代 UI 设计体系，仿主流 AI 聊天产品质感
- 引入 Zustand 状态管理，管理会话、主题、消息等全局状态
- 实现 Next.js Route API 服务端代理大模型接口，隐藏 API 密钥
- 实现 SSE Streaming 流式打字机输出效果
- 实现多模态能力：图片上传、压缩、解析、识图问答
- 实现会话管理：新建/删除/切换会话、历史会话列表、本地持久化
- 实现代码专项能力：代码解释、纠错、前端/React/TS 代码优化
- 实现全局功能：暗黑/浅色主题切换、骨架屏、错误兜底、请求容错
- 实现全端响应式适配 PC + 移动端

## Impact
- Affected specs: 无（新项目初始化）
- Affected code: 整个项目从零搭建

## ADDED Requirements

### Requirement: 项目初始化与工程化基础
系统 SHALL 基于 Next.js latest stable + App Router + TypeScript 搭建全栈项目骨架，包含规范的目录结构、ESLint/Prettier 配置、路径别名等工程化基础设施。

#### Scenario: 项目骨架搭建成功
- **WHEN** 开发者执行项目初始化
- **THEN** 项目目录结构符合规范，包含 app/、components/、lib/、store/、types/ 等模块化目录
- **AND** TypeScript 严格模式开启，路径别名 @/ 配置可用

### Requirement: AI 文字对话与流式输出
系统 SHALL 支持多轮 AI 文字对话，具备上下文记忆能力，并通过 SSE (Server-Sent Events) 实现流式打字机输出效果。

#### Scenario: 用户发送文字消息
- **WHEN** 用户在输入框输入文字并发送
- **THEN** 消息出现在对话区域，AI 以流式方式逐字输出回复
- **AND** 对话上下文在多轮交互中保持连贯

#### Scenario: 流式输出中断处理
- **WHEN** 流式输出过程中发生网络异常
- **THEN** 系统显示已接收的部分内容，并提供重试选项

### Requirement: 多模态图片能力
系统 SHALL 支持用户上传图片，服务端进行压缩与格式校验，转发至大模型进行图片解析与识图问答。

#### Scenario: 用户上传图片并提问
- **WHEN** 用户上传一张图片并附带文字问题
- **THEN** 图片在上传前经过客户端压缩预览，服务端二次校验
- **AND** AI 基于图片内容返回解析结果

#### Scenario: 上传非法文件
- **WHEN** 用户尝试上传非图片格式文件或超大文件
- **THEN** 系统拒绝上传并给出友好提示

### Requirement: 会话管理
系统 SHALL 提供完整的会话生命周期管理，包括新建对话、删除对话、历史会话列表，并通过 localStorage 实现本地持久化。

#### Scenario: 新建对话
- **WHEN** 用户点击新建对话按钮
- **THEN** 创建空白会话，切换至新会话，历史会话保留在侧边栏

#### Scenario: 删除对话
- **WHEN** 用户删除某个历史会话
- **THEN** 该会话及其所有消息从列表和本地存储中移除

#### Scenario: 刷新页面恢复会话
- **WHEN** 用户刷新页面
- **THEN** 历史会话列表和当前会话状态从 localStorage 恢复

### Requirement: 代码专项能力
系统 SHALL 针对代码场景提供专项能力入口，包括代码解释、代码纠错、前端/React/TS 代码优化。

#### Scenario: 用户请求代码解释
- **WHEN** 用户粘贴代码并选择"代码解释"模式
- **THEN** 系统在 Prompt 中注入代码解释的系统指令，AI 返回结构化代码解释

#### Scenario: 用户请求代码优化
- **WHEN** 用户粘贴前端代码并请求优化
- **THEN** AI 返回优化后的代码及优化说明

### Requirement: 全局 UI 功能
系统 SHALL 提供暗黑/浅色主题切换、加载骨架屏、错误兜底界面、请求容错与重试机制。

#### Scenario: 主题切换
- **WHEN** 用户点击主题切换按钮
- **THEN** 全局 UI 在暗黑模式和浅色模式之间切换，主题偏好持久化至 localStorage
- **AND** 切换过程平滑无闪烁

#### Scenario: 数据加载中
- **WHEN** 页面或组件处于数据加载状态
- **THEN** 显示骨架屏或加载动画，而非空白区域

#### Scenario: 请求异常
- **WHEN** API 请求超时或返回错误
- **THEN** 显示友好的错误提示，提供重试按钮

### Requirement: 全端响应式适配
系统 SHALL 完美适配 PC 端和移动端，在不同屏幕尺寸下提供一致且良好的用户体验。

#### Scenario: 移动端访问
- **WHEN** 用户在手机浏览器打开应用
- **THEN** 侧边栏默认收起，可通过汉堡菜单展开
- **AND** 对话区域和输入框适配小屏幕尺寸

### Requirement: 后端安全代理
系统 SHALL 通过 Next.js Route API 代理所有大模型 API 请求，API 密钥仅存储在服务端环境变量中，前端不透传任何敏感信息。

#### Scenario: 前端发起 AI 对话请求
- **WHEN** 前端调用聊天 API
- **THEN** 请求发送至 Next.js Route Handler，由服务端附加 API 密钥后转发至大模型
- **AND** 前端请求中不包含任何密钥信息

### Requirement: 请求层封装
系统 SHALL 统一封装请求拦截、超时处理、异常捕获、防重复请求等能力。

#### Scenario: 请求超时
- **WHEN** API 请求超过设定超时时间
- **THEN** 请求自动终止，显示超时提示，支持重试

#### Scenario: 防重复提交
- **WHEN** 用户在请求进行中再次点击发送
- **THEN** 系统忽略重复请求，避免并发冲突