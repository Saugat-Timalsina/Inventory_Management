"use client";

import { useTransition } from "react";
import type { FormEvent } from "react";
import { addCustomerLedgerEntry } from "@/actions/ledger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerLedgerActions({ customerId }: { customerId: string }) {
  const [pending, start] = useTransition();

  function onSubmit(kind: "got" | "gave") {
    return (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const note = String(fd.get("note") || "");
      const amount = Number(fd.get("amount") || 0);
      if (!amount || amount <= 0) return;

      start(async () => {
        if (kind === "got") {
          await addCustomerLedgerEntry({
            customerId,
            amountYouGave: 0,
            amountYouGot: amount,
            note: note || "Payment received",
          });
        } else {
          await addCustomerLedgerEntry({
            customerId,
            amountYouGave: amount,
            amountYouGot: 0,
            note: note || "Charge / udhar",
          });
        }
      });
    };
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-emerald-700 dark:text-emerald-300">
            Payment received (You Got)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit("got")} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="got-amt">Amount</Label>
              <Input
                id="got-amt"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="got-note">Note</Label>
              <Textarea id="got-note" name="note" rows={2} />
            </div>
            <Button type="submit" className="w-full" variant="success" disabled={pending}>
              Save payment
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-rose-700 dark:text-rose-300">
            New charge (You Gave / Udhar)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit("gave")} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="gave-amt">Amount</Label>
              <Input
                id="gave-amt"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gave-note">Note</Label>
              <Textarea id="gave-note" name="note" rows={2} />
            </div>
            <Button type="submit" className="w-full" variant="danger" disabled={pending}>
              Add charge
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
