import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPlanLimit } from "@/lib/plan-check";

// Create product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, categoryId, establishmentId, image, preparationTime, tags, emoji } = body;

    if (!name || price == null || !categoryId || !establishmentId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, price, categoryId, establishmentId" },
        { status: 400 }
      );
    }

    const limit = await checkPlanLimit(prisma, establishmentId, "maxProducts");
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Limite de ${limit.limit} produtos atingido para seu plano. Faça upgrade.`, limit: limit.limit },
        { status: 403 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        image: image || "",
        categoryId,
        establishmentId,
        preparationTime: parseInt(preparationTime) || 15,
        tags: tags || [],
        emoji: emoji || "",
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}

// Update product
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, price, categoryId, image, preparationTime, tags, emoji, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID é obrigatório" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(categoryId !== undefined && { categoryId }),
        ...(image !== undefined && { image }),
        ...(preparationTime !== undefined && { preparationTime: parseInt(preparationTime) }),
        ...(tags !== undefined && { tags }),
        ...(emoji !== undefined && { emoji }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

// Delete product
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID é obrigatório" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 });
  }
}

// List all products for an establishment
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const establishmentId = searchParams.get("establishmentId");
  const categoryId = searchParams.get("categoryId");

  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId é obrigatório" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: {
      establishmentId,
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      variants: true,
      additions: true,
      category: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ products });
}
