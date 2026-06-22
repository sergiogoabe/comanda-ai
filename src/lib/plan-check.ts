export const PLAN_LIMITS = {
  FREE: {
    maxTables: 5,
    maxProducts: 50,
    maxCategories: 10,
    aiChat: false,
    crm: false,
    pixPayments: false,
    analytics: false,
    billSplitting: false,
    multiBranch: false,
    apiAccess: false,
    integrations: false,
    whiteLabel: false,
  },
  PRO: {
    maxTables: Infinity,
    maxProducts: 500,
    maxCategories: 50,
    aiChat: true,
    crm: true,
    pixPayments: true,
    analytics: true,
    billSplitting: true,
    multiBranch: false,
    apiAccess: false,
    integrations: false,
    whiteLabel: false,
  },
  ENTERPRISE: {
    maxTables: Infinity,
    maxProducts: Infinity,
    maxCategories: Infinity,
    aiChat: true,
    crm: true,
    pixPayments: true,
    analytics: true,
    billSplitting: true,
    multiBranch: true,
    apiAccess: true,
    integrations: true,
    whiteLabel: true,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
export type Feature = keyof typeof PLAN_LIMITS[Plan];

export function hasFeature(plan: Plan, feature: Feature): boolean {
  return PLAN_LIMITS[plan]?.[feature] === true;
}

export function getLimit(plan: Plan, feature: "maxTables" | "maxProducts" | "maxCategories"): number {
  return PLAN_LIMITS[plan]?.[feature] ?? 0;
}

export async function checkPlanLimit(
  prisma: any,
  establishmentId: string,
  feature: "maxTables" | "maxProducts" | "maxCategories"
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const establishment = await prisma.establishment.findUnique({
    where: { id: establishmentId },
    select: { plan: true },
  });

  if (!establishment) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const limit = getLimit(establishment.plan as Plan, feature);
  if (limit === Infinity) {
    return { allowed: true, current: 0, limit: Infinity };
  }

  const count = await getCount(prisma, establishmentId, feature);
  return { allowed: count < limit, current: count, limit };
}

async function getCount(prisma: any, establishmentId: string, feature: string): Promise<number> {
  switch (feature) {
    case "maxTables":
      return prisma.table.count({ where: { establishmentId } });
    case "maxProducts":
      return prisma.product.count({ where: { establishmentId } });
    case "maxCategories":
      return prisma.category.count({ where: { establishmentId } });
    default:
      return 0;
  }
}
