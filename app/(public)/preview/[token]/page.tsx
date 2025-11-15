interface PreviewPageProps {
  params: { token: string };
}

export default function PreviewPage({ params }: PreviewPageProps) {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Content Preview</h1>
      <p className="text-sm text-[var(--color-muted)]">
        Placeholder for previewing draft content with token: <span className="font-mono">{params.token}</span>.
      </p>
    </section>
  );
}
