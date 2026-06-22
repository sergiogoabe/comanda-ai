"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Utensils,
  ChefHat,
  Settings as SettingsIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Bell,
  CreditCard,
  Shield,
  QrCode,
  Plus,
  Trash2,
  Edit,
  Save,
  Upload,
  Printer,
  MessageSquare,
  Wifi,
  Store,
  Calendar,
  Star,
  Eye,
  EyeOff,
  Copy,
  Download,
  Filter,
  MoreVertical,
  Check,
  X,
  Zap,
  Truck,
  FileText,
  Key,
  Smartphone,
  AlertTriangle,
  Palette,
  Clock4,
  Percent,
  Package,
  Camera,
  Hash,
  Loader2,
} from "lucide-react";
import { EstablishmentDashboardLayout, StatCard } from "@/components/dashboard/Layout";
import { KitchenDisplay } from "@/components/kitchen/KitchenDisplay";
import { formatCurrency, getStatusColor, getStatusLabel, getRelativeTime } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#9333EA", "#06B6D4", "#F59E0B", "#9CA3AF"];

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isActive: boolean;
  preparationTime: number | null;
  tags: string[];
  emoji: string | null;
  categoryId: string;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  _count?: { products: number };
}

interface Table {
  id: string;
  number: string;
  isActive: boolean;
  _count?: { orders: number };
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productImage: string | null;
  notes: string | null;
}

interface Order {
  id: string;
  status: string;
  type: string;
  subtotal: number;
  total: number;
  notes: string | null;
  table?: { number: string } | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface MenuState {
  categories: Category[];
  products: Product[];
  loading: boolean;
}

interface TablesState {
  tables: Table[];
  loading: boolean;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
}

export default function EstablishmentDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const establishmentId = (session?.user as any)?.establishmentId || "demo-establishment";
  const establishmentName = (session?.user as any)?.name || "Bar & Restaurante Demo";
  const [ordersState, setOrdersState] = useState<OrdersState>({ orders: [], loading: true });
  const [menuState, setMenuState] = useState<MenuState>({ categories: [], products: [], loading: true });
  const [tablesState, setTablesState] = useState<TablesState>({ tables: [], loading: true });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?establishmentId=${establishmentId}`);
      if (res.ok) {
        const data = await res.json();
        setOrdersState({ orders: data.orders || [], loading: false });
      }
    } catch (e) {
      setOrdersState({ orders: [], loading: false });
    }
  }, [establishmentId]);

  const fetchMenu = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch(`/api/categories?establishmentId=${establishmentId}`),
        fetch(`/api/products?establishmentId=${establishmentId}`),
      ]);
      const catData = catRes.ok ? await catRes.json() : { categories: [] };
      const prodData = prodRes.ok ? await prodRes.json() : { products: [] };
      setMenuState({
        categories: catData.categories || [],
        products: prodData.products || [],
        loading: false,
      });
    } catch (e) {
      setMenuState({ categories: [], products: [], loading: false });
    }
  }, [establishmentId]);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch(`/api/tables?establishmentId=${establishmentId}`);
      if (res.ok) {
        const data = await res.json();
        setTablesState({ tables: data.tables || [], loading: false });
      }
    } catch (e) {
      setTablesState({ tables: [], loading: false });
    }
  }, [establishmentId]);

  useEffect(() => {
    fetchOrders();
    fetchMenu();
    fetchTables();
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchMenu, fetchTables, refreshKey]);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab orders={ordersState.orders} tables={tablesState.tables} />;
      case "orders":
        return <OrdersTab orders={ordersState.orders} onRefresh={fetchOrders} />;
      case "kitchen":
        return <KitchenDisplay establishmentId={establishmentId} />;
      case "menu":
        return (
          <MenuSettingsTab
            categories={menuState.categories}
            products={menuState.products}
            establishmentId={establishmentId}
            onRefresh={fetchMenu}
          />
        );
      case "tables":
        return (
          <TablesSettingsTab
            tables={tablesState.tables}
            establishmentId={establishmentId}
            onRefresh={fetchTables}
          />
        );
      case "customers":
        return <CustomersTab establishmentId={establishmentId} />;
      case "settings":
        return <SettingsTab establishmentId={establishmentId} />;
      default:
        return <ComingSoonTab name={activeTab} />;
    }
  };

  return (
    <EstablishmentDashboardLayout
      activeTab={activeTab}
      establishmentId={establishmentId}
      establishmentName={establishmentName}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </EstablishmentDashboardLayout>
  );
}

function OverviewTab({ orders, tables }: { orders: Order[]; tables: Table[] }) {
  const recentOrders = orders.slice(0, 5);
  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const activeTables = tables.filter(t => t.isActive).length;

  const salesByDay = orders.reduce((acc: Record<string, number>, order) => {
    const day = new Date(order.createdAt).toLocaleDateString("pt-BR", { weekday: "short" });
    acc[day] = (acc[day] || 0) + Number(order.total);
    return acc;
  }, {});

  const salesData = Object.entries(salesByDay).map(([day, value]) => ({ day, value }));

  const categorySales = orders.flatMap(o => o.items).reduce((acc: Record<string, number>, item) => {
    acc[item.productName] = (acc[item.productName] || 0) + Number(item.totalPrice);
    return acc;
  }, {});

  const categoryData = Object.entries(categorySales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([name, value]) => ({ name: name.split(" ").slice(0, 2).join(" "), value }));

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nenhum pedido ainda</h2>
        <p className="text-gray-400">Os pedidos aparecerão aqui quando os clientes começarem a pedir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vendas Totais"
          value={formatCurrency(totalSales)}
          change={`${orders.length} pedidos`}
          changeType="up"
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatCard
          title="Pedidos"
          value={orders.length.toString()}
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(orders.length > 0 ? totalSales / orders.length : 0)}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          title="Mesas Ativas"
          value={activeTables.toString()}
          icon={<Users className="w-6 h-6" />}
        />
      </div>

      {salesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-xl bg-surface border border-surface-600">
            <h3 className="font-semibold mb-4">Vendas por Dia</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3D" />
                  <XAxis dataKey="day" stroke="#6B6B7B" fontSize={12} />
                  <YAxis stroke="#6B6B7B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E1E2F",
                      border: "1px solid #2A2A3D",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#9333EA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {categoryData.length > 0 && (
            <div className="p-6 rounded-xl bg-surface border border-surface-600">
              <h3 className="font-semibold mb-4">Mais Vendidos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E1E2F",
                        border: "1px solid #2A2A3D",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-6 rounded-xl bg-surface border border-surface-600">
        <h3 className="font-semibold mb-4">Pedidos Recentes</h3>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="pb-3">Pedido</th>
                  <th className="pb-3">Mesa</th>
                  <th className="pb-3">Itens</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-600">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-3 font-mono font-medium">{order.id.slice(-6)}</td>
                    <td className="py-3">{order.table ? `Mesa ${order.table.number}` : "—"}</td>
                    <td className="py-3">{order.items.length} itens</td>
                    <td className="py-3 text-primary font-medium">
                      {formatCurrency(Number(order.total))}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {getRelativeTime(new Date(order.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhum pedido recente</p>
        )}
      </div>
    </div>
  );
}

function OrdersTab({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      onRefresh();
    } catch (e) {
      console.error("Failed to update order status");
    }
  };

  const statusCounts = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-surface border border-surface-600 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">Todos ({orders.length})</option>
            <option value="PENDING">Pendentes ({statusCounts.PENDING || 0})</option>
            <option value="CONFIRMED">Confirmados ({statusCounts.CONFIRMED || 0})</option>
            <option value="PREPARING">Preparando ({statusCounts.PREPARING || 0})</option>
            <option value="READY">Prontos ({statusCounts.READY || 0})</option>
            <option value="DELIVERED">Entregues ({statusCounts.DELIVERED || 0})</option>
          </select>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-surface hover:bg-surface-600 text-sm transition-colors"
          >
            Atualizar
          </button>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-xl bg-surface border border-surface-600"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">{order.table ? `Mesa ${order.table.number}` : "—"}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="text-sm text-gray-400 mb-2">
                {order.items.length} itens • {formatCurrency(Number(order.total))}
              </div>
              <div className="space-y-1 mb-3">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-400">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>{formatCurrency(Number(item.totalPrice))}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-500">+{order.items.length - 3} mais...</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {getRelativeTime(new Date(order.createdAt))}
                </span>
                <div className="flex gap-1">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleStatusChange(order.id, "CONFIRMED")}
                      className="px-2 py-1 bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                  {order.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleStatusChange(order.id, "PREPARING")}
                      className="px-2 py-1 bg-warning/20 text-warning text-xs hover:bg-warning/30 transition-colors"
                    >
                      Preparar
                    </button>
                  )}
                  {order.status === "PREPARING" && (
                    <button
                      onClick={() => handleStatusChange(order.id, "READY")}
                      className="px-2 py-1 bg-accent/20 text-accent text-xs hover:bg-accent/30 transition-colors"
                    >
                      Pronto
                    </button>
                  )}
                  {order.status === "READY" && (
                    <button
                      onClick={() => handleStatusChange(order.id, "DELIVERED")}
                      className="px-2 py-1 bg-green-500/20 text-green-400 text-xs hover:bg-green-500/30 transition-colors"
                    >
                      Entregue
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum pedido encontrado</p>
        </div>
      )}
    </div>
  );
}

function CustomersTab({ establishmentId }: { establishmentId: string }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "totalSpent" | "orderCount" | "lastOrderAt">("totalSpent");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    fetch(`/api/contacts?establishmentId=${establishmentId}`)
      .then(r => r.json())
      .then(d => {
        setContacts(d.contacts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [establishmentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadInteractions = async (contactId: string) => {
    try {
      const res = await fetch(`/api/interactions?contactId=${contactId}`);
      const data = await res.json();
      setInteractions(data.interactions || []);
    } catch {
      setInteractions([]);
    }
  };

  const openCustomer = async (c: any) => {
    setSelectedCustomer(c);
    setNewNote("");
    await loadInteractions(c.id);
  };

  const addInteraction = async (type: string, content: string) => {
    if (!selectedCustomer || !content.trim()) return;
    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedCustomer.id, type, content }),
      });
      if (res.ok) {
        await loadInteractions(selectedCustomer.id);
        showToast("Nota adicionada!");
        setNewNote("");
      }
    } catch {
      showToast("Erro ao adicionar nota.");
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Excluir este cliente?")) return;
    try {
      await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
      setContacts(prev => prev.filter(c => c.id !== id));
      setSelectedCustomer(null);
      showToast("Cliente excluído.");
    } catch {
      showToast("Erro ao excluir.");
    }
  };

  const toggleTag = async (contact: any, tag: string) => {
    const tags = contact.tags || [];
    const newTags = tags.includes(tag) ? tags.filter((t: string) => t !== tag) : [...tags, tag];
    try {
      const res = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contact.id, tags: newTags }),
      });
      if (res.ok) {
        setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, tags: newTags } : c));
        setSelectedCustomer((prev: any) => prev ? { ...prev, tags: newTags } : null);
      }
    } catch {
      showToast("Erro ao atualizar tag.");
    }
  };

  const allTags = Array.from(new Set(contacts.flatMap((c: any) => c.tags || [])));

  const filtered = contacts
    .filter((c: any) => {
      if (search) {
        const s = search.toLowerCase();
        return (
          c.name?.toLowerCase().includes(s) ||
          c.email?.toLowerCase().includes(s) ||
          c.phone?.includes(s)
        );
      }
      return true;
    })
    .filter((c: any) => tagFilter === "all" || c.tags?.includes(tagFilter))
    .sort((a: any, b: any) => {
      if (sortBy === "name") return a.name?.localeCompare(b.name || "");
      if (sortBy === "totalSpent") return Number(b.totalSpent || 0) - Number(a.totalSpent || 0);
      if (sortBy === "orderCount") return (b.orderCount || 0) - (a.orderCount || 0);
      if (sortBy === "lastOrderAt") return new Date(b.lastOrderAt || 0).getTime() - new Date(a.lastOrderAt || 0).getTime();
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalRevenue = contacts.reduce((sum: number, c: any) => sum + Number(c.totalSpent || 0), 0);
  const vipCount = contacts.filter((c: any) => c.tags?.includes("VIP")).length;
  const avgTicket = contacts.length > 0 ? totalRevenue / contacts.reduce((s: number, c: any) => s + (c.orderCount || 0), 0) || 0 : 0;

  useEffect(() => { setPage(1); }, [search, tagFilter, sortBy]);

  const interactionTypeIcon = (type: string) => {
    switch (type) {
      case "NOTE": return "📝";
      case "ORDER": return "🛒";
      case "EMAIL": return "📧";
      case "SMS": return "📱";
      case "CALL": return "📞";
      default: return "💬";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}

      {selectedCustomer ? (
        <CustomerDetailModal
          customer={selectedCustomer}
          interactions={interactions}
          newNote={newNote}
          setNewNote={setNewNote}
          addInteraction={addInteraction}
          toggleTag={toggleTag}
          onClose={() => { setSelectedCustomer(null); setInteractions([]); }}
          onDelete={deleteContact}
          formatCurrency={formatCurrency}
          interactionTypeIcon={interactionTypeIcon}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">CRM - Clientes</h2>
              <p className="text-sm text-gray-400">{contacts.length} clientes cadastrados</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 bg-surface border border-surface-600">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold mt-4">{contacts.length}</h3>
              <p className="text-gray-400 text-sm">Total de Clientes</p>
            </div>
            <div className="p-6 bg-surface border border-surface-600">
              <Star className="w-6 h-6 text-warning" />
              <h3 className="text-2xl font-bold mt-4">{vipCount}</h3>
              <p className="text-gray-400 text-sm">Clientes VIP</p>
            </div>
            <div className="p-6 bg-surface border border-surface-600">
              <DollarSign className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold mt-4">{formatCurrency(totalRevenue)}</h3>
              <p className="text-gray-400 text-sm">Total Faturado</p>
            </div>
            <div className="p-6 bg-surface border border-surface-600">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold mt-4">{formatCurrency(avgTicket)}</h3>
              <p className="text-gray-400 text-sm">Ticket Médio</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou telefone..."
                className="w-full pl-4 pr-4 py-3 bg-surface border border-surface-600 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              className="px-4 py-3 bg-surface border border-surface-600 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">Todas as tags</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-surface border border-surface-600 text-sm focus:border-primary focus:outline-none"
            >
              <option value="totalSpent">Mais gastos</option>
              <option value="orderCount">Mais pedidos</option>
              <option value="lastOrderAt">Último pedido</option>
              <option value="name">Nome A-Z</option>
            </select>
          </div>

          {paginated.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase">
                      <th className="pb-3">Cliente</th>
                      <th className="pb-3">Contato</th>
                      <th className="pb-3">Pedidos</th>
                      <th className="pb-3">Total Gasto</th>
                      <th className="pb-3">Tags</th>
                      <th className="pb-3">Última Visita</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-600">
                    {paginated.map((c: any) => (
                      <tr key={c.id} className="text-sm hover:bg-surface-700/50 cursor-pointer" onClick={() => openCustomer(c)}>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {c.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-400">{c.phone || c.email || "—"}</td>
                        <td className="py-3">{c._count?.orders || c.orderCount || 0}</td>
                        <td className="py-3 text-primary font-medium">{formatCurrency(Number(c.totalSpent))}</td>
                        <td className="py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(c.tags || []).slice(0, 3).map((t: string) => (
                              <span key={t} className="px-2 py-0.5 bg-primary/20 text-primary text-xs">
                                {t}
                              </span>
                            ))}
                            {c.tags?.length > 3 && (
                              <span className="px-2 py-0.5 bg-surface-600 text-gray-400 text-xs">+{c.tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-gray-400 text-xs">
                          {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteContact(c.id); }}
                            className="p-1 hover:bg-error/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-gray-500 hover:text-error" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 bg-surface border border-surface-600 text-sm disabled:opacity-40 hover:bg-surface-600 transition-colors"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<number[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push(-1);
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === -1 ? (
                          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 text-sm ${
                              p === page
                                ? "bg-primary text-white"
                                : "bg-surface border border-surface-600 hover:bg-surface-600 transition-colors"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 bg-surface border border-surface-600 text-sm disabled:opacity-40 hover:bg-surface-600 transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{search || tagFilter !== "all" ? "Nenhum cliente encontrado com os filtros aplicados" : "Nenhum cliente cadastrado ainda"}</p>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <AddCustomerModal
          establishmentId={establishmentId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetch(`/api/contacts?establishmentId=${establishmentId}`)
              .then(r => r.json())
              .then(d => setContacts(d.contacts || []));
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function CustomerDetailModal({
  customer,
  interactions,
  newNote,
  setNewNote,
  addInteraction,
  toggleTag,
  onClose,
  onDelete,
  formatCurrency,
  interactionTypeIcon,
}: {
  customer: any;
  interactions: any[];
  newNote: string;
  setNewNote: (v: string) => void;
  addInteraction: (type: string, content: string) => void;
  toggleTag: (c: any, tag: string) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  formatCurrency: (v: number) => string;
  interactionTypeIcon: (t: string) => string;
}) {
  const predefinedTags = ["VIP", "Frequente", "Novo", "Reclamação", "Elogio", "Aniversariante"];
  const npsScore = customer.nps || 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-background border border-surface-600 my-8">
        <div className="flex items-center justify-between p-6 border-b border-surface-600">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{customer.name}</h2>
              <p className="text-sm text-gray-400">Cliente desde {new Date(customer.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(customer.id)}
              className="p-2 hover:bg-error/20 rounded transition-colors"
            >
              <Trash2 className="w-5 h-5 text-gray-400 hover:text-error" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface-600 rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-surface-700">
                <p className="text-xs text-gray-400">Total Gasto</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(Number(customer.totalSpent || 0))}</p>
              </div>
              <div className="p-4 bg-surface-700">
                <p className="text-xs text-gray-400">Pedidos</p>
                <p className="text-lg font-bold">{customer.orderCount || 0}</p>
              </div>
              <div className="p-4 bg-surface-700">
                <p className="text-xs text-gray-400">Última Visita</p>
                <p className="text-sm font-medium">{customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
              <div className="p-4 bg-surface-700">
                <p className="text-xs text-gray-400">NPS</p>
                <p className="text-lg font-bold">{customer.nps !== null ? `${customer.nps}/10` : "—"}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Interações e Notas
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Adicionar nota ou observação..."
                    rows={2}
                    className="flex-1 px-3 py-2 bg-surface-700 border border-surface-600 text-sm focus:border-primary focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => addInteraction("NOTE", newNote)}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 gradient-primary text-white text-sm font-medium disabled:opacity-50 self-end"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const msg = prompt("Mensagem:");
                      if (msg) addInteraction("SMS", msg);
                    }}
                    className="px-3 py-2 bg-surface-700 text-sm hover:bg-surface-600 transition-colors flex items-center gap-1"
                  >
                    📱 SMS
                  </button>
                  <button
                    onClick={() => {
                      const msg = prompt("Mensagem:");
                      if (msg) addInteraction("EMAIL", msg);
                    }}
                    className="px-3 py-2 bg-surface-700 text-sm hover:bg-surface-600 transition-colors flex items-center gap-1"
                  >
                    📧 Email
                  </button>
                  <button
                    onClick={() => {
                      const msg = prompt("Detalhes da ligação:");
                      if (msg) addInteraction("CALL", msg);
                    }}
                    className="px-3 py-2 bg-surface-700 text-sm hover:bg-surface-600 transition-colors flex items-center gap-1"
                  >
                    📞 Ligação
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {interactions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Nenhuma interação registrada</p>
                ) : (
                  interactions.map((int: any) => (
                    <div key={int.id} className="p-3 bg-surface-700">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{interactionTypeIcon(int.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm">{int.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(int.createdAt).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(int.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Informações de Contato</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Hash className="w-4 h-4" />
                  <span>CPF: {customer.cpf || "—"}</span>
                </div>
                {customer.birthDate && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(customer.birthDate).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
                {customer.notes && (
                  <div className="p-3 bg-surface-700 mt-2">
                    <p className="text-xs text-gray-400 mb-1">Notas</p>
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map(tag => {
                  const isActive = (customer.tags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(customer, tag)}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-surface-700 text-gray-400 hover:bg-surface-600"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Segmento</h3>
              <p className="text-sm text-gray-400">{customer.segment || "Não definido"}</p>
            </div>

            {npsScore > 0 && (
              <div>
                <h3 className="font-semibold mb-2">NPS Score</h3>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-3 text-center text-xs font-bold ${
                        i + 1 <= npsScore
                          ? i + 1 <= 6 ? "bg-error/60 text-white" : i + 1 <= 8 ? "bg-warning/60 text-black" : "bg-accent/60 text-black"
                          : "bg-surface-700 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {npsScore <= 6 ? "Detrator" : npsScore <= 8 ? "Neutro" : "Promotor"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCustomerModal({
  establishmentId,
  onClose,
  onSuccess,
}: {
  establishmentId: string;
  onClose: () => void;
  onSuccess: () => void;
  formatCurrency: (v: number) => string;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "", birthDate: "", notes: "", segment: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, establishmentId }),
      });
      if (res.ok) onSuccess();
    } catch {
      console.error("Failed to create contact");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-surface-600 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-surface-600">
          <h3 className="font-semibold text-lg">Novo Cliente</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-700 border border-surface-600 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-700 border border-surface-600 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-700 border border-surface-600 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">CPF</label>
              <input
                type="text"
                value={form.cpf}
                onChange={e => setForm(prev => ({ ...prev, cpf: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-700 border border-surface-600 text-sm focus:border-primary focus:outline-none"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data de Nasc.</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => setForm(prev => ({ ...prev, birthDate: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-700 border border-surface-600 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Segmento</label>
            <select
              value={form.segment}
              onChange={e => setForm(prev => ({ ...prev, segment: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-700 border border-surface-600 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Selecione...</option>
              <option value="Casual">Casual</option>
              <option value="Frequente">Frequente</option>
              <option value="VIP">VIP</option>
              <option value="Corporativo">Corporativo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 bg-surface-700 border border-surface-600 text-sm focus:border-primary focus:outline-none resize-none"
              placeholder="Observações sobre o cliente..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-surface-700 text-sm hover:bg-surface-600 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="flex items-center gap-2 px-6 py-2 gradient-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HoursSettings({ establishmentId }: { establishmentId: string }) {
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/establishments?id=${establishmentId}`)
      .then(r => r.json())
      .then(d => {
        if (d.establishment?.settings) {
          setSettings(d.establishment.settings);
        }
      });
  }, [establishmentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleDay = (day: string) => {
    setSettings((prev: any) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...(prev.hours?.[day] || {}), isOpen: !prev.hours?.[day]?.isOpen },
      },
    }));
  };

  const setTime = (day: string, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...(prev.hours?.[day] || {}), [field]: value },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/establishments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: establishmentId, settings: { hours: settings.hours } }),
      });
      showToast("Horários salvos!");
    } catch {
      showToast("Erro ao salvar.");
    }
    setSaving(false);
  };

  const days = [
    { id: "monday", label: "Segunda-feira" },
    { id: "tuesday", label: "Terça-feira" },
    { id: "wednesday", label: "Quarta-feira" },
    { id: "thursday", label: "Quinta-feira" },
    { id: "friday", label: "Sexta-feira" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">Horários de Funcionamento</h3>
        <p className="text-sm text-gray-400">Defina os dias e horários do estabelecimento</p>
      </div>

      <div className="space-y-3">
        {days.map((day) => {
          const daySettings = settings.hours?.[day.id] || { isOpen: true, open: "11:00", close: "23:00" };
          return (
            <div key={day.id} className="flex items-center gap-4 p-3 bg-surface-700">
              <button
                onClick={() => toggleDay(day.id)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  daySettings.isOpen ? "bg-primary" : "bg-surface-600"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    daySettings.isOpen ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="w-28 text-sm">{day.label}</span>
              {daySettings.isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={daySettings.open}
                    onChange={e => setTime(day.id, "open", e.target.value)}
                    className="px-3 py-2 bg-surface border border-surface-600 text-sm focus:border-primary focus:outline-none"
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="time"
                    value={daySettings.close}
                    onChange={e => setTime(day.id, "close", e.target.value)}
                    className="px-3 py-2 bg-surface border border-surface-600 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-sm text-error">Fechado</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-surface-600">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function SettingsTab({ establishmentId }: { establishmentId: string }) {
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");

  const settingsTabs = [
    { id: "general", label: "Geral", icon: Store },
    { id: "hours", label: "Horários", icon: Clock4 },
    { id: "payment", label: "Pagamentos", icon: CreditCard },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "integrations", label: "Integrações", icon: Wifi },
    { id: "team", label: "Equipe", icon: Users },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "billing", label: "Assinatura", icon: FileText },
    { id: "danger", label: "Zona Perigo", icon: AlertTriangle },
  ];

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case "general":
        return <GeneralSettings establishmentId={establishmentId} />;
      case "hours":
        return <HoursSettings establishmentId={establishmentId} />;
      case "payment":
        return <PaymentSettings establishmentId={establishmentId} />;
      case "notifications":
        return <NotificationSettings establishmentId={establishmentId} />;
      case "integrations":
        return <IntegrationSettings establishmentId={establishmentId} />;
      case "team":
        return <TeamSettings />;
      case "appearance":
        return <AppearanceSettings establishmentId={establishmentId} />;
      case "security":
        return <SecuritySettings establishmentId={establishmentId} />;
      case "billing":
        return <BillingSettings establishmentId={establishmentId} />;
      case "danger":
        return <DangerSettings establishmentId={establishmentId} />;
      default:
        return <GeneralSettings establishmentId={establishmentId} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Configurações</h2>
        <p className="text-gray-400">Gerencie as configurações do seu estabelecimento</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <nav className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-surface border border-surface-600">
            {settingsTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-surface-600 last:border-b-0 ${
                  activeSettingsTab === tab.id
                    ? "bg-primary/10 text-primary border-l-2 border-l-primary"
                    : "text-gray-400 hover:bg-surface-600 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-surface border border-surface-600 p-6">
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings({ establishmentId }: { establishmentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    fetch(`/api/establishments?id=${establishmentId}`)
      .then(r => r.json())
      .then(d => {
        const est = d.establishment;
        if (est) {
          setData(est);
          setForm({
            name: est.name || "",
            phone: est.phone || "",
            address: est.address || "",
            description: est.description || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [establishmentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Arquivo muito grande. Máximo 2MB.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.url) {
        await fetch("/api/establishments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: establishmentId, logo: json.url }),
        });
        setData((prev: any) => ({ ...prev, logo: json.url }));
        showToast("Logo atualizada!");
      }
    } catch {
      showToast("Erro ao fazer upload.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/establishments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: establishmentId, ...form }),
      });
      showToast("Salvo com sucesso!");
    } catch {
      showToast("Erro ao salvar.");
    }
    setSaving(false);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Informações Gerais</h3>
        <p className="text-sm text-gray-400">Dados básicos do seu estabelecimento</p>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Logo Upload */}
      <div className="p-4 bg-surface-700">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-primary/20 flex items-center justify-center overflow-hidden">
            {data?.logo ? (
              <img src={data.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">{form.name?.charAt(0) || "B"}</span>
            )}
          </div>
          <div>
            <p className="font-medium mb-1">Logo do Estabelecimento</p>
            <p className="text-sm text-gray-400 mb-3">PNG, JPG ou WEBP. Máximo 2MB.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Enviando..." : "Upload"}
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Nome *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => updateField("name", e.target.value)}
            className="w-full px-4 py-3 bg-surface-700 border border-surface-600 focus:border-primary focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Telefone *</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              value={form.phone}
              onChange={e => updateField("phone", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-700 border border-surface-600 focus:border-primary focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="p-4 bg-surface-700">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Endereço
        </h4>
        <input
          type="text"
          value={form.address}
          onChange={e => updateField("address", e.target.value)}
          placeholder="Rua, número - Bairro, Cidade - Estado"
          className="w-full px-4 py-3 bg-surface border border-surface-600 focus:border-primary focus:outline-none text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Descrição</label>
        <textarea
          value={form.description}
          onChange={e => updateField("description", e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Descreva seu estabelecimento..."
          className="w-full px-4 py-3 bg-surface-700 border border-surface-600 focus:border-primary focus:outline-none text-sm resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{form.description.length}/500 caracteres</p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-surface-600">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}

function PaymentSettings({ establishmentId }: { establishmentId: string }) {
  const [settings, setSettings] = useState<any>({});
  const [methods, setMethods] = useState<Record<string, boolean>>({
    PIX: true,
    CARD: true,
    CASH: true,
    VALE_ALIMENTACAO: false,
    CREDIARIO: false,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/establishments?id=${establishmentId}`)
      .then(r => r.json())
      .then(d => {
        if (d.establishment?.settings) {
          setSettings(d.establishment.settings);
          if (d.establishment.settings.paymentMethods) {
            setMethods(d.establishment.settings.paymentMethods);
          }
        }
      });
  }, [establishmentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleMethod = (name: string) => {
    setMethods((prev: any) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/establishments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: establishmentId,
          settings: {
            paymentMethods: methods,
            serviceTax: parseFloat(settings.serviceTax || "10"),
            deliveryFee: parseFloat(settings.deliveryFee || "5.90"),
          },
        }),
      });
      showToast("Pagamentos salvos!");
    } catch {
      showToast("Erro ao salvar.");
    }
    setSaving(false);
  };

  const allMethods = [
    { name: "PIX", icon: QrCode },
    { name: "CARD", label: "Cartão", icon: CreditCard },
    { name: "CASH", label: "Dinheiro", icon: DollarSign },
    { name: "VALE_ALIMENTACAO", label: "Vale Alimentação", icon: CreditCard },
    { name: "CREDIARIO", label: "Crediário", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">Pagamentos</h3>
        <p className="text-sm text-gray-400">Configure métodos aceitos e taxas</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Métodos Aceitos</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {allMethods.map((m) => (
            <button
              key={m.name}
              onClick={() => toggleMethod(m.name)}
              className={`p-4 transition-colors ${
                methods[m.name]
                  ? "border-2 border-primary bg-primary/10"
                  : "border border-surface-600 bg-surface-700 hover:border-surface-500"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`w-6 h-6 ${methods[m.name] ? "text-primary" : "text-gray-500"}`} />
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  methods[m.name] ? "bg-primary" : "bg-surface-600"
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    methods[m.name] ? "translate-x-4" : "translate-x-0"
                  }`} />
                </div>
              </div>
              <p className="font-medium">{m.label || m.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-surface-700">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Percent className="w-4 h-4 text-primary" />
          Taxas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Taxa de Serviço (%)</label>
            <input
              type="number"
              value={settings.serviceTax || 10}
              onChange={e => setSettings((prev: any) => ({ ...prev, serviceTax: e.target.value }))}
              className="w-full px-4 py-3 bg-surface border border-surface-600 focus:border-primary focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Taxa de Entrega (R$)</label>
            <input
              type="number"
              step="0.01"
              value={settings.deliveryFee || 5.90}
              onChange={e => setSettings((prev: any) => ({ ...prev, deliveryFee: e.target.value }))}
              className="w-full px-4 py-3 bg-surface border border-surface-600 focus:border-primary focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-surface-600">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function NotificationSettings({ establishmentId }: { establishmentId: string }) {
  const [notifications, setNotifications] = useState<any>({
    newOrder: { push: true, email: true },
    orderReady: { push: true, email: false },
    paymentConfirmed: { push: true, email: true },
    tableOccupied: { push: true, email: false },
    dailyReport: { push: false, email: true },
    lowStock: { push: true, email: true },
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/establishments?id=${establishmentId}`)
      .then(r => r.json())
      .then(d => {
        if (d.establishment?.settings?.notifications) {
          setNotifications(d.establishment.settings.notifications);
        }
      });
  }, [establishmentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleChannel = (key: string, channel: string) => {
    setNotifications((prev: any) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/establishments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: establishmentId, settings: { notifications } }),
      });
      showToast("Notificações salvas!");
    } catch {
      showToast("Erro ao salvar.");
    }
    setSaving(false);
  };

  const items = [
    { key: "newOrder", title: "Novo Pedido", desc: "Quando um novo pedido for feito" },
    { key: "orderReady", title: "Pedido Pronto", desc: "Quando o pedido estiver pronto" },
    { key: "paymentConfirmed", title: "Pagamento Confirmado", desc: "Confirmação de pagamento" },
    { key: "tableOccupied", title: "Mesa Ocupada", desc: "Quando cliente abrir o chat" },
    { key: "dailyReport", title: "Relatório Diário", desc: "Resumo de vendas do dia" },
    { key: "lowStock", title: "Alerta de Estoque", desc: "Quando item estiver acabando" },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">Notificações</h3>
        <p className="text-sm text-gray-400">Configure alertas e notificações</p>
      </div>

      {items.map(item => (
        <div key={item.key} className="p-4 bg-surface-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {(["push", "email"] as const).map(ch => (
              <label key={ch} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]?.[ch] || false}
                  onChange={() => toggleChannel(item.key, ch)}
                  className="rounded border-surface-600 text-primary focus:ring-primary"
                />
                <span className="text-gray-400">{ch === "push" ? "App" : "Email"}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t border-surface-600">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function IntegrationSettings({ establishmentId }: { establishmentId: string }) {
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    ifood: false,
    rappi: false,
    whatsapp: false,
    printer: false,
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/establishments?id=${establishmentId}`)
      .then(r => r.json())
      .then(d => {
        if (d.establishment?.settings?.integrations) {
          setIntegrations(d.establishment.settings.integrations);
        }
      });
  }, [establishmentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleIntegration = async (key: string) => {
    const next = { ...integrations, [key]: !integrations[key] };
    setIntegrations(next);
    await fetch("/api/establishments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: establishmentId, settings: { integrations: next } }),
    });
    showToast(`Integração ${next[key] ? "ativada" : "desativada"}`);
  };

  const items = [
    { key: "printer", name: "Impressora Térmica", desc: "Imprima pedidos automaticamente", icon: Printer },
    { key: "whatsapp", name: "WhatsApp", desc: "Envie notificações via WhatsApp", icon: MessageSquare },
    { key: "ifood", name: "iFood", desc: "Sincronize pedidos do iFood", icon: Smartphone },
    { key: "rappi", name: "Rappi", desc: "Integração com Rappi", icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">Integrações</h3>
        <p className="text-sm text-gray-400">Conecte a outros serviços</p>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-surface-700">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                integrations[item.key] ? "bg-accent/20" : "bg-surface-600"
              }`}>
                <item.icon className={`w-6 h-6 ${integrations[item.key] ? "text-accent" : "text-gray-500"}`} />
              </div>
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => toggleIntegration(item.key)}
              className={`px-4 py-2 text-sm font-medium ${
                integrations[item.key]
                  ? "bg-accent/20 text-accent hover:bg-accent/30"
                  : "bg-surface-600 text-gray-400 hover:bg-surface-500"
              }`}
            >
              {integrations[item.key] ? "Ativado" : "Ativar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSettings() {
  const team = [
    { name: "Admin", email: "admin@demo.com", role: "Administrador", status: "Ativo", avatar: "A" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Equipe</h3>
          <p className="text-sm text-gray-400">Gerencie os membros da equipe</p>
        </div>
      </div>

      <div className="space-y-3">
        {team.map((m, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-surface-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {m.avatar}
              </div>
              <div>
                <h4 className="font-medium">{m.name}</h4>
                <p className="text-sm text-gray-400">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{m.role}</span>
              <span className="px-2 py-1 text-xs font-medium bg-accent/20 text-accent">{m.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-surface-700">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Permissões por Função
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-3 pr-4">Permissão</th>
                {["Admin", "Gerente", "Garçom", "Cozinha", "Caixa"].map(r => (
                  <th key={r} className="pb-3 pr-4 text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-600">
              {[
                { name: "Ver Pedidos", roles: ["Admin", "Gerente", "Garçom", "Cozinha", "Caixa"] },
                { name: "Editar Cardápio", roles: ["Admin", "Gerente"] },
                { name: "Cancelar Pedido", roles: ["Admin", "Gerente"] },
                { name: "Gerenciar Equipe", roles: ["Admin"] },
                { name: "Ver Relatórios", roles: ["Admin", "Gerente"] },
                { name: "Configurações", roles: ["Admin"] },
              ].map(p => (
                <tr key={p.name}>
                  <td className="py-3 pr-4">{p.name}</td>
                  {["Admin", "Gerente", "Garçom", "Cozinha", "Caixa"].map(r => (
                    <td key={r} className="py-3 pr-4 text-center">
                      {p.roles.includes(r) ? (
                        <Check className="w-4 h-4 text-accent mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings({ establishmentId }: { establishmentId: string }) {
  const [appearance, setAppearance] = useState<any>({
    primaryColor: "#9333EA",
    accentColor: "#06B6D4",
    layout: "list",
    fontTitle: "Play",
    fontBody: "PT Narrow",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/establishments?id=${establishmentId}`)
      .then(r => r.json())
      .then(d => {
        if (d.establishment?.settings?.appearance) {
          setAppearance(d.establishment.settings.appearance);
        }
      });
  }, [establishmentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/establishments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: establishmentId, settings: { appearance } }),
      });
      showToast("Aparência salva!");
    } catch {
      showToast("Erro ao salvar.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">Aparência</h3>
        <p className="text-sm text-gray-400">Personalize o cardápio digital</p>
      </div>

      <div className="p-4 bg-surface-700">
        <h4 className="font-medium mb-4">Cores do Tema</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "primaryColor", label: "Cor Primária" },
            { key: "accentColor", label: "Cor de Destaque" },
          ].map(c => (
            <div key={c.key}>
              <label className="block text-sm text-gray-400 mb-2">{c.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={appearance[c.key]}
                  onChange={e => setAppearance((prev: any) => ({ ...prev, [c.key]: e.target.value }))}
                  className="w-12 h-12 border border-surface-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={appearance[c.key]}
                  onChange={e => setAppearance((prev: any) => ({ ...prev, [c.key]: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-surface border border-surface-600 text-sm font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-surface-700">
        <h4 className="font-medium mb-4">Layout</h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "list", name: "Lista" },
            { key: "grid", name: "Grade" },
            { key: "cards", name: "Cards" },
          ].map(l => (
            <button
              key={l.key}
              onClick={() => setAppearance((prev: any) => ({ ...prev, layout: l.key }))}
              className={`p-4 border text-center text-sm transition-colors ${
                appearance.layout === l.key
                  ? "border-primary bg-primary/10"
                  : "border-surface-600 hover:border-surface-500"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-surface-600">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function SecuritySettings({ establishmentId }: { establishmentId: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const session = typeof window !== "undefined" ? null : null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.error || "Erro ao alterar senha.");
      }
    } catch {
      showToast("Erro ao alterar senha.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">Segurança</h3>
        <p className="text-sm text-gray-400">Proteja sua conta</p>
      </div>

      <div className="p-4 bg-surface-700">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          Alterar Senha
        </h4>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Senha Atual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-surface-600 focus:border-primary focus:outline-none text-sm"
              />
              <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showCurrent ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nova Senha</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-surface-600 focus:border-primary focus:outline-none text-sm"
              />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showNew ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirmar Nova Senha</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-surface-600 focus:border-primary focus:outline-none text-sm"
              />
              <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showConfirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="px-4 py-2 gradient-primary text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Alterando..." : "Alterar Senha"}
          </button>
        </div>
      </div>

      <div className="p-4 bg-surface-700">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          Autenticação em Duas Etapas
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Adicione uma camada extra de segurança</p>
            <p className="text-sm text-gray-400">Receba um código por SMS ou app autenticador</p>
          </div>
          <span className="px-3 py-1 bg-surface-600 text-gray-400 text-sm">Em breve</span>
        </div>
      </div>
    </div>
  );
}

function BillingSettings({ establishmentId }: { establishmentId: string }) {
  const [plan, setPlan] = useState<string>("PRO");
  const [ordersCount, setOrdersCount] = useState(0);
  const [tablesCount, setTablesCount] = useState(0);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/establishments?id=${establishmentId}`)
      .then(r => r.json())
      .then(d => {
        if (d.establishment) {
          setPlan(d.establishment.plan || "PRO");
        }
      });
    fetch(`/api/orders?establishmentId=${establishmentId}`)
      .then(r => r.json())
      .then(d => setOrdersCount(d.orders?.length || 0));
    fetch(`/api/tables?establishmentId=${establishmentId}`)
      .then(r => r.json())
      .then(d => setTablesCount(d.tables?.length || 0));
  }, [establishmentId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleChangePlan = async (newPlan: string) => {
    if (newPlan === plan) {
      showToast("Você já está neste plano.");
      return;
    }
    setChangingPlan(newPlan);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ establishmentId, newPlan }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlan(newPlan);
        showToast(`Plano alterado para ${data.plan} com sucesso!`);
      } else {
        showToast(data.error || "Erro ao alterar plano.");
      }
    } catch {
      showToast("Erro ao alterar plano.");
    }
    setChangingPlan(null);
  };

  const plans = [
    { name: "Starter", key: "FREE", price: "49", border: "border-surface-600", badge: null, features: ["Até 5 mesas", "Cardápio digital", "Pedidos ilimitados", "Cozinha Kanban"] },
    { name: "Pro", key: "PRO", price: "97", border: "border-primary", badge: null, features: ["Mesas ilimitadas", "IA garçom", "Relatórios", "CRM", "PIX integrado", "Divisão de conta"] },
    { name: "Enterprise", key: "ENTERPRISE", price: "197", border: "border-surface-600", badge: null, features: ["Tudo do Pro", "Multi-filiais", "API aberta", "iFood/Rappi", "Suporte 24/7", "White-label"] },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">Plano: <span className="text-primary">{plan}</span></h3>
        <p className="text-sm text-gray-400">Gerencie sua assinatura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(p => {
          const isCurrent = p.key === plan;
          return (
            <div key={p.name} className={`p-6 border-2 rounded-xl ${isCurrent ? "border-primary" : p.border} bg-surface-700 relative`}>
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-bold">
                  Seu Plano
                </span>
              )}
              <h3 className="text-2xl font-bold text-center mb-2">{p.name}</h3>
              <div className="text-center mb-4">
                <span className="text-sm text-gray-400">R$</span>
                <span className="text-4xl font-bold ml-1">{p.price}</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <button
                  onClick={() => handleChangePlan(p.key)}
                  disabled={changingPlan === p.key}
                  className="w-full py-3 gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {changingPlan === p.key ? "Alterando..." : `Mudar para ${p.name}`}
                </button>
              )}
              {isCurrent && (
                <div className="w-full py-3 bg-primary/20 text-primary text-sm font-medium text-center">
                  Plano atual
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-surface-700">
        <h4 className="font-medium mb-4">Uso</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Pedidos</span>
              <span>{ordersCount}</span>
            </div>
            <div className="w-full h-2 bg-surface-600">
              <div className="h-full bg-primary" style={{ width: `${Math.min(ordersCount * 2, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Mesas</span>
              <span>{tablesCount}</span>
            </div>
            <div className="w-full h-2 bg-surface-600">
              <div className="h-full bg-primary" style={{ width: `${Math.min(tablesCount * 5, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DangerSettings({ establishmentId }: { establishmentId: string }) {
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const [ordersRes, contactsRes, tablesRes, productsRes] = await Promise.all([
        fetch(`/api/orders?establishmentId=${establishmentId}`),
        fetch(`/api/contacts?establishmentId=${establishmentId}`),
        fetch(`/api/tables?establishmentId=${establishmentId}`),
        fetch(`/api/products?establishmentId=${establishmentId}`),
      ]);
      const data = {
        orders: (await ordersRes.json()).orders || [],
        contacts: (await contactsRes.json()).contacts || [],
        tables: (await tablesRes.json()).tables || [],
        products: (await productsRes.json()).products || [],
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comanda-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Dados exportados!");
    } catch {
      showToast("Erro ao exportar.");
    }
    setExporting(false);
  };

  const handleDelete = async () => {
    if (!confirm("ATENÇÃO: Esta ação é irreversível. Deseja realmente excluir TODOS os dados?")) return;
    if (!confirm("Última chance! Digite OK para confirmar.")) return;
    setDeleting(true);
    showToast("Função desabilitada em produção.");
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-accent text-white text-sm font-medium">
          {toast}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">Zona de Perigo</h3>
        <p className="text-sm text-gray-400">Ações irreversíveis. Prossiga com cautela.</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-surface-700">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">Exportar Dados</h4>
              <p className="text-sm text-gray-400 mt-1">Baixe todos os pedidos, clientes, mesas e produtos.</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-surface text-gray-300 text-sm hover:bg-surface-600 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exportando..." : "Exportar"}
            </button>
          </div>
        </div>

        <div className="p-4 bg-error/10 border border-error/30">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-error">Excluir Tudo</h4>
              <p className="text-sm text-gray-400 mt-1">Remove todos os pedidos, clientes e configurações. Irreversível.</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-error/20 text-error text-sm hover:bg-error/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuSettingsTab({ categories, products, establishmentId, onRefresh }: {
  categories: Category[];
  products: Product[];
  establishmentId: string;
  onRefresh: () => void;
}) {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error("Failed to delete product");
    }
  };

  const handleToggleProduct = async (product: Product) => {
    try {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isActive: !product.isActive }),
      });
      onRefresh();
    } catch (e) {
      console.error("Failed to toggle product");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Excluir esta categoria? Os produtos permanecerão.")) return;
    try {
      await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cardápio</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-600 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Categoria
          </button>
          <button
            onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
            className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma categoria cadastrada</p>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="mt-4 px-4 py-2 bg-primary text-white text-sm"
          >
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryProducts = products.filter(p => p.categoryId === category.id);
            return (
              <div key={category.id} className="bg-surface border border-surface-600">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {category.icon && <span className="text-xl">{category.icon}</span>}
                    <h3 className="font-semibold">{category.name}</h3>
                    <span className="text-xs text-gray-500">{categoryProducts.length} produto(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 hover:bg-surface-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-error" />
                    </button>
                    <button
                      onClick={() => { setEditingCategory(category); setShowCategoryModal(true); }}
                      className="p-2 hover:bg-surface-600 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                      className="flex items-center gap-1 px-3 py-2 gradient-primary text-white text-sm hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                      Produto
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-surface-600">
                  {categoryProducts.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">Nenhum produto nesta categoria</div>
                  ) : (
                    categoryProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 hover:bg-surface-600/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-surface-700 flex items-center justify-center text-xl">
                            {product.emoji || product.image ? (
                              product.image ? (
                                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                              ) : (
                                product.emoji
                              )
                            ) : (
                              "🍽️"
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-gray-400">{product.description}</p>
                            )}
                            <span className="text-primary font-medium">{formatCurrency(Number(product.price))}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleProduct(product)}
                            className={`px-2 py-1 text-xs ${
                              product.isActive ? "bg-accent/20 text-accent" : "bg-error/20 text-error"
                            }`}
                          >
                            {product.isActive ? "Ativo" : "Inativo"}
                          </button>
                          <button
                            onClick={() => { setEditingProduct(product); setShowProductModal(true); }}
                            className="p-2 hover:bg-surface-600 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-surface-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-error" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          establishmentId={establishmentId}
          onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
          onSuccess={() => { setShowCategoryModal(false); setEditingCategory(null); onRefresh(); }}
        />
      )}

      {showProductModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          establishmentId={establishmentId}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
          onSuccess={() => { setShowProductModal(false); setEditingProduct(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, establishmentId, onClose, onSuccess }: {
  category: Category | null;
  establishmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || "");
  const [description, setDescription] = useState(category?.description || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const method = category ? "PUT" : "POST";
      const body = category
        ? { id: category.id, name, icon, description }
        : { name, icon, description, establishmentId };
      await fetch(`/api/categories`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onSuccess();
    } catch (e) {
      console.error("Failed to save category");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-surface-600 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-surface-600">
          <h3 className="font-semibold">{category ? "Editar Categoria" : "Nova Categoria"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
              placeholder="Ex: Bebidas"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ícone (emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
              placeholder="🍺"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none resize-none"
              rows={2}
              placeholder="Descrição opcional"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-surface-700 text-gray-300 text-sm hover:bg-surface-600">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {category ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductModal({ product, categories, establishmentId, onClose, onSuccess }: {
  product: Product | null;
  categories: Category[];
  establishmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || (categories.length > 0 ? categories[0].id : ""));
  const [emoji, setEmoji] = useState(product?.emoji || "");
  const [image, setImage] = useState(product?.image || "");
  const [tags, setTags] = useState(product?.tags.join(", ") || "");
  const [preparationTime, setPreparationTime] = useState(product?.preparationTime?.toString() || "15");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) return;
    setSaving(true);
    try {
      const method = product ? "PUT" : "POST";
      const body = product
        ? { id: product.id, name, description, price, categoryId, emoji, image, tags: tags.split(",").map(t => t.trim()).filter(Boolean), preparationTime: parseInt(preparationTime) }
        : { name, description, price, categoryId, establishmentId, emoji, image, tags: tags.split(",").map(t => t.trim()).filter(Boolean), preparationTime: parseInt(preparationTime) };
      await fetch(`/api/products`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onSuccess();
    } catch (e) {
      console.error("Failed to save product");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-surface-600 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-surface-600">
          <h3 className="font-semibold">{product ? "Editar Produto" : "Novo Produto"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
              placeholder="Ex: Pizza Margherita"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none resize-none"
              rows={2}
              placeholder="Descrição do produto"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tempo (min)</label>
              <input
                type="number"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
                placeholder="15"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Categoria *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
              required
            >
              <option value="">Selecione...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
                placeholder="🍕"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
                placeholder="popular, vegano"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">URL da Imagem</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-surface-700 text-gray-300 text-sm hover:bg-surface-600">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !price || !categoryId}
              className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {product ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TablesSettingsTab({ tables, establishmentId, onRefresh }: {
  tables: Table[];
  establishmentId: string;
  onRefresh: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const handleDeleteTable = async (id: string) => {
    if (!confirm("Excluir esta mesa?")) return;
    try {
      await fetch(`/api/tables?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error("Failed to delete table");
    }
  };

  const handleToggleTable = async (table: Table) => {
    try {
      await fetch("/api/tables", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: table.id, isActive: !table.isActive }),
      });
      onRefresh();
    } catch (e) {
      console.error("Failed to toggle table");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mesas</h2>
        <div className="flex gap-2">
          <Link href="/qr-codes" className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-600 text-sm transition-colors">
            <Download className="w-4 h-4" />
            QR Codes
          </Link>
          <button
            onClick={() => { setEditingTable(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nova Mesa
          </button>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma mesa cadastrada</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-primary text-white text-sm"
          >
            Criar primeira mesa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="p-4 bg-surface border border-surface-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Mesa {table.number}</h3>
                <span className={`px-2 py-1 text-xs ${
                  table.isActive ? "bg-accent/20 text-accent" : "bg-error/20 text-error"
                }`}>
                  {table.isActive ? "Ativa" : "Inativa"}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Pedidos</span>
                  <span>{table._count?.orders || 0}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleToggleTable(table)}
                  className="flex-1 py-2 bg-surface-700 text-sm hover:bg-surface-600 transition-colors text-xs"
                >
                  {table.isActive ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => { setEditingTable(table); setShowModal(true); }}
                  className="flex-1 py-2 bg-surface-700 text-sm hover:bg-surface-600 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="py-2 px-3 bg-surface-700 text-sm hover:bg-error/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-error" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TableModal
          table={editingTable}
          establishmentId={establishmentId}
          onClose={() => { setShowModal(false); setEditingTable(null); }}
          onSuccess={() => { setShowModal(false); setEditingTable(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

function TableModal({ table, establishmentId, onClose, onSuccess }: {
  table: Table | null;
  establishmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [number, setNumber] = useState(table?.number || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim()) return;
    setSaving(true);
    try {
      const method = table ? "PUT" : "POST";
      const body = table
        ? { id: table.id, number }
        : { number, establishmentId };
      await fetch(`/api/tables`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onSuccess();
    } catch (e) {
      console.error("Failed to save table");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-surface-600 w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-surface-600">
          <h3 className="font-semibold">{table ? "Editar Mesa" : "Nova Mesa"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Número/Nome *</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-surface-600 focus:border-primary focus:outline-none"
              placeholder="Ex: 1, 2, VIP, Bar..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-surface-700 text-gray-300 text-sm hover:bg-surface-600">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !number.trim()}
              className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {table ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ComingSoonTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-600 flex items-center justify-center mb-4">
        <Utensils className="w-8 h-8 text-gray-500" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </h2>
      <p className="text-gray-400">
        Esta funcionalidade estará disponível em breve.
      </p>
    </div>
  );
}