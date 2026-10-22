import { defineTheme } from '@revolist/revogrid';

export const temaClaro = defineTheme({
    name: 'tema-claro',
    extends: 'default',
    tokens: {
      headerBg: '#ff00ff',      // ✅ Fondo de la cabecera
      headerColor: '#ffffff',   // ✅ Color del texto de la cabecera
      background: '#ffffff',    // ✅ Fondo general (antes usabas --revo-bg)
      // ... otros tokens
    },
  });