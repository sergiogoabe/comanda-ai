import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const id = searchParams.get("id");

  let establishment;

  if (slug) {
    establishment = await prisma.establishment.findUnique({
      where: { slug },
      include: { tables: { where: { isActive: true }, orderBy: { number: "asc" } } },
    });
  } else if (id) {
    establishment = await prisma.establishment.findUnique({
      where: { id },
      include: { tables: { where: { isActive: true }, orderBy: { number: "asc" } } },
    });
  }

  if (!establishment) {
    return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ establishment });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, slug, logo, address, phone, description, settings } = body;

    if (!id) {
      return NextResponse.json({ error: "Establishment ID é obrigatório" }, { status: 400 });
    }

    const current = await prisma.establishment.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });
    }

    const mergedSettings = settings
      ? { ...((current.settings as object) || {}), ...settings }
      : undefined;

    const establishment = await prisma.establishment.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(logo !== undefined && { logo }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(description !== undefined && { description }),
        ...(mergedSettings && { settings: mergedSettings as any }),
      },
    });

    return NextResponse.json({ success: true, establishment });
  } catch (error: any) {
    console.error("Update establishment error:", error);
    return NextResponse.json({ error: "Erro ao atualizar estabelecimento" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, settings } = body;

    if (!id || !settings) {
      return NextResponse.json({ error: "id e settings são obrigatórios" }, { status: 400 });
    }

    const current = await prisma.establishment.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });
    }

    const merged = { ...((current.settings as object) || {}), ...settings };

    const establishment = await prisma.establishment.update({
      where: { id },
      data: { settings: merged as any },
    });

    return NextResponse.json({ success: true, establishment });
  } catch (error: any) {
    console.error("Patch establishment error:", error);
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
  }
}
