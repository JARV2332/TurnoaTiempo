import type { Marcha } from '@/lib/types'

export function obtenerPiezasPorTurno(marchas: Marcha[], turno: number): Marcha[] {
  if (!marchas.length || turno < 1) return []

  const exactas = marchas.filter((m) => m.turno === turno)
  if (exactas.length > 0) return exactas

  // Fallback para datos antiguos sin turno explícito.
  const idx = (turno - 1) % marchas.length
  return marchas[idx] ? [marchas[idx]] : []
}

export function obtenerPiezaPorTurno(marchas: Marcha[], turno: number): Marcha | null {
  return obtenerPiezasPorTurno(marchas, turno)[0] ?? null
}
