import { useEffect, useState } from 'react';
import { User, ShieldCheck, Calendar, IdCard, Pencil, Save, X, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { usePerfil } from '../hooks/usePerfil';
import { actualizarMiPerfil, cambiarPassword } from '../services/auth.service';
import { iniciales, NOMBRES_ROL } from '../utils/formato';

const claseCampo = "h-11 w-full rounded-control border border-line px-3.5 text-sm text-ink outline-none transition-all";
const claseLectura = `${claseCampo} bg-page`;
const claseEditable = `${claseCampo} bg-surface hover:border-line focus:border-info focus:ring-4 focus:ring-info/10`;

const formatoLargo = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

// Tarjeta con el mismo estilo que la imagen de referencia
const Seccion = ({ icono, titulo, acciones, children }: { icono: React.ReactNode; titulo: string; acciones?: React.ReactNode; children: React.ReactNode }) => (
    <section className="rounded-card border border-line bg-surface p-6 ">
        <header className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-ink">
                {icono}
                <h2 className="text-base font-semibold text-ink">{titulo}</h2>
            </div>
            {acciones}
        </header>
        {children}
    </section>
);

const Dato = ({ icono, etiqueta, valor }: { icono: React.ReactNode; etiqueta: string; valor: string }) => (
    <div className="flex items-start gap-3">
        <span className="mt-0.5 text-label">{icono}</span>
        <div>
            <p className="text-xs text-label">{etiqueta}</p>
            <p className="text-sm font-medium text-ink">{valor}</p>
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
        <p className={`mt-4 flex items-center gap-2 rounded-control border px-4 py-2.5 text-sm ${m.tipo === 'ok' ? 'border-success/30 bg-success-soft text-success' : 'border-danger/30 bg-danger-soft text-danger'}`}>
            {m.tipo === 'ok' && <CheckCircle2 size={16} />} {m.texto}
        </p>
    );

    const rol = perfil ? NOMBRES_ROL[perfil.rol] ?? perfil.rol : '-';

    return (
        <div className="flex flex-col gap-6">
            {/* Título */}
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info-soft text-info">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-ink">Perfil</h1>
                    <p className="mt-1 text-sm text-label">Gestiona tu información personal y mantén tu perfil actualizado.</p>
                </div>
            </div>

            {error && <p className="rounded-control border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">{error}</p>}

            {/* Tarjeta principal */}
            <section className="flex flex-col gap-6 rounded-card border border-info/40 bg-gradient-to-br from-primary/80 via-primary/50 to-white p-8 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-6">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-avatar text-3xl font-semibold text-avatar-ink">
                        {cargando && !perfil ? '' : iniciales(perfil?.nombreCompleto || perfil?.email)}
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-ink">{perfil?.nombreCompleto || (cargando ? 'Cargando...' : 'Sin nombre')}</h2>
                        <p className="truncate text-sm text-label">{perfil?.email}</p>
                        <span className="mt-2 inline-flex items-center rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
                            Activo
                        </span>
                    </div>
                </div>

                <div className="hidden h-24 w-px bg-info-soft md:block" />

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
                        className="flex items-center gap-2 rounded-control border border-info/40 px-4 py-2 text-sm font-medium text-info transition-colors hover:bg-info-soft disabled:opacity-50"
                    >
                        <Pencil size={16} /> Editar
                    </button>
                )}
            >
                <form onSubmit={guardarPerfil}>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1.5 text-sm text-label">
                            Nombre completo
                            <input
                                value={form.nombreCompleto}
                                readOnly={!editando}
                                required
                                onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
                                className={editando ? claseEditable : claseLectura}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm text-label">
                            DNI
                            <input
                                value={form.documentoIdentidad}
                                readOnly={!editando}
                                inputMode="numeric"
                                onChange={(e) => setForm({ ...form, documentoIdentidad: e.target.value })}
                                className={editando ? claseEditable : claseLectura}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm text-label">
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
                        <label className="flex flex-col gap-1.5 text-sm text-label">
                            Cargo
                            <input value={rol} readOnly className={`${claseLectura} cursor-not-allowed text-label`} title="Solo un administrador puede cambiar el rol" />
                        </label>
                    </div>

                    {editando && (
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cancelarEdicion}
                                disabled={guardando}
                                className="flex items-center gap-2 rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-medium text-label transition-colors hover:bg-page"
                            >
                                <X size={16} /> Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={guardando}
                                className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-control bg-primary px-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="flex items-center gap-1.5 text-sm text-label hover:text-ink"
                    >
                        {verPass ? <EyeOff size={16} /> : <Eye size={16} />} {verPass ? 'Ocultar' : 'Mostrar'}
                    </button>
                }
            >
                <form onSubmit={guardarPassword}>
                    <p className="mb-4 text-sm text-label">Usa al menos 8 caracteres. Después de cambiarla, úsala en tu próximo inicio de sesión.</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {([
                            ['actual', 'Contraseña actual', 'current-password'],
                            ['nueva', 'Nueva contraseña', 'new-password'],
                            ['confirmar', 'Confirmar nueva contraseña', 'new-password'],
                        ] as const).map(([campo, etiqueta, auto]) => (
                            <label key={campo} className="flex flex-col gap-1.5 text-sm text-label">
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
                            className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-control border border-line-input bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
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
