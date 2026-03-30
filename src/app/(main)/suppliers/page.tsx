import Link from "next/link";
import { Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function SuppliersPage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return (
      <p className="text-sm text-muted-foreground">
        Create a business in{" "}
        <Link href="/settings" className="underline">
          settings
        </Link>{" "}
        first.
      </p>
    );
  }

  const suppliers = await prisma.supplier.findMany({
    where: { businessId: business.id },
    include: {
      ledger: { orderBy: { occurredAt: "desc" }, take: 1 },
      _count: { select: { ledger: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Purchase khata — what you owe and what you paid.
          </p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/suppliers/new">Add supplier</Link>
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Truck className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No suppliers yet. Add wholesalers you buy stock from.
            </p>
            <Button asChild>
              <Link href="/suppliers/new">Add supplier</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {suppliers.map((s) => {
            const bal = Number(s.ledger[0]?.balanceAfter ?? 0);
            const label =
              bal > 0 ? "Payable" : bal < 0 ? "Advance paid" : "Settled";
            return (
              <Link key={s.id} href={`/suppliers/${s.id}`}>
                <Card className="h-full transition hover:border-primary/40 hover:shadow-md">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.mobile ?? "—"} · {s._count.ledger} entries
                        </p>
                      </div>
                      <Badge
                        variant={
                          bal > 0 ? "danger" : bal < 0 ? "success" : "secondary"
                        }
                      >
                        {label}
                      </Badge>
                    </div>
                    <p
                      className={
                        bal >= 0
                          ? "text-lg font-bold text-rose-700 dark:text-rose-300"
                          : "text-lg font-bold text-emerald-700 dark:text-emerald-300"
                      }
                    >
                      {formatMoney(Math.abs(bal))}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
