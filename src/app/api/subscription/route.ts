import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { establishmentId, newPlan, paymentMethod } = body;

    if (!establishmentId || !newPlan) {
      return NextResponse.json(
        { error: "establishmentId e newPlan são obrigatórios" },
        { status: 400 }
      );
    }

    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado" },
        { status: 404 }
      );
    }

    const planPrices: Record<string, number> = {
      FREE: 49,
      PRO: 97,
      ENTERPRISE: 197,
    };

    const price = planPrices[newPlan];
    if (!price) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // Em produção: criar checkout session no Stripe/Asaas/Mercado Pago
    // Por enquanto, atualiza diretamente com simulação
    const updated = await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        plan: newPlan as any,
        settings: {
          ...(establishment.settings as any || {}),
          billing: {
            ...(establishment.settings as any)?.billing || {},
            lastPlanChange: new Date().toISOString(),
            previousPlan: establishment.plan,
            checkoutMethod: paymentMethod || "manual",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      plan: updated.plan,
      price,
      message: `Plano alterado para ${newPlan}`,
    });
  } catch (error: any) {
    console.error("Subscription change error:", error);
    return NextResponse.json(
      { error: "Erro ao alterar plano" },
      { status: 500 }
    );
  }
}
