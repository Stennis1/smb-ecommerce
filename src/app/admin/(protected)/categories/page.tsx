import Link from "next/link";
import { getPrismaClient } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await getPrismaClient().category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          listings: true,
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
            Categories
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Manage the taxonomy that listings will be organized under across
            the admin and public catalog.
          </p>
        </div>

        <Link
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/admin/categories/new"
        >
          New category
        </Link>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No categories yet
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create the first category so listing management has a usable
              structure.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {categories.map((category) => (
              <article
                key={category.id}
                className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(0,1.6fr)_140px_120px_110px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {category.name}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                        category.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Slug: <span className="font-mono">{category.slug}</span>
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {category.description || "No description added yet."}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Listings
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {category._count.listings}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Updated
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {category.updatedAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-start md:justify-end">
                  <Link
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                    href={`/admin/categories/${category.id}/edit`}
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
