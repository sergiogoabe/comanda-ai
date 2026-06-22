"use client";

import React from "react";
import { useChatStore } from "@/store/chat-store";
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface CartViewProps {
  onClose: () => void;
}

export function CartView({ onClose }: CartViewProps) {
  const { cart, updateCartItem, removeFromCart, getCartTotal, setTyping, addMessage } =
    useChatStore();
  const total = getCartTotal();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const totalFormatted = formatCurrency(total);
    addMessage({
      id: Date.now().toString(),
      role: "user",
      content: `Quero fechar a conta. Total de ${totalFormatted}`,
      timestamp: new Date(),
    });
    onClose();
  };

  const handleRequestSplit = () => {
    addMessage({
      id: Date.now().toString(),
      role: "user",
      content: "Gostaria de dividir a conta igualmente",
      timestamp: new Date(),
    });
    addMessage({
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Perfeito! Para dividir igualmente entre as pessoas, vou mostrar a opção no checkout. O valor por pessoa seria ${formatCurrency(total / 2)}.`,
      timestamp: new Date(),
    });
    onClose();
  };

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-600">
          <h2 className="font-semibold">Carrinho</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-surface-700 flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Carrinho vazio</h3>
          <p className="text-gray-400 text-sm mb-6">
            Adicione itens do cardápio para fazer seu pedido
          </p>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Ver Cardápio</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-600">
        <h2 className="font-semibold">
          Carrinho ({cart.length} {cart.length === 1 ? "item" : "itens"})
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-surface-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-surface border border-surface-600"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-surface-700 flex items-center justify-center text-lg font-bold">
                {item.product.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{item.product.name}</h4>
                    {item.variant && (
                      <p className="text-xs text-gray-400">{item.variant.name}</p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 rounded-lg hover:bg-surface-600 text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 bg-surface-700 rounded-lg">
                    <button
                      onClick={() =>
                        updateCartItem(item.id, {
                          quantity: Math.max(1, item.quantity - 1),
                        })
                      }
                      className="p-1.5 rounded-lg hover:bg-surface-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartItem(item.id, { quantity: item.quantity + 1 })
                      }
                      className="p-1.5 rounded-lg hover:bg-surface-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-primary font-semibold">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary & Actions */}
      <div className="p-4 bg-surface border-t border-surface-600 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Taxa de serviço (10%)</span>
            <span>{formatCurrency(total * 0.1)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-surface-600">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total * 1.1)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRequestSplit}
            className="py-3 rounded-xl bg-surface-700 text-white font-medium hover:bg-surface-600 transition-colors"
          >
            Dividir Conta
          </button>
          <button
            onClick={handleCheckout}
            className="py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
          >
            Fechar Conta
          </button>
        </div>
      </div>
    </div>
  );
}