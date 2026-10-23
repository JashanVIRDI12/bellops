"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "../actions";

const initialState: SignInState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="admin-password" className="text-sm font-bold">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state.error ? "true" : undefined}
          aria-describedby={state.error ? "admin-password-error" : undefined}
          className="admin-input"
        />
        {state.error && (
          <p
            id="admin-password-error"
            role="alert"
            className="text-sm font-semibold text-[#ffc4ba]"
          >
            {state.error}
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} className="admin-button">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
