import React from 'react';

interface Props {
  children?: React.ReactNode;
}

export const FondoClaro: React.FC<Props> = ({ children }) => {
    return (
        // Agregamos min-h-screen o min-h-[calc(100vh-XXpx)] dependiendo de tu Navbar, y w-full flex flex-col
        <div className="relative min-h-[calc(100vh-64px)] w-full flex flex-col overflow-hidden bg-page px-4 py-8 sm:px-8">
          
          {/* Capa de fondo decorativa */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-red-600/10 blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-red-500/5 blur-[120px]" />
    
            <svg className="absolute -right-16 -top-12 h-96 w-96 text-red-600/10" fill="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="2" />
              <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 50,200 Q 200,50 350,200" stroke="currentColor" strokeWidth="2" />
            </svg>
    
            <svg className="absolute -bottom-10 left-0 w-full text-red-600/[0.03]" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            </svg>
          </div>
    
          {/* Contenido principal flex-1 para que empuje el contenido si es necesario */}
          <div className="relative z-10 flex-1 w-full">
            {children}
          </div>
        </div>
      );
    };