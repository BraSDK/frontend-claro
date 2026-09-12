import { CategoriaType } from "../enums/Categoria";

export interface Servicio {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: CategoriaType;
} 