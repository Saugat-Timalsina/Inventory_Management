import { prisma } from "@/lib/prisma";

export type DashboardRange = { from: Date; to: Date };

export async function getDashboardData(
  businessId: string,
  range: DashboardRange,
) {
  const { from, to } = range;

  const customers = await prisma.customer.findMany({
    where: { businessId },
    include: {
      ledger: { orderBy: { occurredAt: "desc" }, take: 1 },
      _count: { select: { ledger: true } },
    },
  });

  let totalReceivable = 0;
  for (const c of customers) {
    const bal = Number(c.ledger[0]?.balanceAfter ?? 0);
    if (bal > 0) totalReceivable += bal;
  }

  const suppliers = await prisma.supplier.findMany({
    where: { businessId },
    include: {
      ledger: { orderBy: { occurredAt: "desc" }, take: 1 },
      _count: { select: { ledger: true } },
    },
  });

  let totalPayable = 0;
  for (const s of suppliers) {
    const bal = Number(s.ledger[0]?.balanceAfter ?? 0);
    if (bal > 0) totalPayable += bal;
  }

  const [
    salesAgg,
    purchasesAgg,
    cashIn,
    cashOut,
    lowStock,
    topCustomers,
    topSuppliers,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        businessId,
        occurredAt: { gte: from, lte: to },
      },
      _sum: { total: true, paidAmount: true },
      _count: true,
    }),
    prisma.purchase.aggregate({
      where: {
        businessId,
        occurredAt: { gte: from, lte: to },
      },
      _sum: { total: true, paidAmount: true },
      _count: true,
    }),
    prisma.cashbookEntry.aggregate({
      where: {
        businessId,
        type: "IN",
        occurredAt: { gte: from, lte: to },
      },
      _sum: { amount: true },
    }),
    prisma.cashbookEntry.aggregate({
      where: {
        businessId,
        type: "OUT",
        occurredAt: { gte: from, lte: to },
      },
      _sum: { amount: true },
    }),
    prisma.product.findMany({
      where: {
        businessId,
        lowStockThreshold: { gt: 0 },
      },
      take: 12,
      orderBy: { quantity: "asc" },
    }),
    prisma.sale.groupBy({
      by: ["customerId"],
      where: {
        businessId,
        occurredAt: { gte: from, lte: to },
        customerId: { not: null },
      },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.purchase.groupBy({
      by: ["supplierId"],
      where: {
        businessId,
        occurredAt: { gte: from, lte: to },
        supplierId: { not: null },
      },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
  ]);

  const lowStockAlerts = lowStock.filter(
    (p) => Number(p.quantity) <= Number(p.lowStockThreshold),
  );

  const customerNames = await prisma.customer.findMany({
    where: {
      id: { in: topCustomers.map((t) => t.customerId!).filter(Boolean) },
    },
    select: { id: true, name: true },
  });
  const custMap = Object.fromEntries(customerNames.map((c) => [c.id, c.name]));

  const supplierNames = await prisma.supplier.findMany({
    where: {
      id: { in: topSuppliers.map((t) => t.supplierId!).filter(Boolean) },
    },
    select: { id: true, name: true },
  });
  const supMap = Object.fromEntries(supplierNames.map((s) => [s.id, s.name]));

  const recentSales = await prisma.sale.findMany({
    where: { businessId },
    orderBy: { occurredAt: "desc" },
    take: 8,
    include: { customer: { select: { name: true } } },
  });

  const recentPurchases = await prisma.purchase.findMany({
    where: { businessId },
    orderBy: { occurredAt: "desc" },
    take: 8,
    include: { supplier: { select: { name: true } } },
  });

  const recentCash = await prisma.cashbookEntry.findMany({
    where: { businessId },
    orderBy: { occurredAt: "desc" },
    take: 8,
  });

  type RecentRow = {
    id: string;
    label: string;
    sub: string;
    amount: number;
    kind: "sale" | "purchase" | "cash_in" | "cash_out";
    at: Date;
  };

  const recent: RecentRow[] = [
    ...recentSales.map((s) => ({
      id: s.id,
      label: "Sale",
      sub: s.customer?.name ?? "Walk-in",
      amount: Number(s.total),
      kind: "sale" as const,
      at: s.occurredAt,
    })),
    ...recentPurchases.map((p) => ({
      id: p.id,
      label: "Purchase",
      sub: p.supplier?.name ?? "—",
      amount: Number(p.total),
      kind: "purchase" as const,
      at: p.occurredAt,
    })),
    ...recentCash.map((c) => ({
      id: c.id,
      label: c.type === "IN" ? "Cash in" : "Cash out",
      sub: c.note ?? "Cashbook",
      amount: Number(c.amount),
      kind: c.type === "IN" ? ("cash_in" as const) : ("cash_out" as const),
      at: c.occurredAt,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 12);

  return {
    totalReceivable,
    totalPayable,
    periodSalesTotal: Number(salesAgg._sum.total ?? 0),
    periodPurchasesTotal: Number(purchasesAgg._sum.total ?? 0),
    periodSalesPaid: Number(salesAgg._sum.paidAmount ?? 0),
    periodPurchasesPaid: Number(purchasesAgg._sum.paidAmount ?? 0),
    salesCount: salesAgg._count,
    purchasesCount: purchasesAgg._count,
    totalCashIn: Number(cashIn._sum.amount ?? 0),
    totalCashOut: Number(cashOut._sum.amount ?? 0),
    lowStockAlerts,
    topCustomers: topCustomers.map((t) => ({
      id: t.customerId,
      name: t.customerId ? custMap[t.customerId] ?? "—" : "—",
      total: Number(t._sum.total ?? 0),
    })),
    topSuppliers: topSuppliers.map((t) => ({
      id: t.supplierId,
      name: t.supplierId ? supMap[t.supplierId] ?? "—" : "—",
      total: Number(t._sum.total ?? 0),
    })),
    recent,
    customersPreview: customers.slice(0, 6),
    suppliersPreview: suppliers.slice(0, 6),
  };
}
