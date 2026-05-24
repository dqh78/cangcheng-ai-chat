"use client";

/*
 * ============================================
 * Sidebar - 玻璃态可折叠侧边栏
 * 渐变 Logo · 会话列表高亮指示条 · 主题 Toggle · 用户信息
 * ============================================
 */

import { useConversationStore } from "@/store/conversationStore";
import { useThemeStore } from "@/store/themeStore";
import { useUIStore } from "@/store/uiStore";
import { useMemo, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Sparkles,
  Plus,
  Sun,
  Moon,
  Trash2,
  MessageSquare,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function Sidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    loadConversations,
    isHydrated,
  } = useConversationStore();

  // 页面首次加载时从数据库读取会话列表
  useEffect(() => {
    if (!isHydrated) {
      loadConversations();
    }
  }, [isHydrated, loadConversations]);

  const { theme, toggleTheme } = useThemeStore();
  const {
    mobileSidebarOpen,
    setMobileSidebarOpen,
    sidebarCollapsed,
    toggleDesktopSidebar,
  } = useUIStore();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /* 切换会话 */
  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    setMobileSidebarOpen(false);
  };

  /* 新建对话 */
  const handleNewChat = () => {
    createConversation();
    setMobileSidebarOpen(false);
  };

  /* 确认删除 */
  const handleDeleteConfirm = (id: string) => {
    deleteConversation(id);
    setDeleteConfirmId(null);
  };

  /* 格式化时间 */
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [conversations]
  );

  return (
    <>
      {/* 移动端遮罩层 */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 侧边栏主体 */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full flex flex-col
          bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl
          border-r border-border/60
          transition-all duration-300 ease-in-out
          lg:relative
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${sidebarCollapsed ? "lg:w-0 lg:border-r-0 lg:overflow-hidden" : "lg:w-[300px]"}
          ${sidebarCollapsed ? "lg:translate-x-[-320px]" : "lg:translate-x-0"}
        `}
      >
        <div className="w-[300px] flex-shrink-0 h-full flex flex-col">
          {/* 头部区域 - Logo + 新建按钮 */}
          <div className="flex-shrink-0 p-4">
            {/* 品牌 Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                苍城 AI
              </h1>
            </div>

            {/* 新建对话按钮 */}
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                rounded-xl text-base font-medium
                border border-primary/20 bg-primary-50 text-primary
                hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/20
                active:scale-[0.98]
                transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              新建对话
            </button>
          </div>

          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {sortedConversations.length === 0 ? (
              <div className="text-center text-text-tertiary text-[15px] py-12 px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>暂无对话记录</p>
                <p className="text-sm mt-1">点击上方按钮开始新对话</p>
              </div>
            ) : (
              sortedConversations.map((conv) => {
                const isActive = conv.id === currentConversationId;
                const isConfirming = conv.id === deleteConfirmId;

                return (
                  <div
                    key={conv.id}
                    className="relative mb-0.5"
                  >
                    {/* 统一容器 - 不切换 DOM，只切换内部内容，避免焦点跳转 */}
                    <div
                      role="button"
                      tabIndex={isConfirming ? -1 : 0}
                      onClick={() => {
                        if (!isConfirming) handleSelectConversation(conv.id);
                      }}
                      onKeyDown={(e) => {
                        if (isConfirming) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectConversation(conv.id);
                        }
                      }}
                      className={`
                        group w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left
                        transition-colors duration-150 focus:outline-none
                        ${isConfirming
                          ? "bg-primary-50 animate-fade-in cursor-default"
                          : isActive
                            ? "bg-primary-100 text-primary font-medium cursor-pointer"
                            : "text-text-secondary hover:bg-sidebar-hover cursor-pointer"
                        }
                      `}
                    >
                      {isConfirming ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConfirm(conv.id);
                            }}
                            className="flex-1 px-4 py-2 text-sm font-medium text-error
                              rounded-xl border border-error/30 hover:bg-error/5
                              transition-all duration-200 focus:outline-none"
                          >
                            确认删除
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="px-4 py-2 text-sm text-text-secondary
                              hover:text-text-primary transition-colors focus:outline-none"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] truncate">{conv.title}</p>
                            <p className="text-xs text-text-tertiary mt-0.5">
                              {formatTime(new Date(conv.updatedAt).getTime())}
                            </p>
                          </div>

                          {/* 删除按钮（hover 时显示） */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(conv.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1
                              rounded-lg hover:bg-surface-tertiary text-text-tertiary
                              hover:text-error transition-all"
                            title="删除对话"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 底部区域 - 主题切换 + 折叠 + 用户信息 */}
          <div className="flex-shrink-0 p-4 border-t border-border/60">
            <div className="flex items-center justify-between mb-3">
              {/* 主题切换 Toggle */}
              <button
                onClick={toggleTheme}
                className="relative flex items-center gap-2 px-1 py-1 rounded-xl
                  text-text-secondary hover:text-text-primary transition-colors"
                title={theme === "dark" ? "切换到浅色模式" : "切换到暗黑模式"}
              >
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    theme === "dark" ? "bg-primary/30" : "bg-surface-tertiary"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm
                      transition-all duration-200 flex items-center justify-center
                      ${theme === "dark" ? "left-[22px] bg-primary" : "left-0.5"}`}
                  >
                    {theme === "dark" ? (
                      <Moon className="w-2.5 h-2.5 text-white" />
                    ) : (
                      <Sun className="w-2.5 h-2.5 text-primary" />
                    )}
                  </div>
                </div>
              </button>

              {/* 折叠按钮 */}
              <button
                onClick={toggleDesktopSidebar}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary
                  hover:bg-surface-tertiary transition-all duration-200
                  hidden lg:flex items-center justify-center"
                title="折叠侧边栏"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* 用户信息 */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl w-full
                  hover:bg-sidebar-hover transition-colors"
                title={session?.user?.name || "用户"}
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="头像"
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-medium">
                      {(session?.user?.name || "用")[0]}
                    </span>
                  </div>
                )}
                <span className="text-sm text-text-secondary truncate">
                  {session?.user?.name || "用户"}
                </span>
              </button>

              {/* 下拉菜单 */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-surface-secondary
                    border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden
                    animate-scale-in origin-bottom-right">
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {session?.user?.name || "用户"}
                      </p>
                      <p className="text-xs text-text-tertiary truncate">
                        {session?.user?.email || ""}
                      </p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm
                        text-text-secondary hover:bg-surface-secondary transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 桌面端折叠后的展开按钮（浮在左侧） */}
      {sidebarCollapsed && (
        <button
          onClick={toggleDesktopSidebar}
          className="hidden lg:flex fixed top-4 left-4 z-50 w-9 h-9 items-center justify-center
            rounded-xl bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl
            border border-border/60 shadow-md
            text-text-secondary hover:text-primary hover:border-primary/30
            transition-all duration-200"
          title="展开侧边栏"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}
    </>
  );
}