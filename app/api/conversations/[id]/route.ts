import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth("获取会话详情", async (userId) => {
    const conversation = await prisma.conversation.findUnique({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!conversation) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }
    return conversation;
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth("更新会话", async (userId) => {
    const body = await request.json();
    return prisma.conversation.update({
      where: { id, userId },
      data: { title: body.title, codeMode: body.codeMode },
    })
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth("删除会话", async (userId) => {
    await prisma.conversation.delete({ where: { id, userId } });
    return { success: true };
  });
}