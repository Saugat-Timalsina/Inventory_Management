import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatMoney, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerLedgerActions } from "@/components/customers/customer-ledger-actions";
import { CustomerLedgerPdfButton } from "@/components/customers/customer-ledger-pdf-button";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  if (!business) notFound();

  const customer = await prisma.customer.findFirst({
    where: { id, businessId: business.id },
    include: {
      ledger: { orderBy: { occurredAt: "asc" } },
    },
  });

  if (!customer) notFound();

  const last = customer.ledger[customer.ledger.length - 1];
  const balance = Number(last?.balanceAfter ?? 0);

  const wa = customer.mobile?.replace(/\D/g, "");
  const waLink = wa ? `https://wa.me/${wa}` : undefined;
  const tel = customer.mobile ? `tel:${customer.mobile}` : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-1" asChild>
            <Link href="/customers">← Customers</Link>
          </Button>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            {customer.mobile ?? "No mobile"} · {customer.ledger.length} entries
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tel ? (
              <Button size="sm" variant="outline" asChild>
                <a href={tel}>Call</a>
              </Button>
            ) : null}
            {waLink ? (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-600/90" asChild>
                <a href={waLink} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </Button>
            ) : null}
            <CustomerLedgerPdfButton
              partyName={customer.name}
              rows={customer.ledger.map((e) => ({
                date: formatDate(e.occurredAt),
                youGave: formatMoney(e.amountYouGave),
                youGot: formatMoney(e.amountYouGot),
                balance: formatMoney(e.balanceAfter),
                note: e.note ?? undefined,
              }))}
            />
          </div>
        </div>
        <Card className="w-full sm:max-w-xs border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Current balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
              {formatMoney(balance)}
            </p>
            <p className="text-xs text-muted-foreground">
              {balance > 0
                ? "Receivable — you will get this amount."
                : balance < 0
                  ? "Advance / you owe the customer side."
                  : "Settled up."}
            </p>
          </CardContent>
        </Card>
      </div>

      <CustomerLedgerActions customerId={customer.id} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ledger</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 md:p-6 md:pt-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-rose-700">You Gave</th>
                <th className="px-3 py-2 text-emerald-700">You Got</th>
                <th className="px-3 py-2">Balance</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {customer.ledger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    No entries yet. Record a payment or a new charge.
                  </td>
                </tr>
              ) : (
                customer.ledger.map((e) => (
                  <tr key={e.id} className="border-b border-border/60">
                    <td className="whitespace-nowrap px-3 py-2 align-top text-xs text-muted-foreground">
                      {formatDate(e.occurredAt)}
                    </td>
                    <td className="px-3 py-2 align-top font-medium text-rose-600">
                      {Number(e.amountYouGave) ? formatMoney(e.amountYouGave) : "—"}
                    </td>
                    <td className="px-3 py-2 align-top font-medium text-emerald-600">
                      {Number(e.amountYouGot) ? formatMoney(e.amountYouGot) : "—"}
                    </td>
                    <td className="px-3 py-2 align-top font-semibold">
                      {formatMoney(e.balanceAfter)}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-muted-foreground">
                      {e.note ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
