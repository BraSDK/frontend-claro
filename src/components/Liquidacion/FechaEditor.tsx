import React, { useState, useEffect } from 'react';
import type { EditorType } from '@revolist/react-datagrid';

const FechaEditor = ({ val, save, close }: EditorType) => {
  const [texto, setTexto] = useState(String(val || ''));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let nuevo = e.target.value.replace(/\D/g, ''); // Solo números
    
    // Insertar "/" automáticamente después de 2 y 4 dígitos
    if (nuevo.length >= 2) nuevo = nuevo.slice(0, 2) + '/' + nuevo.slice(2);
    if (nuevo.length >= 5) nuevo = nuevo.slice(0, 5) + '/' + nuevo.slice(5);
    
    setTexto(nuevo.slice(0, 10)); // Limitar a DD/MM/AAAA
  };

  // Guardar al presionar Enter (opcional, RevoGrid lo maneja)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save(texto);
    if (e.key === 'Escape') close();
  };

  return (
    <input
      type="text"
      value={texto}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="DD/MM/AAAA"
      autoFocus
    />
  );
};

export default FechaEditor;