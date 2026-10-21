import React from "react";
import type { ElementType } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ElementType;
    trend?: { value: number; isPositive: boolean };
    iconClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, iconClassName = "bg-blue-50 text-blue-600" }) => (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
            <Icon size={24} />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">{value}</span>
                {trend && (
                    <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </span>
                )}
            </div>
        </div>
    </div>
);