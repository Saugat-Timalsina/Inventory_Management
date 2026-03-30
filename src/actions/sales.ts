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

export type SaleLineInput = {
  productId: string;
  quantity: number;
  rate: number;
  discount: number;
  tax: number;
};

export async function createSale(input: {
  customerId: string | null;
  occurredAt: Date;
  items: SaleLineInput[];
  notes?: string;
  /** Amount received now; defaults to full total (cash sale). */
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
  const paid =
    input.paidAmount !== undefined ? input.paidAmount : total;
  const status = paymentStatus(total, paid);

  const invoiceNumber = `S-${Date.now().toString(36).toUpperCase()}`;

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        businessId: business.id,
        customerId: input.customerId,
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
      const qty = Number(product.quantity) - l.quantity;
      if (qty < 0) throw new Error(`Insufficient stock for ${product.name}`);

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: qty },
      });

      await tx.inventoryTransaction.create({
        data: {
          businessId: business.id,
          productId: product.id,
          quantityDelta: -l.quantity,
          type: "SALE",
          referenceType: "Sale",
          referenceId: sale.id,
        },
      });
    }

    if (input.customerId) {
      const last = await tx.customerLedgerEntry.findFirst({
        where: { customerId: input.customerId, businessId: business.id },
        orderBy: { occurredAt: "desc" },
      });
      const prev = Number(last?.balanceAfter ?? 0);
      const bal = prev + total - paid;
      await tx.customerLedgerEntry.create({
        data: {
          businessId: business.id,
          customerId: input.customerId,
          occurredAt: input.occurredAt,
          amountYouGave: total,
          amountYouGot: paid,
          balanceAfter: bal,
          note: `Sale ${invoiceNumber}`,
          source: "SALE",
          referenceType: "Sale",
          referenceId: sale.id,
        },
      });
    }
  });

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/inventory");
  if (input.customerId) {
    revalidatePath("/customers");
    revalidatePath(`/customers/${input.customerId}`);
  }
  return { ok: true as const };
}
