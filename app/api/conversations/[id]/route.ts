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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserId();

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

    return NextResponse.json(conversation);
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
    const body = await request.json();

    const conversation = await prisma.conversation.update({
      where: { id, userId },
      data: {
        title: body.title,
        codeMode: body.codeMode,
      },
    });

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserId();

    await prisma.conversation.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
}