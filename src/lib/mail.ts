import { getAppBaseUrl } from "@/lib/app-url";

export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<{ sent: boolean }> {
  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!key || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info("[password reset] Email not configured. Reset link:", resetUrl);
    }
    return { sent: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your Khata Stock password",
      html: `<p>You asked to reset your password. This link expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p><p style="color:#666;font-size:12px">If you did not request this, you can ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[password reset] Resend error:", res.status, text);
    return { sent: false };
  }

  return { sent: true };
}
