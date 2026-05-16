/*
 * ============================================
 * POST /api/upload - 图片上传路由
 * 职责：接收前端图片 → 服务端二次校验 → 压缩 → 返回 base64
 *
 * 面试考点：
 *  1. 服务端文件校验：不能信任前端校验结果
 *  2. magic bytes 校验：文件类型不能只看扩展名
 *  3. 为什么返回 base64 而不是存文件？
 *     → 大模型 Vision API 需要 base64 或 URL
 *     → 项目定位轻量，暂不需要 OSS
 *     → 后续可扩展为上传到云存储返回 URL
 * ============================================
 */

import { NextRequest } from "next/server";

/* 允许的文件类型 */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* 文件大小上限 10MB */
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { error: "未找到上传文件" },
        { status: 400 }
      );
    }

    /* 校验文件大小 */
    if (file.size > MAX_SIZE) {
      return Response.json(
        {
          error: `文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），最大 10MB`,
        },
        { status: 400 }
      );
    }

    /* 校验文件类型 */
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: `不支持的文件类型：${file.type}` },
        { status: 400 }
      );
    }

    /* 校验魔数 */
    const buffer = await file.arrayBuffer();
    const isValid = validateMagicBytes(new Uint8Array(buffer), file.type);
    if (!isValid) {
      return Response.json(
        { error: "文件内容与声明类型不符" },
        { status: 400 }
      );
    }

    /* 转为 base64 返回 */
    const base64 = arrayBufferToBase64(buffer, file.type);

    return Response.json({
      success: true,
      base64,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("[Upload Error]", error);
    return Response.json(
      { error: "上传处理失败，请重试" },
      { status: 500 }
    );
  }
}

/* 魔数校验 */
function validateMagicBytes(
  bytes: Uint8Array,
  mimeType: string
): boolean {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (mimeType === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }
  return false;
}

/* ArrayBuffer 转 base64 data URL */
function arrayBufferToBase64(
  buffer: ArrayBuffer,
  mimeType: string
): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return `data:${mimeType};base64,${b64}`;
}