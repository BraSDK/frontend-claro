export const CategoriaType = {
  INGRESADO : 0,
  PROCESADO : 1,
  LIQUIDADO : 2
} as const

export type CategoriaType = typeof CategoriaType[keyof typeof CategoriaType];