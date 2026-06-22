import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const establishmentId = searchParams.get("establishmentId");

  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId é obrigatório" }, { status: 400 });
  }

  const categories = await prisma.category.findMany({
    where: { establishmentId, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        include: {
          variants: true,
          additions: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ categories });
}
