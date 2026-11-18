import React, { useMemo, useState } from 'react';
import type { EditorType } from '@revolist/react-datagrid';

// Una opción que se puede sugerir: `valor` es lo que se completa y guarda; `detalle` es una ayuda tenue (DNI, nombre del servicio)
export interface Sugerencia {
  valor: string;
  detalle?: string;
}

// Las opciones viajan en la definición de la columna: { editor: EDITOR_SUGERENCIA, sugerencias: [...] }
type ColumnaConSugerencias = { sugerencias?: Sugerencia[] };

const minus = (texto: string) => texto.toLocaleLowerCase('es');

// Editor de celda con autocompletado "fantasma", como Excel:
// mientras escribes aparece en gris el resto de la primera opción que empieza igual.
//   Enter       → guarda (con la sugerencia completa si la hay)
//   Tab / →     → acepta la sugerencia sin salir de la celda
//   Esc         → cancela
const SugerenciaEditor = ({ val, save, close, column }: EditorType) => {
  const opciones = (column?.column as ColumnaConSugerencias | undefined)?.sugerencias ?? [];
  const [texto, setTexto] = useState(String(val ?? ''));

  // la primera opción que empieza con lo escrito (sin importar mayúsculas)
  const sugerencia = useMemo(() => {
    const escrito = minus(texto);
    if (!escrito.trim()) return undefined;
    return opciones.find((o) => minus(o.valor).startsWith(escrito));
  }, [texto, opciones]);

  // lo que falta por escribir, en gris (se respeta lo que el usuario tecleó, el resto sale de la opción)
  const resto = sugerencia ? sugerencia.valor.slice(texto.length) : '';

  const aceptar = () => (sugerencia ? sugerencia.valor : texto.trim());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const alFinal = e.currentTarget.selectionStart === texto.length;

    if (e.key === 'Enter') {
      e.preventDefault();
      save(aceptar());
    } else if (e.key === 'Escape') {
      close();
    } else if ((e.key === 'Tab' || (e.key === 'ArrowRight' && alFinal)) && resto) {
      e.preventDefault();        // que la grilla no se mueva a la siguiente celda
      e.stopPropagation();
      setTexto(sugerencia!.valor);
    }
  };

  // el input y la capa de la sugerencia usan la misma letra y el mismo relleno para que el texto calce encima
  const estiloTexto: React.CSSProperties = { font: 'inherit', padding: '0 8px', letterSpacing: 'inherit' };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'white' }}>
      <div
        aria-hidden
        style={{ ...estiloTexto, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', whiteSpace: 'pre', overflow: 'hidden', pointerEvents: 'none' }}
      >
        <span style={{ visibility: 'hidden' }}>{texto}</span>
        <span style={{ color: '#9ca3af' }}>{resto}</span>
        {sugerencia?.detalle && (
          <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af' }}>{sugerencia.detalle}</span>
        )}
      </div>
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        spellCheck={false}
        autoComplete="off"
        style={{ ...estiloTexto, position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, outline: 'none', background: 'transparent' }}
      />
    </div>
  );
};

export default SugerenciaEditor;
