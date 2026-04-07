"use client";

import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/password-reset";
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

type State = null | { error: string } | { ok: true };

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, action] = useFormState(resetPasswordAction, null as State);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.replace("/login?reset=1");
    }
  }, [state, router]);

  if (!token) {
    return (
      <Card className="w-full max-w-md border-violet-200/80 shadow-xl dark:border-violet-900/40">
        <CardHeader>
          <CardTitle className="text-2xl">Invalid link</CardTitle>
          <CardDescription>
            This reset link is missing a token. Request a new email from the login page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request reset</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-violet-200/80 shadow-xl dark:border-violet-900/40">
      <CardHeader>
        <CardTitle className="text-2xl">New password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
          {state && "error" in state ? (
            <p className="text-sm text-rose-600" role="alert">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Update password
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
