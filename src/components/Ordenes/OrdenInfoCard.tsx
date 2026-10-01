// src/components/ordenes/OrdenInfoCard.tsx
import { Card } from "../../components/Cards/Card";
import { ESTADOS_ORDEN } from "../shared/EstadoBadge";

interface Props {
  sot: number;
  estado: number;
  descripcion: string;
  onChange: (campo: "estado" | "descripcion", valor: string | number) => void;
}

export function OrdenInfoCard({ sot, estado, descripcion, onChange }: Props) {
  return (
    <Card title="Información de la Orden">
  <div className="grid grid-cols-2 gap-4">
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      N° de Orden (SOT)
      <input
        value={sot}
        disabled
        className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
      />
    </label>

    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      Estado
      <select
        value={estado}
        onChange={(e) => onChange("estado", Number(e.target.value))}
        className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      >
        {Object.entries(ESTADOS_ORDEN).map(([valor, info]) => (
          <option key={valor} value={valor}>{info.label}</option>
        ))}
      </select>
    </label>
  </div>

  <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-slate-700">
    Observaciones
    <textarea
      value={descripcion}
      maxLength={500}
      rows={4}
      onChange={(e) => onChange("descripcion", e.target.value)}
      className="resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />
    <span className="self-end text-xs font-normal text-slate-400">{descripcion.length}/500</span>
  </label>
    </Card>
  );
}