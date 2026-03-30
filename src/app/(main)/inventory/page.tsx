import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function InventoryPage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return <p className="text-sm text-muted-foreground">Set up your shop first.</p>;
  }

  const products = await prisma.product.findMany({
    where: { businessId: business.id },
    orderBy: { name: "asc" },
    include: { supplier: { select: { name: true } } },
  });

  const valuation = products.reduce(
    (s, p) => s + Number(p.quantity) * Number(p.purchasePrice),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Valuation (at cost): <span className="font-semibold text-foreground">{formatMoney(valuation)}</span>
          </p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/inventory/new">Add product</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No products yet.{" "}
              <Link href="/inventory/new" className="font-medium text-primary underline">
                Create a product
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          products.map((p) => {
            const low =
              Number(p.lowStockThreshold) > 0 &&
              Number(p.quantity) <= Number(p.lowStockThreshold);
            return (
              <Link key={p.id} href={`/inventory/products/${p.id}`}>
                <Card className="h-full transition hover:border-primary/40 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {p.sku ?? "—"} · {p.category ?? "Uncategorized"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock</span>
                      <span className="font-semibold">
                        {Number(p.quantity)} {p.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sale price</span>
                      <span>{formatMoney(p.sellingPrice)}</span>
                    </div>
                    {low ? <Badge variant="warning">Low stock</Badge> : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
