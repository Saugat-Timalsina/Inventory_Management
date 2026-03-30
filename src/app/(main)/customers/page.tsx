import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CustomersPage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return (
      <p className="text-sm text-muted-foreground">
        Create a business in <Link href="/settings" className="underline">settings</Link> first.
      </p>
    );
  }

  const customers = await prisma.customer.findMany({
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
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Udhar khata — who owes you, and who you paid.
          </p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/customers/new">Add customer</Link>
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No customers yet. Add your first party to start the ledger.
            </p>
            <Button asChild>
              <Link href="/customers/new">Add customer</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {customers.map((c) => {
            const bal = Number(c.ledger[0]?.balanceAfter ?? 0);
            const direction =
              bal > 0 ? "You will get" : bal < 0 ? "You will give" : "Settled";
            return (
              <Link key={c.id} href={`/customers/${c.id}`}>
                <Card className="h-full transition hover:border-primary/40 hover:shadow-md">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.mobile ?? "—"} · {c._count.ledger} entries
                        </p>
                      </div>
                      <Badge variant={bal > 0 ? "success" : bal < 0 ? "danger" : "secondary"}>
                        {direction}
                      </Badge>
                    </div>
                    <p
                      className={
                        bal >= 0
                          ? "text-lg font-bold text-emerald-700 dark:text-emerald-300"
                          : "text-lg font-bold text-rose-700 dark:text-rose-300"
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
