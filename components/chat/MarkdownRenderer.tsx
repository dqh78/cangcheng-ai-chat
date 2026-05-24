"use client";

/*
 * ============================================
 * MarkdownRenderer - Markdown 渲染组件
 * 基于 react-markdown + remark-gfm
 * 代码块使用 react-syntax-highlighter 高亮
 * 适配科技蓝紫主题
 * ============================================
 */

import { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/* 代码块组件 */
const CodeBlock = memo(function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 忽略复制失败 */
    }
  };

  return (
    <div className="group relative my-3 rounded-xl overflow-hidden border border-border shadow-sm">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-tertiary border-b border-border">
        <span className="text-xs text-text-tertiary font-mono">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-text-tertiary
            hover:text-primary rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              复制
            </>
          )}
        </button>
      </div>

      {/* 代码高亮区域 */}
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.6",
        }}
        showLineNumbers={value.split("\n").length > 3}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`prose max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          /* 自定义代码块渲染 */
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const value = String(children).replace(/\n$/, "");

            /* 行内代码 */
            if (!match) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-surface-tertiary text-sm font-mono text-primary"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            /* 代码块 */
            return <CodeBlock language={match[1]} value={value} />;
          },

          /* 链接在新窗口打开 */
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },

          /* 表格样式 */
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-border">
                <table className="min-w-full border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border-b border-border px-3 py-2 bg-surface-secondary text-left text-sm font-medium">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border-b border-border px-3 py-2 text-sm">
                {children}
              </td>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}