"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Building,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  ShoppingCart,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const sidebarItems = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "establishments", label: "Estabelecimentos", icon: Building },
  { id: "plans", label: "Planos", icon: CreditCard },
  { id: "crm", label: "CRM", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Configurações", icon: Settings },
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-3xl animate-pulse">⚡</div>
      </div>
    );
  }

  const establishments = data?.establishments || [];
  const filteredEstablishments = establishments.filter((e: any) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalMRR = data?.totalMRR || 0;
  const activeEstablishments = data?.activeEstablishments || 0;
  const totalOrders = data?.totalOrders || 0;
  const totalRevenue = data?.totalRevenue || 0;
  const revenueChart = data?.revenueChart || [];
  const recentOrders = data?.recentOrders || [];
  const recentContacts = data?.recentContacts || [];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab totalMRR={totalMRR} activeEstablishments={activeEstablishments} totalOrders={totalOrders} revenueChart={revenueChart} />;
      case "establishments":
        return <EstablishmentsTab establishments={filteredEstablishments} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case "crm":
        return <CRMTab contacts={recentContacts} />;
      default:
        return <PlaceholderTab name={activeTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-surface-600 flex flex-col">
        <div className="p-4 border-b border-surface-600">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-xl">🧾</span>
            </div>
            <div>
              <span className="font-bold">ComandaAI</span>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                activeTab === item.id
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-surface-600 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 px-6 bg-surface border-b border-surface-600 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">
              {sidebarItems.find((s) => s.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-surface-700 border border-surface-600 focus:border-primary focus:outline-none text-sm w-64 placeholder:text-gray-500"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-surface-600 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black font-bold">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

function OverviewTab({
  totalMRR,
  activeEstablishments,
  totalOrders,
  revenueChart,
}: {
  totalMRR: number;
  activeEstablishments: number;
  totalOrders: number;
  revenueChart: { month: string; value: number }[];
}) {
  const weeks = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const weeklySignups = weeks.map((day) => ({ day, value: Math.floor(Math.random() * 30 + 10) }));
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-surface border border-surface-600">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-accent/20 text-accent">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-sm text-accent font-medium">+8.2%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{formatCurrency(totalMRR)}</h3>
          <p className="text-sm text-gray-400">MRR Atual</p>
        </div>
        <div className="p-6 rounded-xl bg-surface border border-surface-600">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/20 text-primary">
              <Building className="w-6 h-6" />
            </div>
            <span className="text-sm text-accent font-medium">+12</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{activeEstablishments}</h3>
          <p className="text-sm text-gray-400">Estabelecimentos Ativos</p>
        </div>
        <div className="p-6 rounded-xl bg-surface border border-surface-600">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-warning/20 text-warning">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="text-sm text-accent font-medium">+25%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{totalOrders}</h3>
          <p className="text-sm text-gray-400">Pedidos Este Mês</p>
        </div>
        <div className="p-6 rounded-xl bg-surface border border-surface-600">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-error/20 text-error">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="text-sm text-accent font-medium">+18</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">156</h3>
          <p className="text-sm text-gray-400">Novos Cadastros (30d)</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-surface border border-surface-600">
          <h3 className="font-semibold mb-4">Receita Mensal (MRR)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3D" />
                <XAxis dataKey="month" stroke="#6B6B7B" fontSize={12} />
                <YAxis stroke="#6B6B7B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1E2F",
                    border: "1px solid #2A2A3D",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#00D9A5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-surface border border-surface-600">
          <h3 className="font-semibold mb-4">Novos Cadastros (Semana)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySignups}>
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
                <Bar dataKey="value" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function EstablishmentsTab({
  establishments,
  searchTerm,
  setSearchTerm,
}: {
  establishments: { id: string; name: string; plan: string; status: string; mrr: number; orders: number; joined: string }[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estabelecimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-surface border border-surface-600 focus:border-primary focus:outline-none text-sm w-80 placeholder:text-gray-500"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Novo Estabelecimento
        </button>
      </div>

      <div className="rounded-xl bg-surface border border-surface-600 overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estabelecimento</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plano</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">MRR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pedidos</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Desde</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-600">
            {establishments.map((estab) => (
              <tr key={estab.id} className="hover:bg-surface-600/50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {estab.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{estab.name}</div>
                      <div className="text-xs text-gray-400">ID: {estab.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    estab.plan === "ENTERPRISE" ? "bg-accent/20 text-accent" :
                    estab.plan === "PRO" ? "bg-primary/20 text-primary" :
                    "bg-surface-600 text-gray-400"
                  }`}>
                    {estab.plan}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`flex items-center gap-1 text-sm ${estab.status === "active" ? "text-accent" : "text-gray-400"}`}>
                    {estab.status === "active" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {estab.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono">{formatCurrency(estab.mrr)}</td>
                <td className="px-4 py-4">{estab.orders}</td>
                <td className="px-4 py-4 text-gray-400">{new Date(estab.joined).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-4 text-right">
                  <button className="p-2 rounded-lg hover:bg-surface-600 transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CRMTab({ contacts }: { contacts: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CRM - Contatos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-surface-600">
          <h3 className="text-2xl font-bold">{contacts.length}</h3>
          <p className="text-sm text-gray-400">Total de Contatos</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-surface-600">
          <h3 className="text-2xl font-bold">{contacts.filter((c: any) => Number(c.totalSpent) > 500).length}</h3>
          <p className="text-sm text-gray-400">VIPs</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-surface-600">
          <h3 className="text-2xl font-bold">{contacts.filter((c: any) => c.phone).length}</h3>
          <p className="text-sm text-gray-400">Com WhatsApp</p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-xl bg-surface border border-surface-600 p-12 text-center">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum contato registrado ainda.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-surface border border-surface-600 overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contato</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estabelecimento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Gasto Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pedidos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-600">
              {contacts.map((contact: any) => (
                <tr key={contact.id} className="hover:bg-surface-600/50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-xs text-gray-400">{contact.email || contact.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400">{contact.establishment}</td>
                  <td className="px-4 py-4 font-mono">{formatCurrency(Number(contact.totalSpent))}</td>
                  <td className="px-4 py-4">{contact.orderCount}</td>
                  <td className="px-4 py-4 text-gray-400">
                    {new Date(contact.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-600 flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-gray-500" />
      </div>
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <p className="text-gray-400">Funcionalidade em desenvolvimento.</p>
    </div>
  );
}