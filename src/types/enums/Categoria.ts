export const CategoriaType = {
  ELECTRONICA : 0,
  ROPA : 1,
  HOGAR : 2,
  ALIMENTOS : 3
} as const

export type CategoriaType = typeof CategoriaType[keyof typeof CategoriaType];