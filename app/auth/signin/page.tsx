"use client";

/*
 * ============================================
 * SignInPage - 苍城 AI 登录/注册页
 * 暖橙品牌色 · 极简主义 · 精致微交互
 * ============================================
 */

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignInPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (isRegistering) {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail || undefined,
          phone: registerPhone || undefined,
          password,
          name: registerName,
        }),
      });

      if (response.ok) {
        const loginAccount = registerPhone || registerEmail;
        const result = await signIn("credentials", {
          account: loginAccount,
          password,
          redirect: false,
        });
        if (result?.ok) {
          router.push("/");
        } else {
          setError(result?.error || "登录失败");
        }
      } else {
        const data = await response.json();
        setError(data.error || "注册失败");
      }
    } else {
      const result = await signIn("credentials", {
        account,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱/手机号或密码错误");
      } else {
        router.push("/");
      }
    }
    setIsLoading(false);
  };

  const handleGitHubLogin = () => {
    signIn("github", { callbackUrl: "/" });
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setAccount("");
    setPassword("");
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPhone("");
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* 左侧品牌区域 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/5">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent-blue/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center justify-center w-full px-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1
            className="text-3xl font-semibold text-text-primary mb-3 font-heading tracking-tight"
          >
            苍城 AI
          </h1>
          <p className="text-text-secondary text-lg mb-2">高端智能对话系统</p>
          <p className="text-text-tertiary text-sm">
            多轮对话 · 图片识别 · 代码优化
          </p>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* 移动端 Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-text-primary font-heading tracking-tight">
              苍城 AI
            </h1>
          </div>

          {/* 标题 */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary font-heading tracking-tight">
              {isRegistering ? "创建账户" : "欢迎回来"}
            </h2>
            <p className="text-text-secondary mt-1.5 text-sm">
              {isRegistering
                ? "填写信息创建新账户"
                : "登录你的苍城 AI 账户"}
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering ? (
              <>
                {/* 注册 - 昵称 */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    昵称
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-secondary border border-border
                        rounded-xl text-text-primary placeholder:text-text-tertiary text-sm
                        focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5
                        transition-all duration-200"
                      placeholder="请输入昵称"
                    />
                  </div>
                </div>

                {/* 注册 - 手机号 */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    手机号
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-secondary border border-border
                        rounded-xl text-text-primary placeholder:text-text-tertiary text-sm
                        focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5
                        transition-all duration-200"
                      placeholder="请输入手机号（可选）"
                    />
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-text-tertiary">或</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* 注册 - 邮箱 */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-secondary border border-border
                        rounded-xl text-text-primary placeholder:text-text-tertiary text-sm
                        focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5
                        transition-all duration-200"
                      placeholder="请输入邮箱（可选）"
                    />
                  </div>
                </div>
                <p className="text-xs text-text-tertiary">手机号和邮箱至少填写一个</p>
              </>
            ) : (
              /* 登录 - 邮箱/手机号 */
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  邮箱 / 手机号
                </label>
                <div className="relative">
                  {account.includes("@") ? (
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  ) : (
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  )}
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-secondary border border-border
                      rounded-xl text-text-primary placeholder:text-text-tertiary text-sm
                      focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5
                      transition-all duration-200"
                    placeholder="请输入邮箱或手机号"
                    required
                  />
                </div>
              </div>
            )}

            {/* 密码 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-surface-secondary border border-border
                    rounded-xl text-text-primary placeholder:text-text-tertiary text-sm
                    focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5
                    transition-all duration-200"
                  placeholder="请输入密码（至少6位）"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary
                    hover:text-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-error/5 text-error text-sm px-4 py-3 rounded-xl border border-error/15">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4
                bg-primary text-white rounded-xl text-sm font-medium
                hover:bg-primary-dark hover:shadow-md
                active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none
                transition-all duration-200 shadow-sm font-heading"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  处理中...
                </>
              ) : isRegistering ? (
                "注册"
              ) : (
                <>
                  登录
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* GitHub 登录 */}
          {!isRegistering && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-tertiary whitespace-nowrap">
                  其他登录方式
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                onClick={handleGitHubLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4
                  bg-surface-secondary border border-border rounded-xl
                  text-text-secondary hover:text-text-primary hover:border-text-tertiary
                  transition-all duration-200 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub 登录
              </button>
            </>
          )}

          {/* 切换模式 */}
          <p className="text-center mt-8 text-sm text-text-secondary">
            {isRegistering ? "已有账户？" : "没有账户？"}
            <button
              onClick={switchMode}
              className="ml-1 text-primary hover:text-primary-dark font-medium transition-colors"
            >
              {isRegistering ? "立即登录" : "立即注册"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}