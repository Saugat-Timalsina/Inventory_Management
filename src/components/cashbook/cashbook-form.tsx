"use client";

import { useTransition } from "react";
import type { FormEvent } from "react";
import { addCashbookEntry } from "@/actions/ledger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CashbookForm({ defaultTab }: { defaultTab: "IN" | "OUT" }) {
  const [pending, start] = useTransition();

  function onSubmit(type: "IN" | "OUT") {
    return (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const amount = Number(fd.get("amount") || 0);
      const note = String(fd.get("note") || "");
      const category = String(fd.get("category") || "");
      if (!amount || amount <= 0) return;
      start(async () => {
        await addCashbookEntry({
          type,
          amount,
          note: note || undefined,
          category: category || undefined,
        });
        e.currentTarget.reset();
      });
    };
  }

  return (
    <Tabs defaultValue={defaultTab === "OUT" ? "out" : "in"} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="in">Cash in</TabsTrigger>
        <TabsTrigger value="out">Cash out</TabsTrigger>
      </TabsList>
      <TabsContent value="in">
        <form onSubmit={onSubmit("IN")} className="mt-4 space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <Label htmlFor="in-amt">Amount</Label>
            <Input id="in-amt" name="amount" type="number" step="0.01" min="0" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="in-cat">Category</Label>
            <Input id="in-cat" name="category" placeholder="Sale / other" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="in-note">Note</Label>
            <Textarea id="in-note" name="note" rows={2} />
          </div>
          <Button type="submit" className="w-full" variant="success" disabled={pending}>
            Save cash in
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="out">
        <form onSubmit={onSubmit("OUT")} className="mt-4 space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <Label htmlFor="out-amt">Amount</Label>
            <Input id="out-amt" name="amount" type="number" step="0.01" min="0" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="out-cat">Category</Label>
            <Input id="out-cat" name="category" placeholder="Rent / salary" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="out-note">Note</Label>
            <Textarea id="out-note" name="note" rows={2} />
          </div>
          <Button type="submit" className="w-full" variant="danger" disabled={pending}>
            Save cash out
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
