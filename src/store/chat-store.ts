import { create } from "zustand";

export interface Addition {
  id: string;
  name: string;
  price: number;
}

export interface Variant {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isActive: boolean;
  preparationTime: number;
  additions: Addition[];
  variants: Variant[];
  tags?: string[];
  emoji?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
  description?: string;
  products: Product[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: Variant;
  additions: Addition[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: Date;
}

interface ChatStore {
  establishment: {
    id: string;
    name: string;
    logo: string;
  } | null;
  table: {
    id: string;
    number: string;
  } | null;
  messages: Message[];
  cart: CartItem[];
  isTyping: boolean;
  categories: Category[];
  sessionId: string | null;
  
  setEstablishment: (establishment: ChatStore["establishment"]) => void;
  setTable: (table: ChatStore["table"]) => void;
  addMessage: (message: Message) => void;
  setTyping: (isTyping: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  setCategories: (categories: Category[]) => void;
  setSessionId: (sessionId: string) => void;
  getCartTotal: () => number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  action?: {
    type: "add_to_cart" | "view_menu" | "checkout" | "suggestion" | "order_confirmed";
    data?: unknown;
  };
}

export const useChatStore = create<ChatStore>((set, get) => ({
  establishment: null,
  table: null,
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Olá! Sou seu assistente virtual. Como posso ajudá-lo hoje?\n\nPosso ajudar você a:\n• Ver o cardápio completo\n• Fazer pedidos do seu jeito\n• Dividir a conta\n• Sair da conta\n\nÉ só me dizer o que deseja!",
      timestamp: new Date(),
    },
  ],
  isTyping: false,
  cart: [],
  categories: [],
  sessionId: null,

  setEstablishment: (establishment) => set({ establishment }),
  setTable: (table) => set({ table }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setTyping: (isTyping) => set({ isTyping }),
  addToCart: (item) =>
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (ci) =>
          ci.product.id === item.product.id &&
          ci.variant?.id === item.variant?.id &&
          JSON.stringify(ci.additions) === JSON.stringify(item.additions)
      );
      if (existingIndex > -1) {
        const updated = [...state.cart];
        updated[existingIndex].quantity += item.quantity;
        updated[existingIndex].totalPrice =
          updated[existingIndex].unitPrice * updated[existingIndex].quantity;
        return { cart: updated };
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    })),
  updateCartItem: (itemId, updates) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === itemId
          ? { ...item, ...updates, totalPrice: (updates.quantity || item.quantity) * item.unitPrice }
          : item
      ),
    })),
  clearCart: () => set({ cart: [] }),
  setCategories: (categories) => set({ categories }),
  setSessionId: (sessionId) => set({ sessionId }),
  getCartTotal: () => {
    const cart = get().cart;
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  },
}));