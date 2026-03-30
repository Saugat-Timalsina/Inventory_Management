import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SalesPage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return <p className="text-sm text-muted-foreground">Set up your shop first.</p>;
  }

  const sales = await prisma.sale.findMany({
    where: { businessId: business.id },
    orderBy: { occurredAt: "desc" },
    take: 100,
    include: { customer: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-sm text-muted-foreground">Invoices and payment status.</p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/sales/new">New sale</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent invoices</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 md:p-6 md:pt-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No sales yet.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="px-3 py-2 font-mono text-xs">{s.invoiceNumber}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {formatDate(s.occurredAt)}
                    </td>
                    <td className="px-3 py-2">{s.customer?.name ?? "—"}</td>
                    <td className="px-3 py-2 font-medium">{formatMoney(s.total)}</td>
                    <td className="px-3 py-2">{formatMoney(s.paidAmount)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={s.status === "PAID" ? "success" : "warning"}>
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
