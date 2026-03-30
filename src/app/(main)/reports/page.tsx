import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney, formatDateOnly } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportsPdfButton } from "@/components/reports/reports-pdf-button";
import { startOfMonth } from "date-fns";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type ?? "sales";
  const business = await getCurrentBusiness();
  if (!business) {
    return <p className="text-sm text-muted-foreground">Set up your shop first.</p>;
  }

  const from = startOfMonth(new Date());

  const sales = await prisma.sale.findMany({
    where: { businessId: business.id, occurredAt: { gte: from } },
    orderBy: { occurredAt: "desc" },
    include: { customer: { select: { name: true } } },
    take: 200,
  });

  const purchases = await prisma.purchase.findMany({
    where: { businessId: business.id, occurredAt: { gte: from } },
    orderBy: { occurredAt: "desc" },
    include: { supplier: { select: { name: true } } },
    take: 200,
  });

  const saleTotal = sales.reduce((s, x) => s + Number(x.total), 0);
  const purchaseTotal = purchases.reduce((s, x) => s + Number(x.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            This month · filter types below · export a snapshot PDF.
          </p>
        </div>
        <ReportsPdfButton
          title="Business summary"
          lines={[
            `Sales (${sales.length}): ${formatMoney(saleTotal)}`,
            `Purchases (${purchases.length}): ${formatMoney(purchaseTotal)}`,
            `Gross margin (sales - purchases): ${formatMoney(saleTotal - purchaseTotal)}`,
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["sales", "Sales"],
            ["purchases", "Purchases"],
          ] as const
        ).map(([k, label]) => (
          <Button key={k} asChild variant={type === k ? "default" : "outline"} size="sm">
            <Link href={`/reports?type=${k}`}>{label}</Link>
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sales total (MTD)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatMoney(saleTotal)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Purchases total (MTD)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-rose-700 dark:text-rose-300">
            {formatMoney(purchaseTotal)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Simple P/L (sales − purchases)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatMoney(saleTotal - purchaseTotal)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {type === "sales" ? "Sales rows" : "Purchase rows"}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 md:p-6 md:pt-0">
          {type === "sales" ? (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {formatDateOnly(s.occurredAt)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{s.invoiceNumber}</td>
                    <td className="px-3 py-2">{s.customer?.name ?? "—"}</td>
                    <td className="px-3 py-2 font-medium">{formatMoney(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">Supplier</th>
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {formatDateOnly(p.occurredAt)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{p.invoiceNumber}</td>
                    <td className="px-3 py-2">{p.supplier?.name ?? "—"}</td>
                    <td className="px-3 py-2 font-medium">{formatMoney(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
