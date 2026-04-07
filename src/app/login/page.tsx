import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthPageShell } from "@/components/layout/auth-page-shell";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
