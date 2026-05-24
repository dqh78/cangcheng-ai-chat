"use client";

/*
 * ============================================
 * ClientLayout - 客户端布局包装层
 * 包裹 ErrorBoundary + SessionProvider
 * ============================================
 */

import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ErrorBoundary>{children}</ErrorBoundary>
    </SessionProvider>
  );
}