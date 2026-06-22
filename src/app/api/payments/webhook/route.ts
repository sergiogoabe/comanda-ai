import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mercado Pago webhook handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    console.log("Mercado Pago webhook received:", { type, data });

    // Handle payment notification
    if (type === "payment") {
      const paymentId = data.id;
      
      // Fetch payment details from Mercado Pago
      const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!mpToken) {
        return NextResponse.json({ status: "ok" }, { status: 200 });
      }

      try {
        const response = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${mpToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const mpPayment = await response.json();
        
        if (mpPayment.status === "approved") {
          // Update payment in database
          const order = await prisma.order.findFirst({
            where: {
              payments: {
                some: {
                  pixCode: mpPayment.metadata?.order_id ? String(mpPayment.metadata.order_id) : undefined,
                },
              },
            },
            include: { payments: true },
          });

          if (order) {
            await prisma.payment.updateMany({
              where: {
                orderId: order.id,
                method: "PIX",
              },
              data: {
                status: "CONFIRMED",
                paidAt: new Date(),
              },
            });

            await prisma.order.update({
              where: { id: order.id },
              data: { status: "CONFIRMED" },
            });

            console.log(`Payment ${paymentId} confirmed for order ${order.id}`);
          }
        }
      } catch (error) {
        console.error("Error processing Mercado Pago webhook:", error);
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Webhook endpoint is working" });
}
