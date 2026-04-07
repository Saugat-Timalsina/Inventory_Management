import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthPageShell } from "@/components/layout/auth-page-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
