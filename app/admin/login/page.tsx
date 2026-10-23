import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in" };

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-6 pt-[12svh] pb-16">
      <h1 className="font-heading text-3xl font-medium tracking-tight">
        Sign in
      </h1>
      <p className="mt-2 text-white/70">
        Enquiries from the website contact form are waiting inside.
      </p>
      <LoginForm />
    </main>
  );
}
