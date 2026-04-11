"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ListingStatus } from "@/generated/prisma";
import { requireAdmin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { generateSlug, normalizeWhatsAppNumber } from "@/lib/utils";
import { z } from "zod";

const listingSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters long."),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters long."),
  categoryId: z.string().cuid("Select a valid category."),
  status: z.enum(ListingStatus),
  price: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), {
      message: "Enter a valid price with up to 2 decimal places.",
    }),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter code."),
  location: z.string().trim().optional(),
  whatsappNumber: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number."),
  coverImageKey: z.string().trim().optional(),
  metadata: z.string().trim().optional(),
  imageKeys: z.array(z.string().trim()).default([]),
});

export type ListingActionState = {
  errors?: {
    id?: string[];
    title?: string[];
    description?: string[];
    categoryId?: string[];
    status?: string[];
    price?: string[];
    currency?: string[];
    location?: string[];
    whatsappNumber?: string[];
    coverImageKey?: string[];
    metadata?: string[];
    imageKeys?: string[];
  };
  message?: string;
};

function parseListingFormData(formData: FormData) {
  return listingSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    status: formData.get("status"),
    price: formData.get("price") || undefined,
    currency: formData.get("currency"),
    location: formData.get("location") || undefined,
    whatsappNumber: formData.get("whatsappNumber"),
    coverImageKey: formData.get("coverImageKey") || undefined,
    metadata: formData.get("metadata") || undefined,
    imageKeys: formData.getAll("imageKeys"),
  });
}

async function resolveUniqueListingSlug(title: string, listingId?: string) {
  const baseSlug = generateSlug(title);

  if (!baseSlug) {
    return null;
  }

  const prisma = getPrismaClient();
  let nextSlug = baseSlug;
  let counter = 2;

  while (true) {
    const existingListing = await prisma.listing.findUnique({
      where: { slug: nextSlug },
      select: { id: true },
    });

    if (!existingListing || existingListing.id === listingId) {
      return nextSlug;
    }

    nextSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function assertCategoryExists(categoryId: string) {
  const category = await getPrismaClient().category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  return Boolean(category);
}

function parseMetadataValue(rawMetadata?: string) {
  if (!rawMetadata) {
    return { data: null } as const;
  }

  try {
    return { data: JSON.parse(rawMetadata) } as const;
  } catch {
    return {
      errors: {
        metadata: ["Metadata must be valid JSON."],
      },
      message: "Fix the metadata and try again.",
    } satisfies ListingActionState;
  }
}

async function buildListingData(
  parsedValues: z.infer<typeof listingSchema>,
  listingId?: string,
) {
  const categoryExists = await assertCategoryExists(parsedValues.categoryId);

  if (!categoryExists) {
    return {
      errors: {
        categoryId: ["Selected category no longer exists."],
      },
      message: "Listing category is invalid.",
    } satisfies ListingActionState;
  }

  const slug = await resolveUniqueListingSlug(parsedValues.title, listingId);

  if (!slug) {
    return {
      errors: {
        title: ["Enter a title that can be converted into a valid slug."],
      },
      message: "Listing title is invalid.",
    } satisfies ListingActionState;
  }

  const parsedMetadata = parseMetadataValue(parsedValues.metadata);

  if ("errors" in parsedMetadata) {
    return parsedMetadata;
  }

  return {
    data: {
      title: parsedValues.title,
      slug,
      description: parsedValues.description,
      categoryId: parsedValues.categoryId,
      status: parsedValues.status,
      price: parsedValues.price || null,
      currency: parsedValues.currency,
      location: parsedValues.location || null,
      whatsappNumber: normalizeWhatsAppNumber(parsedValues.whatsappNumber),
      coverImageKey: parsedValues.coverImageKey || null,
      metadata: parsedMetadata.data,
      imageKeys: parsedValues.imageKeys,
    },
  } as const;
}

export async function createListing(
  _previousState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  await requireAdmin();

  const parsedValues = parseListingFormData(formData);

  if (!parsedValues.success) {
    return {
      errors: parsedValues.error.flatten().fieldErrors,
      message: "Fix the listing details and try again.",
    } satisfies ListingActionState;
  }

  const preparedData = await buildListingData(parsedValues.data);

  if ("errors" in preparedData) {
    return preparedData;
  }

  await getPrismaClient().listing.create({
    data: {
      title: preparedData.data.title,
      slug: preparedData.data.slug,
      description: preparedData.data.description,
      categoryId: preparedData.data.categoryId,
      status: preparedData.data.status,
      price: preparedData.data.price,
      currency: preparedData.data.currency,
      location: preparedData.data.location,
      whatsappNumber: preparedData.data.whatsappNumber,
      coverImageKey: preparedData.data.coverImageKey,
      metadata: preparedData.data.metadata,
      images: {
        create: preparedData.data.imageKeys.map((imageKey: string, index: number) => ({
          imageKey,
          sortOrder: index,
        })),
      },
    },
  });

  revalidatePath("/admin/listings");
  redirect("/admin/listings");
}

export async function updateListing(
  _previousState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  await requireAdmin();

  const parsedValues = parseListingFormData(formData);

  if (!parsedValues.success) {
    return {
      errors: parsedValues.error.flatten().fieldErrors,
      message: "Fix the listing details and try again.",
    } satisfies ListingActionState;
  }

  const { id } = parsedValues.data;

  if (!id) {
    return {
      errors: {
        id: ["Missing listing id."],
      },
      message: "Listing could not be updated.",
    } satisfies ListingActionState;
  }

  const existingListing = await getPrismaClient().listing.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingListing) {
    return {
      errors: {
        id: ["Listing not found."],
      },
      message: "Listing could not be updated.",
    } satisfies ListingActionState;
  }

  const preparedData = await buildListingData(parsedValues.data, id);

  if ("errors" in preparedData) {
    return preparedData;
  }

  await getPrismaClient().listing.update({
    where: { id },
    data: {
      title: preparedData.data.title,
      slug: preparedData.data.slug,
      description: preparedData.data.description,
      categoryId: preparedData.data.categoryId,
      status: preparedData.data.status,
      price: preparedData.data.price,
      currency: preparedData.data.currency,
      location: preparedData.data.location,
      whatsappNumber: preparedData.data.whatsappNumber,
      coverImageKey: preparedData.data.coverImageKey,
      metadata: preparedData.data.metadata,
      images: {
        deleteMany: {},
        create: preparedData.data.imageKeys.map((imageKey: string, index: number) => ({
          imageKey,
          sortOrder: index,
        })),
      },
    },
  });

  revalidatePath("/admin/listings");
  redirect("/admin/listings");
}
