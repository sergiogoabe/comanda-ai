"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore, type Message } from "@/store/chat-store";
import { Send, ShoppingCart, Menu, ArrowLeft } from "lucide-react";
import { cn, formatCurrency, generateId } from "@/lib/utils";
import { MenuView } from "./MenuView";
import { CartView } from "./CartView";
import { CheckoutView } from "./CheckoutView";

export function ChatInterface() {
const [activeView, setActiveView] = useState<"chat" | "menu" | "cart" | "checkout">("chat");
const [input, setInput] = useState("");
const [isOffline, setIsOffline] = useState(false);
const messagesEndRef = useRef<HTMLDivElement>(null);
const {
messages,
addMessage,
setTyping,
cart,
categories,
establishment,
table,
} = useChatStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildMenuContext = () => {
    return categories.map((cat) => {
      const products = cat.products.map((p) => `  - ${p.name} (R$ ${p.price.toFixed(2)}): ${p.description}`).join("\n");
      return `${cat.name}:\n${products}`;
    }).join("\n\n");
  };

  const handleSendMessage = async () => {
if (!input.trim()) return;

const userMessage: Message = {
id: generateId(),
role: "user",
content: input.trim(),
timestamp: new Date(),
};
addMessage(userMessage);
const userInput = input.trim();
setInput("");
setTyping(true);
setIsOffline(false);

const apiMessages = [
{ role: "user" as const, content: userInput },
];

try {
const res = await fetch("/api/chat", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
messages: apiMessages,
menuContext: buildMenuContext(),
}),
});

setTyping(false);

if (res.ok) {
const data = await res.json();
const assistantMessage: Message = {
id: generateId(),
role: "assistant",
content: data.response,
timestamp: new Date(),
};
addMessage(assistantMessage);
} else if (res.status === 429) {
const errorMessage: Message = {
id: generateId(),
role: "assistant",
content: "⚠️ Muitas solicitações. Aguarde alguns segundos e tente novamente.",
timestamp: new Date(),
};
addMessage(errorMessage);
} else {
const errorMessage: Message = {
id: generateId(),
role: "assistant",
content: "😕 Ocorreu um erro. Tente novamente.",
timestamp: new Date(),
};
addMessage(errorMessage);
}
} catch (error) {
setTyping(false);
setIsOffline(true);
const errorMessage: Message = {
id: generateId(),
role: "assistant",
content: "⚠️ Erro de conexão. Verifique sua internet e tente novamente.",
timestamp: new Date(),
};
addMessage(errorMessage);
}
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-600">
        <div className="flex items-center gap-3">
          {activeView !== "chat" && (
            <button
              onClick={() => setActiveView("chat")}
              className="p-2 hover:bg-surface-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <div>
            <h1 className="font-semibold text-sm">
              {establishment?.name || "Restaurante"}
            </h1>
            <p className="text-xs text-gray-400">
              Mesa {table?.number || "1"}
            </p>
          </div>
        </div>
        {activeView === "chat" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("menu")}
              className="p-2 hover:bg-surface-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveView("cart")}
              className="p-2 relative hover:bg-surface-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-black text-xs flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-hidden">
        {activeView === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {useChatStore.getState().isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-2 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setInput("Ver cardápio")}
                className="flex items-center gap-2 px-3 py-2 bg-surface text-sm whitespace-nowrap hover:bg-surface-600 transition-colors"
              >
                <Menu className="w-4 h-4 text-primary" />
                Cardápio
              </button>
              <button
                onClick={() => setInput("Sugestão do chef")}
                className="flex items-center gap-2 px-3 py-2 bg-surface text-sm whitespace-nowrap hover:bg-surface-600 transition-colors"
              >
                <span className="text-warning">⭐</span>
                Sugestão
              </button>
              <button
                onClick={() => setInput("Fechar conta")}
                className="flex items-center gap-2 px-3 py-2 bg-surface text-sm whitespace-nowrap hover:bg-surface-600 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-accent" />
                Conta
              </button>
            </div>

        <div className="p-4 bg-surface border-t border-surface-600">
{isOffline && (
<div className="mb-3 p-2 bg-error/20 border border-error/30 rounded text-xs text-error text-center">
⚠️ Sem conexão. Verifique sua internet.
</div>
)}
<div className="flex items-center gap-3">
<input
type="text"
value={input}
onChange={(e) => setInput(e.target.value)}
onKeyDown={handleKeyPress}
placeholder="Digite sua mensagem..."
className="flex-1 px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none text-sm placeholder:text-gray-500"
/>
<button
onClick={handleSendMessage}
disabled={!input.trim() || isOffline}
className="p-3 gradient-primary disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
>
<Send className="w-5 h-5 text-white" />
</button>
</div>
</div>
          </div>
        )}

        {activeView === "menu" && (
          <MenuView onClose={() => setActiveView("chat")} />
        )}

        {activeView === "cart" && (
          <CartView onClose={() => setActiveView("chat")} />
        )}

        {activeView === "checkout" && <CheckoutView />}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        "flex animate-slide-up",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] px-4 py-3",
          message.role === "user"
            ? "bg-primary text-white rounded-br-sm"
            : "bg-surface text-white rounded-bl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-gray-400 mt-1">
          {message.timestamp.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-slide-up">
      <div className="bg-surface rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
          <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
          <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
        </div>
      </div>
    </div>
  );
}
