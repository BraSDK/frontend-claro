import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, BarChart3, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verPassword, setVerPassword] = useState(false);
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch {
            // el hook ya guarda el mensaje de error
        }
    };

    const claseInput =
        'block h-12 w-full rounded-control border border-line bg-surface text-sm text-ink outline-none transition hover:border-line-fixed focus:border-transparent focus:ring-2 focus:ring-primary';

    return (
        <div className="flex min-h-screen bg-page font-sans text-ink">
            {/* Panel de marca (solo en pantallas grandes): lavado lavanda, sin sombras */}
            <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-lavanda p-12 lg:flex">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-brand">
                        <div className="h-3.5 w-3.5 rotate-45 rounded-[3px] bg-surface" />
                    </div>
                    <span className="text-2xl font-bold text-ink">Sistema Claro</span>
                </div>

                <div className="max-w-md">
                    <h1 className="text-[44px] font-bold leading-[1.11] text-ink">
                        Controla tus órdenes de trabajo <span className="text-brand">en un solo lugar</span>.
                    </h1>
                    <p className="mt-5 text-lg text-label">
                        Registra SOTs, sus servicios, adicionales y drops, y revisa la producción de cada técnico mes a mes.
                    </p>

                    <ul className="mt-10 space-y-4">
                        {[
                            { icono: <FileSpreadsheet size={18} strokeWidth={1.75} />, texto: 'Carga masiva de SOTs desde Excel' },
                            { icono: <BarChart3 size={18} strokeWidth={1.75} />, texto: 'Dashboard con totales por técnico y servicio' },
                            { icono: <ShieldCheck size={18} strokeWidth={1.75} />, texto: 'Acceso por rol: admin, almacén y técnico' },
                        ].map((item) => (
                            <li key={item.texto} className="flex items-center gap-3 text-base text-ink">
                                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-surface text-primary">
                                    {item.icono}
                                </span>
                                {item.texto}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-sm text-label">© {new Date().getFullYear()} Sistema Claro</p>
            </aside>

            {/* Formulario: tarjeta blanca sobre el lienzo lavanda */}
            <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
                <div className="w-full max-w-md rounded-card bg-surface p-8 sm:p-10">
                    <div className="mb-8">
                        <img src="/ck2-letra.png" alt="Logo de la empresa" className="mb-8 h-12 object-contain" />
                        <h2 className="text-2xl font-bold text-ink">Iniciar sesión</h2>
                        <p className="mt-2 text-sm text-label">Ingresa tus credenciales para acceder al sistema.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-control border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-label">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail size={18} strokeWidth={1.75} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-label" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`${claseInput} pl-11 pr-4`}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-label">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock size={18} strokeWidth={1.75} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-label" />
                                <input
                                    id="password"
                                    type={verPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`${claseInput} pl-11 pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setVerPassword((v) => !v)}
                                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-pill text-label transition-colors hover:bg-hover hover:text-ink"
                                    title={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {verPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-12 w-full items-center justify-center rounded-pill bg-brand text-base font-semibold text-on-primary transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? 'Ingresando...' : 'Ingresar al sistema'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-label">
                        ¿Problemas para ingresar? Contacta al administrador del sistema.
                    </p>
                </div>
            </main>
        </div>
    );
};
