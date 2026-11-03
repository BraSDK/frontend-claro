import { useState } from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Download, type LucideIcon } from 'lucide-react';
import { descargarReporte } from '../services/reporte.service';
import { NOMBRES_MES } from '../utils/formato';

// Cada reporte es un botón. Para agregar otro, solo suma un objeto aquí (y su ruta en el back)
const REPORTES: { titulo: string; descripcion: string; icono: LucideIcon; color: string; ruta: string; archivo: string }[] = [
    {
        titulo: 'Pagos validados',
        descripcion: 'SOT auditadas como "Pagó" en el mes',
        icono: FileSpreadsheet,
        color: 'bg-success-soft text-success',
        ruta: '/Reporte/pagos-validados',
        archivo: 'pagos-validados',
    },
];

export const ReportesPage = () => {
    const hoy = new Date();
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [descargando, setDescargando] = useState<string | null>(null);   // ruta del reporte que se está bajando
    const [error, setError] = useState<string | null>(null);

    const moverMes = (delta: number) => {
        const fecha = new Date(anio, mes - 1 + delta, 1);
        setAnio(fecha.getFullYear());
        setMes(fecha.getMonth() + 1);
    };
    const esMesActual = anio === hoy.getFullYear() && mes === hoy.getMonth() + 1;

    const descargar = async (r: typeof REPORTES[number]) => {
        setDescargando(r.ruta);
        setError(null);
        try {
            const mm = String(mes).padStart(2, '0');
            await descargarReporte(r.ruta, anio, mes, `${r.archivo}-${anio}-${mm}.xlsx`);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setDescargando(null);
        }
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            {/* título + selector de mes */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Reportes</h1>
                    <p className="mt-1 text-sm text-label">Elige el mes y descarga el reporte en Excel.</p>
                </div>
                <div className="flex items-center gap-1 rounded-card border border-line bg-surface p-1">
                    <button type="button" onClick={() => moverMes(-1)} className="rounded-control p-2 text-label hover:bg-page" title="Mes anterior">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="min-w-36 text-center text-sm font-semibold text-ink">{NOMBRES_MES[mes - 1]} {anio}</span>
                    <button
                        type="button"
                        onClick={() => moverMes(1)}
                        disabled={esMesActual}
                        className="rounded-control p-2 text-label hover:bg-page disabled:cursor-not-allowed disabled:opacity-30"
                        title="Mes siguiente"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {error && <div className="rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">{error}</div>}

            {/* botones grandes, como en Inicio */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {REPORTES.map((r) => {
                    const Icono = r.icono;
                    const bajando = descargando === r.ruta;
                    return (
                        <button
                            key={r.ruta}
                            type="button"
                            disabled={bajando}
                            onClick={() => descargar(r)}
                            className="flex h-36 items-center gap-5 rounded-3xl border border-line-soft bg-surface px-7 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-menu disabled:cursor-wait disabled:opacity-60"
                        >
                            <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${r.color}`}>
                                <Icono size={30} strokeWidth={1.75} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-lg font-semibold text-ink">{r.titulo}</span>
                                <span className="mt-1 block text-sm text-muted">{bajando ? 'Generando Excel…' : r.descripcion}</span>
                            </span>
                            <Download size={18} className="shrink-0 text-muted" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
