import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down";
    label?: string;
  };
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconClassName,
}: StatCardProps) {
  return (
    <div className="flex min-h-[92px] items-center gap-4 rounded-card bg-surface p-4 shadow-card">
      
      {/* Icono */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClassName ?? "bg-hover text-label"}`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>

      {/* Información */}
      <div className="min-w-0">
        <p className="text-sm text-label">
          {title}
        </p>

        <p className="mt-0.5 text-2xl font-bold tracking-tight text-ink">
          {value}
        </p>

        {trend && (
          <div className="mt-1 flex items-center gap-2">
            <span
              className={
                trend.direction === "up"
                  ? "text-xs font-semibold text-success"
                  : "text-xs font-semibold text-danger"
              }
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </span>

            <span className="text-[11px] text-muted">
              {trend.label ?? "vs. mes anterior"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}