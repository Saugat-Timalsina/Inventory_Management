"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPurchase, type PurchaseLineInput } from "@/actions/purchases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProductOpt = { id: string; name: string; purchasePrice: number };

export function PurchaseNewForm({
  products,
  suppliers,
}: {
  products: ProductOpt[];
  suppliers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [supplierId, setSupplierId] = useState<string | "">("");
  const [lines, setLines] = useState<PurchaseLineInput[]>([
    { productId: products[0]?.id ?? "", quantity: 1, rate: 0, discount: 0, tax: 0 },
  ]);
  const [notes, setNotes] = useState("");

  const totals = useMemo(() => {
    const total = lines.reduce((s, l) => s + (l.quantity * l.rate - l.discount + l.tax), 0);
    return { total };
  }, [lines]);

  function addLine() {
    setLines((prev) => [
      ...prev,
      { productId: products[0]?.id ?? "", quantity: 1, rate: 0, discount: 0, tax: 0 },
    ]);
  }

  function updateLine(i: number, patch: Partial<PurchaseLineInput>) {
    setLines((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      if (patch.productId) {
        const p = products.find((x) => x.id === patch.productId);
        if (p) next[i].rate = p.purchasePrice;
      }
      return next;
    });
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) {
      alert("Choose a supplier.");
      return;
    }
    start(async () => {
      const res = await createPurchase({
        supplierId,
        occurredAt: new Date(),
        items: lines.filter((l) => l.productId),
        notes: notes || undefined,
      });
      if ("error" in res && res.error) {
        alert(res.error);
        return;
      }
      router.push("/purchases");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supplier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Supplier</Label>
            <Select value={supplierId || "none"} onValueChange={(v) => setSupplierId(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select…</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Line items</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={addLine}>
            Add row
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {lines.map((line, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-2xl border border-border/70 p-3 md:grid-cols-6"
            >
              <div className="md:col-span-2">
                <Label>Product</Label>
                <Select
                  value={line.productId}
                  onValueChange={(v) => updateLine(i, { productId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Qty</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Rate</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.rate}
                  onChange={(e) => updateLine(i, { rate: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Discount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.discount}
                  onChange={(e) => updateLine(i, { discount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Tax</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.tax}
                  onChange={(e) => updateLine(i, { tax: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end justify-end md:col-span-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLine(i)}
                  disabled={lines.length <= 1}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="flex justify-end text-sm text-muted-foreground">
            Total{" "}
            <span className="ml-1 font-semibold text-foreground">{totals.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full md:w-auto" disabled={pending || products.length === 0}>
        {pending ? "Saving…" : "Create purchase"}
      </Button>
    </form>
  );
}
