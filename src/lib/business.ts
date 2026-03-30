import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** First business for the signed-in user (demo: one shop per account). */
export async function getCurrentBusiness() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.business.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function requireBusiness() {
  const b = await getCurrentBusiness();
  if (!b) throw new Error("No business found for this account.");
  return b;
}
