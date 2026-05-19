import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { getS3ObjectUrl } from "@/lib/s3";
import { buildWhatsAppLink } from "@/lib/utils";
import { getPrismaClient } from "@/lib/prisma";

export default async function HomePage() {
  const [categories, featuredListings] = await Promise.all([
    getPrismaClient().category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            listings: {
              where: {
                status: "PUBLISHED",
              },
            },
          },
        },
      },
    }),
    getPrismaClient().listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: {
            imageKey: true,
          },
        },
      },
    }),
  ]);
  const totalPublishedListings = categories.reduce(
    (sum, category) => sum + category._count.listings,
    0,
  );
  const topCategories = categories.slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <p className="font-medium uppercase tracking-[0.22em] text-slate-500">
              StaySmart
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                className="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
                href="#categories"
              >
                Browse categories
              </a>
              <a
                className="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
                href="#latest-listings"
              >
                Latest listings
              </a>
              <Link
                className="rounded-full bg-slate-900 px-4 py-1.5 font-medium text-white transition hover:bg-slate-700"
                href="/admin/login"
              >
                Admin login
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:items-start">
          <div className="rounded-3xl border border-slate-200 bg-white px-7 py-10 sm:px-10 sm:py-12">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                Public catalog
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Find the right listing without extra clutter.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                StaySmart organizes properties, vehicles, appliances, and
                service offers into a clean public catalog with direct WhatsApp
                enquiry links when you are ready to act.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  href="#categories"
                >
                  Explore categories
                </a>
                <a
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                  href="#latest-listings"
                >
                  See recent listings
                </a>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Active categories
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {categories.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Published listings
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {totalPublishedListings}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Direct enquiry
                  </p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">
                    WhatsApp ready
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
              Quick start
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Start from the section that matches your intent.
            </h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  01
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Browse by category
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Jump into curated groups when you already know the type of
                  listing you want.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  02
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Review fresh updates
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Recent listings surface first, so the newest options are easy
                  to compare.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  03
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Enquire instantly
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open a prefilled WhatsApp chat directly from any listing page
                  or featured card.
                </p>
              </div>
            </div>

            {topCategories.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Popular entry points
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {topCategories.map((category) => (
                    <Link
                      key={category.id}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                      href={`/categories/${category.slug}`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Structured catalog
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              Clear browsing paths
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Categories, listing cards, and detail pages are arranged to
              reduce scanning effort and surface the essentials quickly.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Direct contact
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              No dead-end forms
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Each listing can route straight into WhatsApp, keeping enquiry
              friction low when users are ready to move.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Admin managed
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              Content stays curated
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Listings and categories are controlled from the admin side, so
              the public homepage can stay focused and current.
            </p>
          </div>
        </section>

        <section className="mt-20" id="categories">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Browse by category
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Start with the listing type you need
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Each category groups published inventory into a simpler, more
              navigable shelf.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {categories.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-sm leading-6 text-slate-600">
                No active categories are available yet.
              </div>
            ) : (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300 hover:bg-white"
                  href={`/categories/${category.slug}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {category._count.listings} live
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900">
                    {category.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {category.description ||
                      "Browse published listings in this category."}
                  </p>
                  <div className="mt-8 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Open category</span>
                    <span className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="mt-20" id="latest-listings">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Recently updated
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Fresh listings worth a closer look
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              New and updated inventory surfaces here first so repeat visitors
              can get oriented quickly.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredListings.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-sm leading-6 text-slate-600">
                No published listings are visible yet.
              </div>
            ) : (
              featuredListings.map((listing) => (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-slate-300"
                >
                  {getS3ObjectUrl(
                    listing.coverImageKey || listing.images[0]?.imageKey,
                  ) ? (
                    <Image
                      alt={listing.title}
                      className="h-56 w-full object-cover"
                      height={224}
                      src={
                        getS3ObjectUrl(
                          listing.coverImageKey || listing.images[0]?.imageKey,
                        ) || ""
                      }
                      width={640}
                    />
                  ) : (
                    <div className="flex h-56 items-end bg-slate-100 p-6">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {listing.category.name}
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {listing.category.name}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                          {listing.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Live
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                      {listing.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Price
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {listing.price
                            ? `${listing.currency} ${listing.price.toString()}`
                            : "Price on request"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                          href={`/listings/${listing.slug}`}
                        >
                          Details
                        </Link>
                        <a
                          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                          href={buildWhatsAppLink(
                            listing.title,
                            listing.whatsappNumber,
                          )}
                          rel="noreferrer"
                          target="_blank"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
