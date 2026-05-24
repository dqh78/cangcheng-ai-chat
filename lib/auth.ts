import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        account: { label: "邮箱 / 手机号", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.account || !credentials?.password) {
          return null;
        }

        // 判断是手机号还是邮箱
        const isPhone = /^1[3-9]\d{9}$/.test(credentials.account);

        const user = await prisma.user.findFirst({
          where: isPhone
            ? { phone: credentials.account }
            : { email: credentials.account },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url as string,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 天过期
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: user.email || undefined },
            ],
          },
        });

        if (existingUser) {
          // 已有用户，更新头像和名字
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
            },
          });
        } else {
          // 新用户，创建账户
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "GitHub用户",
              image: user.image,
            },
          });
          user.id = newUser.id;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.image as string;
        // 确保 id 传递到 session
        (session.user as Record<string, unknown>).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};