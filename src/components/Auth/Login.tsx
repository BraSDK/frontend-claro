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

    return (
        <div className="flex min-h-screen bg-page font-sans text-ink">
            {/* Panel de marca (solo en pantallas grandes) */}
            <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink p-12 lg:flex">
                {/* adorno de fondo */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary shadow-menu">
                        <div className="h-3.5 w-3.5 rotate-45 rounded-sm bg-surface" />
                    </div>
                    <span className="text-2xl font-bold tracking-wide text-white">
                        Sistema<span className="text-primary">Claro</span>
                    </span>
                </div>

                <div className="relative max-w-md">
                    <h1 className="text-4xl font-bold leading-tight text-white">
                        Controla tus órdenes de trabajo en un solo lugar.
                    </h1>
                    <p className="mt-4 text-base text-muted">
                        Registra SOTs, sus servicios, adicionales y drops, y revisa la producción de cada técnico mes a mes.
                    </p>

                    <ul className="mt-10 space-y-4">
                        {[
                            { icono: <FileSpreadsheet size={18} />, texto: 'Carga masiva de SOTs desde Excel' },
                            { icono: <BarChart3 size={18} />, texto: 'Dashboard con totales por técnico y servicio' },
                            { icono: <ShieldCheck size={18} />, texto: 'Acceso por rol: admin, almacén y técnico' },
                        ].map((item) => (
                            <li key={item.texto} className="flex items-center gap-3 text-sm text-muted">
                                <span className="flex h-9 w-9 items-center justify-center rounded-control bg-white/5 text-primary ring-1 ring-white/10">
                                    {item.icono}
                                </span>
                                {item.texto}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs text-label">© {new Date().getFullYear()} SistemaClaro</p>
            </aside>

            {/* Formulario */}
            <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <img src="/ck2-letra.png" alt="Logo de la empresa" className="mb-8 h-12 object-contain" />
                        <h2 className="text-2xl font-bold tracking-tight text-ink">Iniciar sesión</h2>
                        <p className="mt-2 text-sm text-label">Ingresa tus credenciales para acceder al sistema.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-control border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block h-12 w-full rounded-control border border-line-input bg-surface pl-11 pr-4 text-sm text-ink placeholder-placeholder outline-none transition-all hover:border-line-input focus:border-info focus:ring-4 focus:ring-info/10"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    id="password"
                                    type={verPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block h-12 w-full rounded-control border border-line-input bg-surface pl-11 pr-12 text-sm text-ink placeholder-placeholder outline-none transition-all hover:border-line-input focus:border-info focus:ring-4 focus:ring-info/10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setVerPassword((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted transition-colors hover:text-ink"
                                    title={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-12 w-full items-center justify-center rounded-control bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-info/20 disabled:cursor-not-allowed disabled:opacity-60"
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
