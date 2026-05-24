"use client";

/*
 * ============================================
 * ChatInput - 悬浮玻璃态输入框组件
 * 辉光聚焦边框 · 渐变发送按钮 · 图片上传
 * ============================================
 */

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useImageUpload, type ImageItem } from "@/hooks/useImageUpload";
import {
  ImagePlus,
  X,
  Send,
  Square,
  Loader2,
} from "lucide-react";

interface ChatInputProps {
  onSend: (content: string, images: ImageItem[]) => void;
  onStop?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
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

  /* 键盘事件 - Enter 发送, Shift+Enter 换行 */
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
    <div className="flex-shrink-0 px-4 pb-3 pt-2">
      <div className="max-w-[768px] mx-auto">
        {/* 图片预览区 */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border/50 shadow-sm"
              >
                <img
                  src={img.base64}
                  alt={img.fileName}
                  className="w-full h-full object-cover"
                />
                {/* 移除按钮 */}
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center
                    rounded-full bg-black/60 text-white
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* 压缩中 */}
            {isCompressing && (
              <div className="w-20 h-20 rounded-xl border border-border/50
                flex items-center justify-center bg-surface-secondary/80 shadow-sm">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* 悬浮输入框 */}
        <div
          className="relative flex items-end gap-2.5 px-4 py-3 rounded-2xl
            bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl
            border border-border/60
            focus-within:border-primary/40 focus-within:shadow-glow
            transition-all duration-200 ease-out shadow-md"
        >
          {/* 图片上传按钮 */}
          <div className="flex-shrink-0 pb-0.5">
            <button
              onClick={openFilePicker}
              disabled={isDisabled}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                text-text-tertiary hover:text-primary hover:bg-primary-50
                transition-all duration-200 disabled:opacity-50"
              title="上传图片"
            >
              <ImagePlus className="w-5 h-5" />
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
              outline-none text-base leading-6 py-1.5 max-h-[200px]
              disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* 发送 / 停止按钮 */}
          {isLoading ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl
                bg-surface-tertiary text-text-secondary hover:bg-error/10 hover:text-error
                transition-all duration-200 active:scale-95"
              title="停止生成"
            >
              <Square className="w-4 h-4" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={
                isDisabled ||
                (!inputValue.trim() && images.length === 0)
              }
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl
                bg-gradient-to-br from-primary to-accent text-white
                hover:brightness-110 hover:shadow-lg hover:shadow-primary/25
                disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:hover:shadow-none
                active:scale-95 transition-all duration-200 shadow-md shadow-primary/15"
              title="发送消息"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-[0.8rem] text-text-tertiary mt-2.5">
          支持上传图片进行识图问答 · AI 可能会产生不准确信息
        </p>
      </div>
    </div>
  );
}