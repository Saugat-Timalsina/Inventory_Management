import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthPageShell } from "@/components/layout/auth-page-shell";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthPageShell>
      <ResetPasswordForm token={token ?? ""} />
    </AuthPageShell>
  );
}
