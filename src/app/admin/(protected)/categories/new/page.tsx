import Link from "next/link";
import { createCategory } from "@/app/admin/(protected)/categories/actions";
import { CategoryForm } from "@/app/admin/(protected)/categories/category-form";

export default function NewCategoryPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            New category
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Create a category for a listing type such as cars, properties,
            appliances, or digital services.
          </p>
        </div>

        <Link
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          href="/admin/categories"
        >
          Back
        </Link>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <CategoryForm action={createCategory} submitLabel="Create category" />
      </div>
    </section>
  );
}
