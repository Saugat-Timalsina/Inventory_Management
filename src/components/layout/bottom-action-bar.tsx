"use client";

import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  ShoppingCart,
  Truck,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { href: "/customers/new", label: "Customer", icon: UserPlus, color: "bg-violet-600" },
  { href: "/suppliers/new", label: "Supplier", icon: Truck, color: "bg-indigo-600" },
  { href: "/cashbook?add=in", label: "Cash In", icon: ArrowDownCircle, color: "bg-emerald-600" },
  { href: "/cashbook?add=out", label: "Cash Out", icon: ArrowUpCircle, color: "bg-rose-600" },
  { href: "/sales/new", label: "Sale", icon: ShoppingCart, color: "bg-fuchsia-600" },
  { href: "/purchases/new", label: "Purchase", icon: Plus, color: "bg-amber-600" },
];

export function BottomActionBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-safe md:hidden">
      <div className="pointer-events-auto mx-auto max-w-6xl px-2 pb-3">
        <div className="flex items-stretch justify-between gap-1 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-2xl backdrop-blur">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium text-foreground"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md",
                  a.color,
                )}
              >
                <a.icon className="h-5 w-5" />
              </span>
              <span className="truncate">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
