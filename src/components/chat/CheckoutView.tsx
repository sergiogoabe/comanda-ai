"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useChatStore } from "@/store/chat-store";
import { Check, QrCode, CreditCard, Copy, ArrowLeft, Loader2, Clock } from "lucide-react";
import { cn, formatCurrency, generateId } from "@/lib/utils";

export function CheckoutView() {
  const { cart, getCartTotal, clearCart, establishment, table, addMessage } = useChatStore();
  const [step, setStep] = useState<"review" | "payment" | "success">("review");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "cash">("pix");
  const [pixData, setPixData] = useState<{ qrCode: string; code: string; paymentId: string; txid: string } | null>(null);
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixStatus, setPixStatus] = useState<"pending" | "confirmed">("pending");
  const [copied, setCopied] = useState(false);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const generatePIX = useCallback(async () => {
    if (pixData) return;
    setIsGeneratingPix(true);
    try {
      const order = await submitOrderToAPI();
      if (!order) {
        setIsGeneratingPix(false);
        return;
      }

      setOrderId(order.id);

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setPixData({
          qrCode: data.payment.pixQrCode,
          code: data.payment.pixCode,
          paymentId: data.payment.id,
          txid: data.payment.txid,
        });
        setPixStatus("pending");
      }
    } catch (e) {
      console.error("Failed to generate PIX:", e);
    }
    setIsGeneratingPix(false);
  }, [pixData]);

  useEffect(() => {
    if (step === "payment" && paymentMethod === "pix" && !pixData) {
      generatePIX();
    }
  }, [step, paymentMethod, pixData, generatePIX]);

  useEffect(() => {
    if (pixData?.paymentId && pixStatus === "pending") {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/payments?orderId=${orderId}`);
          if (res.ok) {
            const data = await res.json();
            const payment = data.payments?.find((p: any) => p.id === pixData.paymentId);
            if (payment?.status === "CONFIRMED") {
              setPixStatus("confirmed");
              setStep("success");
              clearCart();
              addMessage({
                id: generateId(),
                role: "assistant",
                content: `✅ Pagamento confirmado via PIX! Pedido #${orderId.slice(-4).toUpperCase()} está sendo preparado.\n\nTempo estimado: 20-30 minutos.`,
                timestamp: new Date(),
                action: { type: "order_confirmed" },
              });
            }
          }
        } catch (e) {
          console.error("Payment check failed:", e);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [pixData, orderId, pixStatus]);

  const submitOrderToAPI = async () => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table?.id || "mesa-1",
          establishmentSlug: "demo",
          establishmentId: establishment?.id,
          items: cart.map((item) => ({
            productName: item.product.name,
            productImage: item.product.image,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes || "",
            variantId: item.variant?.id || null,
            additions: item.additions.map((a) => a.name),
          })),
          type: "ONSITE",
          notes: "",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch (e) {
      console.error("Failed to submit order:", e);
    }
    return null;
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "pix" && !pixData) return;
    if (paymentMethod === "pix" && pixStatus !== "confirmed") {
      setPixStatus("confirmed");
      setStep("success");
      clearCart();
      addMessage({
        id: generateId(),
        role: "assistant",
        content: `✅ Pedido #${orderId.slice(-4).toUpperCase()} confirmado e enviado para a cozinha!\n\nTempo estimado: 20-30 minutos.\n\nObrigado pela preferência! 😊`,
        timestamp: new Date(),
        action: { type: "order_confirmed" },
      });

      if (pixData?.paymentId) {
        await fetch("/api/payments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: pixData.paymentId, status: "CONFIRMED" }),
        });
      }
      return;
    }

    setIsSubmitting(true);
    const order = await submitOrderToAPI();
    const generatedId = order?.id || Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderId(generatedId);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStep("success");
    setIsSubmitting(false);
    clearCart();

    addMessage({
      id: generateId(),
      role: "assistant",
      content: `✅ Pedido #${generatedId.slice(-4).toUpperCase()} confirmado e enviado para a cozinha!\n\nTempo estimado: 20-30 minutos.\n\nObrigado pela preferência! 😊`,
      timestamp: new Date(),
      action: { type: "order_confirmed" },
    });
  };

  const handleCopyCode = () => {
    if (pixData?.code) {
      navigator.clipboard.writeText(pixData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (step === "success") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mb-6 animate-pulse-slow">
          <Check className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h2>
        <p className="text-gray-400 mb-6">
          Seu pedido foi enviado para a cozinha.
        </p>
        <div className="w-full max-w-xs p-4 bg-surface">
          <div className="text-sm text-gray-400 mb-2">Pedido</div>
          <div className="text-lg font-mono font-medium">
            #{orderId.slice(-4).toUpperCase()}
          </div>
          <div className="text-sm text-gray-400 mt-2">Método</div>
          <div className="text-lg font-medium capitalize">{paymentMethod === "pix" ? "PIX" : paymentMethod === "card" ? "Cartão" : "Dinheiro"}</div>
          <div className="text-sm text-gray-400 mt-2">Tempo estimado</div>
          <div className="text-lg font-medium">~25 minutos</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-surface-600">
        <button
          onClick={() => step === "payment" ? setStep("review") : undefined}
          className="p-2 hover:bg-surface-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold">
          {step === "review" ? "Revisar Pedido" : "Pagamento"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {step === "review" && (
          <>
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Seus pedidos</h3>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-surface-600"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary/20 text-primary text-sm flex items-center justify-center font-medium">
                      {item.quantity}
                    </span>
                    <div>
                      <div className="font-medium text-sm">{item.product.name}</div>
                      {item.notes && (
                        <div className="text-xs text-gray-500">{item.notes}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 p-4 bg-surface">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Taxa de serviço (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-surface-600">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Forma de pagamento
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setPaymentMethod("pix"); setPixData(null); setPixStatus("pending"); }}
                  className={cn(
                    "p-4 border flex flex-col items-center gap-2 transition-colors",
                    paymentMethod === "pix"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-surface-600 hover:border-surface-500"
                  )}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-sm font-medium">PIX</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={cn(
                    "p-4 border flex flex-col items-center gap-2 transition-colors",
                    paymentMethod === "card"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-surface-600 hover:border-surface-500"
                  )}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm font-medium">Cartão</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={cn(
                    "p-4 border flex flex-col items-center gap-2 transition-colors",
                    paymentMethod === "cash"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-surface-600 hover:border-surface-500"
                  )}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm font-medium">Dinheiro</span>
                </button>
              </div>
            </div>

            {paymentMethod === "pix" && (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white mb-4">
                  {isGeneratingPix ? (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : pixData ? (
                    <img
                      src={pixData.qrCode}
                      alt="PIX QR Code"
                      className="w-48 h-48"
                    />
                  ) : null}
                </div>

                {pixStatus === "pending" && pixData && (
                  <div className="flex items-center gap-2 mb-3 text-warning text-sm">
                    <Clock className="w-4 h-4" />
                    Aguardando pagamento...
                  </div>
                )}

                {pixData && (
                  <div className="w-full max-w-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Código PIX:</span>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <div className="p-3 bg-surface-700 text-xs font-mono break-all">
                      {pixData.code}
                    </div>
                    {pixData.txid && (
                      <div className="mt-2 text-xs text-gray-500">
                        TxID: {pixData.txid}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="text-center py-12 text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chame um garçom para pagamento com cartão</p>
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="text-center py-12 text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chame um garçom para pagamento em dinheiro</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-surface border-t border-surface-600">
        {step === "review" ? (
          <button
            onClick={() => setStep("payment")}
            className="w-full py-4 gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Ir para Pagamento - {formatCurrency(total)}
          </button>
        ) : (
          <button
            onClick={handleConfirmPayment}
            disabled={isSubmitting || (paymentMethod === "pix" && !pixData)}
            className="w-full py-4 gradient-accent text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando pedido...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirmar e Enviar Pedido
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
