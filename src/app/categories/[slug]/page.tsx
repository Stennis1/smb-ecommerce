import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { getS3ObjectUrl } from "@/lib/s3";
import { buildWhatsAppLink } from "@/lib/utils";
import { getPrismaClient } from "@/lib/prisma";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await getPrismaClient().category.findUnique({
    where: { slug },
    include: {
      listings: {
        where: { status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: {
              imageKey: true,
            },
          },
        },
      },
    },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Link
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          href="/"
        >
          Back to home
        </Link>

        <div className="mt-6 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Category
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            {category.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {category.description ||
              "Browse the currently published listings available in this category."}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {category.listings.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                No published listings yet
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This category exists, but nothing is publicly visible in it
                right now.
              </p>
            </div>
          ) : (
            category.listings.map((listing) => (
              <article
                key={listing.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                {getS3ObjectUrl(
                  listing.coverImageKey || listing.images[0]?.imageKey,
                ) ? (
                  <Image
                    alt={listing.title}
                    className="mb-5 h-52 w-full rounded-2xl object-cover"
                    height={208}
                    src={
                      getS3ObjectUrl(
                        listing.coverImageKey || listing.images[0]?.imageKey,
                      ) || ""
                    }
                    width={640}
                  />
                ) : null}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {listing.location || category.name}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                      {listing.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    Published
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {listing.description}
                </p>

                <div className="mt-6 flex items-center justify-between gap-4">
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
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                      href={`/listings/${listing.slug}`}
                    >
                      View details
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
      <SiteFooter />
    </main>
  );
}
