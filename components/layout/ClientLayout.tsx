"use client";

/*
 * ============================================
 * ClientLayout - 客户端布局包装层
 * 包裹 ErrorBoundary，处理 Zustand hydration
 * ============================================
 */

import ErrorBoundary from "@/components/common/ErrorBoundary";
import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}