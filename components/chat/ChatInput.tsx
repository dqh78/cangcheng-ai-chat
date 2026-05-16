"use client";

/*
 * ============================================
 * ChatInput - 输入框组件（含图片上传）
 * 负责文本输入、图片选择/预览、发送
 * ============================================
 */

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useImageUpload, type ImageItem } from "@/hooks/useImageUpload";

/*
 * 代码专项快捷操作模板
 * 点击后自动填入输入框，用户可继续编辑后发送
 */
const codeShortcuts = [
  {
    icon: "🔍",
    label: "代码解释",
    prompt:
      "请详细解释以下代码的功能和工作原理，包括关键函数、算法逻辑和实现细节：\n\n```\n```",
  },
  {
    icon: "🐛",
    label: "代码纠错",
    prompt:
      "请帮我检查以下代码中的错误，指出问题所在并给出修复方案：\n\n```\n```",
  },
  {
    icon: "⚡",
    label: "代码优化",
    prompt:
      "请帮我优化以下代码，提升性能、可读性和可维护性，并说明优化点：\n\n```\n```",
  },
  {
    icon: "📝",
    label: "写代码",
    prompt: "请帮我用 TypeScript / React 实现以下功能：\n\n",
  },
];

interface ChatInputProps {
  onSend: (content: string, images: ImageItem[]) => void;
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

  const {
    images,
    isCompressing,
    fileInputRef,
    handleFiles,
    removeImage,
    clearImages,
    openFilePicker,
  } = useImageUpload();

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
    const hasText = inputValue.trim().length > 0;
    const hasImages = images.length > 0;
    if ((!hasText && !hasImages) || isDisabled || isLoading) return;
    onSend(inputValue.trim(), images);
    setInputValue("");
    clearImages();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  /* 键盘事件处理 */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
        {/* 图片预览区 */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border"
              >
                <img
                  src={img.base64}
                  alt={img.fileName}
                  className="w-full h-full object-cover"
                />
                {/* 移除按钮 */}
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center
                    rounded-full bg-black/60 text-white text-xs
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            {/* 压缩中 */}
            {isCompressing && (
              <div className="w-20 h-20 rounded-lg border border-border
                flex items-center justify-center bg-surface-secondary">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* 代码专项快捷操作栏 */}
        {images.length === 0 && (
          <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-0.5">
            {codeShortcuts.map((shortcut) => (
              <button
                key={shortcut.label}
                onClick={() => setInputValue(shortcut.prompt)}
                disabled={isDisabled}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5
                  rounded-lg text-xs bg-surface-secondary border border-border
                  text-text-secondary hover:text-primary hover:border-primary/30
                  transition-colors disabled:opacity-50"
              >
                <span>{shortcut.icon}</span>
                <span>{shortcut.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 输入框区域 */}
        <div
          className="relative flex items-end gap-2 bg-surface-secondary rounded-2xl border border-border
            focus-within:border-primary/50 focus-within:shadow-md transition-all duration-200 px-4 py-2"
        >
          {/* 图片上传按钮 */}
          <div className="flex-shrink-0 pb-1">
            <button
              onClick={openFilePicker}
              disabled={isDisabled}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-text-tertiary hover:text-primary hover:bg-surface-tertiary
                transition-colors disabled:opacity-50"
              title="上传图片"
            >
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>

          {/* 隐藏的文件选择器 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

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
            disabled={
              isDisabled ||
              isLoading ||
              (!inputValue.trim() && images.length === 0)
            }
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl
              bg-primary text-white hover:bg-primary-dark
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95 transition-all duration-200"
            title="发送消息"
          >
            {isLoading ? (
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
          支持上传图片进行识图问答 · AI 可能会产生不准确信息
        </p>
      </div>
    </div>
  );
}