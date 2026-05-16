"use client";

/*
 * ============================================
 * useImageUpload - 图片上传 Hook
 * 职责：管理选中图片的预览、压缩、清理
 * 面试考点：
 *  1. useRef 持有 FileReader 引用避免重复创建
 *  2. Canvas API 前端压缩（减少网络传输）
 *  3. 状态管理：图片列表的增删
 * ============================================
 */

import { useState, useRef, useCallback } from "react";
import { compressImage } from "@/lib/image-utils";

export interface ImageItem {
  id: string;
  base64: string;
  width: number;
  height: number;
  fileName: string;
}

export function useImageUpload() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 处理文件选择 */
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsCompressing(true);

    const newImages: ImageItem[] = [];

    for (const file of Array.from(files)) {
      try {
        const { base64, width, height } = await compressImage(file);
        newImages.push({
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          base64,
          width,
          height,
          fileName: file.name,
        });
      } catch (error) {
        console.error("图片压缩失败:", error);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setIsCompressing(false);

    /* 重置 input 以允许重新选择同一文件 */
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  /* 移除单张图片 */
  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  /* 清空所有图片 */
  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  /* 打开文件选择器 */
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    images,
    isCompressing,
    fileInputRef,
    handleFiles,
    removeImage,
    clearImages,
    openFilePicker,
  };
}