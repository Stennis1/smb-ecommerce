"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createAdminSession,
  redirectIfAuthenticated,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getPrismaClient } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export type LoginActionState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
};

export async function loginAdmin(
  _previousState: LoginActionState | undefined,
  formData: FormData,
) {
  await redirectIfAuthenticated();

  const parsedValues = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedValues.success) {
    return {
      errors: parsedValues.error.flatten().fieldErrors,
      message: "Enter a valid email and password.",
    } satisfies LoginActionState;
  }

  const { email, password } = parsedValues.data;

  const admin = await getPrismaClient().admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return {
      message: "Invalid email or password.",
    } satisfies LoginActionState;
  }

  const passwordMatches = await verifyPassword(password, admin.passwordHash);

  if (!passwordMatches) {
    return {
      message: "Invalid email or password.",
    } satisfies LoginActionState;
  }

  await createAdminSession({
    adminId: admin.id,
    email: admin.email,
  });

  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  const { clearAdminSession } = await import("@/lib/auth");

  await clearAdminSession();
  redirect("/admin/login");
}
