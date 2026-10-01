// src/components/ordenes/OrdenResumenCard.tsx
import { EstadoBadge } from "../shared/EstadoBadge";
import { CircleCheck, WalletCards,ClipboardList} from "lucide-react";

interface Props { estado: number; cantidad: number; subtotal?: number; total: number; }

const soles = (n: number) => `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

export function OrdenResumenCard({ estado,subtotal, cantidad, total }: Props) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <EstadoBadge estado={estado} />

      <div className="mt-7">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <ClipboardList size={18} strokeWidth={2} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Servicios realizados
          </p>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            {cantidad}
          </span>

          <span className="text-sm text-slate-400">
            servicio{cantidad !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <WalletCards size={18} strokeWidth={2} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">Total</p>
              <p className="text-xs text-slate-400">Orden de trabajo</p>
            </div>
          </div>

          <span className="text-2xl font-bold tracking-tight text-blue-600">
            {soles(total)}
          </span>
        </div>
      </div>
    </div>
  );
}