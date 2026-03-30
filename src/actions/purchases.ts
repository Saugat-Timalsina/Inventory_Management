"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { InvoicePaymentStatus } from "@/generated/prisma";

async function businessForUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.business.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
}

function paymentStatus(total: number, paid: number): InvoicePaymentStatus {
  if (paid <= 0) return "DUE";
  if (paid >= total) return "PAID";
  return "PARTIAL";
}

export type PurchaseLineInput = {
  productId: string;
  quantity: number;
  rate: number;
  discount: number;
  tax: number;
};

export async function createPurchase(input: {
  supplierId: string | null;
  occurredAt: Date;
  items: PurchaseLineInput[];
  notes?: string;
  paidAmount?: number;
}) {
  const business = await businessForUser();
  if (!business) return { error: "No business" };

  if (input.items.length === 0) return { error: "Add at least one line item." };

  const lines = input.items.map((row) => {
    const afterDisc = row.quantity * row.rate - row.discount;
    const lineTotal = afterDisc + row.tax;
    return { ...row, lineTotal };
  });

  const subtotal = lines.reduce((s, l) => s + (l.quantity * l.rate - l.discount), 0);
  const tax = lines.reduce((s, l) => s + l.tax, 0);
  const discountTotal = lines.reduce((s, l) => s + l.discount, 0);
  const total = lines.reduce((s, l) => s + l.lineTotal, 0);
  const paid = input.paidAmount !== undefined ? input.paidAmount : total;
  const status = paymentStatus(total, paid);

  const invoiceNumber = `P-${Date.now().toString(36).toUpperCase()}`;

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        businessId: business.id,
        supplierId: input.supplierId,
        invoiceNumber,
        occurredAt: input.occurredAt,
        subtotal,
        discount: discountTotal,
        tax,
        total,
        paidAmount: paid,
        status,
        notes: input.notes,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            rate: l.rate,
            discount: l.discount,
            tax: l.tax,
            lineTotal: l.lineTotal,
          })),
        },
      },
    });

    for (const l of lines) {
      const product = await tx.product.findFirst({
        where: { id: l.productId, businessId: business.id },
      });
      if (!product) throw new Error("Invalid product");

      const qty = Number(product.quantity) + l.quantity;

      await tx.product.update({
        where: { id: product.id },
        data: {
          quantity: qty,
          purchasePrice: l.rate,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          businessId: business.id,
          productId: product.id,
          quantityDelta: l.quantity,
          type: "PURCHASE",
          referenceType: "Purchase",
          referenceId: purchase.id,
        },
      });
    }

    if (input.supplierId) {
      const last = await tx.supplierLedgerEntry.findFirst({
        where: { supplierId: input.supplierId, businessId: business.id },
        orderBy: { occurredAt: "desc" },
      });
      const prev = Number(last?.balanceAfter ?? 0);
      const bal = prev + total - paid;
      await tx.supplierLedgerEntry.create({
        data: {
          businessId: business.id,
          supplierId: input.supplierId,
          occurredAt: input.occurredAt,
          purchaseAmount: total,
          paymentAmount: paid,
          balanceAfter: bal,
          note: `Purchase ${invoiceNumber}`,
          source: "MANUAL",
          referenceType: "Purchase",
          referenceId: purchase.id,
        },
      });
    }
  });

  revalidatePath("/purchases");
  revalidatePath("/dashboard");
  revalidatePath("/inventory");
  if (input.supplierId) {
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${input.supplierId}`);
  }
  return { ok: true as const };
}
