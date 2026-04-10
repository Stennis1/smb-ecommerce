import { getPrismaClient } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const prisma = getPrismaClient();

  const [categoryCount, listingCount, publishedCount] = await Promise.all([
    prisma.category.count(),
    prisma.listing.count(),
    prisma.listing.count({
      where: { status: "PUBLISHED" },
    }),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          Overview
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Admin dashboard
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Authentication is now in place. This dashboard is intentionally lean
          while we build the next MVP slices: category CRUD, listing CRUD, S3
          image handling, and public pages.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Categories</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {categoryCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Listings</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {listingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Published listings
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {publishedCount}
          </p>
        </div>
      </div>
    </section>
  );
}
