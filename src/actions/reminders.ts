"use server";

import { revalidatePath } from "next/cache";
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

export async function createReminderFromForm(formData: FormData) {
  const business = await businessForUser();
  if (!business) return;

  const title = String(formData.get("title") || "").trim();
  const dueRaw = String(formData.get("dueAt") || "");
  const message = String(formData.get("message") || "").trim();
  if (!title || !dueRaw) return;

  await prisma.reminder.create({
    data: {
      businessId: business.id,
      title,
      message: message || undefined,
      dueAt: new Date(dueRaw),
      entity: "GENERIC",
    },
  });

  revalidatePath("/reminders");
}

export async function setReminderStatus(id: string, status: "DONE" | "DISMISSED") {
  const business = await businessForUser();
  if (!business) return;
  await prisma.reminder.updateMany({
    where: { id, businessId: business.id },
    data: { status },
  });
  revalidatePath("/reminders");
}

export async function markReminderDoneForm(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await setReminderStatus(id, "DONE");
}

export async function markReminderDismissedForm(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await setReminderStatus(id, "DISMISSED");
}
