import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            await login({ email, password: password });
            //Aqui puedes redirigir el usuario a la vista de Servicios o Dashboard
            // ¡Redirección exitosa!
            navigate('/servicios');
        } catch (err){
            // El error ya es maneado por el hook, no necesitamos mas por aca
        }
    };

    return (
        // Contenedor principal: Fondo gris extra claro para resaltar la tarjeta
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans text-gray-900">
    
          {/* Tarjeta Profesional: Blanca con borde sutil y sombra elegante */}
          <div className="max-w-md w-full p-8 sm:p-10 rounded-2xl bg-white border border-gray-100 shadow-xl">
    
            {/* Cabecera y Espacio para el Logo */}
            <div className="text-center mb-8">
              {/* Contenedor del Logo de la Empresa */}
              <div className="mx-auto h-16 mb-6 flex items-center justify-center">
                {/* REEMPLAZA EL SRC CON LA RUTA DE TU LOGO (ej. /assets/logo.png) */}
                <img 
                  src="/ck2-letra.png" 
                  alt="Logo de la Empresa" 
                  className="max-h-full object-contain"
                />
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Bienvenido al Portal</h2>
              <p className="mt-2 text-sm text-gray-500">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>
    
            {/* Formulario */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Mensaje de Error */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-md text-red-800 text-sm font-medium">
                  {error}
                </div>
              )}
    
              <div className="space-y-4">
                {/* Input Correo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="nombre@empresa.com"
                    className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
    
                {/* Input Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                    <a href="#" className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all sm:text-sm tracking-widest"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
    
              {/* Botón Principal (Rojo Corporativo) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-60 transition-colors shadow-md mt-6"
              >
                {isLoading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
              </button>
            </form>
    
            {/* Pie de página */}
            <p className="mt-8 text-center text-sm text-gray-500">
              ¿No tienes una cuenta?{' '}
              <a href="#" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
                Contacta a soporte
              </a>
            </p>
          </div>
        </div>
    );
};