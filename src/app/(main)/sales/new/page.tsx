import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { SaleNewForm } from "@/components/sales/sale-new-form";

export default async function NewSalePage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return <p className="text-sm text-muted-foreground">Set up your shop in settings.</p>;
  }

  const [products, customers] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: business.id },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      where: { businessId: business.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">New sale</h1>
          <p className="text-sm text-muted-foreground">
            Stock reduces automatically; customer khata updates if linked.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/sales">Back</Link>
        </Button>
      </div>
      <SaleNewForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          sellingPrice: Number(p.sellingPrice),
          quantity: Number(p.quantity),
        }))}
        customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
