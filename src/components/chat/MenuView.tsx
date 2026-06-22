"use client";

import React, { useState } from "react";
import { useChatStore, type Product, type CartItem, type Category } from "@/store/chat-store";
import { sampleCategories } from "./sample-menu";
import { X, Plus, Minus, ShoppingCart, Clock, Flame } from "lucide-react";
import { cn, formatCurrency, generateId } from "@/lib/utils";

interface MenuViewProps {
  onClose: () => void;
}

export function MenuView({ onClose }: MenuViewProps) {
  const { addToCart } = useChatStore();
  const categories: Category[] = sampleCategories;
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAdditions, setSelectedAdditions] = useState<any[]>([]);

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const price = selectedVariant
      ? selectedVariant.price
      : selectedProduct.price;
    const additionsTotal = selectedAdditions.reduce(
      (sum, a) => sum + a.price,
      0
    );

    const cartItem: CartItem = {
      id: generateId(),
      product: selectedProduct,
      quantity,
      additions: selectedAdditions,
      variant: selectedVariant,
      notes: notes || undefined,
      unitPrice: price + additionsTotal,
      totalPrice: (price + additionsTotal) * quantity,
    };

    addToCart(cartItem);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setSelectedAdditions([]);
    setQuantity(1);
    setNotes("");
  };

  const toggleAddition = (addition: any) => {
    setSelectedAdditions((prev) => {
      const exists = prev.find((a) => a.id === addition.id);
      if (exists) {
        return prev.filter((a) => a.id !== addition.id);
      }
      return [...prev, addition];
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-600">
        <div>
          <h2 className="font-display font-bold">Cardápio</h2>
          {currentCategory?.description && (
            <p className="text-xs text-gray-400">{currentCategory.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-surface-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 p-4 overflow-x-auto bg-surface border-b border-surface-600">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap transition-colors",
              selectedCategory === category.id
                ? "gradient-primary text-white"
                : "bg-surface-700 text-gray-300 hover:bg-surface-600"
            )}
          >
            <span>{category.icon}</span>
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentCategory?.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={() => {
              setSelectedProduct(product);
              setSelectedVariant(
                product.variants.length > 0 ? product.variants[0] : null
              );
              setSelectedAdditions([]);
            }}
          />
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="bg-surface w-full sm:max-w-md sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Product Image Placeholder */}
            <div className="w-full h-48 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center relative">
              <span className="text-6xl">{selectedProduct.emoji || selectedProduct.name.charAt(0)}</span>
              {selectedProduct.tags?.includes("Mais Pedido") && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-medium">
                  <Flame className="w-3 h-3" />
                  Mais Pedido
                </div>
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-display font-bold">{selectedProduct.name}</h3>
              <p className="text-gray-400 text-sm mt-2">
                {selectedProduct.description}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-primary font-bold text-lg">
                  {formatCurrency(
                    selectedVariant
                      ? selectedVariant.price
                      : selectedProduct.price
                  )}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {selectedProduct.preparationTime} min
                </span>
                {selectedProduct.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-primary/20 text-primary text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Variants */}
              {selectedProduct.variants.length > 0 && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-400 mb-3 block">
                    Escolha a opção
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProduct.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          "p-3 bg-surface-700 border text-sm transition-colors",
                          selectedVariant?.id === variant.id
                            ? "border-primary bg-primary/10"
                            : "border-surface-600 hover:border-surface-500"
                        )}
                      >
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-primary text-xs">
                          {formatCurrency(variant.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additions */}
              {selectedProduct.additions.length > 0 && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-400 mb-3 block">
                    Adicionais
                  </label>
                  <div className="space-y-2">
                    {selectedProduct.additions.map((addition) => (
                      <button
                        key={addition.id}
                        onClick={() => toggleAddition(addition)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 bg-surface-700 transition-colors",
                          selectedAdditions.find((a) => a.id === addition.id)
                            ? "border-2 border-primary bg-primary/10"
                            : "border border-surface-600 hover:border-surface-500"
                        )}
                      >
                        <span className="text-sm">{addition.name}</span>
                        <span className="text-primary text-sm font-medium">
                          + {formatCurrency(addition.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: sem cebola, bem passado..."
                  className="w-full p-3 rounded-lg bg-surface-700 border border-surface-600 resize-none h-20 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Quantity & Add */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-3 bg-surface-700 p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg hover:bg-surface-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg hover:bg-surface-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-4 gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    Adicionar{" "}
                    {formatCurrency(
                      ((selectedVariant?.price || selectedProduct.price) +
                        selectedAdditions.reduce((sum, a) => sum + a.price, 0)) *
                        quantity
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface border border-surface-600 hover:border-primary/50 transition-colors text-left"
    >
      <div className="w-16 h-16 rounded-lg bg-surface-700 flex items-center justify-center text-2xl flex-shrink-0">
        {product.emoji || product.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium">{product.name}</h4>
          {product.tags?.includes("Mais Pedido") && (
            <span className="flex items-center gap-1 text-xs text-warning flex-shrink-0">
              <Flame className="w-3 h-3 fill-warning" />
              Popular
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 mt-1">
          {product.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary font-bold">
            {formatCurrency(product.price)}
          </span>
          {product.preparationTime && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {product.preparationTime}min
            </span>
          )}
        </div>
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags.filter((t) => t !== "Mais Pedido").map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-primary/20 text-primary text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </button>
  );
}