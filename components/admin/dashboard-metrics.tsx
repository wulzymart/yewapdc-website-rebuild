import * as React from "react";

import type { DashboardMetric } from "@/lib/services/dashboard-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  NewspaperIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface DashboardMetricsProps {
  metrics: DashboardMetric[];
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  articles: NewspaperIcon,
  events: CalendarDaysIcon,
  promotions: MegaphoneIcon,
  media: PhotoIcon,
};

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <p className="text-xs text-[var(--color-muted)]">
        No metrics available yet. Create some content to see activity here.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.id] ?? NewspaperIcon;
        const trendClass =
          metric.trend === "up"
            ? "text-emerald-600"
            : metric.trend === "down"
              ? "text-red-600"
              : "text-[var(--color-muted)]";

        return (
          <Card key={metric.id} className="border-[var(--color-border)] bg-[var(--color-card)]/90">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-xs font-medium text-[var(--color-muted-foreground)]">
                  {metric.label}
                </CardTitle>
                <CardDescription className="text-2xl font-semibold text-[var(--color-foreground)]">
                  {metric.value.toLocaleString()}
                </CardDescription>
                {typeof metric.delta === "number" && (
                  <p className={`text-[0.7rem] ${trendClass}`}>
                    {metric.trend === "up" && "+"}
                    {metric.delta.toFixed(1)}%
                    <span className="text-[var(--color-muted)]"> vs last period</span>
                  </p>
                )}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </CardHeader>
            {metric.href && (
              <CardContent className="px-4 pt-0 pb-4">
                <Button asChild variant="outline" size="sm" className="text-[0.75rem]">
                  <a href={metric.href}>View all</a>
                </Button>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
