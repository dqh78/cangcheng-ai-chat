/*
 * ============================================
 * AI 多模态智能对话助手 - 全局类型定义
 * ============================================
 */

/* ==================== 消息相关类型 ==================== */

/* 消息角色：用户 or 助手 or 系统 */
export type MessageRole = "user" | "assistant" | "system";

/* 单条消息内容块 - 支持文本和图片 */
export interface TextContent {
  type: "text";
  text: string;
}

export interface ImageContent {
  type: "image_url";
  image_url: {
    url: string; // 图片 URL 或 base64
    detail?: "low" | "high" | "auto";
  };
}

export type MessageContent = TextContent | ImageContent;

/* 单条消息 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string; // 展示用的纯文本/原始内容
  contents?: MessageContent[]; // 结构化内容（用于 API 调用，支持多模态）
  timestamp: number;
  isStreaming?: boolean; // 是否正在流式输出中
  isError?: boolean; // 是否是错误消息
  errorMessage?: string; // 错误信息
}

/* ==================== 会话相关类型 ==================== */

/* 代码专项模式 */
export type CodeMode = "explain" | "fix" | "optimize" | null;

/* 会话 */
export interface Conversation {
  id: string;
  title: string; // 会话标题
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  codeMode?: CodeMode; // 当前会话的代码模式
}

/* ==================== 主题相关类型 ==================== */

export type Theme = "light" | "dark";

/* ==================== UI 状态相关类型 ==================== */

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // 自动消失时间（ms），默认 3000
}

/* ==================== API 相关类型 ==================== */

/* 聊天请求参数 */
export interface ChatRequest {
  messages: {
    role: MessageRole;
    content: string | MessageContent[];
  }[];
  model?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

/* 聊天响应中的 delta */
export interface ChatDelta {
  role?: string;
  content?: string;
}

/* SSE 数据块 */
export interface ChatStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: ChatDelta;
    finish_reason: string | null;
  }[];
}

/* 上传图片响应 */
export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

/* ==================== 组件 Props 类型 ==================== */

export interface SidebarProps {
  className?: string;
}

export interface ChatInputProps {
  onSend: (content: string, images?: File[]) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  onStop?: () => void;
  codeMode?: CodeMode;
  onCodeModeChange?: (mode: CodeMode) => void;
}

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}