"use client";

import React, { useState, useEffect } from "react";
import { ChefHat, Clock, CheckCircle, ArrowRight, AlertCircle, Volume2 } from "lucide-react";
import { cn, formatCurrency, getRelativeTime, getStatusColor, getStatusLabel } from "@/lib/utils";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  notes?: string;
  additions?: string[];
}

interface KitchenOrder {
  id: string;
  table: string;
  items: OrderItem[];
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered";
  createdAt: string;
  total: number;
}

export function KitchenDisplay({ establishmentId }: { establishmentId: string }) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `/api/orders?establishmentId=${establishmentId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const openOrders = (data.orders || [])
        .filter((o: any) => !["DELIVERED", "CANCELLED"].includes(o.status))
        .map((o: any) => ({
          id: o.id,
          table: o.table?.number ? `Mesa ${o.table.number}` : "Delivery",
          items: (o.items || []).map((item: any) => ({
            id: item.id,
            productName: item.productName,
            quantity: item.quantity,
            notes: item.notes || undefined,
            additions: item.additions || [],
          })),
          status: o.status.toLowerCase(),
          createdAt: o.createdAt,
          total: Number(o.total),
        }));
      setOrders(openOrders);
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch kitchen orders:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [establishmentId]);

  const advanceOrder = async (orderId: string, currentStatus: string) => {
    const statusMap: Record<string, string> = {
      pending: "CONFIRMED",
      confirmed: "PREPARING",
      preparing: "READY",
      ready: "DELIVERED",
    };
    const newStatus = statusMap[currentStatus];
    if (!newStatus) return;

    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      await fetchOrders();
    } catch (e) {
      console.error("Failed to update order status:", e);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  const getTimerColor = (dateStr: string) => {
    const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (minutes < 10) return "text-accent";
    if (minutes < 20) return "text-warning";
    return "text-error";
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-surface border-b border-surface-600 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <ChefHat className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Cozinha</h1>
            <p className="text-sm text-gray-400">
              {loading ? "Carregando..." : `${orders.length} pedidos em aberto`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            "p-3 rounded-lg transition-colors",
            soundEnabled ? "bg-accent/20 text-accent" : "bg-surface-600 text-gray-400"
          )}
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 flex gap-6 overflow-x-auto">
        {/* Pending Column */}
        <div className="flex-1 min-w-[300px] max-w-[350px]">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h2 className="font-semibold">Novos Pedidos</h2>
            <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-sm font-medium">
              {pendingOrders.length}
            </span>
          </div>
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                onAdvance={() => advanceOrder(order.id, order.status)}
                timerColor={getTimerColor(order.createdAt)}
                buttonText="Confirmar"
              />
            ))}
            {pendingOrders.length === 0 && (
              <div className="p-8 rounded-xl bg-surface text-center text-gray-500">
                Nenhum pedido novo
              </div>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="flex-1 min-w-[300px] max-w-[350px]">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Preparando</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-sm font-medium">
              {preparingOrders.length}
            </span>
          </div>
          <div className="space-y-4">
            {preparingOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                onAdvance={() => advanceOrder(order.id, order.status)}
                timerColor={getTimerColor(order.createdAt)}
                buttonText="Pronto"
              />
            ))}
            {preparingOrders.length === 0 && (
              <div className="p-8 rounded-xl bg-surface text-center text-gray-500">
                Nenhum pedido em preparo
              </div>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="flex-1 min-w-[300px] max-w-[350px]">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Prontos</h2>
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-sm font-medium">
              {readyOrders.length}
            </span>
          </div>
          <div className="space-y-4">
            {readyOrders.map((order) => (
              <KitchenCard
                key={order.id}
                order={order}
                onAdvance={() => advanceOrder(order.id, order.status)}
                timerColor={getTimerColor(order.createdAt)}
                buttonText="Entregue"
                isReady
              />
            ))}
            {readyOrders.length === 0 && (
              <div className="p-8 rounded-xl bg-surface text-center text-gray-500">
                Nenhum pedido pronto
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KitchenCard({
  order,
  onAdvance,
  timerColor,
  isReady,
  buttonText,
}: {
  order: KitchenOrder;
  onAdvance: () => void;
  timerColor: string;
  isReady?: boolean;
  buttonText: string;
}) {
  const getElapsedTime = (dateStr: string) => {
    const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-surface border transition-all",
        isReady ? "border-accent/50 bg-accent/10" : "border-surface-600 hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-bold text-lg">{order.table}</span>
          <span className="text-gray-400 text-sm ml-2">#{order.id.slice(-6)}</span>
        </div>
        <div className={cn("flex items-center gap-1 font-mono text-sm", timerColor)}>
          <Clock className="w-4 h-4" />
          {getElapsedTime(order.createdAt)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {item.quantity}
            </span>
            <div>
              <span className="font-medium">{item.productName}</span>
              {item.notes && (
                <p className="text-xs text-warning mt-0.5">📝 {item.notes}</p>
              )}
              {item.additions && item.additions.length > 0 && (
                <p className="text-xs text-accent mt-0.5">
                  + {item.additions.join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onAdvance}
        className={cn(
          "w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90",
          isReady
            ? "bg-accent text-black"
            : "gradient-primary text-white"
        )}
      >
        {isReady ? (
          <>
            <CheckCircle className="w-5 h-5" />
            {buttonText}
          </>
        ) : (
          <>
            <span>{buttonText}</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}