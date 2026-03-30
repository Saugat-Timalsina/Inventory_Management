"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validations";

export async function upsertBusinessAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.business.findFirst({
    where: { userId: session.user.id },
  });

  if (existing) {
    await prisma.business.update({
      where: { id: existing.id },
      data: parsed.data,
    });
  } else {
    await prisma.business.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
        currency: "INR",
      },
    });
  }

  revalidatePath("/", "layout");
  return { ok: true as const };
}
