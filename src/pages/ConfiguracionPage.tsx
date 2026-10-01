import { useEffect, useState } from 'react';
import { User, ShieldCheck, Calendar, IdCard, Pencil, Save, X, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { usePerfil } from '../hooks/usePerfil';
import { actualizarMiPerfil, cambiarPassword } from '../services/auth.service';
import { iniciales, NOMBRES_ROL } from '../utils/formato';

const claseCampo = "h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-700 outline-none transition-all";
const claseLectura = `${claseCampo} bg-slate-50`;
const claseEditable = `${claseCampo} bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10`;

const formatoLargo = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

// Tarjeta con el mismo estilo que la imagen de referencia
const Seccion = ({ icono, titulo, acciones, children }: { icono: React.ReactNode; titulo: string; acciones?: React.ReactNode; children: React.ReactNode }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700">
                {icono}
                <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
            </div>
            {acciones}
        </header>
        {children}
    </section>
);

const Dato = ({ icono, etiqueta, valor }: { icono: React.ReactNode; etiqueta: string; valor: string }) => (
    <div className="flex items-start gap-3">
        <span className="mt-0.5 text-slate-500">{icono}</span>
        <div>
            <p className="text-xs text-slate-500">{etiqueta}</p>
            <p className="text-sm font-medium text-slate-800">{valor}</p>
        </div>
    </div>
);

export const ConfiguracionPage = () => {
    const { perfil, cargando, error, recargar } = usePerfil();

    // ===== Información personal =====
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({ nombreCompleto: '', documentoIdentidad: '', email: '' });
    const [guardando, setGuardando] = useState(false);
    const [mensajePerfil, setMensajePerfil] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

    useEffect(() => {
        if (perfil) setForm({ nombreCompleto: perfil.nombreCompleto, documentoIdentidad: perfil.documentoIdentidad, email: perfil.email });
    }, [perfil]);

    const cancelarEdicion = () => {
        if (perfil) setForm({ nombreCompleto: perfil.nombreCompleto, documentoIdentidad: perfil.documentoIdentidad, email: perfil.email });
        setEditando(false);
        setMensajePerfil(null);
    };

    const guardarPerfil = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!perfil) return;
        try {
            setGuardando(true);
            setMensajePerfil(null);
            await actualizarMiPerfil(perfil, form);
            await recargar();
            setEditando(false);
            setMensajePerfil({ tipo: 'ok', texto: 'Tus datos se actualizaron correctamente.' });
        } catch (err: any) {
            setMensajePerfil({ tipo: 'error', texto: err.response?.data?.error ?? 'No se pudieron guardar los cambios.' });
        } finally {
            setGuardando(false);
        }
    };

    // ===== Seguridad =====
    const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' });
    const [verPass, setVerPass] = useState(false);
    const [cambiandoPass, setCambiandoPass] = useState(false);
    const [mensajePass, setMensajePass] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

    const guardarPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pass.nueva.length < 8) return setMensajePass({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 8 caracteres.' });
        if (pass.nueva !== pass.confirmar) return setMensajePass({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden.' });
        try {
            setCambiandoPass(true);
            setMensajePass(null);
            await cambiarPassword({ passwordActual: pass.actual, passwordNueva: pass.nueva });
            setPass({ actual: '', nueva: '', confirmar: '' });
            setMensajePass({ tipo: 'ok', texto: 'Tu contraseña se cambió correctamente.' });
        } catch (err: any) {
            setMensajePass({ tipo: 'error', texto: err.response?.data?.error ?? 'No se pudo cambiar la contraseña.' });
        } finally {
            setCambiandoPass(false);
        }
    };

    const Mensaje = ({ m }: { m: { tipo: 'ok' | 'error'; texto: string } | null }) => !m ? null : (
        <p className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${m.tipo === 'ok' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {m.tipo === 'ok' && <CheckCircle2 size={16} />} {m.texto}
        </p>
    );

    const rol = perfil ? NOMBRES_ROL[perfil.rol] ?? perfil.rol : '-';

    return (
        <div className="flex flex-col gap-6">
            {/* Título */}
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Perfil</h1>
                    <p className="mt-1 text-sm text-slate-500">Gestiona tu información personal y mantén tu perfil actualizado.</p>
                </div>
            </div>

            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

            {/* Tarjeta principal */}
            <section className="flex flex-col gap-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white p-8 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-6">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-400 text-3xl font-semibold text-white shadow-lg shadow-indigo-400/30">
                        {cargando && !perfil ? '' : iniciales(perfil?.nombreCompleto || perfil?.email)}
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-slate-900">{perfil?.nombreCompleto || (cargando ? 'Cargando...' : 'Sin nombre')}</h2>
                        <p className="truncate text-sm text-slate-500">{perfil?.email}</p>
                        <span className="mt-2 inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            Activo
                        </span>
                    </div>
                </div>

                <div className="hidden h-24 w-px bg-indigo-100 md:block" />

                <div className="flex flex-col gap-4 md:w-64">
                    <Dato icono={<ShieldCheck size={18} />} etiqueta="Rol" valor={rol} />
                    <Dato icono={<IdCard size={18} />} etiqueta="Documento" valor={perfil?.documentoIdentidad || '-'} />
                    <Dato icono={<Calendar size={18} />} etiqueta="Miembro desde" valor={formatoLargo(perfil?.fechaRegistro)} />
                </div>
            </section>

            {/* Información personal */}
            <Seccion
                icono={<User size={20} />}
                titulo="Información personal"
                acciones={!editando && (
                    <button
                        type="button"
                        onClick={() => { setEditando(true); setMensajePerfil(null); }}
                        disabled={!perfil}
                        className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
                    >
                        <Pencil size={16} /> Editar
                    </button>
                )}
            >
                <form onSubmit={guardarPerfil}>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1.5 text-sm text-slate-600">
                            Nombre completo
                            <input
                                value={form.nombreCompleto}
                                readOnly={!editando}
                                required
                                onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
                                className={editando ? claseEditable : claseLectura}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm text-slate-600">
                            DNI
                            <input
                                value={form.documentoIdentidad}
                                readOnly={!editando}
                                inputMode="numeric"
                                onChange={(e) => setForm({ ...form, documentoIdentidad: e.target.value })}
                                className={editando ? claseEditable : claseLectura}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm text-slate-600">
                            Correo electrónico
                            <input
                                type="email"
                                value={form.email}
                                readOnly={!editando}
                                required
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className={editando ? claseEditable : claseLectura}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm text-slate-600">
                            Cargo
                            <input value={rol} readOnly className={`${claseLectura} cursor-not-allowed text-slate-500`} title="Solo un administrador puede cambiar el rol" />
                        </label>
                    </div>

                    {editando && (
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cancelarEdicion}
                                disabled={guardando}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                <X size={16} /> Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={guardando}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                            >
                                <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    )}
                    <Mensaje m={mensajePerfil} />
                </form>
            </Seccion>

            {/* Seguridad */}
            <Seccion
                icono={<KeyRound size={20} />}
                titulo="Seguridad"
                acciones={
                    <button
                        type="button"
                        onClick={() => setVerPass((v) => !v)}
                        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
                    >
                        {verPass ? <EyeOff size={16} /> : <Eye size={16} />} {verPass ? 'Ocultar' : 'Mostrar'}
                    </button>
                }
            >
                <form onSubmit={guardarPassword}>
                    <p className="mb-4 text-sm text-slate-500">Usa al menos 8 caracteres. Después de cambiarla, úsala en tu próximo inicio de sesión.</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {([
                            ['actual', 'Contraseña actual', 'current-password'],
                            ['nueva', 'Nueva contraseña', 'new-password'],
                            ['confirmar', 'Confirmar nueva contraseña', 'new-password'],
                        ] as const).map(([campo, etiqueta, auto]) => (
                            <label key={campo} className="flex flex-col gap-1.5 text-sm text-slate-600">
                                {etiqueta}
                                <input
                                    type={verPass ? 'text' : 'password'}
                                    autoComplete={auto}
                                    required
                                    value={pass[campo]}
                                    onChange={(e) => setPass({ ...pass, [campo]: e.target.value })}
                                    className={claseEditable}
                                />
                            </label>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={cambiandoPass}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                        >
                            <KeyRound size={16} /> {cambiandoPass ? 'Cambiando...' : 'Cambiar contraseña'}
                        </button>
                    </div>
                    <Mensaje m={mensajePass} />
                </form>
            </Seccion>
        </div>
    );
};
