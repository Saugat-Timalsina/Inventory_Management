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

export async function createCustomer(input: {
  name: string;
  mobile?: string;
  email?: string;
  notes?: string;
}) {
  const business = await businessForUser();
  if (!business) return { error: "No business" };
  const c = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: input.name,
      mobile: input.mobile,
      email: input.email,
      notes: input.notes,
    },
  });
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { ok: true as const, id: c.id };
}

export async function createCustomerFromForm(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) redirect("/customers/new?e=1");
  const mobile = String(formData.get("mobile") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const res = await createCustomer({
    name,
    mobile: mobile || undefined,
    notes: notes || undefined,
  });
  if ("error" in res && res.error) redirect("/customers/new?e=1");
  if ("id" in res && res.id) redirect(`/customers/${res.id}`);
  redirect("/customers");
}

export async function createSupplier(input: {
  name: string;
  mobile?: string;
  email?: string;
  notes?: string;
}) {
  const business = await businessForUser();
  if (!business) return { error: "No business" };
  const s = await prisma.supplier.create({
    data: {
      businessId: business.id,
      name: input.name,
      mobile: input.mobile,
      email: input.email,
      notes: input.notes,
    },
  });
  revalidatePath("/suppliers");
  revalidatePath("/dashboard");
  return { ok: true as const, id: s.id };
}

export async function createSupplierFromForm(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) redirect("/suppliers/new?e=1");
  const mobile = String(formData.get("mobile") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const res = await createSupplier({
    name,
    mobile: mobile || undefined,
    notes: notes || undefined,
  });
  if ("error" in res && res.error) redirect("/suppliers/new?e=1");
  if ("id" in res && res.id) redirect(`/suppliers/${res.id}`);
  redirect("/suppliers");
}
