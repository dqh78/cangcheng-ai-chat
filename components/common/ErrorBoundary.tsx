"use client";

/*
 * ============================================
 * ErrorBoundary - React 错误边界
 * 捕获子树渲染错误，展示降级 UI + 重试按钮
 * 适配科技蓝紫设计语言
 * ============================================
 */

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] 捕获到渲染错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-14 h-14 mb-5 rounded-2xl bg-error/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-error" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            页面渲染出错
          </h2>
          <p className="text-sm text-text-secondary mb-6 max-w-md">
            {this.state.error?.message || "发生了未知错误"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-gradient-to-br from-primary to-accent text-white text-sm font-medium
              hover:brightness-110 hover:shadow-md hover:shadow-primary/20
              transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            重新加载页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}