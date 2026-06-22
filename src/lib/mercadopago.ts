import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

let mpClient: MercadoPagoConfig | null = null;
let mpPayment: Payment | null = null;
let mpPreference: Preference | null = null;

export function getMercadoPago() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) return null;

  if (!mpClient) {
    mpClient = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    });
    mpPayment = new Payment(mpClient);
    mpPreference = new Preference(mpClient);
  }

  return { client: mpClient, payment: mpPayment!, preference: mpPreference! };
}

export async function createPixPayment(
  amount: number,
  description: string,
  orderId: string,
  customerEmail: string,
  customerName?: string
) {
  const mp = getMercadoPago();
  if (!mp) {
    throw new Error("Mercado Pago não configurado. Configure MERCADO_PAGO_ACCESS_TOKEN no .env");
  }

  const payment = await mp.payment.create({
    body: {
      transaction_amount: amount,
      description,
      payment_method_id: "pix",
      payer: {
        email: customerEmail,
        first_name: customerName || "Cliente",
      },
      metadata: {
        order_id: orderId,
      },
    },
  });

  return {
    id: payment.id,
    status: payment.status,
    statusDetail: payment.status_detail,
    pixCode: payment.point_of_interaction?.transaction_data?.qr_code || null,
    pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code_base64
      ? `data:image/png;base64,${payment.point_of_interaction.transaction_data.qr_code_base64}`
      : null,
    pixCopyPaste: payment.point_of_interaction?.transaction_data?.qr_code || null,
    createdAt: payment.date_created,
  };
}

export async function getPaymentStatus(mpPaymentId: number) {
  const mp = getMercadoPago();
  if (!mp) {
    throw new Error("Mercado Pago não configurado");
  }

  const payment = await mp.payment.get({ id: mpPaymentId });
  return {
    id: payment.id,
    status: payment.status,
    statusDetail: payment.status_detail,
  };
}
