import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ChefHat,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  QrCode,
  Utensils,
  Phone,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  establishmentId: string;
  establishmentName: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "orders", label: "Pedidos", icon: ShoppingCart },
  { id: "kitchen", label: "Cozinha", icon: ChefHat },
  { id: "menu", label: "Cardápio", icon: Utensils },
  { id: "tables", label: "Mesas", icon: QrCode },
  { id: "customers", label: "CRM", icon: Users },
  { id: "settings", label: "Configurações", icon: Settings },
];

export function EstablishmentDashboardLayout({
  children,
  activeTab,
  establishmentId,
  establishmentName,
  onTabChange,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-surface-700 flex flex-col">
        <div className="p-4 border-b border-surface-700">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
            <div>
              <span className="font-display font-bold text-sm">{establishmentName}</span>
              <p className="text-xs text-gray-500">Painel Administrativo</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-surface-700 hover:text-white"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:bg-surface-700 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 px-6 bg-surface border-b border-surface-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar pedidos, clientes..."
                className="pl-9 pr-4 py-2 bg-surface-700 border border-surface-600 focus:border-primary focus:outline-none text-sm w-72 placeholder:text-gray-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-surface-700 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div>
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-gray-500">admin@demo.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down";
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  return (
    <div className="p-5 bg-surface border border-surface-700">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-primary/10 text-primary">{icon}</div>
        {change && (
          <span className={cn("text-sm font-medium", changeType === "up" ? "text-accent" : "text-error")}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-display font-bold mb-1">{value}</h3>
      <p className="text-sm text-gray-400">{title}</p>
    </div>
  );
}