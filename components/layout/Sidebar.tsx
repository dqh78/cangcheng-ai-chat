"use client";

/*
 * ============================================
 * Sidebar - 侧边栏组件
 * 展示会话列表、新建对话按钮、主题切换
 * ============================================
 */

import { useConversationStore } from "@/store/conversationStore";
import { useThemeStore } from "@/store/themeStore";
import { useUIStore } from "@/store/uiStore";
import { useChatStore } from "@/store/chatStore";
import { useMemo, useState } from "react";

export default function Sidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    setCurrentConversation,
  } = useConversationStore();

  const { theme, toggleTheme } = useThemeStore();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /* 切换会话：加载目标会话消息 */
  const handleSelectConversation = (id: string) => {
    /* 注：消息已由 useChat.sendMessage 实时持久化，此处无需重复保存 */

    /* 切换会话 ID */
    setCurrentConversation(id);

    /* 加载目标会话的消息 */
    const { conversations } = useConversationStore.getState();
    const targetConv = conversations.find((c) => c.id === id);
    if (targetConv) {
      useChatStore.getState().setMessages(targetConv.messages);
    } else {
      useChatStore.getState().clearMessages();
    }

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

  /* 格式化时间为简洁显示 */
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
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations]
  );

  return (
    <>
      {/* 移动端遮罩层 */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 侧边栏主体 */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-72 flex flex-col
          bg-sidebar border-r border-border
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* 头部区域 - Logo + 新建按钮 */}
        <div className="flex-shrink-0 p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-text-primary">
              🏯 苍城 AI
            </h1>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
              bg-primary text-white rounded-lg text-sm font-medium
              hover:bg-primary-dark active:scale-[0.98]
              transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            新建对话
          </button>
        </div>

        {/* 会话列表 */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {sortedConversations.length === 0 ? (
            <div className="text-center text-text-tertiary text-sm py-8">
              暂无对话记录
              <br />
              点击上方按钮开始新对话
            </div>
          ) : (
            sortedConversations.map((conv) => {
              const isActive = conv.id === currentConversationId;
              const isConfirming = conv.id === deleteConfirmId;

              return (
                <div key={conv.id} className="group relative mb-0.5 animate-fade-in transition-all duration-300">
                  {isConfirming ? (
                    /* 删除确认状态 */
                    <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-error/10 border border-error/30">
                      <span className="flex-1 text-xs text-error truncate">
                        确认删除？
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConfirm(conv.id);
                        }}
                        className="px-2 py-0.5 text-xs font-medium text-white bg-error rounded
                          hover:bg-error/80 transition-colors"
                      >
                        删除
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-0.5 text-xs text-text-secondary rounded
                          hover:bg-surface-tertiary transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    /* 正常会话项（用 div+role 避免 button 内嵌 button 的 HTML 错误） */
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectConversation(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectConversation(conv.id);
                        }
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left
                        transition-all duration-150 cursor-pointer
                        ${isActive
                          ? "bg-sidebar-active text-primary font-medium"
                          : "text-text-secondary hover:bg-sidebar-hover"
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{conv.title}</p>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {formatTime(conv.updatedAt)}
                        </p>
                      </div>

                      {/* 删除按钮（hover 时显示） */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1
                          rounded hover:bg-surface-tertiary text-text-tertiary
                          hover:text-error transition-all"
                        title="删除对话"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 底部区域 - 主题切换 + 用户信息 */}
        <div className="flex-shrink-0 p-4 border-t border-border">
          <div className="flex items-center justify-between">
            {/* 主题切换按钮 */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-lg
                text-text-secondary hover:bg-sidebar-hover transition-colors"
              title={theme === "dark" ? "切换到浅色模式" : "切换到暗黑模式"}
            >
              {theme === "dark" ? (
                /* 太阳图标 */
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                /* 月亮图标 */
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
              <span className="text-sm">{theme === "dark" ? "浅色" : "暗黑"}</span>
            </button>

            {/* 用户头像占位 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs text-primary font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}