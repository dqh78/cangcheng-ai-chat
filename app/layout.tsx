/*
 * ============================================
 * RootLayout - 根布局组件
 * 职责：HTML 骨架、字体加载、主题 class 绑定、全局布局结构
 * 面试考点：Next.js App Router 的 layout.tsx 工作原理
 *  - layout 是服务端组件，嵌套 layout 会自动包裹子 page
 *  - metadata 在服务端渲染时注入 <head>
 * ============================================
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeScript } from "@/components/layout/ThemeScript";
import ClientLayout from "@/components/layout/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "苍城 AI - 多模态智能对话助手",
  description:
    "一款支持多轮对话、图片识别、代码优化的 AI 智能助手，基于 Next.js 全栈架构",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      /* suppressHydrationWarning 防止主题 class 导致的水合警告 */
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        {/* 内联脚本：在 HTML 解析前设置主题，避免 FOUC */}
        <ThemeScript />
      </head>
      <body className="h-full bg-surface text-text-primary antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}