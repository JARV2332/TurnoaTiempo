import type { Marcha } from '@/lib/types'

export function obtenerPiezaPorTurno(marchas: Marcha[], turno: number): Marcha | null {
  if (!marchas.length || turno < 1) return null

  const exacta = marchas.find((m) => m.turno === turno)
  if (exacta) return exacta

  // Fallback para datos antiguos sin turno explícito.
  const idx = (turno - 1) % marchas.length
  return marchas[idx] ?? null
}
