import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPlanLimit } from "@/lib/plan-check";

// Create table
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { number, establishmentId, isActive } = body;

    if (!number || !establishmentId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: number, establishmentId" },
        { status: 400 }
      );
    }

    const limit = await checkPlanLimit(prisma, establishmentId, "maxTables");
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Limite de ${limit.limit} mesas atingido para seu plano. Faça upgrade para adicionar mais.`, limit: limit.limit },
        { status: 403 }
      );
    }

    const table = await prisma.table.create({
      data: {
        number,
        establishmentId,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error: any) {
    console.error("Create table error:", error);
    return NextResponse.json({ error: "Erro ao criar mesa" }, { status: 500 });
  }
}

// List tables for an establishment
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const establishmentId = searchParams.get("establishmentId");
  const isActive = searchParams.get("isActive");

  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId é obrigatório" }, { status: 400 });
  }

  const tables = await prisma.table.findMany({
    where: {
      establishmentId,
      ...(isActive !== null ? { isActive: isActive === "true" } : {}),
    },
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { number: "asc" },
  });

  return NextResponse.json({ tables });
}

// Update table
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, number, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Table ID é obrigatório" }, { status: 400 });
    }

    const table = await prisma.table.update({
      where: { id },
      data: {
        ...(number !== undefined && { number }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error("Update table error:", error);
    return NextResponse.json({ error: "Erro ao atualizar mesa" }, { status: 500 });
  }
}

// Delete table
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Table ID é obrigatório" }, { status: 400 });
    }

    await prisma.table.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete table error:", error);
    return NextResponse.json({ error: "Erro ao deletar mesa" }, { status: 500 });
  }
}
