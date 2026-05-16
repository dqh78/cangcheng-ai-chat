/*
 * ============================================
 * chatStore - 聊天消息状态管理
 * 职责：管理当前会话的消息列表、发送消息、流式追加内容、加载状态
 * ============================================
 */

import { create } from "zustand";
import type { Message, MessageRole } from "@/types";

interface ChatState {
  /* 当前会话的消息列表 */
  messages: Message[];
  /* 是否正在等待 AI 回复 */
  isLoading: boolean;
  /* 流式输出中止控制器 */
  abortController: AbortController | null;

  /* 添加一条消息（用户或 AI） */
  addMessage: (role: MessageRole, content: string) => string;
  /* 追加内容到流式消息（打字机效果） */
  appendToLastMessage: (chunk: string) => void;
  /* 设置消息列表（用于切换会话） */
  setMessages: (messages: Message[]) => void;
  /* 标记最后一条消息为流式完成 */
  finishStreaming: () => void;
  /* 标记最后一条消息为错误 */
  markLastMessageError: (errorMessage: string) => void;
  /* 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /* 设置中止控制器 */
  setAbortController: (controller: AbortController | null) => void;
  /* 清空消息 */
  clearMessages: () => void;
}

/* 简易 ID 生成器（客户端用，不需要 uuid） */
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  abortController: null,

  addMessage: (role, content) => {
    const id = generateId();
    const message: Message = {
      id,
      role,
      content,
      timestamp: Date.now(),
      isStreaming: role === "assistant",
    };
    set((state) => ({
      messages: [...state.messages, message],
    }));
    return id;
  },

  appendToLastMessage: (chunk) => {
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        messages[messages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + chunk,
        };
      }
      return { messages };
    });
  },

  setMessages: (messages) => set({ messages }),

  finishStreaming: () => {
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        messages[messages.length - 1] = {
          ...lastMessage,
          isStreaming: false,
        };
      }
      return { messages, isLoading: false };
    });
  },

  markLastMessageError: (errorMessage) => {
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        messages[messages.length - 1] = {
          ...lastMessage,
          isStreaming: false,
          isError: true,
          errorMessage,
          content: lastMessage.content || errorMessage || "请求失败，请重试",
        };
      }
      return { messages, isLoading: false };
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setAbortController: (controller) => set({ abortController: controller }),

  clearMessages: () =>
    set({ messages: [], isLoading: false, abortController: null }),
}));