/*
 * ============================================
 * ai-client.ts - 大模型 API 调用客户端
 * 支持 OpenAI 兼容接口（OpenAI / DeepSeek / 硅基流动 / 通义千问 等）
 *
 * 面试考点：
 *  1. 适配器模式：统一封装不同模型提供商的接口差异
 *  2. 服务端代理：API Key 仅在服务端，前端无法获取
 *  3. 为什么在服务端调大模型？
 *     → 隐藏 API Key，防止前端泄露
 *     → 可做请求日志、限流、内容审核等中间处理
 *     → 避免浏览器跨域问题
 * ============================================
 */

import { fetchWithTimeout } from "@/lib/api-utils";
import type { ChatRequest } from "@/types";

/*
 * 判断当前是否运行在 Mock 模式
 * 条件：API Key 未配置 / 保持默认值 / 明确设为 "mock"
 */
export function isMockMode(): boolean {
  const apiKey = process.env.AI_API_KEY;
  return !apiKey || apiKey === "your-api-key-here" || apiKey === "mock";
}

/*
 * 获取大模型配置（从环境变量读取）
 * 密钥只存在于服务端 .env.local，不会暴露给前端
 */
function getAIConfig() {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_API_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o";

  if (!apiKey || apiKey === "your-api-key-here" || apiKey === "mock") {
    throw new Error(
      "AI_API_KEY 未配置，当前运行在 Mock 模式"
    );
  }

  return { apiKey, baseUrl, model };
}

/*
 * 非流式聊天请求（普通 JSON 响应）
 */
export async function chatCompletion(
  request: ChatRequest
): Promise<string> {
  const { apiKey, baseUrl, model } = getAIConfig();

  const response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model || model,
      messages: request.messages,
      stream: false,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/*
 * 流式聊天请求（SSE Streaming）
 * 返回原始 Response，在 Route Handler 中透传 ReadableStream
 *
 * 原理说明：
 *  设置 stream: true → 大模型按 token 逐块返回
 *  每块数据格式：data: {"choices":[{"delta":{"content":"xxx"}}]}\n\n
 *  前端使用 fetch + reader 逐块读取并实时渲染 → 打字机效果
 */
export async function chatCompletionStream(
  request: ChatRequest
): Promise<Response> {
  const { apiKey, baseUrl, model } = getAIConfig();

  const response = await fetchWithTimeout(
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || model,
        messages: request.messages,
        stream: true,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      }),
      timeout: 120000, // 流式请求超时更长
    }
  );

  return response;
}