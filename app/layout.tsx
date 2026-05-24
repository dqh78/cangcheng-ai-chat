/*
 * ============================================
 * RootLayout - 根布局组件
 * 字体使用 next/font/google 自托管（解决国内 CDN 被墙问题）
 * ============================================
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeScript } from "@/components/layout/ThemeScript";
import ClientLayout from "@/components/layout/ClientLayout";
import "./globals.css";

/* Inter - 现代无衬线 UI 字体（自托管） */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "苍城 AI - 智能对话助手",
  description:
    "苍城 AI — 高端智能对话系统，支持多轮对话、图片识别、代码优化",
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
      className={`h-full ${inter.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="h-full bg-surface text-text-primary antialiased font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}