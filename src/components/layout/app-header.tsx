"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Users,
  Truck,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/cashbook", label: "Cashbook", icon: BookOpen },
  { href: "/inventory", label: "Stock", icon: Package },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/purchases", label: "Purchases", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppHeader({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-violet-800 via-purple-800 to-violet-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="min-w-0 shrink">
          <p className="truncate text-xs uppercase tracking-wider text-violet-200">
            Khata &amp; Stock
          </p>
          <p className="truncate text-lg font-semibold leading-tight">
            {businessName}
          </p>
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="hidden border-white/20 bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </Button>
      </div>
      <nav
        className="no-scrollbar flex gap-1 overflow-x-auto px-2 pb-2 md:px-4"
        aria-label="Primary"
      >
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:text-sm",
                active
                  ? "bg-white text-violet-900 shadow"
                  : "text-violet-100 hover:bg-white/10",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
