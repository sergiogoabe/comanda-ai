import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    if (!rateLimit(ip, 5, 60000)) {
      return NextResponse.json(
        { error: "Muitas solicitações. Aguarde um momento." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { tableId, establishmentSlug, establishmentId, items, type, notes } = body;

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    let estId = establishmentId;
    if (!estId && establishmentSlug) {
      // Try as slug first, then as ID
      const est = await prisma.establishment.findUnique({ where: { slug: establishmentSlug } });
      if (est) {
        estId = est.id;
      }
    }
    // If establishmentId was passed as a cuid, use it directly
    if (estId) {
      const estCheck = await prisma.establishment.findUnique({ where: { id: estId } });
      if (!estCheck) estId = null;
    }
    if (!estId) {
      return NextResponse.json(
        { error: "Estabelecimento não identificado" },
        { status: 400 }
      );
    }

    // Resolve tableId: could be a cuid ID or a table number string
    let resolvedTableId = tableId;
    const tableByCuid = await prisma.table.findUnique({ where: { id: tableId } });
    if (!tableByCuid) {
      const tableByNumber = await prisma.table.findFirst({
        where: { establishmentId: estId, number: tableId },
      });
      if (tableByNumber) {
        resolvedTableId = tableByNumber.id;
      }
    }

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.unitPrice * item.quantity;
    }

    const orderItems = items.map((item: any) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      notes: item.notes || null,
      productName: item.productName || item.name || "Item do cardápio",
      productImage: item.productImage || item.image || null,
      variantId: item.variantId || null,
      additions: item.additions || [],
    }));

    const order = await prisma.order.create({
      data: {
        tableId: resolvedTableId,
        establishmentId: estId,
        type: type || "ONSITE",
        notes,
        subtotal,
        total: subtotal,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        table: true,
      },
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let establishmentId = searchParams.get("establishmentId");
  const establishmentSlug = searchParams.get("establishmentSlug");
  const status = searchParams.get("status");

  if (!establishmentId && establishmentSlug) {
    const est = await prisma.establishment.findUnique({
      where: { slug: establishmentSlug },
      select: { id: true },
    });
    if (est) establishmentId = est.id;
  }

  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId ou establishmentSlug é obrigatório" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: {
      establishmentId,
      ...(status ? { status: status as any } : { status: { not: "DELIVERED" } }),
    },
    include: {
      items: true,
      table: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Campos obrigatórios: id, status" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        table: true,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}
