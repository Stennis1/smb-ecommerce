import Image from "next/image";
import Link from "next/link";
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

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          StaySmart Platform
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Admin-managed multi-category listings platform
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          A custom platform for properties, cars, appliances, and digital
          services with a public catalog, admin dashboard, and WhatsApp inquiry
          flow.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">MVP scope</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Admin-managed listings and categories, S3 image keys stored in the
              database, public category and listing pages, and WhatsApp
              click-to-chat for enquiries.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Current phase
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Project foundation in progress: Prisma schema, shared utilities,
              and the base application shell are being prepared for admin auth
              and CRUD flows.
            </p>
          </div>
        </div>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Browse
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Categories
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                No active categories are available yet.
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300 hover:bg-white"
                  href={`/categories/${category.slug}`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {category._count.listings} published
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    {category.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {category.description ||
                      "Browse published listings in this category."}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="mt-16">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
              Recently updated
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Published listings
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredListings.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                No published listings are visible yet.
              </div>
            ) : (
              featuredListings.map((listing) => (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6"
                >
                  {getS3ObjectUrl(
                    listing.coverImageKey || listing.images[0]?.imageKey,
                  ) ? (
                    <Image
                      alt={listing.title}
                      className="mb-5 h-48 w-full rounded-2xl object-cover"
                      height={192}
                      src={
                        getS3ObjectUrl(
                          listing.coverImageKey || listing.images[0]?.imageKey,
                        ) || ""
                      }
                      width={640}
                    />
                  ) : null}
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {listing.category.name}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                    {listing.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {listing.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {listing.price
                        ? `${listing.currency} ${listing.price.toString()}`
                        : "Price on request"}
                    </p>

                    <div className="flex items-center gap-3">
                      <Link
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                        href={`/listings/${listing.slug}`}
                      >
                        Details
                      </Link>
                      <a
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
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
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
