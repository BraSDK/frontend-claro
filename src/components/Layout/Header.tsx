import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut } from 'lucide-react';

export const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    return(
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
      
        {/* Buscador Global (Visual) */}
        <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-full border border-gray-200 w-96 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-400 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar en el sistema..." 
            className="bg-transparent border-none focus:outline-none ml-3 w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        
        {/* Perfil y Acciones */}
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-red-600 transition-colors relative">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
  
          <div className="h-8 w-px bg-gray-200"></div> {/* Divisor */}
  
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700 leading-none">Admin Brayan</p>
              <p className="text-xs text-gray-500 mt-1">Super Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold border border-red-200">
              AB
            </div>
          </div>
  
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
    );
};