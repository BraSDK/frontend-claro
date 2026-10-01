import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, X } from "lucide-react";
import { importarExcelOrdenes } from "../../services/Ordenes/OrdenesTrabajo.service";
import type { ImportarExcelResponse } from "../../types/Ordenes";

interface ImportarExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportado: () => void;   // para refrescar la lista cuando termina la carga
}

export const ImportarExcelModal = ({ isOpen, onClose, onImportado }: ImportarExcelModalProps) => {
    const [archivo, setArchivo] = useState<File | null>(null);
    const [subiendo, setSubiendo] = useState(false);
    const [resultado, setResultado] = useState<ImportarExcelResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const cerrar = () => {
        if (subiendo) return;   // no cerrar a mitad de la carga
        setArchivo(null);
        setResultado(null);
        setError(null);
        onClose();
    };

    const seleccionar = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArchivo(e.target.files?.[0] ?? null);
        setResultado(null);
        setError(null);
        e.target.value = "";   // permite volver a elegir el mismo archivo
    };

    const importar = async () => {
        if (!archivo) return;
        try {
            setSubiendo(true);
            setError(null);
            const data = await importarExcelOrdenes(archivo);
            setResultado(data);
            onImportado();
        } catch (err: any) {
            if (err.response?.status === 403) setError("No tienes permisos para importar órdenes");
            else setError(err.response?.data?.error ?? "No se pudo importar el Excel");
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={cerrar}>
            <div
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <FileSpreadsheet size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Importar SOTs desde Excel</h2>
                            <p className="text-sm text-slate-500">Se crean las SOT con sus servicios, adicionales y drops.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={cerrar}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        title="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40">
                        <Upload size={28} className="text-slate-400" />
                        {archivo ? (
                            <span className="text-sm font-medium text-slate-700">{archivo.name}</span>
                        ) : (
                            <span className="text-sm font-medium text-slate-700">Haz click para elegir el Excel</span>
                        )}
                        <span className="text-xs text-slate-400">
                            .xlsx con columnas FECHA, APELLIDOS, SOT, TIPO DE SERVICIO, COSTO, ADICIONAL, 150, 220, 300
                        </span>
                        <input type="file" accept=".xlsx" className="hidden" onChange={seleccionar} disabled={subiendo} />
                    </label>

                    <p className="text-xs text-slate-500">
                        Si una SOT ya existe, se <span className="font-medium text-slate-700">reemplazan sus servicios</span> por los del Excel.
                        Los servicios que no existan se crean automáticamente. El archivo no se guarda.
                    </p>

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
                    )}

                    {resultado && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <Resumen titulo="SOTs creadas" valor={resultado.ordenesCreadas} />
                                <Resumen titulo="SOTs actualizadas" valor={resultado.ordenesActualizadas} />
                                <Resumen titulo="Filas con error" valor={resultado.errores.length} alerta={resultado.errores.length > 0} />
                            </div>

                            {resultado.errores.length === 0 ? (
                                <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
                                    <CheckCircle2 size={16} /> Todas las filas se importaron correctamente.
                                </p>
                            ) : (
                                <div className="overflow-hidden rounded-lg border border-amber-200">
                                    <p className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
                                        <AlertTriangle size={16} /> Estas filas no se importaron:
                                    </p>
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Fila</th>
                                                <th className="px-4 py-2 font-medium">SOT</th>
                                                <th className="px-4 py-2 font-medium">Motivo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {resultado.errores.map((e) => (
                                                <tr key={e.fila}>
                                                    <td className="px-4 py-2">{e.fila}</td>
                                                    <td className="px-4 py-2">{e.sot ?? "-"}</td>
                                                    <td className="px-4 py-2">{e.mensaje}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {resultado.serviciosCreados.length > 0 && (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                                    <p className="font-medium text-slate-700">
                                        Servicios nuevos creados ({resultado.serviciosCreados.length}):
                                    </p>
                                    <ul className="mt-1 list-inside list-disc text-slate-600">
                                        {resultado.serviciosCreados.map((s) => <li key={s}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pie */}
                <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                    <button
                        type="button"
                        onClick={cerrar}
                        disabled={subiendo}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                    >
                        {resultado ? "Listo" : "Cancelar"}
                    </button>
                    {!resultado && (
                        <button
                            type="button"
                            onClick={importar}
                            disabled={!archivo || subiendo}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Upload size={16} />
                            {subiendo ? "Importando..." : "Importar"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Resumen = ({ titulo, valor, alerta = false }: { titulo: string; valor: number; alerta?: boolean }) => (
    <div className={`rounded-lg border px-4 py-3 ${alerta ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
        <p className="text-xs text-slate-500">{titulo}</p>
        <p className={`text-2xl font-semibold ${alerta ? "text-amber-700" : "text-slate-900"}`}>{valor}</p>
    </div>
);
