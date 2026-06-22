import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixPayment } from "@/lib/mercadopago";
import QRCode from "qrcode";

function generatePixPayload(merchantName: string, merchantCity: string, amount: number, txid: string): string {
  const format = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  };
  const payload = [
    format("00", "01"),
    format("26", [format("00", "br.gov.bcb.pix"), format("01", "infinity-comanda@pix.com"), format("02", txid)].join("")),
    format("52", "0000"),
    format("53", "986"),
    format("54", amount.toFixed(2)),
    format("58", "BR"),
    format("59", merchantName.substring(0, 25)),
    format("60", merchantCity.substring(0, 15)),
    format("62", format("05", txid)),
    "6304",
  ].join("");
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  crc &= 0xffff;
  return payload + crc.toString(16).toUpperCase().padStart(4, "0");
}

async function generatePixQrSvg(pixPayload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(pixPayload, { type: "image/png", width: 300, margin: 1, color: { dark: "#0A0A0F", light: "#FFFFFF" } });
  } catch { return ""; }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId é obrigatório" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { establishment: true, payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.payments.some(p => p.status === "CONFIRMED")) {
      return NextResponse.json({ error: "Pedido já foi pago" }, { status: 400 });
    }

    const total = Number(order.total);
    const txid = `COMANDA${orderId.slice(-10).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;

    // Try Mercado Pago first if configured
    const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (mpToken) {
      try {
        const mpResult = await createPixPayment(
          total,
          `Pedido ${orderId.slice(-8)} - ${order.establishment.name}`,
          orderId,
          "cliente@email.com"
        );

        const payment = await prisma.payment.create({
          data: {
            orderId,
            method: "PIX",
            amount: total,
            status: mpResult.status === "approved" ? "CONFIRMED" : "PENDING",
            pixCode: mpResult.pixCode || txid,
            pixQrCode: mpResult.pixQrCode || "",
            paidAt: mpResult.status === "approved" ? new Date() : undefined,
          },
        });

        return NextResponse.json({
          success: true,
          gateway: "mercadopago",
          payment: {
            id: payment.id,
            pixCode: mpResult.pixCode,
            pixQrCode: mpResult.pixQrCode,
            amount: total,
            status: payment.status,
            mpPaymentId: mpResult.id,
          },
        });
      } catch (mpError: any) {
        console.error("Mercado Pago error, falling back to simulated PIX:", mpError.message);
      }
    }

    // Fallback: simulated PIX
    const pixPayload = generatePixPayload(
      order.establishment.name,
      order.establishment.address?.split(",")[0]?.trim() || "Sao Paulo",
      total,
      txid
    );
    const pixQrSvg = await generatePixQrSvg(pixPayload);

    const payment = await prisma.payment.create({
      data: {
        orderId,
        method: "PIX",
        amount: total,
        status: "PENDING",
        pixCode: pixPayload,
        pixQrCode: pixQrSvg,
      },
    });

    return NextResponse.json({
      success: true,
      gateway: "simulado",
      payment: {
        id: payment.id,
        pixCode: pixPayload,
        pixQrCode: pixQrSvg,
        amount: total,
        status: payment.status,
        txid,
      },
      notice: "Pagamento simulado. Configure MERCADO_PAGO_ACCESS_TOKEN no .env para PIX real.",
    });
  } catch (error: any) {
    console.error("PIX generation error:", error);
    return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId é obrigatório" }, { status: 400 });
  }
  const payments = await prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ payments });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, status } = body;

    if (!paymentId || !status) {
      return NextResponse.json({ error: "paymentId e status são obrigatórios" }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status, paidAt: status === "CONFIRMED" ? new Date() : undefined },
      include: { order: true },
    });

    if (status === "CONFIRMED" && payment.order) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CONFIRMED" },
      });
      if (payment.order.customerId) {
        const orderCount = await prisma.order.count({ where: { customerId: payment.order.customerId } });
        const totalSpent = await prisma.order.aggregate({ where: { customerId: payment.order.customerId }, _sum: { total: true } });
        await prisma.contact.update({
          where: { id: payment.order.customerId },
          data: { orderCount, totalSpent: Number(totalSpent._sum.total || 0), lastOrderAt: new Date() },
        });
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error("Payment update error:", error);
    return NextResponse.json({ error: "Erro ao atualizar pagamento" }, { status: 500 });
  }
}
