"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

const categorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  description: z
    .string()
    .trim()
    .max(300, "Description must be 300 characters or fewer.")
    .optional(),
  isActive: z.boolean(),
});

export type CategoryActionState = {
  errors?: {
    id?: string[];
    name?: string[];
    description?: string[];
    isActive?: string[];
  };
  message?: string;
};

function parseCategoryFormData(formData: FormData) {
  return categorySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

async function resolveUniqueCategorySlug(name: string, categoryId?: string) {
  const baseSlug = generateSlug(name);

  if (!baseSlug) {
    return null;
  }

  const prisma = getPrismaClient();
  let nextSlug = baseSlug;
  let counter = 2;

  while (true) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: nextSlug },
      select: { id: true },
    });

    if (!existingCategory || existingCategory.id === categoryId) {
      return nextSlug;
    }

    nextSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function createCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsedValues = parseCategoryFormData(formData);

  if (!parsedValues.success) {
    return {
      errors: parsedValues.error.flatten().fieldErrors,
      message: "Fix the category details and try again.",
    } satisfies CategoryActionState;
  }

  const { name, description, isActive } = parsedValues.data;
  const slug = await resolveUniqueCategorySlug(name);

  if (!slug) {
    return {
      errors: {
        name: ["Enter a name that can be converted into a valid slug."],
      },
      message: "Category name is invalid.",
    } satisfies CategoryActionState;
  }

  await getPrismaClient().category.create({
    data: {
      name,
      slug,
      description: description || null,
      isActive,
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsedValues = parseCategoryFormData(formData);

  if (!parsedValues.success) {
    return {
      errors: parsedValues.error.flatten().fieldErrors,
      message: "Fix the category details and try again.",
    } satisfies CategoryActionState;
  }

  const { id, name, description, isActive } = parsedValues.data;

  if (!id) {
    return {
      errors: {
        id: ["Missing category id."],
      },
      message: "Category could not be updated.",
    } satisfies CategoryActionState;
  }

  const existingCategory = await getPrismaClient().category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingCategory) {
    return {
      errors: {
        id: ["Category not found."],
      },
      message: "Category could not be updated.",
    } satisfies CategoryActionState;
  }

  const slug = await resolveUniqueCategorySlug(name, id);

  if (!slug) {
    return {
      errors: {
        name: ["Enter a name that can be converted into a valid slug."],
      },
      message: "Category name is invalid.",
    } satisfies CategoryActionState;
  }

  await getPrismaClient().category.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || null,
      isActive,
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
