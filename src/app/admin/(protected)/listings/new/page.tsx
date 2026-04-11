import Link from "next/link";
import { createListing } from "@/app/admin/(protected)/listings/actions";
import { ListingForm } from "@/app/admin/(protected)/listings/listing-form";
import { getPrismaClient } from "@/lib/prisma";

export default async function NewListingPage() {
  const categories = await getPrismaClient().category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            New listing
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Create a draft, publish immediately, or archive a listing while
            keeping the core data in one place.
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
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Create at least one category before creating listings.
          </div>
        ) : (
          <ListingForm
            action={createListing}
            categories={categories}
            submitLabel="Create listing"
          />
        )}
      </div>
    </section>
  );
}
