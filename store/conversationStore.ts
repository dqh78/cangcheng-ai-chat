/*
 * ============================================
 * conversationStore - 会话管理状态
 * 职责：管理会话列表、当前会话、CRUD 操作、localStorage 持久化
 * ============================================
 */

import { create } from "zustand";
import type { Conversation } from "@/types";
import { useChatStore } from "@/store/chatStore";

interface ConversationState {
  /* 所有会话列表 */
  conversations: Conversation[];
  /* 当前选中的会话 ID */
  currentConversationId: string | null;
  /* 是否已从 localStorage 恢复 */
  isHydrated: boolean;

  /* 获取当前会话对象 */
  getCurrentConversation: () => Conversation | null;
  /* 新建会话 */
  createConversation: () => string;
  /* 删除会话 */
  deleteConversation: (id: string) => void;
  /* 切换当前会话 */
  setCurrentConversation: (id: string | null) => void;
  /* 更新会话标题 */
  updateConversationTitle: (id: string, title: string) => void;
  /* 更新会话的消息列表（同步持久化） */
  updateConversationMessages: (id: string, messages: Conversation["messages"]) => void;
  /* 标记水合完成 */
  setHydrated: () => void;
}

/* 生成会话 ID */
function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/* localStorage key */
const STORAGE_KEY = "ai-chat-conversations";

/* 从 localStorage 读取会话 */
function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* 保存会话到 localStorage */
function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    console.error("保存会话到 localStorage 失败");
  }
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isHydrated: false,

  getCurrentConversation: () => {
    const { conversations, currentConversationId } = get();
    return (
      conversations.find((c) => c.id === currentConversationId) || null
    );
  },

  createConversation: () => {
    const id = generateId();
    const now = Date.now();
    const conversation: Conversation = {
      id,
      title: "新对话",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    /* 新建会话时清空聊天区 */
    useChatStore.getState().clearMessages();

    set((state) => {
      const newConversations = [conversation, ...state.conversations];
      saveConversations(newConversations);
      return {
        conversations: newConversations,
        currentConversationId: id,
      };
    });

    return id;
  },

  deleteConversation: (id) => {
    set((state) => {
      const newConversations = state.conversations.filter(
        (c) => c.id !== id
      );
      saveConversations(newConversations);

      const isDeletingCurrent = state.currentConversationId === id;
      const newCurrentId = isDeletingCurrent
        ? newConversations[0]?.id || null
        : state.currentConversationId;

      /* 删除当前会话时加载新会话的消息，或清空聊天区 */
      if (isDeletingCurrent) {
        const newCurrent = newConversations.find(
          (c) => c.id === newCurrentId
        );
        if (newCurrent) {
          useChatStore.getState().setMessages(newCurrent.messages);
        } else {
          useChatStore.getState().clearMessages();
        }
      }

      return {
        conversations: newConversations,
        currentConversationId: newCurrentId,
      };
    });
  },

  setCurrentConversation: (id) => {
    set({ currentConversationId: id });
  },

  updateConversationTitle: (id, title) => {
    set((state) => {
      const newConversations = state.conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c
      );
      saveConversations(newConversations);
      return { conversations: newConversations };
    });
  },

  updateConversationMessages: (id, messages) => {
    set((state) => {
      const newConversations = state.conversations.map((c) =>
        c.id === id ? { ...c, messages, updatedAt: Date.now() } : c
      );
      saveConversations(newConversations);
      return { conversations: newConversations };
    });
  },

  setHydrated: () => set({ isHydrated: true }),
}));

/* 初始化：在客户端从 localStorage 加载数据 */
if (typeof window !== "undefined") {
  const saved = loadConversations();
  if (saved.length > 0) {
    useConversationStore.setState({
      conversations: saved,
      currentConversationId: saved[0].id,
      isHydrated: true,
    });
  } else {
    useConversationStore.setState({ isHydrated: true });
  }
}