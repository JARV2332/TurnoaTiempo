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
export const RADIO_TURNO_METROS = 20

export type LatLng = { lat: number; lng: number }

/**
 * Une dos puntos en forma de L para no cortar manzanas en diagonal.
 * Elige primero el eje con mayor desplazamiento (más natural en cuadrícula).
 */
export function segmentoManhattan(
  a: LatLng,
  b: LatLng,
  preferLngFirst?: boolean,
): [number, number][] {
  const sameLat = Math.abs(a.lat - b.lat) < 1e-6
  const sameLng = Math.abs(a.lng - b.lng) < 1e-6
  if (sameLat || sameLng) {
    return [
      [a.lng, a.lat],
      [b.lng, b.lat],
    ]
  }
  const lngFirst =
    preferLngFirst ?? Math.abs(a.lng - b.lng) >= Math.abs(a.lat - b.lat)
  if (lngFirst) {
    return [
      [a.lng, a.lat],
      [b.lng, a.lat],
      [b.lng, b.lat],
    ]
  }
  return [
    [a.lng, a.lat],
    [a.lng, b.lat],
    [b.lng, b.lat],
  ]
}

/** Polyline Manhattan entre una secuencia de puntos (lng,lat). */
export function lineaManhattan(puntos: LatLng[]): [number, number][] {
  if (puntos.length === 0) return []
  if (puntos.length === 1) return [[puntos[0].lng, puntos[0].lat]]

  const out: [number, number][] = []
  for (let i = 0; i < puntos.length - 1; i++) {
    const seg = segmentoManhattan(puntos[i], puntos[i + 1], true)
    if (i === 0) out.push(seg[0])
    for (let j = 1; j < seg.length; j++) out.push(seg[j])
  }
  return out
}

/**
 * Si dos marcadores están muy cerca, desplaza el segundo perpendicularmente
 * unos metros para que se lean en el mapa.
 */
export function separarMarcadoresCercanos(
  puntos: LatLng[],
  minMetros = 28,
): LatLng[] {
  if (puntos.length === 0) return []
  const out: LatLng[] = [{ ...puntos[0] }]
  for (let i = 1; i < puntos.length; i++) {
    const prev = out[i - 1]
    const cur = puntos[i]
    const d = distanciaMetros(prev.lat, prev.lng, cur.lat, cur.lng)
    if (d >= minMetros) {
      out.push({ ...cur })
      continue
    }
    // Desplazamiento perpendicular ~minMetros (aprox en grados)
    const dx = cur.lng - prev.lng
    const dy = cur.lat - prev.lat
    const len = Math.hypot(dx, dy) || 1
    // perpendicular
    const px = -dy / len
    const py = dx / len
    const metrosADegLat = minMetros / 111320
    const metrosADegLng = minMetros / (111320 * Math.cos((cur.lat * Math.PI) / 180))
    const side = i % 2 === 0 ? 1 : -1
    out.push({
      lat: cur.lat + py * metrosADegLat * side,
      lng: cur.lng + px * metrosADegLng * side,
    })
  }
  return out
}
