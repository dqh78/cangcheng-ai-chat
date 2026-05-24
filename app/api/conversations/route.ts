import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string;
  if (!userId) throw new Error("未授权");
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(conversations);
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: "新对话",
      },
    });

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
}