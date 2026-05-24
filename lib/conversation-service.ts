import type { Conversation, Message } from "./generated/prisma/client";

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