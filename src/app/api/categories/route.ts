import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Create category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, icon, establishmentId, order } = body;

    if (!name || !establishmentId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, establishmentId" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || "",
        icon: icon || "",
        establishmentId,
        order: order || 0,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
  }
}

// List categories for an establishment
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const establishmentId = searchParams.get("establishmentId");

  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId é obrigatório" }, { status: 400 });
  }

  const categories = await prisma.category.findMany({
    where: { establishmentId },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ categories });
}

// Update category
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, icon, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID é obrigatório" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 });
  }
}

// Delete category
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID é obrigatório" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Erro ao deletar categoria" }, { status: 500 });
  }
}
