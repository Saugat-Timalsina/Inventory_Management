"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getBusinessForUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.business.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
}

/** Customer: balance += amountYouGave - amountYouGot (receivable positive). */
export async function addCustomerLedgerEntry(input: {
  customerId: string;
  amountYouGave: number;
  amountYouGot: number;
  note?: string;
  occurredAt?: Date;
}) {
  const business = await getBusinessForUser();
  if (!business) return { error: "No business" };

  const occurredAt = input.occurredAt ?? new Date();

  await prisma.$transaction(async (tx) => {
    const last = await tx.customerLedgerEntry.findFirst({
      where: { customerId: input.customerId, businessId: business.id },
      orderBy: { occurredAt: "desc" },
    });
    const prev = Number(last?.balanceAfter ?? 0);
    const bal =
      prev + Number(input.amountYouGave) - Number(input.amountYouGot);

    await tx.customerLedgerEntry.create({
      data: {
        businessId: business.id,
        customerId: input.customerId,
        occurredAt,
        amountYouGave: input.amountYouGave,
        amountYouGot: input.amountYouGot,
        balanceAfter: bal,
        note: input.note,
        source: "MANUAL",
      },
    });
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${input.customerId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function addSupplierLedgerEntry(input: {
  supplierId: string;
  purchaseAmount: number;
  paymentAmount: number;
  note?: string;
  occurredAt?: Date;
}) {
  const business = await getBusinessForUser();
  if (!business) return { error: "No business" };

  const occurredAt = input.occurredAt ?? new Date();

  await prisma.$transaction(async (tx) => {
    const last = await tx.supplierLedgerEntry.findFirst({
      where: { supplierId: input.supplierId, businessId: business.id },
      orderBy: { occurredAt: "desc" },
    });
    const prev = Number(last?.balanceAfter ?? 0);
    const bal =
      prev + Number(input.purchaseAmount) - Number(input.paymentAmount);

    await tx.supplierLedgerEntry.create({
      data: {
        businessId: business.id,
        supplierId: input.supplierId,
        occurredAt,
        purchaseAmount: input.purchaseAmount,
        paymentAmount: input.paymentAmount,
        balanceAfter: bal,
        note: input.note,
        source: "MANUAL",
      },
    });
  });

  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${input.supplierId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function addCashbookEntry(input: {
  type: "IN" | "OUT";
  amount: number;
  note?: string;
  category?: string;
  occurredAt?: Date;
}) {
  const business = await getBusinessForUser();
  if (!business) return { error: "No business" };

  await prisma.cashbookEntry.create({
    data: {
      businessId: business.id,
      type: input.type,
      amount: input.amount,
      note: input.note,
      category: input.category,
      occurredAt: input.occurredAt ?? new Date(),
    },
  });

  revalidatePath("/cashbook");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
