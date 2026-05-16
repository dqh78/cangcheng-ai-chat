/*
 * ============================================
 * ai-mock.ts - Mock 模式：模拟大模型流式回复
 * 当 AI_API_KEY 未配置时自动启用，方便离线演示
 *
 * 面试考点：
 *  1. 策略模式：根据配置切换真实 API / Mock 实现
 *  2. ReadableStream 手动构造：模拟真实 SSE 数据块格式
 *  3. 异步迭代器 + 延迟 → 模拟打字机效果
 * ============================================
 */

import type { ChatRequest } from "@/types";

/*
 * 提取最后一条用户消息的文本内容
 * 支持纯文本和 ContentPart 数组两种格式
 */
function getLastUserText(request: ChatRequest): string {
  const lastUserMessage = request.messages
    .filter((m) => m.role === "user")
    .pop();

  if (!lastUserMessage) return "";

  const content = lastUserMessage.content;

  /* 纯文本 */
  if (typeof content === "string") return content;

  /* ContentPart 数组 → 提取 text 部分 */
  if (Array.isArray(content)) {
    const textPart = content.find((part) => part.type === "text");
    return textPart && typeof textPart.text === "string" ? textPart.text : "";
  }

  return "";
}

/* 检测是否包含图片 */
function hasImages(request: ChatRequest): boolean {
  const lastUserMessage = request.messages
    .filter((m) => m.role === "user")
    .pop();
  if (!lastUserMessage) return false;

  const content = lastUserMessage.content;
  if (Array.isArray(content)) {
    return content.some((part) => part.type === "image_url");
  }
  return false;
}

/* Mock 回复语料库 - 根据用户输入动态生成回复 */
function generateMockResponse(userMessage: string, hasImage: boolean): string {
  const msg = userMessage.toLowerCase();

  /* 图片分析 */
  if (hasImage) {
    return [
      "## 🖼️ Mock 图片分析\n\n",
      "这是在 Mock 演示模式下的模拟图片分析结果。\n\n",
      "**如果是真实大模型，这里会返回：**\n\n",
      "- 📝 图片内容的文字描述\n",
      "- 🔍 物体识别与定位\n",
      "- 📊 图表数据提取\n",
      "- 🎨 色彩与风格分析\n",
      "- 📸 场景理解与推理\n\n",
      "> ⚠️ 当前为 Mock 演示模式，图片分析仅为模拟。\n",
      "> 配置支持 Vision 的大模型 API（如 GPT-4o、Claude 3.5 等）即可获得真实识图能力。\n\n",
      "要接入真实图片识别，推荐使用：\n",
      "- **GPT-4o**（OpenAI）\n",
      "- **DeepSeek-V3**（支持多模态）\n",
      "- **通义千问 VL**（阿里）\n",
      "- **Claude 3.5 Sonnet**（Anthropic）",
    ].join("");
  }

  /* 打招呼 */
  if (
    msg.includes("你好") ||
    msg.includes("hi") ||
    msg.includes("hello") ||
    msg.includes("嗨")
  ) {
    return [
      "你好！👋 我是 **苍城 AI 助手**，很高兴为你服务！\n\n",
      "我目前运行在 **Mock 模式** 下，这是一个本地演示环境。\n\n",
      "我可以帮你：\n",
      "- 💬 **智能对话**：回答各类问题\n",
      "- 🖼️ **图片识别**：上传图片进行识图问答\n",
      "- 💻 **代码专项**：代码解释、纠错、优化\n\n",
      "> ⚠️ 当前为 Mock 演示模式，回复内容是预设的。配置 API Key 后可接入真实大模型。\n\n",
      "有什么我可以帮你的吗？",
    ].join("");
  }

  /* 代码相关 */
  if (
    msg.includes("代码") ||
    msg.includes("code") ||
    msg.includes("function") ||
    msg.includes("react") ||
    msg.includes("bug") ||
    msg.includes("优化") ||
    msg.includes("纠错") ||
    msg.includes("解释") ||
    msg.includes("实现")
  ) {
    return [
      "好的，我来帮你分析这段代码！\n\n",
      "## 🔍 代码分析\n\n",
      "这是一个典型的场景，让我给你一些建议：\n\n",
      "```typescript\n",
      "// 示例：React 组件优化\n",
      "import { memo, useMemo, useCallback } from 'react';\n\n",
      "const MyComponent = memo(function MyComponent({ data }: Props) {\n",
      "  // ✅ 使用 useMemo 缓存计算结果\n",
      "  const processed = useMemo(() => {\n",
      "    return expensiveOperation(data);\n",
      "  }, [data]);\n\n",
      "  // ✅ 使用 useCallback 稳定函数引用\n",
      "  const handleClick = useCallback(() => {\n",
      "    doSomething(processed);\n",
      "  }, [processed]);\n\n",
      "  return <div onClick={handleClick}>{processed}</div>;\n",
      "});\n",
      "```\n\n",
      "## 📋 优化要点\n\n",
      "| 优化项 | 说明 | 效果 |\n",
      "|--------|------|------|\n",
      "| `memo` | 避免不必要的重渲染 | ✅ 减少渲染次数 |\n",
      "| `useMemo` | 缓存计算结果 | ✅ 避免重复计算 |\n",
      "| `useCallback` | 稳定回调引用 | ✅ 配合 memo 生效 |\n\n",
      "> 💡 **提示**：当前为 Mock 模式，接入真实模型后可获得更精准的代码分析。",
    ].join("");
  }

  /* 图片相关 */
  if (
    msg.includes("图片") ||
    msg.includes("image") ||
    msg.includes("照片") ||
    msg.includes("截图")
  ) {
    return [
      "关于图片处理，这里是一些关键要点：\n\n",
      "## 🖼️ 图片处理最佳实践\n\n",
      "1. **上传前压缩**：客户端先压缩再上传，减少带宽消耗\n",
      "   - 使用 Canvas API 进行 resize\n",
      "   - 限制最大尺寸为 2048px\n",
      "   - JPEG 质量设为 0.8\n\n",
      "2. **服务端校验**：\n",
      "   - 检查文件类型（仅允许 image/jpeg, image/png, image/webp）\n",
      "   - 限制文件大小为 10MB\n",
      "   - 校验文件魔数（防止伪造类型）\n\n",
      "3. **Base64 传输 vs URL 传输**：\n",
      "   - Base64 适合小图片（< 1MB）\n",
      "   - 大图片推荐先上传到 OSS 用 URL 传参\n\n",
      "> ⚠️ Mock 模式提示：上传图片功能需要真实大模型 Vision API 支持。",
    ].join("");
  }

  /* 技术问题 */
  if (
    msg.includes("next") ||
    msg.includes("ssr") ||
    msg.includes("服务端") ||
    msg.includes("前端")
  ) {
    return [
      "很好的技术问题！让我来详细解释一下。\n\n",
      "## Next.js 全栈架构核心概念\n\n",
      "### 1. 服务端组件 vs 客户端组件\n\n",
      "```typescript\n",
      "// ✅ 服务端组件（默认）- 在服务器渲染，无 JS 发送到客户端\n",
      "export default async function ServerComponent() {\n",
      "  const data = await fetchData(); // 直接访问数据库\n",
      "  return <div>{data}</div>;\n",
      "}\n\n",
      "// ✅ 客户端组件 - 需要交互时使用\n",
      "\"use client\";\n",
      "export default function ClientComponent() {\n",
      "  const [state, setState] = useState(0);\n",
      "  return <button onClick={() => setState(s => s + 1)}>+1</button>;\n",
      "}\n",
      "```\n\n",
      "### 2. SSR Streaming 原理\n\n",
      "Next.js 通过 React 18 的 Suspense + Streaming SSR：\n",
      "- 先发送 HTML 骨架（静态部分）\n",
      "- 再流式发送动态内容（替代传统 SSR 的等待策略）\n",
      "- TTFB 显著降低，首屏更快\n\n",
      "> 💡 Mock 模式下回答基于预设知识，接入 AI 后可深度讨论具体场景。",
    ].join("");
  }

  /* 默认回复 */
  return [
    "收到你的问题！让我来详细回答。\n\n",
    `关于「**${userMessage.slice(0, 30)}${userMessage.length > 30 ? "..." : ""}**」这个问题：\n\n`,
    "这是一个很好的问题。在 Mock 演示模式下，我给你展示一下 AI 助手的完整回复格式：\n\n",
    "## ✨ 支持的特性\n\n",
    "- **Markdown 渲染**：支持标题、列表、粗体、斜体等格式\n",
    "- **代码高亮**：自动识别语言并语法高亮\n",
    "- **表格展示**：结构化数据清晰呈现\n",
    "- **流式输出**：逐字打印，打字机效果\n\n",
    "```python\n",
    "# 代码块示例\n",
    "def fibonacci(n: int) -> int:\n",
    "    if n <= 1:\n",
    "        return n\n",
    "    return fibonacci(n - 1) + fibonacci(n - 2)\n\n",
    "for i in range(10):\n",
    "    print(f\"fib({i}) = {fibonacci(i)}\")\n",
    "```\n\n",
    "> ⚠️ **Mock 模式提示**：当前未配置 API Key。\n",
    "> 在 `.env.local` 中填入真实 API Key 即可接入大模型获得更智能的回复。\n",
    "> 推荐使用 DeepSeek（deepseek.com），便宜好用，国内直接访问。",
  ].join("");
}

/*
 * 创建 Mock SSE 流
 * 模拟真实大模型的 token-by-token 流式输出
 *
 * 原理：
 *  1. 将完整回复按空格/标点分割成小块（模拟 token）
 *  2. 用异步生成器逐块产出
 *  3. 每块包装成 SSE 格式：data: {...}\n\n
 *  4. 随机延迟 30-80ms → 真实的打字机速度感
 */
export function createMockStream(
  request: ChatRequest
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  const lastUserText = getLastUserText(request);
  const hasImage = hasImages(request);
  const fullResponse = generateMockResponse(lastUserText, hasImage);

  /* 将回复按字符拆成小块，模拟逐 token 输出 */
  const chunks = splitIntoChunks(fullResponse, 3);

  let chunkIndex = 0;

  return new ReadableStream({
    async pull(controller) {
      if (chunkIndex >= chunks.length) {
        /* 发送结束标记 */
        controller.enqueue(
          encoder.encode("data: [DONE]\n\n")
        );
        controller.close();
        return;
      }

      const chunk = chunks[chunkIndex++];

      /* 构造 SSE 格式数据块（与 OpenAI 格式一致） */
      const sseData = {
        id: `mock-${Date.now()}-${chunkIndex}`,
        object: "chat.completion.chunk",
        created: Date.now(),
        model: "mock-model",
        choices: [
          {
            index: 0,
            delta: { content: chunk },
            finish_reason: chunkIndex >= chunks.length ? "stop" : null,
          },
        ],
      };

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(sseData)}\n\n`)
      );

      /* 随机延迟 20-60ms，模拟真实大模型的输出速度 */
      await sleep(20 + Math.random() * 40);
    },
  });
}

/* 将文本按固定字符数分割成数组 */
function splitIntoChunks(text: string, maxChars: number): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    result.push(text.slice(i, i + maxChars));
    i += maxChars;
  }
  return result;
}

/* Promise 封装的延迟 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* 判断是否应该使用 Mock 模式 */
export function shouldUseMock(): boolean {
  const apiKey = process.env.AI_API_KEY;
  return !apiKey || apiKey === "your-api-key-here" || apiKey === "mock";
}