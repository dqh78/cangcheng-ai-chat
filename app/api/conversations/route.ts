import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth("获取会话列表", (userId) =>
    prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    })
  );
}

export async function POST(request: NextRequest) {
  return withAuth("创建会话", (userId) =>
    prisma.conversation.create({
      data: {
        userId,
        title: "新对话",
      },
    })
  );
}