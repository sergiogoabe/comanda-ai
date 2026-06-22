"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Clock, Star, ShoppingCart, ChefHat, Plus, Minus, Truck, Store } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const categories = [
  { id: "all", name: "Todos", icon: "🍽️" },
  { id: "pizzas", name: "Pizzas", icon: "🍕" },
  { id: "burgers", name: "Hambúrgueres", icon: "🍔" },
  { id: "drinks", name: "Bebidas", icon: "🥤" },
  { id: "desserts", name: "Sobremesas", icon: "🍰" },
];

const products = [
  { id: "1", name: "Pizza Margherita Grande", description: "Molho de tomate, mussarela, manjericão", price: 52, category: "pizzas", rating: 4.8 },
  { id: "2", name: "Pizza Pepperoni", description: "Molho de tomate, mussarela, pepperoni", price: 58, category: "pizzas", rating: 4.7 },
  { id: "3", name: "Smash Burguer", description: "200g de blend, queijo cheddar, cebola caramelizada", price: 32, category: "burgers", rating: 4.9 },
  { id: "4", name: "Cheese Bacon", description: "Duplo smash, bacon crocante, queijo americano", price: 38, category: "burgers", rating: 4.8 },
  { id: "5", name: "Refrigerante 600ml", description: "Coca-Cola, Guaraná ou Sprite", price: 12, category: "drinks", rating: 4.5 },
  { id: "6", name: "IPA Artesanal", description: "Cerveja artesanal local", price: 18, category: "drinks", rating: 4.6 },
  { id: "7", name: "Brownie", description: "Com sorvete de creme e calda quente", price: 22, category: "desserts", rating: 4.9 },
  { id: "8", name: "Petit Gateau", description: "Bolinho de chocolate com sorvete de baunilha", price: 28, category: "desserts", rating: 5.0 },
];

const sampleEstablishments = [
  { id: "1", name: "Bar & Restaurante Demo", rating: 4.8, distance: "2.3 km", deliveryTime: "25-35 min" },
  { id: "2", name: "Pizzaria Express", rating: 4.6, distance: "3.1 km", deliveryTime: "30-40 min" },
  { id: "3", name: "Hamburgueria Central", rating: 4.7, distance: "1.8 km", deliveryTime: "20-30 min" },
];

interface CartItem {
  product: typeof products[0];
  quantity: number;
}

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState<"browse" | "orders" | "cart">("browse");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState(sampleEstablishments[0]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: typeof products[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = 5.9;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-surface-600">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold">ComandaAI</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("cart")}
                className="relative p-2 rounded-lg hover:bg-surface-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-black text-xs flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("browse")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === "browse" ? "gradient-primary text-white" : "bg-surface text-gray-400"
              )}
            >
              <Store className="w-4 h-4 inline mr-2" />
              Pedir Online
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === "orders" ? "gradient-primary text-white" : "bg-surface text-gray-400"
              )}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Acompanhar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {activeTab === "browse" && (
          <>
            {/* Establishment Info */}
            <div className="p-4 rounded-xl bg-surface border border-surface-600 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-xl">
                    {selectedEstablishment.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedEstablishment.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        {selectedEstablishment.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedEstablishment.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedEstablishment.deliveryTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar no cardápio..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border border-surface-600 focus:border-primary focus:outline-none placeholder:text-gray-500"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                    selectedCategory === cat.id
                      ? "gradient-primary text-white"
                      : "bg-surface text-gray-300 hover:bg-surface-600"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-xl bg-surface border border-surface-600"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-16 rounded-lg bg-surface-700 flex items-center justify-center text-2xl">
                      {product.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium">{product.name}</h3>
                        <span className="flex items-center gap-1 text-sm text-warning">
                          <Star className="w-3 h-3 fill-warning" />
                          {product.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum pedido em andamento</h2>
            <p className="text-gray-400">
              Seus pedidos em delivery aparecerão aqui
            </p>
          </div>
        )}

        {activeTab === "cart" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Seu Carrinho</h2>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="font-semibold mb-2">Carrinho vazio</h3>
                <p className="text-gray-400 text-sm">
                  Adicione itens para fazer seu pedido
                </p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="mt-4 px-6 py-2 rounded-lg gradient-primary text-white text-sm font-medium"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-surface-600"
                    >
                      <div className="w-12 h-12 rounded-lg bg-surface-700 flex items-center justify-center text-lg">
                        {item.product.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <span className="text-primary text-sm">
                          {formatCurrency(item.product.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-surface-700 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 rounded hover:bg-surface-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 rounded hover:bg-surface-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-surface border border-surface-600 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Taxa de entrega</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-surface-600">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cartTotal + deliveryFee)}</span>
                  </div>
                </div>

                <button className="w-full py-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity">
                  Finalizar Pedido
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}