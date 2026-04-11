import Link from "next/link";
import { ListingStatus } from "@/generated/prisma";
import { getPrismaClient } from "@/lib/prisma";

const statusStyles: Record<ListingStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-slate-200 text-slate-600",
};

export default async function AdminListingsPage() {
  const listings = await getPrismaClient().listing.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Listings
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Create and manage the listings that appear on the public catalog,
            including publication status and category assignment.
          </p>
        </div>

        <Link
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/admin/listings/new"
        >
          New listing
        </Link>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {listings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No listings yet
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create the first listing once at least one category is available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(0,1.8fr)_160px_140px_120px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {listing.title}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusStyles[listing.status]}`}
                    >
                      {listing.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Slug: <span className="font-mono">{listing.slug}</span>
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {listing.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Category
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {listing.category.name}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Price
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {listing.price
                      ? `${listing.currency} ${listing.price.toString()}`
                      : "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Location
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {listing.location || "Not set"}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Updated
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {listing.updatedAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-start md:justify-end">
                  <Link
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                    href={`/admin/listings/${listing.id}/edit`}
                  >
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
