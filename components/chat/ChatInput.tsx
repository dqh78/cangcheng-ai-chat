"use client";

/*
 * ============================================
 * ChatInput - 输入框组件
 * 负责文本输入、发送、以及快捷操作按钮
 * 当前阶段：骨架版（回车发送 + 发送按钮）
 * ============================================
 */

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export default function ChatInput({
  onSend,
  isDisabled = false,
  isLoading = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* 自动调整输入框高度 */
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  /* 发送消息 */
  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isDisabled || isLoading) return;
    onSend(trimmed);
    setInputValue("");
    /* 重置高度 */
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  /* 键盘事件处理 */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    /* Enter 发送（不按 Shift） */
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* 自动聚焦 */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex-shrink-0 border-t border-border bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="relative flex items-end gap-2 bg-surface-secondary rounded-2xl border border-border
          focus-within:border-primary/50 focus-within:shadow-md transition-all duration-200 px-4 py-2">
          {/* 文本输入框 */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
            disabled={isDisabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-text-primary placeholder-text-tertiary
              outline-none text-sm leading-6 py-1.5 max-h-[200px]
              disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={isDisabled || isLoading || !inputValue.trim()}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl
              bg-primary text-white hover:bg-primary-dark
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95 transition-all duration-200"
            title="发送消息"
          >
            {isLoading ? (
              /* 加载中图标 */
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              /* 发送箭头图标 */
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* 底部提示文字 */}
        <p className="text-center text-xs text-text-tertiary mt-2">
          AI 助手可能会产生不准确信息，请注意甄别
        </p>
      </div>
    </div>
  );
}