import type { UpcomingItem } from "@/lib/services/dashboard-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardScheduleProps {
  items: UpcomingItem[];
}

export function DashboardSchedule({ items }: DashboardScheduleProps) {
  const hasEvents = items.some((i) => i.type === "event");
  const hasPromotions = items.some((i) => i.type === "promotion");

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-card)]/80 mt-8">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-2">
        <CardTitle className="text-sm font-semibold text-[var(--color-foreground)]">
          Upcoming events & promotions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 text-xs">
        {items.length === 0 && (
          <p className="text-[var(--color-muted)]">
            No upcoming events or promotions in the next 30 days.
          </p>
        )}
        {items.length > 0 && (
          <ul className="space-y-1.5">
            {items.map((item) => {
              const start = item.start.toLocaleString?.() ?? String(item.start);
              return (
                <li
                  key={`${item.type}-${item.id}`}
                  className="flex items-start justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-card)]/80 px-3 py-2"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-[var(--color-foreground)]">{item.title}</p>
                    <p className="text-[0.7rem] text-[var(--color-muted)]">
                      {item.type === "event" ? "Event" : "Promotion"} • {start}
                    </p>
                  </div>
                  <a
                    href={item.href}
                    className="shrink-0 text-[0.7rem] font-medium text-[var(--color-accent)] hover:underline"
                  >
                    View
                  </a>
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex gap-2 pt-1">
          {hasEvents && (
            <Button asChild variant="outline" size="sm" className="text-[0.75rem]">
              <a href="/admin/events">View all events</a>
            </Button>
          )}
          {hasPromotions && (
            <Button asChild variant="outline" size="sm" className="text-[0.75rem]">
              <a href="/admin/promotions">View all promotions</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
