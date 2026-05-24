"use client";

/*
 * ============================================
 * Home Page - 主页面
 * 职责：组合 Sidebar + ChatArea，处理侧边栏折叠和移动端汉堡菜单
 * ============================================
 */

import Sidebar from "@/components/layout/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useUIStore } from "@/store/uiStore";
import { Sparkles, Menu } from "lucide-react";

export default function HomePage() {
  const { toggleMobileSidebar } = useUIStore();

  return (
    <div className="flex h-full overflow-hidden bg-surface">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区域 */}
      <main className="flex flex-col flex-1 min-w-0 h-full">
        {/* 顶部导航栏（移动端汉堡菜单 + 标题） */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 lg:hidden">
          {/* 汉堡菜单按钮 */}
          <button
            onClick={toggleMobileSidebar}
            className="p-2 -ml-2 rounded-xl text-text-secondary hover:bg-surface-secondary transition-colors"
            aria-label="打开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-base font-semibold text-text-primary">
              苍城 AI
            </h1>
          </div>
        </header>

        {/* 聊天区域（填满剩余空间） */}
        <ChatArea />
      </main>
    </div>
  );
}