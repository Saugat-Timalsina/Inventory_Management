import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { PurchaseNewForm } from "@/components/purchases/purchase-new-form";

export default async function NewPurchasePage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return <p className="text-sm text-muted-foreground">Set up your shop in settings.</p>;
  }

  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: business.id },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      where: { businessId: business.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">New purchase</h1>
          <p className="text-sm text-muted-foreground">
            Stock increases; supplier khata updates for the selected vendor.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/purchases">Back</Link>
        </Button>
      </div>
      <PurchaseNewForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          purchasePrice: Number(p.purchasePrice),
        }))}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
