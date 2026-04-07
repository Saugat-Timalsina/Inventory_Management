"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";

const RESET_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordResetAction(_prev: unknown, formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }
  const email = parsed.data.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + RESET_TTL_MS);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    await sendPasswordResetEmail(email, token);
  }

  return {
    ok: true as const,
    message:
      "If an account exists for that email, we sent a link to reset your password.",
  };
}

export async function resetPasswordAction(_prev: unknown, formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Invalid or expired link. Request a new reset email." };
  }
  const { token, password } = parsed.data;

  const row = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!row || row.expires < new Date()) {
    return { error: "This reset link has expired. Request a new one from the login page." };
  }

  const email = row.identifier.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return { error: "Could not reset password for this account." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { ok: true as const };
}
