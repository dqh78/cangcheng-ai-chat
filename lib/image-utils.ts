/*
 * ============================================
 * image-utils.ts - 图片处理工具
 * 面试考点：
 *  1. Canvas API 前端压缩 → 减少上传带宽、提升体验
 *  2. 文件魔数校验 → 防止伪造 MIME type 绕过类型检查
 *  3. 为什么前端压缩 + 服务端二次校验？
 *     → 前端压缩：减少网络传输
 *     → 服务端校验：安全兜底，不能信任客户端输入
 * ============================================
 */

/* 允许的 MIME 类型 */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/* 最大文件大小（10MB） */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* 前端压缩参数 */
const COMPRESS_CONFIG = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
  maxOutputBytes: 2 * 1024 * 1024, // 2MB
};

/*
 * 文件魔数校验（Magic Number）
 * 原理：每种文件格式的前几个字节是固定的"签名"
 * 不能信任 file.type（客户端可控），必须读二进制头
 *
 * JPEG: FF D8 FF
 * PNG:  89 50 4E 47
 * WEBP: 52 49 46 46 ... 57 45 42 50
 */
async function validateFileSignature(
  file: File
): Promise<boolean> {
  const buffer = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  /* JPEG */
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }
  /* PNG */
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return true;
  }

  /* WEBP: 需要读 12 字节 */
  const webpBuffer = await file.slice(0, 12).arrayBuffer();
  const webpBytes = new Uint8Array(webpBuffer);
  if (
    webpBytes[0] === 0x52 &&
    webpBytes[1] === 0x49 &&
    webpBytes[2] === 0x46 &&
    webpBytes[3] === 0x46 &&
    webpBytes[8] === 0x57 &&
    webpBytes[9] === 0x45 &&
    webpBytes[10] === 0x42 &&
    webpBytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}

/*
 * 前端 Canvas 压缩
 * 策略：
 *  1. 等比例缩放到 maxWidth/maxHeight 以内
 *  2. JPEG 输出（减少体积，但对透明图不友好）
 *  3. 如果原图是 PNG 且小于压缩目标，保留原图
 */
export async function compressImage(
  file: File
): Promise<{ base64: string; width: number; height: number }> {
  /* Step 1: 校验 */
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error(
      `不支持的图片格式：${file.type}，仅支持 JPEG/PNG/WebP`
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），最大 10MB`);
  }

  const isValid = await validateFileSignature(file);
  if (!isValid) {
    throw new Error("文件格式校验失败，请上传真实图片");
  }

  /* Step 2: 加载图片 */
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  /* Step 3: 等比例缩放 */
  if (
    width > COMPRESS_CONFIG.maxWidth ||
    height > COMPRESS_CONFIG.maxHeight
  ) {
    const ratio = Math.min(
      COMPRESS_CONFIG.maxWidth / width,
      COMPRESS_CONFIG.maxHeight / height
    );
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  /* Step 4: Canvas 绘制 + 导出 */
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 上下文创建失败");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  /* Step 5: 导出为 JPEG base64 */
  let quality = COMPRESS_CONFIG.quality;
  let base64 = canvas.toDataURL("image/jpeg", quality);

  /* 如果压缩后仍然过大，降低质量重试 */
  while (
    base64.length > COMPRESS_CONFIG.maxOutputBytes &&
    quality > 0.3
  ) {
    quality -= 0.1;
    base64 = canvas.toDataURL("image/jpeg", quality);
  }

  canvas.remove();

  return { base64, width, height };
}

/*
 * 将 File 转为 base64（不压缩，用于小文件直接上传）
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

export { ALLOWED_TYPES, MAX_FILE_SIZE };