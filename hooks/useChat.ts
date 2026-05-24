"use client";

import { useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { useConversationStore } from "@/store/conversationStore";
import * as conversationService from "@/lib/conversation-service";
import type { MessageRole, MessageContent } from "@/types";
import type { ImageItem } from "@/hooks/useImageUpload";

export function useChat() {
  const {
    addMessage,
    appendToLastMessage,
    finishStreaming,
    markLastMessageError,
    setLoading,
    setAbortController,
    setLastImages,
  } = useChatStore();

  const { currentConversationId } =
    useConversationStore();

  function parseSSEChunk(text: string): string {
    const lines = text.split("\n");
    let result = "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const data = JSON.parse(jsonStr);
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            result += content;
          }
        } catch {
          /* 忽略解析失败的行 */
        }
      }
    }

    return result;
  }

  function buildContent(
    text: string,
    images: ImageItem[]
  ): string | MessageContent[] {
    if (images.length === 0) return text || "";

    const content: MessageContent[] = [];
    if (text) {
      content.push({ type: "text", text });
    } else {
      content.push({ type: "text", text: "请帮我分析这张图片的内容" });
    }
    for (const img of images) {
      content.push({
        type: "image_url",
        image_url: { url: img.base64 },
      });
    }
    return content;
  }

  const sendMessage = useCallback(
    async (content: string, images: ImageItem[] = []) => {
      const hasText = content.trim().length > 0;
      const hasImages = images.length > 0;
      if (!hasText && !hasImages) return;

      const state = useChatStore.getState();
      if (state.isLoading) return;

      state.abortController?.abort();

      const displayContent = content.trim() || (hasImages ? "请帮我分析这张图片" : "");
      const userMsgId = addMessage("user", displayContent);

      if (hasImages) {
        setLastImages(images, userMsgId);
      }

      if (currentConversationId) {
        const convStore = useConversationStore.getState();
        const conv = convStore.conversations.find(
          (c) => c.id === currentConversationId
        );
        if (conv && conv.title === "新对话") {
          const trimmed = displayContent;
          const title =
            trimmed.slice(0, 30) + (trimmed.length > 30 ? "..." : "");
          convStore.updateConversationTitle(currentConversationId, title);
        }
      }

      // 只保存用户消息到数据库
      if (currentConversationId) {
        await conversationService.addMessage(currentConversationId, {
          role: "user",
          content: displayContent,
          contents: [],
          isStreaming: false,
          isError: false,
          errorMessage: null,
        });
      }

      addMessage("assistant", "");
      setLoading(true);

      const controller = new AbortController();
      setAbortController(controller);

      try {
        const { messages } = useChatStore.getState();

        const currentContent = buildContent(content.trim(), images);

        const apiMessages: Array<{
          role: MessageRole;
          content: string | MessageContent[];
        }> = messages
          .filter((m) => !m.isStreaming)
          .slice(0, -1)
          .map((m) => ({
            role: m.role as MessageRole,
            content: m.content,
          }));

        apiMessages.push({
          role: "user" as MessageRole,
          content: currentContent,
        });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`请求失败 (${response.status})`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法读取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const chunk = parseSSEChunk(part + "\n\n");
            if (chunk) {
              appendToLastMessage(chunk);
            }
          }
        }

        if (buffer.trim()) {
          const chunk = parseSSEChunk(buffer);
          if (chunk) {
            appendToLastMessage(chunk);
          }
        }

        // 流式结束后一次性保存 AI 消息到数据库
        if (currentConversationId) {
          const currentState = useChatStore.getState();
          const aiMsg = currentState.messages[currentState.messages.length - 1];
          if (aiMsg && aiMsg.role === "assistant") {
            await conversationService.addMessage(currentConversationId, {
              role: "assistant",
              content: aiMsg.content,
              contents: [],
              isStreaming: false,
              isError: false,
              errorMessage: null,
            });
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          const { messages } = useChatStore.getState();
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.content === "") {
            markLastMessageError("已停止生成");
          }
        } else {
          const errMsg =
            error instanceof Error ? error.message : "请求异常";
          markLastMessageError(errMsg);
        }
      } finally {
        finishStreaming();
        setAbortController(null);
      }
    },
    [
      addMessage,
      appendToLastMessage,
      finishStreaming,
      markLastMessageError,
      setLoading,
      setAbortController,
      setLastImages,
      currentConversationId,
    ]
  );

  const stopGeneration = useCallback(() => {
    const { abortController } = useChatStore.getState();
    if (abortController) {
      abortController.abort();
    }
  }, []);

  return { sendMessage, stopGeneration };
}