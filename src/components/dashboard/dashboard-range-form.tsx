"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { from: Date; to: Date };

export function DashboardRangeForm({ from, to }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const f = String(fd.get("from") || "");
    const t = String(fd.get("to") || "");
    const q = new URLSearchParams();
    if (f) q.set("from", f);
    if (t) q.set("to", t);
    start(() => router.push(`/dashboard?${q.toString()}`));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-end gap-2 rounded-2xl border border-border/80 bg-card/80 p-3 shadow-sm"
    >
      <div className="grid gap-1">
        <Label htmlFor="from" className="text-xs">
          From
        </Label>
        <Input
          id="from"
          name="from"
          type="date"
          defaultValue={format(from, "yyyy-MM-dd")}
          className="h-9 w-40"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="to" className="text-xs">
          To
        </Label>
        <Input
          id="to"
          name="to"
          type="date"
          defaultValue={format(to, "yyyy-MM-dd")}
          className="h-9 w-40"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="h-9">
        Apply
      </Button>
    </form>
  );
}
