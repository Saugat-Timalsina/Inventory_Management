import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentBusiness } from "@/lib/business";
import { AppHeader } from "@/components/layout/app-header";
import { BottomActionBar } from "@/components/layout/bottom-action-bar";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await getCurrentBusiness();

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader businessName={business?.name ?? "Your shop"} />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-28 md:pb-8">
        {children}
      </main>
      <BottomActionBar />
    </div>
  );
}
