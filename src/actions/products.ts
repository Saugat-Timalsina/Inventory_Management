"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function businessForUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.business.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function createProduct(input: {
  name: string;
  sku?: string;
  category?: string;
  supplierId?: string | null;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  unit: string;
  barcode?: string;
}) {
  const business = await businessForUser();
  if (!business) return { error: "No business" };

  const p = await prisma.product.create({
    data: {
      businessId: business.id,
      name: input.name,
      sku: input.sku,
      category: input.category,
      supplierId: input.supplierId ?? undefined,
      purchasePrice: input.purchasePrice,
      sellingPrice: input.sellingPrice,
      quantity: input.quantity,
      lowStockThreshold: input.lowStockThreshold,
      unit: input.unit,
      barcode: input.barcode,
    },
  });

  if (Number(input.quantity) !== 0) {
    await prisma.inventoryTransaction.create({
      data: {
        businessId: business.id,
        productId: p.id,
        quantityDelta: input.quantity,
        type: "OPENING",
        referenceType: "Product",
        referenceId: p.id,
        note: "Opening stock",
      },
    });
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return { ok: true as const, id: p.id };
}

export async function createProductFromForm(formData: FormData) {
  const supplierRaw = String(formData.get("supplierId") || "");
  const res = await createProduct({
    name: String(formData.get("name") || ""),
    sku: String(formData.get("sku") || "") || undefined,
    category: String(formData.get("category") || "") || undefined,
    supplierId: supplierRaw && supplierRaw !== "none" ? supplierRaw : null,
    purchasePrice: Number(formData.get("purchasePrice") || 0),
    sellingPrice: Number(formData.get("sellingPrice") || 0),
    quantity: Number(formData.get("quantity") || 0),
    lowStockThreshold: Number(formData.get("lowStockThreshold") || 0),
    unit: String(formData.get("unit") || "pcs"),
    barcode: String(formData.get("barcode") || "") || undefined,
  });
  if ("error" in res && res.error) redirect("/inventory/new?e=1");
  redirect("/inventory");
}

export async function adjustStockFromForm(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const delta = Number(formData.get("delta") || 0);
  const note = String(formData.get("note") || "") || undefined;
  if (!productId || delta === 0 || Number.isNaN(delta)) {
    redirect(productId ? `/inventory/products/${productId}` : "/inventory");
  }
  try {
    const res = await adjustStock({ productId, delta, note });
    if ("error" in res && res.error) {
      redirect(`/inventory/products/${productId}?e=1`);
    }
  } catch {
    redirect(`/inventory/products/${productId}?e=1`);
  }
  redirect(`/inventory/products/${productId}`);
}

export async function adjustStock(input: {
  productId: string;
  delta: number;
  note?: string;
}) {
  const business = await businessForUser();
  if (!business) return { error: "No business" };

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: input.productId, businessId: business.id },
    });
    if (!product) throw new Error("Product not found");

    const next = Number(product.quantity) + input.delta;
    if (next < 0) throw new Error("Stock cannot be negative");

    await tx.product.update({
      where: { id: product.id },
      data: { quantity: next },
    });

    await tx.inventoryTransaction.create({
      data: {
        businessId: business.id,
        productId: product.id,
        quantityDelta: input.delta,
        type: input.delta >= 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
        referenceType: "Manual",
        note: input.note,
      },
    });
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/products/${input.productId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}
