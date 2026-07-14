import type { InformeDetail, InformeListItem } from './types'

export const informeVirgenCarmenList: InformeListItem = {
  slug: 'virgen-del-carmen-santuario-2026',
  title: 'Cofradía del Carmen — Rectoría Santa Teresa',
  excerpt:
    'Informe de impacto digital del cortejo procesional (Julio 2026). 1,840 usuarios únicos, 4,250 visualizaciones y alcance internacional.',
  dateLabel: 'Julio 2026',
}

export const informeVirgenCarmenDetail: InformeDetail = {
  slug: 'virgen-del-carmen-santuario-2026',
  meta: {
    title: 'Informe — Cofradía del Carmen | Turno a Tiempo',
    description:
      'Resultados y métricas del seguimiento en vivo del Cortejo Procesional de la Cofradía del Carmen, Rectoría Santa Teresa, Julio 2026.',
    kicker: 'Turno a Tiempo — Informe de Impacto Digital',
    headline: 'Resultados y métricas del seguimiento en vivo',
    dateLocationLine:
      'Guatemala, Julio 2026 · Cortejo Procesional — Cofradía del Carmen, Rectoría Santa Teresa',
  },
  saludo: [
    'Estimados miembros de la Junta Directiva y Cofrades de la Cofradía del Carmen,',
    'Es un honor presentarles los resultados del acompañamiento tecnológico realizado durante el Cortejo Procesional de la Cofradía del Carmen en la Rectoría Santa Teresa. La plataforma Turno a Tiempo registró una respuesta extraordinaria de la comunidad devota, reflejando el interés y la participación activa de cientos de fieles que siguieron el recorrido en tiempo real.',
  ],
  kpis: [
    { label: 'Visualizaciones de Página', value: '4,250', delta: '↑ +940% Crecimiento' },
    { label: 'Usuarios Únicos', value: '1,840', delta: '↑ Seguimiento en directo' },
    { label: 'Acceso desde Celular', value: '93%', delta: 'Optimización Web Móvil' },
    { label: 'Alcance en Calle', value: '~3,500', delta: 'Devotos impactados*' },
  ],
  traffic: {
    sectionTitle: 'Tráfico durante el cortejo (Julio 2026)',
    chartTitle: 'Visitantes por hora — pico en el recorrido central',
    points: [
      { label: '6am', value: 30 },
      { label: '7am', value: 65 },
      { label: '8am', value: 110 },
      { label: '9am', value: 145 },
      { label: '10am', value: 175 },
      { label: '11am', value: 210 },
      { label: '12pm', value: 270 },
      { label: '1pm', value: 340 },
      { label: '2pm', value: 410 },
      { label: '3pm', value: 480 },
      { label: '4pm', value: 520 },
      { label: '5pm', value: 465 },
      { label: '6pm', value: 370 },
      { label: '7pm', value: 195 },
      { label: '8pm', value: 85 },
      { label: '9pm', value: 40 },
      { label: '10pm', value: 12 },
    ],
  },
  referrers: {
    sectionTitle: 'Fuentes de tráfico y dispositivos',
    chartTitle: 'Origen del tráfico (visitantes)',
    rows: [
      { name: 'lm.facebook.com', value: 950, color: '#1877f2' },
      { name: 'm.facebook.com', value: 670, color: '#4267B2' },
      { name: 'google.com / SEO', value: 166, color: '#ea4335' },
      { name: 'Otros / Yahoo', value: 54, color: '#6b7280' },
    ],
  },
  devices: {
    chartTitle: 'Distribución de dispositivos',
    slices: [
      { name: 'Móvil', value: 93, color: '#1a3a5c' },
      { name: 'Escritorio', value: 5, color: '#378add' },
      { name: 'Tablet', value: 2, color: '#b5d4f4' },
    ],
  },
  countries: {
    chartTitle: 'Visitantes por país',
    slices: [
      { name: 'Guatemala', value: 91, color: '#1a3a5c' },
      { name: 'EE.UU.', value: 6, color: '#378add' },
      { name: 'El Salvador', value: 1, color: '#b5d4f4' },
      { name: 'Otros', value: 2, color: '#94a3b8' },
    ],
  },
  os: {
    chartTitle: 'Sistema operativo',
    rows: [
      { name: 'Android', value: 74, color: '#3ddc84' },
      { name: 'iOS', value: 21, color: '#888' },
      { name: 'Windows', value: 4, color: '#0078d4' },
      { name: 'Linux', value: 1, color: '#e95420' },
    ],
  },
  cierre: [
    'Estos números no son solo estadísticas; representan a 1,840 personas que pudieron localizar el cortejo con precisión, reduciendo la incertidumbre y mejorando la experiencia del devoto en calle. El 93% de accesos desde dispositivos móviles confirma que la herramienta responde exactamente al perfil del fiel que acompaña la procesión.',
    'El alcance internacional —con presencia en Estados Unidos, El Salvador, Costa Rica y España— permitió que quienes están lejos se sintieran parte de la festividad. El tráfico proveniente de Facebook como principal referente demuestra que la comunidad comparte y valora activamente estas herramientas de modernización sin perder la esencia de nuestra tradición.',
    'Agradezco profundamente la confianza de la Asociación de Devotos de la Santísima Virgen del Carmen. Quedo a su disposición para seguir acompañándoles en futuras actividades y elevar juntos el estándar organizativo de nuestras tradiciones.',
  ],
  firma: {
    nombre: 'Ing. Jorge Alberto Romero Villanueva',
    cargo: 'Desarrollador — Turno a Tiempo',
    web: 'turnoatiempo.com',
  },
}
