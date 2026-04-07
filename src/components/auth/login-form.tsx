"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/dashboard";
  const registered = sp.get("registered");
  const resetOk = sp.get("reset");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    window.location.href = res?.url ?? callbackUrl;
  }

  return (
    <Card className="w-full max-w-md border-violet-200/80 shadow-xl dark:border-violet-900/40">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Khata, stock, and invoices — one place for your shop.
        </CardDescription>
        {registered ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Account created. You can sign in now.
          </p>
        ) : null}
        {resetOk ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Password updated. Sign in with your new password.
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p className="text-sm text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Continue"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="font-medium text-primary underline">
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
