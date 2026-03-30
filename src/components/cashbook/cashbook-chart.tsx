"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CashbookChart({
  points,
}: {
  points: { day: string; cin: number; cout: number }[];
}) {
  const max = Math.max(1, ...points.map((p) => Math.max(p.cin, p.cout)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cash flow (recent days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-1 overflow-x-auto pb-2">
          {points.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enough data.</p>
          ) : (
            points.map((p) => (
              <div key={p.day} className="flex w-10 flex-col items-center gap-1">
                <div className="flex h-32 w-full items-end justify-center gap-0.5">
                  <div
                    className="w-2 rounded-t bg-emerald-500"
                    style={{ height: `${(p.cin / max) * 100}%` }}
                    title={`In ${p.cin}`}
                  />
                  <div
                    className="w-2 rounded-t bg-rose-500"
                    style={{ height: `${(p.cout / max) * 100}%` }}
                    title={`Out ${p.cout}`}
                  />
                </div>
                <span className="rotate-45 text-[9px] text-muted-foreground">
                  {p.day.slice(5)}
                </span>
              </div>
            ))
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Green: cash in · Red: cash out (scaled to the largest bar in view).
        </p>
      </CardContent>
    </Card>
  );
}
