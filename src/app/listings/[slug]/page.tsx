import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { getS3ObjectUrl } from "@/lib/s3";
import { buildWhatsAppLink } from "@/lib/utils";
import { getPrismaClient } from "@/lib/prisma";

type ListingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function renderMetadataValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;

  const listing = await getPrismaClient().listing.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (
    !listing ||
    listing.status !== "PUBLISHED" ||
    !listing.category.isActive
  ) {
    notFound();
  }

  const metadataEntries =
    listing.metadata && typeof listing.metadata === "object"
      ? Object.entries(listing.metadata)
      : [];
  const primaryImageUrl = getS3ObjectUrl(
    listing.coverImageKey || listing.images[0]?.imageKey,
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link className="transition hover:text-slate-900" href="/">
            Home
          </Link>
          <span>/</span>
          <Link
            className="transition hover:text-slate-900"
            href={`/categories/${listing.category.slug}`}
          >
            {listing.category.name}
          </Link>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_360px]">
          <div>
            {primaryImageUrl ? (
              <Image
                alt={listing.title}
                className="mb-8 h-[420px] w-full rounded-3xl object-cover"
                height={420}
                src={primaryImageUrl}
                width={1200}
              />
            ) : null}
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              {listing.category.name}
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {listing.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
              {listing.description}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Price
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {listing.price
                    ? `${listing.currency} ${listing.price.toString()}`
                    : "Price on request"}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Location
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {listing.location || "Not specified"}
                </p>
              </div>
            </div>

            {metadataEntries.length > 0 ? (
              <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Listing details
                </h2>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  {metadataEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {key.replaceAll(/([A-Z])/g, " $1")}
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-slate-900">
                        {renderMetadataValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {listing.images.length > 0 ? (
              <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">Gallery</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {listing.images.map((image) =>
                    getS3ObjectUrl(image.imageKey) ? (
                      <Image
                        key={image.id}
                        alt={image.altText || listing.title}
                        className="h-56 w-full rounded-2xl object-cover"
                        height={224}
                        src={getS3ObjectUrl(image.imageKey) || ""}
                        width={480}
                      />
                    ) : null,
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 lg:sticky lg:top-8 lg:self-start">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Quick enquiry
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Ask about this listing
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Contact the admin directly on WhatsApp with a prefilled enquiry
              message for this listing.
            </p>

            <a
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              href={buildWhatsAppLink(listing.title, listing.whatsappNumber)}
              rel="noreferrer"
              target="_blank"
            >
              Chat on WhatsApp
            </a>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Category
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {listing.category.name}
              </p>
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
