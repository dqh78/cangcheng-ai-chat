"use client";

/*
 * ============================================
 * useChat - 核心聊天 Hook
 * 职责：封装发送消息、读取 SSE 流式响应、中止请求、上下文管理
 *
 * 面试考点：
 *  1. fetch + ReadableStream 实现流式读取
 *     - response.body.getReader() 获取 reader
 *     - reader.read() 逐块读取 Uint8Array
 *     - TextDecoder 解码二进制 → 文本
 *  2. AbortController 用于中止请求
 *     - 用户点击"停止生成"时调用 controller.abort()
 *  3. 为什么不用 EventSource？
 *     - EventSource 只支持 GET 请求，不支持 POST
 *     - 不能自定义请求头，不能传 JSON body
 *     - fetch + ReadableStream 更灵活
 *  4. SSE 数据格式解析：
 *     每行 "data: {...}\n\n"
 *     需要按行分割后提取 JSON
 * ============================================
 */

import { useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { useConversationStore } from "@/store/conversationStore";
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

  const { currentConversationId, updateConversationMessages } =
    useConversationStore();

  /* 持久化消息到当前会话 */
  const persistMessages = useCallback(() => {
    if (!currentConversationId) return;
    const { messages } = useChatStore.getState();
    updateConversationMessages(currentConversationId, messages);
  }, [currentConversationId, updateConversationMessages]);

  /*
   * 解析 SSE 流式数据
   * 格式：data: {...}\n\n
   * 返回增量文本内容
   */
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

  /*
   * 构建多模态消息内容
   * 纯文本 → 返回字符串；含图片 → 返回 content 数组
   * OpenAI Vision API 格式：[{ type: "text", text }, { type: "image_url", image_url: { url } }]
   */
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

  /*
   * 发送消息并接收流式响应
   * 核心流程：
   *  1. 添加用户消息到列表
   *  2. 创建 AbortController
   *  3. fetch POST /api/chat，带上历史消息（上下文记忆）
   *  4. 逐块读取 response.body
   *  5. 解析 SSE 格式 → appendToLastMessage（打字机效果）
   *  6. 完成后 finishStreaming + 持久化
   */
  const sendMessage = useCallback(
    async (content: string, images: ImageItem[] = []) => {
      const hasText = content.trim().length > 0;
      const hasImages = images.length > 0;
      if (!hasText && !hasImages) return;

      /* 防护 #1：正在加载时不允许并发发送 */
      const state = useChatStore.getState();
      if (state.isLoading) return;

      /* 防护 #3：中止旧的未完成请求，防止流泄漏 */
      state.abortController?.abort();

      /* Step 1: 添加用户消息 */
      const displayContent = content.trim() || (hasImages ? "请帮我分析这张图片" : "");
      const userMsgId = addMessage("user", displayContent);

      /* 缓存图片供 UI 展示缩略图 */
      if (hasImages) {
        setLastImages(images, userMsgId);
      }

      /* 自动生成会话标题：首条消息截取前 30 字作为标题 */
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

      persistMessages();

      /* Step 2: 准备 AI 消息槽位 + 控制器 */
      addMessage("assistant", "");
      setLoading(true);

      const controller = new AbortController();
      setAbortController(controller);

      try {
        /* Step 3: 构建请求体（含历史消息作为上下文） */
        const { messages } = useChatStore.getState();

        /* 构建当前用户消息（支持多模态） */
        const currentContent = buildContent(content.trim(), images);

        /* 历史消息保持原 content 格式，当前消息用多模态 */
        const apiMessages: Array<{
          role: MessageRole;
          content: string | MessageContent[];
        }> = messages
          .filter((m) => !m.isStreaming)
          .slice(0, -1) // 排除最后一条（刚添加的空 assistant 消息）
          .map((m) => ({
            role: m.role as MessageRole,
            content: m.content,
          }));

        apiMessages.push({
          role: "user" as MessageRole,
          content: currentContent,
        });

        /* Step 4: 发起流式请求 */
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`请求失败 (${response.status})`);
        }

        /* Step 5: 读取流式响应 */
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
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          /* 用户主动中止或新请求覆盖旧请求 */
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
        /* Step 6: 清理 + 持久化 */
        finishStreaming();
        setAbortController(null);
        persistMessages();
      }
    },
    [
      addMessage,
      appendToLastMessage,
      finishStreaming,
      markLastMessageError,
      setLoading,
      setAbortController,
      persistMessages,
    ]
  );

  /* 中止当前请求 */
  const stopGeneration = useCallback(() => {
    const { abortController } = useChatStore.getState();
    if (abortController) {
      abortController.abort();
    }
  }, []);

  return { sendMessage, stopGeneration };
}