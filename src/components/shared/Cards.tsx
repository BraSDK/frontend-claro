import type { ElementType } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ElementType;
    trend?: { value: number; isPositive: boolean };
    iconClassName?: string;
}

// Tarjeta de indicador (KPI): blanca, ícono en círculo suave; la tendencia usa los colores de estado
export const StatCard = ({ title, value, icon: Icon, trend, iconClassName = "bg-info-soft text-info" }: StatCardProps) => (
    <div className="flex min-h-[92px] items-center gap-4 rounded-card bg-surface p-4 shadow-card">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
            <Icon size={24} strokeWidth={1.75} />
        </div>
        <div className="flex min-w-0 flex-col">
            <span className="text-sm text-label">{title}</span>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-ink">{value}</span>
                {trend && (
                    <span className={`text-xs font-semibold ${trend.isPositive ? "text-success" : "text-danger"}`}>
                        {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                    </span>
                )}
            </div>
        </div>
    </div>
);
