/**
 * Paleta de colores para diferenciar visualmente a los integrantes de un equipo.
 * Se asignan por índice (módulo sobre la longitud del array) para garantizar
 * que siempre haya un color disponible sin importar el tamaño del equipo.
 */
export const PALETA_COLORES_EQUIPO: readonly string[] = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
] as const;

/**
 * Retorna el color correspondiente a un índice dado,
 * rotando sobre la paleta si el índice supera su longitud.
 */
export function obtenerColorPorIndice(indice: number): string {
  return PALETA_COLORES_EQUIPO[indice % PALETA_COLORES_EQUIPO.length];
}
