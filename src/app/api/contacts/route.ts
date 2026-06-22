import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, cpf, birthDate, notes, tags, segment, establishmentId } = body;

    if (!name || !establishmentId) {
      return NextResponse.json({ error: "name e establishmentId são obrigatórios" }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        cpf: cpf || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        notes: notes || null,
        tags: tags || [],
        segment: segment || null,
        establishmentId,
      },
    });

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error: any) {
    console.error("Create contact error:", error);
    return NextResponse.json({ error: "Erro ao criar contato" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const establishmentId = searchParams.get("establishmentId");

  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId é obrigatório" }, { status: 400 });
  }

  const contacts = await prisma.contact.findMany({
    where: { establishmentId },
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contacts });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, phone, cpf, birthDate, notes, tags, segment, totalSpent, nps } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(cpf !== undefined && { cpf }),
        ...(birthDate !== undefined && { birthDate: new Date(birthDate) }),
        ...(notes !== undefined && { notes }),
        ...(tags !== undefined && { tags }),
        ...(segment !== undefined && { segment }),
        ...(totalSpent !== undefined && { totalSpent: parseFloat(totalSpent) }),
        ...(nps !== undefined && { nps: parseInt(nps) }),
      },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    console.error("Update contact error:", error);
    return NextResponse.json({ error: "Erro ao atualizar contato" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.contact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete contact error:", error);
    return NextResponse.json({ error: "Erro ao deletar contato" }, { status: 500 });
  }
}
