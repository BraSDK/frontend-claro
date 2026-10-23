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
    <section className="rounded-card bg-surface p-5 md:p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          {icon}
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {subtitle && <p className="text-sm text-label">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}