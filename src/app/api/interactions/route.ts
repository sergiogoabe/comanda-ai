import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contactId, type, content } = body;

    if (!contactId || !type || !content) {
      return NextResponse.json(
        { error: "contactId, type e content são obrigatórios" },
        { status: 400 }
      );
    }

    const interaction = await prisma.interaction.create({
      data: { contactId, type, content },
      include: { contact: true },
    });

    return NextResponse.json({ success: true, interaction }, { status: 201 });
  } catch (error: any) {
    console.error("Create interaction error:", error);
    return NextResponse.json({ error: "Erro ao criar interação" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");

  if (!contactId) {
    return NextResponse.json({ error: "contactId é obrigatório" }, { status: 400 });
  }

  const interactions = await prisma.interaction.findMany({
    where: { contactId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ interactions });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
  }

  await prisma.interaction.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
