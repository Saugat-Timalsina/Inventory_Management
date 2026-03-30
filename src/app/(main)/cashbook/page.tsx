import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashbookForm } from "@/components/cashbook/cashbook-form";
import { CashbookChart } from "@/components/cashbook/cashbook-chart";

export default async function CashbookPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const sp = await searchParams;
  const defaultTab = sp.add === "out" ? "OUT" : "IN";

  const business = await getCurrentBusiness();
  if (!business) {
    return (
      <p className="text-sm text-muted-foreground">
        Create a business in settings first.
      </p>
    );
  }

  const entries = await prisma.cashbookEntry.findMany({
    where: { businessId: business.id },
    orderBy: { occurredAt: "desc" },
    take: 200,
  });

  const byDay = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = format(e.occurredAt, "yyyy-MM-dd");
    const arr = byDay.get(key) ?? [];
    arr.push(e);
    byDay.set(key, arr);
  }

  const totalIn = entries
    .filter((e) => e.type === "IN")
    .reduce((s, e) => s + Number(e.amount), 0);
  const totalOut = entries
    .filter((e) => e.type === "OUT")
    .reduce((s, e) => s + Number(e.amount), 0);

  const chartPoints = Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 14)
    .map(([day, rows]) => {
      const cin = rows.filter((r) => r.type === "IN").reduce((s, r) => s + Number(r.amount), 0);
      const cout = rows.filter((r) => r.type === "OUT").reduce((s, r) => s + Number(r.amount), 0);
      return { day, cin, cout };
    })
    .reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cashbook</h1>
        <p className="text-sm text-muted-foreground">
          Daily cash in and out — grouped by day below.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CashbookForm defaultTab={defaultTab} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary (loaded window)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-emerald-700">Total cash in</span>
              <span className="font-semibold">{formatMoney(totalIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-700">Total cash out</span>
              <span className="font-semibold">{formatMoney(totalOut)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Net</span>
              <span>{formatMoney(totalIn - totalOut)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CashbookChart points={chartPoints} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from(byDay.entries()).length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            Array.from(byDay.entries())
              .sort(([a], [b]) => (a < b ? 1 : -1))
              .map(([day, rows]) => {
                const dayIn = rows
                  .filter((r) => r.type === "IN")
                  .reduce((s, r) => s + Number(r.amount), 0);
                const dayOut = rows
                  .filter((r) => r.type === "OUT")
                  .reduce((s, r) => s + Number(r.amount), 0);
                return (
                  <div key={day}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{day}</p>
                      <p className="text-xs text-muted-foreground">
                        In {formatMoney(dayIn)} · Out {formatMoney(dayOut)} · Net{" "}
                        {formatMoney(dayIn - dayOut)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {rows.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {e.type === "IN" ? "Cash in" : "Cash out"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(e.occurredAt)} · {e.category ?? "—"}
                            </p>
                            {e.note ? (
                              <p className="text-xs text-muted-foreground">{e.note}</p>
                            ) : null}
                          </div>
                          <span
                            className={
                              e.type === "IN"
                                ? "font-semibold text-emerald-600"
                                : "font-semibold text-rose-600"
                            }
                          >
                            {formatMoney(e.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
