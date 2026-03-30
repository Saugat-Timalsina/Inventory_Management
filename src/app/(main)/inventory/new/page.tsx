import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { createProductFromForm } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewProductPage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return <p className="text-sm text-muted-foreground">Set up your shop first.</p>;
  }

  const suppliers = await prisma.supplier.findMany({
    where: { businessId: business.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">New product</h1>
          <p className="text-sm text-muted-foreground">Master data for sales and purchases.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/inventory">Back</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product</CardTitle>
          <CardDescription>Opening quantity creates a stock movement row.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProductFromForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / code</Label>
                <Input id="sku" name="sku" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" defaultValue="pcs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier (optional)</Label>
              <select
                id="supplierId"
                name="supplierId"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                defaultValue="none"
              >
                <option value="none">None</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase price</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  defaultValue={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling price</Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  defaultValue={0}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Opening qty</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.0001"
                  defaultValue={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low stock alert at</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  step="0.0001"
                  defaultValue={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" name="barcode" />
            </div>
            <Button type="submit" className="w-full">
              Save product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
