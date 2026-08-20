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
 * Formatos aceptados (tab, | o ,):
 * 1) Completo: Turno | Son/Alabado | Autor | Dirección | Lat | Lng | Tipo
 * 2) Solo ruta: Turno | Dirección  (o Turno | Dirección | Lat | Lng)
 *
 * Si el turno queda vacío, la pieza/dirección se suma al turno anterior.
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
    const lower = line.toLowerCase()
    if (
      lower.startsWith('turno\t') ||
      lower.startsWith('turno|') ||
      lower.startsWith('turno,') ||
      (lower.includes('melod') && lower.includes('autor')) ||
      (lower.startsWith('turno') && lower.includes('dirección'))
    ) {
      continue
    }

    const parts = line.includes('\t')
      ? line.split('\t')
      : line.includes('|')
        ? line.split('|')
        : line.split(',')

    const colCount = parts.length
    const turnoRaw = (parts[0] ?? '').trim()

    // Formato corto: Turno | Dirección [| Lat | Lng [| Tipo]]
    const looksLikeRouteOnly =
      colCount <= 5 &&
      !looksLikeFullProgramaHeader(parts) &&
      (colCount === 2 ||
        (colCount >= 3 && parseNum(parts[2]) != null) ||
        (colCount === 3 && parseNum(parts[2]) == null && !(parts[2] ?? '').trim()))

    let nombre = ''
    let autor: string | null = null
    let direccion = ''
    let lat: number | null = null
    let lng: number | null = null
    let tipoRaw = ''

    if (looksLikeRouteOnly && colCount <= 5) {
      // Si col2 parece número (lat), no es este caso
      const col2 = (parts[1] ?? '').trim()
      const col3 = (parts[2] ?? '').trim()
      const col4 = (parts[3] ?? '').trim()
      const col5 = (parts[4] ?? '').trim()

      if (parseNum(col2) != null && parseNum(col3) != null) {
        // Turno | Lat | Lng
        direccion = turnoRaw || `Turno ${turnos.length + 1}`
        lat = parseNum(col2)
        lng = parseNum(col3)
        tipoRaw = col4
      } else {
        direccion = col2
        lat = parseNum(col3)
        lng = parseNum(col4)
        tipoRaw = col5
        nombre = ''
      }
    } else {
      nombre = (parts[1] ?? '').trim()
      autor = (parts[2] ?? '').trim() || null
      direccion = (parts[3] ?? '').trim()
      lat = parseNum(parts[4])
      lng = parseNum(parts[5])
      tipoRaw = (parts[6] ?? '').trim()
    }

    if (!nombre && !direccion && !turnoRaw) continue

    // En formato solo-ruta, filas sin número de turno con texto = otra pieza del mismo tramo
    const startsNewTurno = Boolean(turnoRaw)

    if (startsNewTurno || !current) {
      const tipo = parseTipo(tipoRaw, defaultTipo)
      defaultTipo = tipo
      const label = turnoRaw || `Turno ${turnos.length + 1}`
      current = {
        label,
        direccion: direccion || label,
        tipo,
        lat,
        lng,
        piezas: [],
      }
      turnos.push(current)
    } else {
      if (direccion) {
        // Misma dirección repetida = otra pieza en el mismo turno
        if (!current.direccion) current.direccion = direccion
      }
      if (lat != null) current.lat = lat
      if (lng != null) current.lng = lng
      if (tipoRaw) {
        current.tipo = parseTipo(tipoRaw, current.tipo)
        defaultTipo = current.tipo
      }
    }

    if (nombre) {
      current!.piezas.push({ nombre, autor })
    } else if (direccion && !startsNewTurno) {
      // Continuación solo-ruta: pieza placeholder
      current!.piezas.push({
        nombre: `Pieza ${current!.piezas.length + 1}`,
        autor: null,
      })
    } else if (!nombre && direccion && startsNewTurno) {
      current!.piezas.push({
        nombre: `Turno ${turnos.length}`,
        autor: null,
      })
    }
  }

  return { turnos }
}

function looksLikeFullProgramaHeader(parts: string[]): boolean {
  const joined = parts.join(' ').toLowerCase()
  return joined.includes('son') || joined.includes('alabado') || joined.includes('autor')
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
