# AI 聊天应用上线方案

## 一、需求分析

### 当前状态

* ✅ 已实现：AI 聊天功能（支持流式回复）、多模态图片上传、主题切换

* ❌ 缺失：用户认证系统、服务器端数据持久化、会话共享

### 目标状态

* 🔧 用户注册/登录系统

* 🔧 会话数据存储到数据库（而非 localStorage）

* 🔧 支持多用户访问

* 🔧 支持跨设备同步聊天记录

***

## 二、技术方案

### 2.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  用户认证   │  │   聊天界面   │  │    会话管理         │  │
│  │  (NextAuth) │  │   (ChatUI)   │  │  (Conversation)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ API Routes
┌─────────────────────────▼───────────────────────────────────┐
│                        服务层 (Next.js API)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  auth/[...nextauth]  │  │   api/chat           │  │   api/conversations │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼───────────────────────────────────┐
│                        数据层 (PostgreSQL)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   User      │  │ Conversation│  │    Message          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心依赖

| 依赖               | 版本    | 用途                  |
| ---------------- | ----- | ------------------- |
| `next-auth`      | ^4.24 | 用户认证（支持邮箱/密码、OAuth） |
| `prisma`         | ^5.14 | 数据库 ORM             |
| `@prisma/client` | ^5.14 | Prisma 客户端          |
| `bcrypt`         | ^5.1  | 密码加密                |
| `zod`            | ^3.23 | 数据验证                |

### 2.3 数据库选型

**选择 PostgreSQL 的原因**：

| 考量维度        | PostgreSQL                        | 其他选项对比                         |
| ----------- | --------------------------------- | ------------------------------ |
| **成熟度**     | 30+ 年历史，稳定可靠，企业级应用广泛              | MySQL 较年轻，SQLite 适合轻量级         |
| **功能特性**    | 支持 JSON 类型存储（用于多模态消息内容）、全文搜索、数组类型 | MySQL 5.7+ 支持 JSON，但功能不如 PG 完善 |
| **扩展性**     | 支持水平扩展、读写分离、分区表                   | SQLite 不支持并发写入，不适合生产环境         |
| **生态支持**    | Prisma ORM 原生支持，Vercel 等平台内置支持    | MySQL 需要额外配置                   |
| **全文搜索**    | 内置全文索引，支持中文分词扩展                   | MySQL 全文搜索功能有限                 |
| **JSON 支持** | `jsonb` 类型支持索引，查询性能优秀             | MySQL JSON 类型索引能力较弱            |
| **事务支持**    | 完全 ACID 兼容，支持复杂事务                 | SQLite 单文件锁，不适合高并发             |

**为何不选择其他数据库**：

* **SQLite**：适合开发/测试环境，但不支持高并发写入，不适合生产环境多用户场景

* **MySQL**：功能足够，但 JSON 支持和全文搜索不如 PostgreSQL 强大

* **MongoDB**：NoSQL 数据库，事务支持较弱，不适合需要复杂关联查询的会话消息场景

**总结**：PostgreSQL 是本项目的最佳选择，因为：

1. 消息数据需要存储 JSON 格式的结构化内容（多模态支持）
2. 需要支持多用户并发访问
3. Prisma ORM 提供完美的 PostgreSQL 支持
4. Vercel 等主流平台提供一键部署支持

#### 2.4 数据库设计

##### User（用户表）

| 字段        | 类型       | 说明     |
| --------- | -------- | ------ |
| id        | UUID     | 主键     |
| email     | String   | 邮箱（唯一） |
| password  | String   | 加密后的密码 |
| name      | String   | 用户昵称   |
| createdAt | DateTime | 创建时间   |
| updatedAt | DateTime | 更新时间   |

#### Conversation（会话表）

| 字段        | 类型       | 说明       |
| --------- | -------- | -------- |
| id        | UUID     | 主键       |
| userId    | UUID     | 关联用户     |
| title     | String   | 会话标题     |
| codeMode  | String   | 代码模式（可选） |
| createdAt | DateTime | 创建时间     |
| updatedAt | DateTime | 更新时间     |

#### Message（消息表）

| 字段             | 类型       | 说明                    |
| -------------- | -------- | --------------------- |
| id             | UUID     | 主键                    |
| conversationId | UUID     | 关联会话                  |
| role           | String   | user/assistant/system |
| content        | String   | 消息内容                  |
| contents       | Json     | 结构化内容（多模态）            |
| isStreaming    | Boolean  | 是否流式输出中               |
| isError        | Boolean  | 是否错误消息                |
| errorMessage   | String   | 错误信息                  |
| createdAt      | DateTime | 创建时间                  |

***

## 三、实施步骤

### 步骤 1：安装依赖

```bash
npm install next-auth @prisma/client bcrypt zod
npm install -D prisma @types/bcrypt
```

### 步骤 2：初始化 Prisma

```bash
npx prisma init
```

### 步骤 3：配置数据库连接

**文件**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String       @id @default(uuid())
  email         String       @unique
  password      String
  name          String       @default("用户")
  conversations Conversation[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Conversation {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String    @default("新对话")
  codeMode  String?
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id              String    @id @default(uuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role            String
  content         String
  contents        Json?
  isStreaming     Boolean   @default(false)
  isError         Boolean   @default(false)
  errorMessage    String?
  createdAt       DateTime  @default(now())
}
```

### 步骤 4：配置环境变量

**文件**: `.env.local`

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/ai_chat_db"

# NextAuth 密钥（用于加密 Session）
NEXTAUTH_SECRET="your-secret-key-here-32-characters-minimum"
NEXTAUTH_URL="http://localhost:3000"

# AI API 配置（保持原有配置）
AI_API_KEY=sk-e9c17c20930e43a3aa32628ca7f427fa
AI_API_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat

# 应用配置
NEXT_PUBLIC_APP_NAME=苍城 AI 助手
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 步骤 5：创建认证 API

**文件**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
});
```

### 步骤 6：创建注册 API

**文件**: `app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "验证失败", details: validated.error.errors },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validated.data.email,
        password: hashedPassword,
        name: validated.data.name || "用户",
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    );
  }
}
```

### 步骤 7：创建会话管理 API

**文件**: `app/api/conversations/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getServerSession(auth);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  return NextResponse.json(conversations);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(auth);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: "新对话",
    },
  });

  return NextResponse.json(conversation);
}
```

**文件**: `app/api/conversations/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(auth);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id, userId: user.id },
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
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(auth);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const body = await request.json();

  const conversation = await prisma.conversation.update({
    where: { id: params.id, userId: user.id },
    data: {
      title: body.title,
      codeMode: body.codeMode,
    },
  });

  return NextResponse.json(conversation);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(auth);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  await prisma.conversation.delete({
    where: { id: params.id, userId: user.id },
  });

  return NextResponse.json({ success: true });
}
```

### 步骤 8：创建消息管理 API

**文件**: `app/api/conversations/[id]/messages/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(auth);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id, userId: user.id },
  });

  if (!conversation) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }

  const body = await request.json();

  const message = await prisma.message.create({
    data: {
      conversationId: params.id,
      role: body.role,
      content: body.content,
      contents: body.contents,
      isStreaming: body.isStreaming || false,
      isError: body.isError || false,
      errorMessage: body.errorMessage,
    },
  });

  await prisma.conversation.update({
    where: { id: params.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(message);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(auth);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
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
}
```

### 步骤 9：创建认证页面

**文件**: `app/auth/signin/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: registerName }),
      });

      if (response.ok) {
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.error || "注册失败");
      }
    } else {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isRegistering ? "注册" : "登录"}
          </h1>
          <p className="text-gray-500">
            {isRegistering ? "创建新账户" : "欢迎回来"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                昵称
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="请输入昵称"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="请输入密码"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition font-medium"
          >
            {isRegistering ? "注册" : "登录"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isRegistering
              ? "已有账户？立即登录"
              : "没有账户？立即注册"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 步骤 10：修改布局组件添加认证保护

**文件**: `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "苍城 AI 助手",
  description: "AI 多模态智能对话助手",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(auth);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 步骤 11：创建会话存储服务（替换 localStorage）

**文件**: `lib/conversation-service.ts`

```typescript
import type { Conversation, Message } from "@prisma/client";

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/conversations");
  if (!response.ok) {
    throw new Error("获取会话列表失败");
  }
  return response.json();
}

export async function createConversation(): Promise<Conversation> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("创建会话失败");
  }
  return response.json();
}

export async function fetchConversation(
  id: string
): Promise<Conversation & { messages: Message[] }> {
  const response = await fetch(`/api/conversations/${id}`);
  if (!response.ok) {
    throw new Error("获取会话详情失败");
  }
  return response.json();
}

export async function updateConversation(
  id: string,
  data: { title?: string; codeMode?: string }
): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("更新会话失败");
  }
  return response.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("删除会话失败");
  }
}

export async function addMessage(
  conversationId: string,
  message: Omit<Message, "id" | "createdAt" | "conversationId">
): Promise<Message> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    throw new Error("添加消息失败");
  }
  return response.json();
}

export async function updateMessage(
  conversationId: string,
  messageId: string,
  data: Partial<Message>
): Promise<Message> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId, ...data }),
  });
  if (!response.ok) {
    throw new Error("更新消息失败");
  }
  return response.json();
}
```

### 步骤 12：更新会话状态管理

**文件**: `store/conversationStore.ts`

```typescript
import { create } from "zustand";
import type { Conversation, Message } from "@prisma/client";
import { useChatStore } from "@/store/chatStore";
import * as conversationService from "@/lib/conversation-service";

interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isHydrated: boolean;
  isLoading: boolean;

  getCurrentConversation: () => Conversation | null;
  loadConversations: () => Promise<void>;
  createConversation: () => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  setCurrentConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  updateConversationMessages: (id: string, messages: Message[]) => Promise<void>;
  setHydrated: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isHydrated: false,
  isLoading: false,

  getCurrentConversation: () => {
    const { conversations, currentConversationId } = get();
    return conversations.find((c) => c.id === currentConversationId) || null;
  },

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const conversations = await conversationService.fetchConversations();
      set({
        conversations,
        currentConversationId: conversations[0]?.id || null,
        isLoading: false,
        isHydrated: true,
      });

      if (conversations[0]) {
        const detail = await conversationService.fetchConversation(
          conversations[0].id
        );
        useChatStore.getState().setMessages(detail.messages);
      }
    } catch (error) {
      console.error("加载会话失败:", error);
      set({ isLoading: false, isHydrated: true });
    }
  },

  createConversation: async () => {
    const conversation = await conversationService.createConversation();
    useChatStore.getState().clearMessages();
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversationId: conversation.id,
    }));
    return conversation.id;
  },

  deleteConversation: async (id) => {
    await conversationService.deleteConversation(id);
    set((state) => {
      const newConversations = state.conversations.filter((c) => c.id !== id);
      const isDeletingCurrent = state.currentConversationId === id;
      const newCurrentId = isDeletingCurrent
        ? newConversations[0]?.id || null
        : state.currentConversationId;

      if (isDeletingCurrent) {
        if (newCurrentId) {
          conversationService
            .fetchConversation(newCurrentId)
            .then((detail) => {
              useChatStore.getState().setMessages(detail.messages);
            });
        } else {
          useChatStore.getState().clearMessages();
        }
      }

      return {
        conversations: newConversations,
        currentConversationId: newCurrentId,
      };
    });
  },

  setCurrentConversation: async (id) => {
    if (!id) {
      set({ currentConversationId: null });
      useChatStore.getState().clearMessages();
      return;
    }

    set({ currentConversationId: id });
    const conversation = await conversationService.fetchConversation(id);
    useChatStore.getState().setMessages(conversation.messages);
  },

  updateConversationTitle: async (id, title) => {
    await conversationService.updateConversation(id, { title });
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: new Date() } : c
      ),
    }));
  },

  updateConversationMessages: async (id, messages) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, messages, updatedAt: new Date() } : c
      ),
    }));
  },

  setHydrated: () => set({ isHydrated: true }),
}));
```

### 步骤 13：更新聊天 Hook 以保存消息到服务器

**文件**: `hooks/useChat.ts`

```typescript
import { useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { useConversationStore } from "@/store/conversationStore";
import * as conversationService from "@/lib/conversation-service";

export function useChat() {
  const chatStore = useChatStore();
  const conversationStore = useConversationStore();

  const sendMessage = useCallback(
    async (content: string, images?: File[]) => {
      const currentConversationId = conversationStore.getCurrentConversationId();
      if (!currentConversationId) return;

      const messageId = chatStore.addMessage("user", content);

      await conversationService.addMessage(currentConversationId, {
        role: "user",
        content,
        isStreaming: false,
        isError: false,
      });

      chatStore.setLoading(true);
      const controller = new AbortController();
      chatStore.setAbortController(controller);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...chatStore.messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            ],
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("请求失败");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法读取响应");
        }

        const decoder = new TextDecoder();
        let aiMessageId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.delta?.content) {
                  const delta = data.choices[0].delta.content;
                  if (!aiMessageId) {
                    aiMessageId = chatStore.addMessage("assistant", delta);
                    await conversationService.addMessage(
                      currentConversationId,
                      {
                        role: "assistant",
                        content: delta,
                        isStreaming: true,
                        isError: false,
                      }
                    );
                  } else {
                    chatStore.appendToLastMessage(delta);
                    await conversationService.updateMessage(
                      currentConversationId,
                      aiMessageId,
                      {
                        content: chatStore.messages[chatStore.messages.length - 1]
                          .content,
                      }
                    );
                  }
                }
              } catch {
                // 忽略无效 JSON
              }
            }
          }
        }

        if (aiMessageId) {
          chatStore.finishStreaming();
          await conversationService.updateMessage(currentConversationId, aiMessageId, {
            isStreaming: false,
          });
        }

        conversationStore.updateConversationMessages(
          currentConversationId,
          chatStore.messages
        );
      } catch (error) {
        chatStore.markLastMessageError(
          error instanceof Error ? error.message : "发送失败"
        );
      } finally {
        chatStore.setLoading(false);
        chatStore.setAbortController(null);
      }
    },
    [chatStore, conversationStore]
  );

  const stopGenerating = useCallback(() => {
    const controller = chatStore.abortController;
    if (controller) {
      controller.abort();
      chatStore.setAbortController(null);
      chatStore.finishStreaming();
    }
  }, [chatStore]);

  return {
    sendMessage,
    stopGenerating,
    messages: chatStore.messages,
    isLoading: chatStore.isLoading,
    lastImages: chatStore.lastImages,
    setLastImages: chatStore.setLastImages,
  };
}
```

***

## 四、部署方案

### 4.1 数据库准备

是的，需要安装 PostgreSQL 数据库。以下提供三种安装方式：

#### 方式一：本地安装（适合开发环境）

**Windows**：

1. 下载安装包：<https://www.enterprisedb.com/downloads/postgres-postgresql-downloads>
2. 运行安装程序，设置密码（记住这个密码）
3. 默认端口：5432

**macOS**：

```bash
# 使用 Homebrew 安装
brew install postgresql@16
brew services start postgresql@16
```

**Linux（Ubuntu/Debian）**：

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**创建数据库**：

```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE ai_chat_db;

# 创建用户（可选）
CREATE USER ai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_chat_db TO ai_user;

# 退出
\q
```

#### 方式二：使用 Docker（推荐，跨平台）

```bash
# 拉取 PostgreSQL 镜像
docker pull postgres:16

# 启动容器（设置密码和数据库名）
docker run -d \
  --name ai-chat-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=ai_chat_db \
  -p 5432:5432 \
  postgres:16
```

#### 方式三：使用云数据库（适合生产环境）

推荐使用 **Vercel Postgres** 或 **Supabase**：

**Vercel Postgres**（推荐，与 Next.js 无缝集成）：

1. 登录 Vercel 控制台
2. 在项目中添加 Postgres 数据库
3. 自动生成 DATABASE\_URL 环境变量

**Supabase**（免费额度充足）：

1. 注册 Supabase 账号：<https://supabase.com>
2. 创建新项目，获取连接字符串

#### 配置数据库连接

在 `.env.local` 中配置：

```env
# 本地数据库
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ai_chat_db"

# 或使用 Docker
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ai_chat_db"

# 或使用 Vercel Postgres
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

#### 运行数据库迁移

```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库表
npx prisma migrate dev --name init

# 查看数据库内容（可选）
npx prisma studio
```

### 4.2 环境变量配置

在生产环境中，需要设置以下环境变量：

| 变量                 | 说明               |
| ------------------ | ---------------- |
| DATABASE\_URL      | PostgreSQL 连接字符串 |
| NEXTAUTH\_SECRET   | NextAuth 加密密钥    |
| NEXTAUTH\_URL      | 应用域名             |
| AI\_API\_KEY       | 大模型 API 密钥       |
| AI\_API\_BASE\_URL | 大模型 API 地址       |
| AI\_MODEL          | 模型名称             |

### 4.3 Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 在环境变量设置中添加所有必要的变量
4. 部署完成

***

## 五、注意事项

### 5.1 安全性

* ✅ API Key 存储在服务端环境变量中，不会暴露给前端

* ✅ 密码使用 bcrypt 加密存储

* ✅ 使用 NextAuth 进行安全的会话管理

* ✅ 所有 API 端点都进行用户认证检查

### 5.2 性能优化

* ⚡ 使用 Prisma ORM 进行高效的数据库查询

* ⚡ 流式响应避免一次性加载大量数据

* ⚡ 会话列表只返回摘要信息，详情按需加载

### 5.3 扩展性

* 📈 支持添加更多认证方式（Google、GitHub OAuth）

* 📈 支持添加 Redis 缓存会话数据

* 📈 支持添加消息推送功能

* 📈 支持添加管理员后台

***

## 六、待办清单

* [ ] 安装依赖

* [ ] 配置 Prisma Schema

* [ ] 创建认证 API

* [ ] 创建会话管理 API

* [ ] 创建消息管理 API

* [ ] 创建认证页面

* [ ] 更新布局组件

* [ ] 更新状态管理

* [ ] 更新聊天 Hook

* [ ] 配置数据库

* [ ] 部署上线

