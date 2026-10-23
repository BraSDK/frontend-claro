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
    <section className="rounded-card bg-surface px-4 py-4 shadow-card md:px-6">
      <header className="mb-4 flex items-start justify-between">
        <div className="flex gap-3">
          {icon}
          <div>
            <h2 className="text-[17px] font-bold text-ink">{title}</h2>
            {subtitle && <p className="text-sm text-label">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}