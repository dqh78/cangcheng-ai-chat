/*
 * ============================================
 * ThemeScript - 主题初始化内联脚本
 * 目的：在 <html> 渲染前注入脚本，避免暗黑模式 FOUC 闪烁
 * 面试考点：SSR 场景下如何避免主题切换闪烁（hydration mismatch）
 * ============================================
 */

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('ai-chat-theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}