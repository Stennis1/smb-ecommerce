import { redirectIfAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/app/admin/login/login-form";

export default async function AdminLoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-900">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl bg-slate-900 p-8 text-white sm:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            StaySmart Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Sign in to manage listings, categories, and visibility.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
            This admin area is limited to the MVP scope: publishing listings,
            organizing categories, managing S3-backed images, and controlling
            what appears on the public site.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Admin login
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the seeded admin account to access the dashboard.
            </p>
          </div>

          <LoginForm />
        </section>
      </div>
    </main>
  );
}
