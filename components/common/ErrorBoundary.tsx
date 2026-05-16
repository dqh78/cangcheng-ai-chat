"use client";

/*
 * ============================================
 * ErrorBoundary - React 错误边界
 * 捕获子树渲染错误，展示降级 UI + 重试按钮
 *
 * 面试考点：
 *  1. Error Boundary 只能捕获渲染期错误，不能捕获：
 *     - 事件处理函数中的错误（需 try/catch）
 *     - 异步代码错误（需 Promise.catch）
 *     - 服务端错误
 *  2. getDerivedStateFromError → 更新 state 触发降级 UI
 *  3. componentDidCatch → 上报错误日志
 * ============================================
 */

import { Component, type ReactNode } from "react";

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
          <div className="text-4xl mb-4">😵</div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            页面渲染出错
          </h2>
          <p className="text-sm text-text-secondary mb-4 max-w-md">
            {this.state.error?.message || "发生了未知错误"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm
              hover:bg-primary-dark transition-colors"
          >
            重新加载页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}