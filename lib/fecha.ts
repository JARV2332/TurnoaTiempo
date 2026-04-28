type FormatoFechaOpciones = Intl.DateTimeFormatOptions

export function formatearFechaISO(
  fechaISO: string,
  opciones?: FormatoFechaOpciones,
  locale: string = 'es-ES',
): string {
  const [y, m, d] = fechaISO.split('-').map(Number)
  if (!y || !m || !d) return fechaISO

  // Fecha local al mediodia para evitar desfases por zona horaria.
  const fechaLocal = new Date(y, m - 1, d, 12, 0, 0)
  return fechaLocal.toLocaleDateString(locale, opciones)
}
