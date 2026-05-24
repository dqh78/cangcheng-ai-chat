"use client";

/*
 * ============================================
 * ChatArea - 聊天主区域组件
 * 极简欢迎页 + 玻璃态消息气泡 + 三点跳动加载动画
 * ============================================
 */

import { useChatStore } from "@/store/chatStore";
import { useChat } from "@/hooks/useChat";
import ChatInput from "@/components/chat/ChatInput";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { useRef, useEffect } from "react";
import { Sparkles, Zap, Image, Code2 } from "lucide-react";

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
          /* 空状态 - 极简欢迎界面 */
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="text-center max-w-lg">
              {/* 背景装饰光晕 */}
              <div className="relative mb-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="relative w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Slogan */}
              <h2 className="text-[40px] font-semibold text-text-primary mb-3 tracking-tight">
                苍城 AI
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                你的智能对话伙伴
              </p>

              {/* 功能标签 pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  { icon: Zap, label: "智能对话" },
                  { icon: Image, label: "图片识别" },
                  { icon: Code2, label: "代码专项" },
                ].map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                      border border-border bg-surface-secondary/80 text-text-secondary text-[15px]
                      transition-all duration-200"
                  >
                    <item.icon className="w-3.5 h-3.5 text-primary" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 消息列表 */
          <div className="max-w-[768px] mx-auto px-4 py-6 space-y-8">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`animate-fade-in-up ${
                  msg.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] ${
                    msg.role === "user"
                      ? "rounded-[20px] rounded-br-[6px] px-5 py-3 bg-gradient-to-br from-primary to-accent text-white shadow-bubble"
                      : msg.isError
                        ? "rounded-[20px] rounded-bl-[6px] px-5 py-3 bg-error/8 text-error border border-error/20"
                        : "rounded-[20px] rounded-bl-[6px] px-5 py-3 bg-bubble-ai text-bubble-ai-text border border-border/50"
                  }`}
                >
                  {/* AI 角色标识 */}
                  {msg.role === "assistant" && !msg.isError && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-primary">
                        苍城 AI
                      </span>
                      {msg.isStreaming && (
                        <span className="text-sm text-text-tertiary">
                          回复中...
                        </span>
                      )}
                    </div>
                  )}

                  {/* 错误标识 */}
                  {msg.role === "assistant" && msg.isError && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-xs font-medium text-error">
                        请求失败
                      </span>
                    </div>
                  )}

                  {/* 消息内容 */}
                  {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content || "..."} />
                  ) : (
                    <>
                      {/* 用户发送的图片缩略图 */}
                      {msg.id === lastImagesMessageId &&
                        lastImages.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {lastImages.map((img) => (
                              <div
                                key={img.id}
                                className="w-16 h-16 rounded-xl overflow-hidden border border-white/20"
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
                      <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </>
                  )}

                  {/* 流式光标动画 */}
                  {msg.isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle animate-blink-cursor rounded-full" />
                  )}

                  {/* 错误重试 */}
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
                      className="mt-2.5 text-xs text-primary hover:underline transition-colors"
                    >
                      点击重试
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 加载中状态 - 三点跳动动画 */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="max-w-[85%] rounded-[20px] rounded-bl-[6px] px-5 py-4 bg-bubble-ai border border-border/50">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-primary">
                      苍城 AI
                    </span>
                    <span className="text-xs text-text-tertiary">
                      思考中...
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 py-1.5">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-dot-bounce" />
                    <span
                      className="w-2 h-2 bg-primary/60 rounded-full animate-dot-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="w-2 h-2 bg-primary/60 rounded-full animate-dot-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
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
      <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
    </div>
  );
}