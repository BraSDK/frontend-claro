import axios from 'axios';

// 1. Creamos la instancia con la URL base de tu entorno
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones: El guardia de seguridad
api.interceptors.request.use(
  (config) => {
    // Busca el token en el almacenamiento local del navegador
    const token = localStorage.getItem('jwt_token');
    
    // Si el token existe, se lo inyecta a la cabecera de la petición
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opcional: Interceptor de Respuestas (Para atrapar el error 401 si el token expira)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Aquí podrías forzar el cierre de sesión o redirigir al Login
      console.error("Token expirado o inválido");
      // localStorage.removeItem('jwt_token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);