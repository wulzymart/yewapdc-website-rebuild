import type { DashboardActivity } from "@/lib/services/dashboard-service";

interface DashboardActivityProps {
  activity: DashboardActivity[];
}

export function DashboardActivity({ activity }: DashboardActivityProps) {
  if (!activity || activity.length === 0) {
    return (
      <p className="text-xs text-[var(--color-muted)]">
        No recent changes yet. As you create and update content, it will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-2 text-xs">
      {activity.map((item) => (
        <a
          key={`${item.type}-${item.id}-${item.at.toISOString?.() ?? ""}`}
          href={item.href}
          className="flex items-start justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-card)]/80 px-3 py-2 hover:border-[var(--color-accent)] hover:bg-[var(--color-card)]"
        >
          <div className="space-y-0.5">
            <p className="font-medium text-[var(--color-foreground)]">{item.title}</p>
            <p className="text-[0.7rem] text-[var(--color-muted)]">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {" "}
              {item.action} • {item.at.toLocaleString?.()}
            </p>
          </div>
          {item.actor && (
            <p className="shrink-0 text-[0.7rem] text-[var(--color-muted)]">{item.actor}</p>
          )}
        </a>
      ))}
    </div>
  );
}
