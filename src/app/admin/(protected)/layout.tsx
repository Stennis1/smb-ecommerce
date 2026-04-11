import Link from "next/link";
import { logoutAdmin } from "@/app/admin/login/actions";
import { requireAdmin } from "@/lib/auth";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();
  const navigationLinks = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
    },
    {
      href: "/admin/categories",
      label: "Categories",
    },
    {
      href: "/admin/listings",
      label: "Listings",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              StaySmart Admin
            </p>
            <p className="mt-1 text-sm text-slate-600">{admin.email}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap items-center gap-3">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <form action={logoutAdmin}>
              <button
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                type="submit"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
