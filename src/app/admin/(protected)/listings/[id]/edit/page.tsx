import Link from "next/link";
import { notFound } from "next/navigation";
import { updateListing } from "@/app/admin/(protected)/listings/actions";
import { ListingForm } from "@/app/admin/(protected)/listings/listing-form";
import { requireAdmin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

type EditListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  await requireAdmin();

  const { id } = await params;
  const prisma = getPrismaClient();

  const [listing, categories] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    }),
  ]);

  if (!listing) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Edit listing
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Update content, status, category assignment, and structured
            metadata for this listing.
          </p>
        </div>

        <Link
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          href="/admin/listings"
        >
          Back
        </Link>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <ListingForm
          action={updateListing}
          categories={categories}
          defaultValues={{
            id: listing.id,
            title: listing.title,
            description: listing.description,
            categoryId: listing.categoryId,
            status: listing.status,
            price: listing.price?.toString() ?? null,
            currency: listing.currency,
            location: listing.location,
            whatsappNumber: listing.whatsappNumber,
            coverImageKey: listing.coverImageKey,
            metadata: listing.metadata
              ? JSON.stringify(listing.metadata, null, 2)
              : "",
            imageKeys: listing.images.map((image) => image.imageKey),
          }}
          submitLabel="Save changes"
        />
      </div>
    </section>
  );
}
