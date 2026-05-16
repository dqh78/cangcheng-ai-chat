"use client";

/*
 * ============================================
 * Home Page - 主页面
 * 职责：组合 Sidebar + ChatArea，处理移动端汉堡菜单
 * 面试考点：客户端组件 vs 服务端组件的拆分原则
 *  - 交互组件（Sidebar、ChatInput、ChatArea）必须是客户端组件
 *  - 本页面因为有 onClick 等事件，也必须是客户端组件
 *  - 静态内容（metadata）在 layout.tsx 服务端组件中定义
 * ============================================
 */

import Sidebar from "@/components/layout/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useUIStore } from "@/store/uiStore";

export default function HomePage() {
  const { toggleMobileSidebar } = useUIStore();

  return (
    <div className="flex h-full overflow-hidden">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区域 */}
      <main className="flex flex-col flex-1 min-w-0 h-full">
        {/* 顶部导航栏（移动端汉堡菜单 + 标题） */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-surface lg:hidden">
          {/* 汉堡菜单按钮 */}
          <button
            onClick={toggleMobileSidebar}
            className="p-2 -ml-2 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
            aria-label="打开菜单"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-text-primary">苍城 AI</h1>
        </header>

        {/* 聊天区域（填满剩余空间） */}
        <ChatArea />
      </main>
    </div>
  );
}