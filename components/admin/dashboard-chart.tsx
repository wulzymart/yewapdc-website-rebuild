import type { ArticlesChartSeries } from "@/lib/services/dashboard-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardChartProps {
  series: ArticlesChartSeries;
}

export function DashboardChart({ series }: DashboardChartProps) {
  const points = series.points;
  const max = points.reduce((m, p) => (p.count > m ? p.count : m), 0);

  if (!points.length) {
    return (
      <Card className="h-full border-[var(--color-border)] bg-[var(--color-card)]/80">
        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-2">
          <CardTitle className="text-sm font-semibold text-[var(--color-foreground)]">
            Articles over last 14 days
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 text-xs text-[var(--color-muted)]">
          No published articles yet in the last 14 days.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-card)]/80">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-2">
        <CardTitle className="text-sm font-semibold text-[var(--color-foreground)]">
          Articles over last 14 days
        </CardTitle>
        <Button asChild variant="outline" size="sm" className="text-[0.75rem]">
          <a href="/admin/articles">View all articles</a>
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex h-40 items-end gap-1.5 border-t border-[var(--color-border)] pt-3">
          {points.map((point) => {
            const heightPct = max > 0 ? (point.count / max) * 100 : 0;
            const date = new Date(point.date);
            const label = `${date.getDate()}.${date.getMonth() + 1}`;

            return (
              <div
                key={point.date}
                className="flex flex-1 flex-col items-center gap-1 text-[0.65rem] text-[var(--color-muted)]"
              >
                <div className="flex h-24 w-full items-end justify-center rounded-full bg-[var(--color-accent)]/10">
                  <div
                    className="w-2 rounded-full bg-[var(--color-accent)]"
                    style={{ height: `${heightPct || 4}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span className="font-medium text-[var(--color-foreground)]">{label}</span>
                <span className="font-medium text-[var(--color-foreground)]">{point.count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
