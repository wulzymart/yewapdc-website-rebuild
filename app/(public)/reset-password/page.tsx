import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type SearchParams = {
  token?: string;
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const token = resolved.token ?? null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      <ResetPasswordForm token={token} />
    </main>
  );
}
