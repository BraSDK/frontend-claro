import React from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { Search, X } from "lucide-react";

export const FilterBar = ({ onBuscar, onLimpiar, hayFiltros, children }: { 
    onBuscar: () => void; onLimpiar: () => void; hayFiltros: boolean; children: ReactNode;
}) => (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {children}
        </div>
        <div className="flex shrink-0 items-center gap-2">
            <button onClick={onLimpiar} disabled={!hayFiltros} className="inline-flex h-[36px] items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <X size={16} /> Limpiar
            </button>
            <button onClick={onBuscar} className="inline-flex h-[36px] items-center gap-1 rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800">
                <Search size={16} /> Buscar
            </button>
        </div>
    </div>
);

export const Campo = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>
        {children}
    </div>
);

export const Entrada = (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input 
        {...props} 
        className={`h-[36px] w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${props.className || ''}`}
    />
);

export const Selector = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
    <select 
        {...props} 
        className={`h-[36px] w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${props.className || ''}`}
    >
        {props.children}
    </select>
);

export const RangoFechas = ({ desde, hasta, onDesde, onHasta }: { 
    desde: string; hasta: string; onDesde: (v: string) => void; onHasta: (v: string) => void;
}) => (
    <div className="flex items-center gap-2">
        <Entrada type="date" value={desde} onChange={(e) => onDesde(e.target.value)} className="w-full" />
        <span className="text-gray-400">-</span>
        <Entrada type="date" value={hasta} onChange={(e) => onHasta(e.target.value)} className="w-full" />
    </div>
);