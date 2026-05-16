import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许加载外部图片域名（用于大模型返回的图片链接）
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // 服务端运行时配置
  serverExternalPackages: ["react-syntax-highlighter"],
};

export default nextConfig;