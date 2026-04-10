"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginActionState } from "@/app/admin/login/actions";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="email"
        >
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          id="email"
          name="email"
          placeholder="admin@example.com"
          type="email"
        />
        {state.errors?.email ? (
          <p className="text-sm text-red-600">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          id="password"
          name="password"
          placeholder="Enter your password"
          type="password"
        />
        {state.errors?.password ? (
          <p className="text-sm text-red-600">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <button
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
