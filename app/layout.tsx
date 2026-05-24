/*
 * ============================================
 * RootLayout - 根布局组件
 * 职责：HTML 骨架、字体加载、主题 class 绑定、全局布局结构、认证保护
 * ============================================
 */

import type { Metadata } from "next";
import { ThemeScript } from "@/components/layout/ThemeScript";
import ClientLayout from "@/components/layout/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "苍城 AI - 多模态智能对话助手",
  description:
    "一款支持多轮对话、图片识别、代码优化的 AI 智能助手，基于 Next.js 全栈架构",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className="h-full"
    >
      <head>
        <ThemeScript />
      </head>
      <body className="h-full bg-surface text-text-primary antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}