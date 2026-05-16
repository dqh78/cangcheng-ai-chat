/*
 * ============================================
 * themeStore - 主题状态管理
 * 职责：管理暗黑/浅色主题切换、localStorage 持久化
 * ============================================
 */

import { create } from "zustand";
import type { Theme } from "@/types";

interface ThemeState {
  /* 当前主题 */
  theme: Theme;
  /* 是否已挂载（防止 SSR 闪烁） */
  isMounted: boolean;
  /* 切换主题 */
  toggleTheme: () => void;
  /* 设置主题 */
  setTheme: (theme: Theme) => void;
  /* 标记挂载完成 */
  setMounted: () => void;
}

const STORAGE_KEY = "ai-chat-theme";

/* 读取本地存储的主题偏好 */
function getSavedTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* 忽略 */
  }
  // 跟随系统偏好
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/* 应用主题到 DOM */
function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/* 保存主题偏好 */
function saveTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* 忽略 */
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  isMounted: false,

  toggleTheme: () => {
    set((state) => {
      const newTheme: Theme = state.theme === "light" ? "dark" : "light";
      applyTheme(newTheme);
      saveTheme(newTheme);
      return { theme: newTheme };
    });
  },

  setTheme: (theme) => {
    applyTheme(theme);
    saveTheme(theme);
    set({ theme });
  },

  setMounted: () => set({ isMounted: true }),
}));

/* 初始化：客户端加载主题 */
if (typeof window !== "undefined") {
  const savedTheme = getSavedTheme();
  useThemeStore.setState({ theme: savedTheme, isMounted: true });
  applyTheme(savedTheme);
}