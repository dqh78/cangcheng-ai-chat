/*
 * ============================================
 * uiStore - 全局 UI 状态管理
 * 职责：管理侧边栏展开/收起、全局加载、Toast 消息、错误状态
 * ============================================
 */

import { create } from "zustand";
import type { Toast } from "@/types";

interface UIState {
  /* 侧边栏是否展开（桌面端） */
  sidebarOpen: boolean;
  /* 移动端侧边栏是否展开 */
  mobileSidebarOpen: boolean;
  /* Toast 消息队列 */
  toasts: Toast[];
  /* 全局错误信息 */
  globalError: string | null;

  /* 切换桌面端侧边栏 */
  toggleSidebar: () => void;
  /* 设置侧边栏状态 */
  setSidebarOpen: (open: boolean) => void;
  /* 切换移动端侧边栏 */
  toggleMobileSidebar: () => void;
  /* 设置移动端侧边栏 */
  setMobileSidebarOpen: (open: boolean) => void;
  /* 显示 Toast */
  showToast: (type: Toast["type"], message: string, duration?: number) => void;
  /* 移除 Toast */
  removeToast: (id: string) => void;
  /* 设置全局错误 */
  setGlobalError: (error: string | null) => void;
}

/* 生成 Toast ID */
function generateToastId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  toasts: [],
  globalError: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  showToast: (type, message, duration = 3000) => {
    const id = generateToastId();
    const toast: Toast = { id, type, message, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    // 自动消失
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setGlobalError: (error) => set({ globalError: error }),
}));