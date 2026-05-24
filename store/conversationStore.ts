import { create } from "zustand";
import type { Conversation, Message } from "@/lib/generated/prisma/client";
import type { Message as ChatMessage } from "@/types";
import { useChatStore } from "@/store/chatStore";
import * as conversationService from "@/lib/conversation-service";

const PENDING_PREFIX = "pending_";

function isPending(id: string): boolean {
  return id.startsWith(PENDING_PREFIX);
}

function makePlaceholder(): Conversation {
  const now = new Date();
  return {
    id: `${PENDING_PREFIX}${Date.now()}`,
    userId: "",
    title: "新对话",
    codeMode: null,
    createdAt: now,
    updatedAt: now,
  } as Conversation;
}

interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isHydrated: boolean;
  isLoading: boolean;

  getCurrentConversation: () => Conversation | null;
  loadConversations: () => Promise<void>;
  createConversation: () => string;
  realizeConversation: () => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  setCurrentConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  setHydrated: () => void;
}

function convertToChatMessage(dbMessage: Message): ChatMessage {
  return {
    id: dbMessage.id,
    role: dbMessage.role as "user" | "assistant",
    content: dbMessage.content,
    timestamp: new Date(dbMessage.createdAt).getTime(),
    isStreaming: dbMessage.isStreaming,
    isError: dbMessage.isError,
    errorMessage: dbMessage.errorMessage || undefined,
  };
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isHydrated: false,
  isLoading: false,

  getCurrentConversation: () => {
    const { conversations, currentConversationId } = get();
    return conversations.find((c) => c.id === currentConversationId) || null;
  },

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const conversations = await conversationService.fetchConversations();
      set({
        conversations,
        currentConversationId: conversations[0]?.id || null,
        isLoading: false,
        isHydrated: true,
      });

      if (conversations[0]) {
        const detail = await conversationService.fetchConversation(
          conversations[0].id
        );
        const chatMessages = detail.messages.map(convertToChatMessage);
        useChatStore.getState().setMessages(chatMessages);
      }
    } catch (error) {
      console.error("加载会话失败:", error);
      set({ isLoading: false, isHydrated: true });
    }
  },

  createConversation: () => {
    const placeholder = makePlaceholder();
    useChatStore.getState().clearMessages();
    set((state) => ({
      conversations: [placeholder, ...state.conversations],
      currentConversationId: placeholder.id,
    }));
    return placeholder.id;
  },

  realizeConversation: async () => {
    const { currentConversationId } = get();
    if (!currentConversationId || !isPending(currentConversationId)) {
      return currentConversationId || "";
    }

    const real = await conversationService.createConversation();
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === currentConversationId ? real : c
      ),
      currentConversationId: real.id,
    }));
    return real.id;
  },

  deleteConversation: async (id) => {
    if (!isPending(id)) {
      await conversationService.deleteConversation(id);
    }
    set((state) => {
      const newConversations = state.conversations.filter((c) => c.id !== id);
      const isDeletingCurrent = state.currentConversationId === id;
      const newCurrentId = isDeletingCurrent
        ? newConversations[0]?.id || null
        : state.currentConversationId;

      if (isDeletingCurrent) {
        if (newCurrentId) {
          conversationService
            .fetchConversation(newCurrentId)
            .then((detail) => {
              const chatMessages = detail.messages.map(convertToChatMessage);
              useChatStore.getState().setMessages(chatMessages);
            })
            .catch((err) => {
              console.error("加载新会话失败:", err);
              useChatStore.getState().clearMessages();
            });
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

  setCurrentConversation: async (id) => {
    if (!id) {
      set({ currentConversationId: null });
      useChatStore.getState().clearMessages();
      return;
    }

    set({ currentConversationId: id });

    if (isPending(id)) {
      useChatStore.getState().clearMessages();
      return;
    }

    const conversation = await conversationService.fetchConversation(id);
    const chatMessages = conversation.messages.map(convertToChatMessage);
    useChatStore.getState().setMessages(chatMessages);
  },

  updateConversationTitle: async (id, title) => {
    if (!isPending(id)) {
      await conversationService.updateConversation(id, { title });
    }
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: new Date() } : c
      ),
    }));
  },

  setHydrated: () => set({ isHydrated: true }),
}));