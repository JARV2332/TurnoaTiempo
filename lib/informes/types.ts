export type InformeSlug = 'virgen-del-socorro-catedral-2026' | 'virgen-del-carmen-santuario-2026'

export type InformeListItem = {
  slug: InformeSlug
  title: string
  excerpt: string
  dateLabel: string
}

export type KpiItem = {
  label: string
  value: string
  delta: string
}

export type TrafficPoint = { label: string; value: number }

export type ReferrerRow = { name: string; value: number; color: string }

export type DonutSlice = { name: string; value: number; color: string }

export type OsRow = { name: string; value: number; color: string }

export type InformeDetail = {
  slug: InformeSlug
  meta: {
    title: string
    description: string
    kicker: string
    headline: string
    dateLocationLine: string
  }
  saludo: string[]
  kpis: KpiItem[]
  traffic: {
    sectionTitle: string
    chartTitle: string
    points: TrafficPoint[]
  }
  referrers: {
    sectionTitle: string
    chartTitle: string
    rows: ReferrerRow[]
  }
  devices: {
    chartTitle: string
    slices: DonutSlice[]
  }
  countries: {
    chartTitle: string
    slices: DonutSlice[]
  }
  os: {
    chartTitle: string
    rows: OsRow[]
  }
  testimonios?: Array<{ quote: string; source: string }>
  cierre: string[]
  firma: {
    nombre: string
    cargo: string
    web: string
  }
}
