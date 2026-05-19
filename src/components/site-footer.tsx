import Link from "next/link";
import { getPrismaClient } from "@/lib/prisma";

export async function SiteFooter() {
  const categories = await getPrismaClient().category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 6,
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_1fr_1fr_1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
              StaySmart
            </p>
            <h2 className="mt-4 max-w-sm text-2xl font-semibold tracking-tight text-slate-900">
              A cleaner way to browse curated listings and enquire quickly.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              Explore active categories, review published listings, and contact
              the admin directly through WhatsApp when a listing matches what
              you need.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Platform
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link className="block transition hover:text-slate-900" href="/">
                Home
              </Link>
              <Link
                className="block transition hover:text-slate-900"
                href="/admin/login"
              >
                Admin login
              </Link>
              <Link
                className="block transition hover:text-slate-900"
                href="/#latest-listings"
              >
                Recent listings
              </Link>
              <Link
                className="block transition hover:text-slate-900"
                href="/#categories"
              >
                Browse categories
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Categories
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {categories.length === 0 ? (
                <p>No active categories yet.</p>
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    className="block transition hover:text-slate-900"
                    href={`/categories/${category.slug}`}
                  >
                    {category.name}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              How it works
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>Browse by category or start from the latest published listings.</p>
              <p>Open each listing for images, details, pricing, and location.</p>
              <p>Use the WhatsApp action to send a direct prefilled enquiry.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} StaySmart. Public listing catalog.</p>
          <p>Admin-managed inventory with direct WhatsApp enquiries.</p>
        </div>
      </div>
    </footer>
  );
}
