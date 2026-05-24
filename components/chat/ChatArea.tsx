"use client";

/*
 * ============================================
 * ChatArea - 聊天主区域组件
 * 展示消息列表 + Markdown 渲染 + 底部输入框
 * 当前阶段：接入真实流式 API
 * ============================================
 */

import { useChatStore } from "@/store/chatStore";
import { useChat } from "@/hooks/useChat";
import ChatInput from "@/components/chat/ChatInput";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { useRef, useEffect } from "react";

export default function ChatArea() {
  const { messages, isLoading, lastImages, lastImagesMessageId } =
    useChatStore();
  const { sendMessage, stopGeneration } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 消息变化时自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* 空状态 - 欢迎界面 */
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="text-center max-w-md">
              {/* Logo */}
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                你好，我是苍城 AI
              </h2>
              <p className="text-text-secondary mb-8">
                支持多轮对话、图片识别、代码优化，
                <br />
                开始你的智能对话之旅吧
              </p>

              {/* 快捷入口 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "💬", title: "智能对话", desc: "多轮上下文记忆" },
                  { icon: "🖼️", title: "图片识别", desc: "上传图片识图问答" },
                  { icon: "💻", title: "代码专项", desc: "解释/纠错/优化" },
                  { icon: "🌙", title: "主题切换", desc: "暗黑/浅色模式" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-xl border border-border bg-surface-secondary
                      hover:border-primary/30 hover:bg-surface-tertiary
                      transition-all duration-200 cursor-pointer text-left"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-sm font-medium text-text-primary">
                      {item.title}
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 消息列表 */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`animate-fade-in ${
                  msg.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : msg.isError
                        ? "bg-error/10 text-error border border-error/30 rounded-bl-md"
                        : "bg-surface-secondary text-text-primary rounded-bl-md border border-border"
                  }`}
                >
                  {/* AI 角色标识 */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs text-primary">AI</span>
                      </div>
                      <span className="text-xs font-medium text-primary">
                        苍城 AI
                      </span>
                      {msg.isStreaming && (
                        <span className="text-xs text-text-tertiary">
                          回复中...
                        </span>
                      )}
                      {msg.isError && (
                        <span className="text-xs text-error">请求失败</span>
                      )}
                    </div>
                  )}

                  {/* 消息内容：AI 消息用 Markdown 渲染，用户消息纯文本 */}
                  {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content || "..."} />
                  ) : (
                    <>
                      {/* 用户发送的图片缩略图 */}
                      {msg.id === lastImagesMessageId && lastImages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {lastImages.map((img) => (
                            <div
                              key={img.id}
                              className="w-16 h-16 rounded-lg overflow-hidden border border-white/20"
                            >
                              <img
                                src={img.base64}
                                alt={img.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </>
                  )}

                  {/* 流式光标动画 */}
                  {msg.isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-blink-cursor" />
                  )}

                  {/* 错误重试提示 */}
                  {msg.isError && msg.role === "assistant" && (
                    <button
                      onClick={() => {
                        if (isLoading) return;
                        const msgIndex = messages.findIndex(
                          (m) => m.id === msg.id
                        );
                        const userMsg =
                          msgIndex > 0 ? messages[msgIndex - 1] : null;
                        if (userMsg && userMsg.role === "user") {
                          sendMessage(userMsg.content);
                        }
                      }}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      点击重试
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 正在加载中的骨架动画 */}
            {isLoading &&
              messages.length > 0 &&
              !messages[messages.length - 1]?.content && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-surface-secondary border border-border">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}

            {/* 滚动锚点 */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 底部输入区域 */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}