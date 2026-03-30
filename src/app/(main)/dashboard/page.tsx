import Link from "next/link";
import { endOfDay, startOfMonth } from "date-fns";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { getDashboardData } from "@/server/dashboard";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney, formatDateOnly } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardRangeForm } from "@/components/dashboard/dashboard-range-form";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const business = await getCurrentBusiness();
  if (!business) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create your shop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add a business profile to start recording khata, stock, and invoices.
            </p>
            <Button asChild>
              <Link href="/settings">Go to settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const from = sp.from ? new Date(sp.from) : startOfMonth(now);
  const to = sp.to ? endOfDay(new Date(sp.to)) : endOfDay(now);

  const data = await getDashboardData(business.id, { from, to });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of receivables, payables, and period activity.
          </p>
        </div>
        <DashboardRangeForm from={from} to={to} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-200">
              <TrendingUp className="h-4 w-4" />
              You will get
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatMoney(data.totalReceivable)}
            </p>
            <p className="text-xs text-muted-foreground">Total receivable</p>
          </CardContent>
        </Card>

        <Card className="border-rose-200/80 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-rose-800 dark:text-rose-200">
              <TrendingDown className="h-4 w-4" />
              You will give
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {formatMoney(data.totalPayable)}
            </p>
            <p className="text-xs text-muted-foreground">Total payable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Purchases (period)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(data.periodPurchasesTotal)}</p>
            <p className="text-xs text-muted-foreground">
              {data.purchasesCount} bills · paid {formatMoney(data.periodPurchasesPaid)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales (period)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(data.periodSalesTotal)}</p>
            <p className="text-xs text-muted-foreground">
              {data.salesCount} invoices · received {formatMoney(data.periodSalesPaid)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Cash in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatMoney(data.totalCashIn)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">
              Cash out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatMoney(data.totalCashOut)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net cash (period)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {formatMoney(data.totalCashIn - data.totalCashOut)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              data.recent.map((r) => (
                <div
                  key={`${r.kind}-${r.id}`}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.sub}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDateOnly(r.at)}
                    </p>
                  </div>
                  <span
                    className={
                      r.kind === "cash_out" || r.kind === "purchase"
                        ? "font-semibold text-rose-600"
                        : "font-semibold text-emerald-600"
                    }
                  >
                    {formatMoney(r.amount)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low stock</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/inventory">View stock</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.lowStockAlerts.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                All products above threshold.
              </p>
            ) : (
              data.lowStockAlerts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/40 px-3 py-2 text-sm dark:border-amber-900/50 dark:bg-amber-950/20"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Left {Number(p.quantity)} {p.unit} · threshold{" "}
                      {Number(p.lowStockThreshold)}
                    </p>
                  </div>
                  <Badge variant="warning">Low</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top customers (period)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales in range.</p>
            ) : (
              data.topCustomers.map((c) => (
                <div
                  key={c.id ?? "x"}
                  className="flex justify-between rounded-xl border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-emerald-700 dark:text-emerald-300">
                    {formatMoney(c.total)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top suppliers (period)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topSuppliers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No purchases in range.</p>
            ) : (
              data.topSuppliers.map((s) => (
                <div
                  key={s.id ?? "x"}
                  className="flex justify-between rounded-xl border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-rose-700 dark:text-rose-300">
                    {formatMoney(s.total)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
