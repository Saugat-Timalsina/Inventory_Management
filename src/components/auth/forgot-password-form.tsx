"use client";

import { useActionState } from 'react'
import Link from "next/link";
import { requestPasswordResetAction } from "@/actions/password-reset";
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

type State =
  | null
  | { error: string }
  | { ok: true; message: string };

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, null as State);

  return (
    <Card className="w-full max-w-md border-violet-200/80 shadow-xl dark:border-violet-900/40">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send a reset link if an account exists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state && "ok" in state && state.ok ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p>
        ) : (
          <form action={action} className="space-y-4">
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
            {state && "error" in state ? (
              <p className="text-sm text-rose-600" role="alert">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
