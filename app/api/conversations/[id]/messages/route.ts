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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserId();

    const conversation = await prisma.conversation.findUnique({
      where: { id, userId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    const body = await request.json();

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        role: body.role,
        content: body.content,
        contents: body.contents,
        isStreaming: body.isStreaming || false,
        isError: body.isError || false,
        errorMessage: body.errorMessage,
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserId();

    // 验证用户对会话的所有权
    const conversation = await prisma.conversation.findUnique({
      where: { id, userId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    const body = await request.json();

    const message = await prisma.message.update({
      where: { id: body.messageId },
      data: {
        content: body.content,
        isStreaming: body.isStreaming,
        isError: body.isError,
        errorMessage: body.errorMessage,
      },
    });

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
}