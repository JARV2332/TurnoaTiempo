import type { PuntoRuta } from '@/lib/types'

export interface TurnoRuta {
  turno: number
  tipo: 'ida' | 'regreso'
  punto: PuntoRuta
}

export function construirTurnosRuta(puntos: PuntoRuta[]): TurnoRuta[] {
  const puntosIda = puntos
    .filter((p) => p.tipo === 'ida')
    .sort((a, b) => a.orden - b.orden)
  const puntosRegreso = puntos
    .filter((p) => p.tipo === 'regreso')
    .sort((a, b) => a.orden - b.orden)

  return [
    ...puntosIda.map((punto, idx) => ({ turno: idx + 1, tipo: 'ida' as const, punto })),
    ...puntosRegreso.map((punto, idx) => ({
      turno: puntosIda.length + idx + 1,
      tipo: 'regreso' as const,
      punto,
    })),
  ]
}
