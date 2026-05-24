import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth("添加消息", async (userId) => {
    const body = await request.json();
    const conversation = await prisma.conversation.findUnique({
      where: { id, userId },
    });
    if (!conversation) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

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

    return message;
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth("更新消息", async (userId) => {
    const body = await request.json();
    const conversation = await prisma.conversation.findUnique({
      where: { id, userId },
    });
    if (!conversation) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    return prisma.message.update({
      where: { id: body.messageId },
      data: {
        content: body.content,
        isStreaming: body.isStreaming,
        isError: body.isError,
        errorMessage: body.errorMessage,
      },
    });
  });
}