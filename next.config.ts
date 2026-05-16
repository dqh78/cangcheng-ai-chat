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
  // Turbopack 配置（处理某类包无法被外部化的问题）
  turbopack: {},
};

export default nextConfig;