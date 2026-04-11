"use client";

import { useActionState } from "react";
import type { CategoryActionState } from "@/app/admin/(protected)/categories/actions";

const initialState: CategoryActionState = {};

type CategoryFormProps = {
  action: (
    state: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>;
  submitLabel: string;
  defaultValues?: {
    id?: string;
    name?: string;
    description?: string | null;
    isActive?: boolean;
  };
};

export function CategoryForm({
  action,
  submitLabel,
  defaultValues,
}: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {defaultValues?.id ? (
        <input name="id" type="hidden" value={defaultValues.id} />
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Name
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          defaultValue={defaultValues?.name ?? ""}
          id="name"
          name="name"
          placeholder="Cars"
          required
          type="text"
        />
        {state.errors?.name ? (
          <p className="text-sm text-red-600">{state.errors.name[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          defaultValue={defaultValues?.description ?? ""}
          id="description"
          name="description"
          placeholder="Short summary for this category."
        />
        {state.errors?.description ? (
          <p className="text-sm text-red-600">{state.errors.description[0]}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <input
          className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          defaultChecked={defaultValues?.isActive ?? true}
          name="isActive"
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-medium text-slate-900">
            Active category
          </span>
          <span className="mt-1 block text-sm leading-6 text-slate-600">
            Inactive categories stay in the database but can be hidden from
            future public navigation.
          </span>
        </span>
      </label>

      {state.errors?.id ? (
        <p className="text-sm text-red-600">{state.errors.id[0]}</p>
      ) : null}

      {state.message ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <button
        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
