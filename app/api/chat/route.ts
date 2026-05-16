/*
 * ============================================
 * POST /api/chat - 聊天 API 路由
 * 职责：接收前端消息 → 服务端附加 API Key → 调用大模型 → 流式返回
 * 支持 Mock 模式：未配置 AI_API_KEY 时自动切换本地模拟回复
 *
 * 面试考点：
 *  1. Next.js Route Handler：app/api/xxx/route.ts 即 API 端点
 *  2. SSE (Server-Sent Events) vs WebSocket：
 *     SSE 是单向流（服务器→客户端），适合 AI 逐字输出
 *     WebSocket 是双向通信，适合实时协作场景
 *  3. ReadableStream：浏览器原生流 API，支持背压控制
 *  4. 策略模式：根据环境变量切换真实 API / Mock 实现
 *  5. 为什么要服务端代理而不是前端直调大模型？
 *     → 安全：API Key 不暴露给客户端
 *     → 灵活：可在服务端做 prompt 优化、内容审核、日志记录
 *     → 跨域：服务端无跨域限制
 * ============================================
 */

import { NextRequest } from "next/server";
import { chatCompletionStream, isMockMode } from "@/lib/ai-client";
import { createMockStream } from "@/lib/ai-mock";
import { createStreamProxy, logError, logRequest } from "@/lib/api-utils";
import type { MessageRole, MessageContent } from "@/types";

type ChatMessage = {
  role: MessageRole;
  content: string | MessageContent[];
};

export async function POST(request: NextRequest) {
  const useMock = isMockMode();
  let body: { messages?: ChatMessage[] } = {};

  try {
    /* 解析前端传来的消息 */
    body = await request.json() as { messages?: ChatMessage[] };
    logRequest(
      "POST",
      `/api/chat${useMock ? " [Mock模式]" : ""}`,
      body
    );

    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "消息列表不能为空" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let stream: ReadableStream<Uint8Array>;

    if (useMock) {
      /* Mock 模式：本地模拟 SSE 流式回复 */
      stream = createMockStream({ messages });
    } else {
      /* 真实模式：调用大模型 API 并透传流 */
      const aiResponse = await chatCompletionStream({ messages });
      stream = createStreamProxy(aiResponse.body);
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Mock-Mode": useMock ? "true" : "false",
      },
    });
  } catch (error) {
    logError("POST", "/api/chat", error);

    /* 异常时降级为 Mock 回复，保证演示不中断 */
    const fallbackStream = createMockStream({
      messages: body.messages ?? [],
    });

    return new Response(fallbackStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Mock-Mode": "true",
      },
    });
  }
}

/*
 * GET /api/chat - 健康检查（含 Mock 状态）
 */
export async function GET() {
  return Response.json({
    status: "ok",
    message: "苍城 AI 聊天 API 运行中",
    mode: isMockMode() ? "mock" : "live",
    timestamp: Date.now(),
  });
}