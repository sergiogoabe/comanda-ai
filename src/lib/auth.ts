import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { establishment: true },
        });
        if (!user) throw new Error("Email ou senha incorretos");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Email ou senha incorretos");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          establishmentId: user.establishment?.id,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).establishmentId = (user as any).establishmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role;
        (session.user as any).establishmentId = (token as any).establishmentId;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
