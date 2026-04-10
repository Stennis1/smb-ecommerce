export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
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
      </section>
    </main>
  );
}
