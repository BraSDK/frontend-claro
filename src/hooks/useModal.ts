import { useState } from 'react';

// La <T> significa "Tipo Genérico". Permite que este hook maneje Servicios, Usuarios, etc.
export const useModal = <T = unknown>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<T | null>(null);

  const openForCreate = () => {
    setItemToEdit(null);
    setIsOpen(true);
  };

  const openForEdit = (item: T) => {
    setItemToEdit(item);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setItemToEdit(null); // Limpiamos la memoria al cerrar
  };

  return {
    isOpen,
    itemToEdit,
    openForCreate,
    openForEdit,
    closeModal,
  };
};