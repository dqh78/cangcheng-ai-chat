"use client";

/*
 * ============================================
 * Skeleton - 骨架屏组件
 * 用于首次加载和异步数据等待时的占位 UI
 * 适配科技蓝紫设计语言
 * ============================================
 */

interface SkeletonProps {
  className?: string;
}

/* 矩形骨架块 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-tertiary rounded-xl ${className}`}
    />
  );
}

/* 文本行骨架 */
export function SkeletonLine({
  width = "100%",
}: {
  width?: string;
}) {
  return (
    <div
      className="animate-pulse bg-surface-tertiary rounded-md h-4"
      style={{ width }}
    />
  );
}

/* 聊天消息骨架屏（模拟加载中的对话） */
export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      {/* 模拟用户消息 */}
      <div className="flex justify-end">
        <div className="w-3/4 max-w-md">
          <SkeletonLine width="80%" />
          <div className="mt-1">
            <SkeletonLine width="60%" />
          </div>
        </div>
      </div>
      {/* 模拟 AI 回复 */}
      <div className="flex justify-start">
        <div className="w-full max-w-2xl space-y-2.5">
          <SkeletonLine width="90%" />
          <SkeletonLine width="75%" />
          <SkeletonLine width="85%" />
          <SkeletonLine width="40%" />
        </div>
      </div>
      {/* 模拟第二条 AI 回复 */}
      <div className="flex justify-start">
        <div className="w-full max-w-2xl space-y-2.5">
          <SkeletonLine width="70%" />
          <SkeletonLine width="45%" />
        </div>
      </div>
    </div>
  );
}

/* 侧边栏骨架屏 */
export function SidebarSkeleton() {
  return (
    <div className="space-y-2 px-2 py-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}