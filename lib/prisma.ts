import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 移除 pg 驱动不认识的 URL 参数（pgbouncer, connection_limit 等）
const rawUrl = process.env.DATABASE_URL || "";
const url = new URL(rawUrl);
url.searchParams.delete("pgbouncer");
url.searchParams.delete("connection_limit");
const cleanUrl = url.toString();

if (!cleanUrl || cleanUrl === "null:") {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: cleanUrl });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });