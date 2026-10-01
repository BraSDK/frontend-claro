// src/components/ui/Card.tsx
import type { ReactNode } from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;   // ej: el botón "Agregar servicio"
  children: ReactNode;
}



export function Card({ title, subtitle, icon, actions, children }: CardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-start justify-between">
        <div className="flex gap-3">
          {icon}
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}