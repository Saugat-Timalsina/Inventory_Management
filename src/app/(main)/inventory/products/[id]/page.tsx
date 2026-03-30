import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney, formatDate } from "@/lib/format";
import { adjustStockFromForm } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  if (!business) notFound();

  const product = await prisma.product.findFirst({
    where: { id, businessId: business.id },
    include: {
      supplier: { select: { name: true } },
      inventoryTransactions: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-1" asChild>
            <Link href="/inventory">← Inventory</Link>
          </Button>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            {product.sku ?? "—"} · {product.category ?? "Uncategorized"} · {product.unit}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">On hand</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Number(product.quantity)}</p>
            <p className="text-xs text-muted-foreground">
              Low stock at {Number(product.lowStockThreshold)} {product.unit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase</span>
              <span>{formatMoney(product.purchasePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selling</span>
              <span>{formatMoney(product.sellingPrice)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{product.supplier?.name ?? "—"}</p>
            {product.barcode ? (
              <p className="text-xs text-muted-foreground">Barcode {product.barcode}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={adjustStockFromForm} className="grid gap-3 md:grid-cols-3">
            <input type="hidden" name="productId" value={product.id} />
            <div className="space-y-1">
              <Label htmlFor="delta">Δ Quantity (+ or −)</Label>
              <Input id="delta" name="delta" type="number" step="0.0001" required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="note">Reason</Label>
              <Textarea id="note" name="note" rows={2} placeholder="Damaged, recount, etc." />
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Apply adjustment</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movement history</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 md:p-6 md:pt-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Δ Qty</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {product.inventoryTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    No movements yet.
                  </td>
                </tr>
              ) : (
                product.inventoryTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-border/60">
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-3 py-2">{t.type}</td>
                    <td className="px-3 py-2 font-medium">{Number(t.quantityDelta)}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {t.note ?? "—"}
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
