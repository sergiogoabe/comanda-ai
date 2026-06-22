import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session || userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [establishments, orders, totalRevenue, contacts] = await Promise.all([
    prisma.establishment.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { products: true, tables: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      include: { establishment: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.payment.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
    prisma.contact.findMany({
      include: { establishment: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = await prisma.payment.groupBy({
    by: ["paidAt"],
    where: { status: "CONFIRMED", paidAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } },
    _sum: { amount: true },
  });

  const monthlyData = monthlyRevenue.reduce((acc: any, r) => {
    if (!r.paidAt) return acc;
    const key = r.paidAt.toLocaleDateString("pt-BR", { month: "short" });
    acc[key] = (acc[key] || 0) + Number(r._sum.amount);
    return acc;
  }, {} as Record<string, number>);

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const revenueChart = months.map((m) => ({ month: m, value: monthlyData[m] || 0 }));

  const activeEst = establishments.filter((e) => e.isActive).length;
  const totalOrdersCount = orders.length;
  const totalMRR = establishments
    .filter((e) => e.isActive)
    .reduce((sum, e) => {
      if (e.plan === "PRO") return sum + 97;
      if (e.plan === "ENTERPRISE") return sum + 197;
      return sum;
    }, 0);

  return NextResponse.json({
    establishments: establishments.map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      plan: e.plan,
      status: e.isActive ? "active" : "inactive",
      mrr: e.plan === "PRO" ? 97 : e.plan === "ENTERPRISE" ? 197 : 0,
      orders: e._count.orders,
      products: e._count.products,
      tables: e._count.tables,
      joined: e.createdAt.toISOString(),
      owner: e.owner,
    })),
    totalMRR,
    activeEstablishments: activeEst,
    totalOrders: totalOrdersCount,
    totalRevenue: Number(totalRevenue._sum.amount || 0),
    revenueChart,
    recentOrders: orders.slice(0, 10).map((o) => ({
      id: o.id,
      total: Number(o.total),
      status: o.status,
      establishment: o.establishment.name,
      createdAt: o.createdAt.toISOString(),
      type: o.type,
    })),
    recentContacts: contacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      establishment: c.establishment.name,
      totalSpent: Number(c.totalSpent),
      orderCount: c.orderCount,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}
