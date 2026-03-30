"use client";

import { useTransition } from "react";
import type { FormEvent } from "react";
import { addSupplierLedgerEntry } from "@/actions/ledger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupplierLedgerActions({ supplierId }: { supplierId: string }) {
  const [pending, start] = useTransition();

  function onSubmit(kind: "pay" | "purchase") {
    return (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const note = String(fd.get("note") || "");
      const amount = Number(fd.get("amount") || 0);
      if (!amount || amount <= 0) return;

      start(async () => {
        if (kind === "pay") {
          await addSupplierLedgerEntry({
            supplierId,
            purchaseAmount: 0,
            paymentAmount: amount,
            note: note || "Payment to supplier",
          });
        } else {
          await addSupplierLedgerEntry({
            supplierId,
            purchaseAmount: amount,
            paymentAmount: 0,
            note: note || "Purchase on credit",
          });
        }
      });
    };
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-rose-700 dark:text-rose-300">
            Purchase on credit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit("purchase")} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="p-amt">Amount</Label>
              <Input id="p-amt" name="amount" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-note">Note</Label>
              <Textarea id="p-note" name="note" rows={2} />
            </div>
            <Button type="submit" className="w-full" variant="danger" disabled={pending}>
              Add purchase
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-emerald-700 dark:text-emerald-300">
            Payment made
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit("pay")} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="pay-amt">Amount</Label>
              <Input id="pay-amt" name="amount" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pay-note">Note</Label>
              <Textarea id="pay-note" name="note" rows={2} />
            </div>
            <Button type="submit" className="w-full" variant="success" disabled={pending}>
              Record payment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
