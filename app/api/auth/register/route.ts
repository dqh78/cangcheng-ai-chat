import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确").optional().or(z.literal("")),
  password: z.string().min(6),
  name: z.string().optional(),
}).refine(
  (data) => data.email || data.phone,
  { message: "邮箱和手机号至少填写一个" }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "验证失败", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { email, phone, password, name } = validated.data;

    // 检查邮箱是否已存在
    if (email) {
      const emailUser = await prisma.user.findUnique({
        where: { email },
      });
      if (emailUser) {
        return NextResponse.json(
          { error: "该邮箱已被注册" },
          { status: 409 }
        );
      }
    }

    // 检查手机号是否已存在
    if (phone) {
      const phoneUser = await prisma.user.findUnique({
        where: { phone },
      });
      if (phoneUser) {
        return NextResponse.json(
          { error: "该手机号已被注册" },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        name: name || "用户",
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, phone: user.phone, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    );
  }
}