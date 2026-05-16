"use client";

/*
 * ============================================
 * MarkdownRenderer - Markdown 渲染组件
 * 基于 react-markdown + remark-gfm（表格/删除线等）
 * 代码块使用 react-syntax-highlighter 高亮
 *
 * 面试考点：
 *  1. react-markdown：将 Markdown 字符串渲染为 React 组件
 *  2. remark-gfm 插件：支持 GitHub Flavored Markdown（表格、任务列表等）
 *  3. react-syntax-highlighter：基于 Prism.js 的代码语法高亮
 *  4. 自定义组件覆写：通过 components prop 定制代码块渲染
 * ============================================
 */

import { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/* 代码块组件（提取为独立组件以使用 memo） */
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
    <div className="group relative my-3 rounded-xl overflow-hidden border border-border">
      {/* 顶部工具栏：语言标签 + 复制按钮 */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-tertiary border-b border-border">
        <span className="text-xs text-text-tertiary font-mono">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-text-tertiary
            hover:text-text-secondary rounded transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
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
    <div className={`prose-sm max-w-none ${className}`}>
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
              <div className="overflow-x-auto my-3">
                <table className="min-w-full border-collapse border border-border rounded-lg">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-border px-3 py-2 bg-surface-secondary text-left text-sm font-medium">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-border px-3 py-2 text-sm">
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