import { RegisterForm } from "@/components/auth/register-form";
import { AuthPageShell } from "@/components/layout/auth-page-shell";

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <RegisterForm />
    </AuthPageShell>
  );
}
