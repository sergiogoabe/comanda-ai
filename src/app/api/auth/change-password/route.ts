import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "userId, currentPassword e newPassword são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Erro ao alterar senha" }, { status: 500 });
  }
}
