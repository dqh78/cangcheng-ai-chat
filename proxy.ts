import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // 未登录用户重定向到登录页
  if (!token && pathname !== "/auth/signin") {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 已登录用户访问登录页，跳转到首页
  if (token && pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除：
     * - API 路由
     * - 静态文件
     * - Next.js 内部文件
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};