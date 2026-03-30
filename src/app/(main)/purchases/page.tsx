import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PurchasesPage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return <p className="text-sm text-muted-foreground">Set up your shop first.</p>;
  }

  const purchases = await prisma.purchase.findMany({
    where: { businessId: business.id },
    orderBy: { occurredAt: "desc" },
    take: 100,
    include: { supplier: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchases</h1>
          <p className="text-sm text-muted-foreground">Stock-in bills from suppliers.</p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/purchases/new">New purchase</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent bills</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 md:p-6 md:pt-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Supplier</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No purchases yet.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="px-3 py-2 font-mono text-xs">{p.invoiceNumber}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {formatDate(p.occurredAt)}
                    </td>
                    <td className="px-3 py-2">{p.supplier?.name ?? "—"}</td>
                    <td className="px-3 py-2 font-medium">{formatMoney(p.total)}</td>
                    <td className="px-3 py-2">{formatMoney(p.paidAmount)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={p.status === "PAID" ? "success" : "warning"}>
                        {p.status}
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
