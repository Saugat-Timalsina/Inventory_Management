"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "header" | "auth";

export function ThemeToggle({
  className,
  variant = "header",
}: {
  className?: string;
  variant?: Variant;
}) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const headerStyles =
    "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white";
  const authStyles =
    "border-border bg-card/80 text-foreground shadow-sm backdrop-blur-sm hover:bg-card";

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={cn(
        "shrink-0",
        variant === "header" ? headerStyles : authStyles,
        className,
      )}
      aria-label={
        resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      disabled={!mounted}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {!mounted ? (
        <span className="h-5 w-5" aria-hidden />
      ) : resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </Button>
  );
}
