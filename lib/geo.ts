/** Distancia en metros entre dos coordenadas (Haversine). */
export function distanciaMetros(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Radio para considerar que el cortejo llegó al punto del turno.
 * El GPS de móvil tiene 5-15 m de precisión en calle; 15 m es un buen equilibrio
 * entre precisión y fiabilidad de detección.
 */
export const RADIO_TURNO_METROS = 5
