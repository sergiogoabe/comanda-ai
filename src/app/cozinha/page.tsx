"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clock, ChefHat, CheckCircle, AlertCircle, ArrowRight, ChevronUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type KitchenStatus = "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";

interface KitchenItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface KitchenOrder {
  id: string;
  table: string;
  items: KitchenItem[];
  status: KitchenStatus;
  createdAt: Date;
  updatedAt: Date;
  total: number;
  notes?: string;
}

const STATUS_FLOW: KitchenStatus[] = ["PENDING", "PREPARING", "READY", "DELIVERED"];

const COLUMNS: { id: KitchenStatus; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
  { id: "PENDING", label: "Novos", color: "text-warning", bg: "bg-warning/10 border-warning/30", icon: <AlertCircle className="w-4 h-4" /> },
  { id: "PREPARING", label: "Preparando", color: "text-primary", bg: "bg-primary/10 border-primary/30", icon: <ChefHat className="w-4 h-4" /> },
  { id: "READY", label: "Prontos", color: "text-accent", bg: "bg-accent/10 border-accent/30", icon: <CheckCircle className="w-4 h-4" /> },
  { id: "DELIVERED", label: "Entregues", color: "text-gray-400", bg: "bg-surface-700 border-surface-600", icon: <CheckCircle className="w-4 h-4" /> },
];

let nextOrderId = 7;

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getElapsedMinutes(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60000);
}

function playNewOrderSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {}
}

function playReadySound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [783.99, 987.77];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.35);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {}
}

function KitchenOrderCard({ order, onAdvance, onRetreat }: { order: KitchenOrder; onAdvance: () => void; onRetreat: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const elapsed = getElapsedMinutes(order.createdAt);
  const isUrgent = elapsed > 20 && (order.status === "PENDING" || order.status === "PREPARING");

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const canRetreat = currentIndex > 0;
  const canAdvance = currentIndex < STATUS_FLOW.length - 1;

  return (
    <div className={`bg-surface border border-surface-600 mb-3 transition-all ${isUrgent ? "border-error/50" : ""}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-700 text-sm font-mono font-bold">
            {order.id.slice(-4).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-sm">{order.table}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 text-xs ${isUrgent ? "text-error font-bold animate-pulse" : "text-gray-400"}`}>
            <Clock className="w-3 h-3" />
            {elapsed}min
          </div>
          <span className="text-sm font-bold text-primary">{formatCurrency(order.total)}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-600 pt-3">
          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between py-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                      {item.quantity}x
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-warning mt-1 ml-8">
                      ⚠ {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="p-3 bg-surface-700 mb-4 text-sm text-gray-300">
              📝 {order.notes}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-surface-600">
            <div className="text-xs text-gray-500">
              Pedido às {formatTime(order.createdAt)}
            </div>
            <div className="flex gap-2">
              {canRetreat && (
                <button
                  onClick={onRetreat}
                  className="flex items-center gap-1 px-3 py-2 bg-surface-700 text-gray-300 text-xs font-medium hover:bg-surface-600 transition-colors"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  Voltar
                </button>
              )}
              {canAdvance && (
                <button
                  onClick={onAdvance}
                  className="flex items-center gap-1 px-4 py-2 gradient-primary text-white text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Avançar
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KitchenPage() {
const [orders, setOrders] = useState<KitchenOrder[]>([]);
const [soundEnabled, setSoundEnabled] = useState(true);
const [showDelivered, setShowDelivered] = useState(false);
const [soundTriggered, setSoundTriggered] = useState(false);
const [isOnline, setIsOnline] = useState(true);
const prevPendingCount = React.useRef(0);
const prevReadyCount = React.useRef(0);
const establishmentSlug = "demo";
const isInitialized = React.useRef(false);
const lastOrderCount = React.useRef(0);

const fetchOrders = useCallback(async () => {
try {
const res = await fetch(`/api/orders?establishmentSlug=${establishmentSlug}`);
if (res.ok) {
const data = await res.json();
const mapped: KitchenOrder[] = data.orders.map((o: any) => ({
id: o.id,
table: o.table ? `Mesa ${o.table.number}` : "Balcão",
items: o.items.map((item: any) => ({
id: item.id,
name: item.productName || item.product?.name || "Item do cardápio",
quantity: item.quantity,
notes: item.notes || undefined,
})),
status: o.status,
createdAt: new Date(o.createdAt),
updatedAt: new Date(o.updatedAt),
total: Number(o.total),
notes: o.notes || undefined,
}));
setOrders(mapped);
setIsOnline(true);
if (mapped.length !== lastOrderCount.current) {
lastOrderCount.current = mapped.length;
}
} else {
setIsOnline(false);
}
} catch (e) {
console.error("Failed to fetch orders:", e);
setIsOnline(false);
}
}, [establishmentSlug]);

useEffect(() => {
fetchOrders();
const interval = setInterval(fetchOrders, 5000);
return () => clearInterval(interval);
}, [fetchOrders]);

  useEffect(() => {
    if (!isInitialized.current && orders.length > 0) {
      prevPendingCount.current = orders.filter((o) => o.status === "PENDING").length;
      prevReadyCount.current = orders.filter((o) => o.status === "READY").length;
      isInitialized.current = true;
      return;
    }

    const pendingCount = orders.filter((o) => o.status === "PENDING").length;
    const readyCount = orders.filter((o) => o.status === "READY").length;

    if (pendingCount > prevPendingCount.current && soundEnabled) {
      playNewOrderSound();
      setSoundTriggered(true);
      setTimeout(() => setSoundTriggered(false), 1000);
    }
    if (readyCount > prevReadyCount.current && soundEnabled) {
      playReadySound();
    }

    prevPendingCount.current = pendingCount;
    prevReadyCount.current = readyCount;
  }, [orders, soundEnabled]);

  const updateOrderStatus = async (orderId: string, status: KitchenStatus) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      fetchOrders();
    } catch (e) {
      console.error("Failed to update order:", e);
    }
  };

  const advanceOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < STATUS_FLOW.length - 1) {
      updateOrderStatus(orderId, STATUS_FLOW[idx + 1]);
    }
  };

  const retreatOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx > 0) {
      updateOrderStatus(orderId, STATUS_FLOW[idx - 1]);
    }
  };

  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount = orders.filter((o) => o.status === "READY").length;

  return (
<div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col">
{soundTriggered && (
<div className="fixed inset-0 z-50 pointer-events-none animate-pulse bg-warning/5" />
)}
{!isOnline && (
<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-error/90 text-white text-sm font-medium rounded-full">
⚠️ Sem conexão com servidor
</div>
)}

<header className="bg-surface border-b border-surface-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/estabelecimento/demo-establishment" className="p-2 hover:bg-surface-600 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <ChefHat className="w-7 h-7 text-primary" />
            <div>
              <h1 className="font-display font-bold text-lg">Cozinha</h1>
              <p className="text-xs text-gray-400">Bar & Restaurante Demo</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/30 ${soundTriggered ? "animate-pulse" : ""}`}>
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold text-warning">{pendingCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30">
            <ChefHat className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">{preparingCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">{readyCount}</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 hover:bg-surface-600 transition-colors ${soundEnabled ? "text-accent" : "text-gray-500"}`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto">
        <div className="flex min-h-full gap-4 p-4">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.id);
            if (col.id === "DELIVERED" && !showDelivered) return null;

            return (
              <div key={col.id} className="w-80 flex-shrink-0 flex flex-col">
                <div className={`flex items-center justify-between p-3 mb-3 border-b-2 ${col.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={col.color}>{col.icon}</span>
                    <h2 className="font-display font-bold text-sm">{col.label}</h2>
                    <span className={`w-6 h-6 text-xs font-bold flex items-center justify-center ${col.color}`}>
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  {colOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Nenhum pedido
                    </div>
                  )}
                  {colOrders.map((order) => (
                    <KitchenOrderCard
                      key={order.id}
                      order={order}
                      onAdvance={() => advanceOrder(order.id)}
                      onRetreat={() => retreatOrder(order.id)}
                    />
                  ))}

                  {col.id === "READY" && !showDelivered && (
                    <button
                      onClick={() => setShowDelivered(true)}
                      className="w-full mt-2 py-3 text-sm text-gray-500 hover:text-gray-300 transition-colors border-2 border-dashed border-surface-600"
                    >
                      Ver entregues ({deliveredOrders.length})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
