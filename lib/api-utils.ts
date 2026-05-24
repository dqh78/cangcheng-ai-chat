/*
 * ============================================
 * api-utils.ts - API 请求工具函数
 * 面试考点：
 *  1. 服务端统一错误处理模式
 *  2. ReadableStream 流式响应封装
 *  3. 超时控制 → AbortController + setTimeout
 * ============================================
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/* 超时时间（毫秒） */
const REQUEST_TIMEOUT = 60000;

/* 流式读取超时 */
const STREAM_TIMEOUT = 120000;

/*
 * 创建带超时的 fetch 请求
 * 原理：AbortController 信号 + setTimeout 竞赛
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "未知错误");
      throw new Error(
        `API 请求失败 [${response.status}]: ${errorText.slice(0, 200)}`
      );
    }

    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("请求超时，请稍后重试");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/*
 * 将流式 Response body 包装为 ReadableStream<Uint8Array>
 * 用于 Next.js Route Handler 中透传大模型流式响应
 * 加入超时保护
 */
export function createStreamProxy(
  sourceStream: ReadableStream<Uint8Array> | null,
  timeout: number = STREAM_TIMEOUT
): ReadableStream<Uint8Array> {
  if (!sourceStream) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            JSON.stringify({
              error: "大模型返回的流为空",
            })
          )
        );
        controller.close();
      },
    });
  }

  const reader = sourceStream.getReader();
  let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    reader.cancel().catch(() => {});
    timeoutId = null;
  }, timeout);

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          if (timeoutId) clearTimeout(timeoutId);
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        controller.error(error);
      }
    },
    cancel() {
      if (timeoutId) clearTimeout(timeoutId);
      reader.cancel().catch(() => {});
    },
  });
}

/*
 * 构建错误响应的 ReadableStream
 */
export function createErrorStream(message: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          JSON.stringify({ error: message }) + "\n"
        )
      );
      controller.close();
    },
  });
}

/*
 * 日志工具（服务端控制台）
 */
export function logRequest(method: string, path: string, body?: unknown): void {
  console.log(`[API] ${method} ${path}`);
  if (body && process.env.NODE_ENV === "development") {
    console.log(
      `[API] Body: ${JSON.stringify(body).slice(0, 500)}`
    );
  }
}

export function logError(method: string, path: string, error: unknown): void {
  console.error(`[API Error] ${method} ${path}:`, error);
}

// ============================================
// 鉴权相关工具
// ============================================

/**
 * 从 session 中获取当前登录用户的 ID，未登录则抛出 "未授权" 错误
 */
export async function getUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string;
  if (!userId) throw new Error("未授权");
  return userId;
}

/**
 * 包装 API handler，自动处理鉴权和错误分类：
 * - 鉴权失败 → 401 "未授权"
 * - handler 返回 NextResponse（如 404）→ 透传
 * - 其他异常 → 500 + console.error 输出真实错误
 */
export async function withAuth<T>(
  label: string,
  handler: (userId: string) => Promise<T>
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const result = await handler(userId);
    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "未授权") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    console.error(`${label}失败:`, error);
    return NextResponse.json({ error: `${label}失败` }, { status: 500 });
  }
}