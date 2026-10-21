import React from 'react';
import type { ListParamsLiquidacionesDto } from '../../types/liquidacion.types';

interface FiltersProps {
  params: ListParamsLiquidacionesDto;
  setParams: React.Dispatch<React.SetStateAction<ListParamsLiquidacionesDto>>;
}

export const LiquidacionFilters: React.FC<FiltersProps> = ({ params, setParams }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClear = () => {
    setParams({ pagina: 1, canPagina: 15 });
  };

  return (
    <div className="filters-grid">
      <div className="form-group">
        <label>Buscar SOT</label>
        <input 
          name="buscar" 
          value={params.buscar || ''} 
          onChange={handleChange} 
          placeholder="Ej. 123456" 
          className="form-control"
        />
      </div>
      
      <div className="form-group">
        <label>Estado</label>
        <select name="estado" value={params.estado || ''} onChange={handleChange} className="form-control">
          <option value="">Todos</option>
          <option value="1">Ingresada</option>
          <option value="2">Validada</option>
        </select>
      </div>

      <div className="form-group">
        <label>Desde</label>
        <input type="date" name="desde" value={params.desde || ''} onChange={handleChange} className="form-control" />
      </div>

      <div className="form-group">
        <label>Hasta</label>
        <input type="date" name="hasta" value={params.hasta || ''} onChange={handleChange} className="form-control" />
      </div>

      <div className="filters-actions">
        <button className="btn-secondary" onClick={handleClear}>Limpiar</button>
      </div>
    </div>
  );
};