import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DevSignupForm } from "@/components/auth/dev-signup-form";
import { auth } from "@/lib/auth";

export default async function DevSignupPage() {
  const env = process.env.NODE_ENV ?? "development";
  if (env !== "development" && env !== "test") {
    redirect("/");
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      <DevSignupForm />
    </main>
  );
}
