export type ProgramaPieza = {
  nombre: string
  autor: string | null
}

export type ProgramaTurnoImport = {
  label: string
  direccion: string
  tipo: 'ida' | 'regreso'
  lat: number | null
  lng: number | null
  piezas: ProgramaPieza[]
}

export type ProgramaImportPayload = {
  nombre?: string
  turnos: ProgramaTurnoImport[]
}

function parseTipo(raw: string | undefined, fallback: 'ida' | 'regreso'): 'ida' | 'regreso' {
  const v = (raw || '').trim().toLowerCase()
  if (v === 'regreso' || v === 'vuelta' || v === 'return') return 'regreso'
  if (v === 'ida' || v === 'idaida') return 'ida'
  return fallback
}

function parseNum(raw: string | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(raw.trim().replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Formato esperado (tab o |):
 * Turno | Son/Alabado | Autor | Dirección | Lat | Lng | Tipo(ida/regreso)
 *
 * Si el turno queda vacío, la pieza se suma al turno anterior.
 * Lat/Lng/Tipo/Dirección se heredan del turno si vienen vacíos en filas siguientes.
 */
export function parseProgramaBulkText(text: string): ProgramaImportPayload {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)

  const turnos: ProgramaTurnoImport[] = []
  let current: ProgramaTurnoImport | null = null
  let defaultTipo: 'ida' | 'regreso' = 'ida'

  for (const line of lines) {
    // Saltar encabezados
    const lower = line.toLowerCase()
    if (
      lower.startsWith('turno\t') ||
      lower.startsWith('turno|') ||
      lower.startsWith('turno,') ||
      (lower.includes('melod') && lower.includes('autor'))
    ) {
      continue
    }

    const parts = line.includes('\t')
      ? line.split('\t')
      : line.includes('|')
        ? line.split('|')
        : line.split(',')

    const turnoRaw = (parts[0] ?? '').trim()
    const nombre = (parts[1] ?? '').trim()
    const autor = (parts[2] ?? '').trim() || null
    const direccion = (parts[3] ?? '').trim()
    const lat = parseNum(parts[4])
    const lng = parseNum(parts[5])
    const tipoRaw = (parts[6] ?? '').trim()

    if (!nombre && !direccion && !turnoRaw) continue

    const startsNewTurno = Boolean(turnoRaw)

    if (startsNewTurno || !current) {
      const tipo = parseTipo(tipoRaw, defaultTipo)
      defaultTipo = tipo
      current = {
        label: turnoRaw || `Turno ${turnos.length + 1}`,
        direccion: direccion || turnoRaw || `Turno ${turnos.length + 1}`,
        tipo,
        lat,
        lng,
        piezas: [],
      }
      turnos.push(current)
    } else {
      if (direccion) current.direccion = direccion
      if (lat != null) current.lat = lat
      if (lng != null) current.lng = lng
      if (tipoRaw) {
        current.tipo = parseTipo(tipoRaw, current.tipo)
        defaultTipo = current.tipo
      }
    }

    if (nombre) {
      current!.piezas.push({ nombre, autor })
    }
  }

  // Si hay turnos sin coordenadas, se permiten (el mapa podrá ajustarlas después)
  return { turnos }
}

export function resumenPrograma(payload: ProgramaImportPayload) {
  const piezas = payload.turnos.reduce((acc, t) => acc + t.piezas.length, 0)
  const conCoords = payload.turnos.filter((t) => t.lat != null && t.lng != null).length
  const ida = payload.turnos.filter((t) => t.tipo === 'ida').length
  const regreso = payload.turnos.filter((t) => t.tipo === 'regreso').length
  return {
    turnos: payload.turnos.length,
    piezas,
    conCoords,
    ida,
    regreso,
  }
}

export function programaToTSV(payload: ProgramaImportPayload): string {
  const lines = ['Turno\tSon/Alabado\tAutor\tDirección\tLat\tLng\tTipo']
  for (const turno of payload.turnos) {
    if (turno.piezas.length === 0) {
      lines.push(
        [
          turno.label,
          '',
          '',
          turno.direccion,
          turno.lat ?? '',
          turno.lng ?? '',
          turno.tipo,
        ].join('\t'),
      )
      continue
    }
    turno.piezas.forEach((pieza, idx) => {
      lines.push(
        [
          idx === 0 ? turno.label : '',
          pieza.nombre,
          pieza.autor ?? '',
          idx === 0 ? turno.direccion : '',
          idx === 0 ? (turno.lat ?? '') : '',
          idx === 0 ? (turno.lng ?? '') : '',
          idx === 0 ? turno.tipo : '',
        ].join('\t'),
      )
    })
  }
  return lines.join('\n')
}
