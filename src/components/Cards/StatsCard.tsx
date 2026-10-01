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
    <div className="flex min-h-[104px] items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
      
      {/* Icono */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClassName ?? "bg-slate-100 text-slate-600"}`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>

      {/* Información */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        {trend && (
          <div className="mt-1 flex items-center gap-2">
            <span
              className={
                trend.direction === "up"
                  ? "text-xs font-semibold text-emerald-500"
                  : "text-xs font-semibold text-red-500"
              }
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </span>

            <span className="text-[11px] text-slate-400">
              {trend.label ?? "vs. mes anterior"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}