import type { InformeDetail, InformeListItem } from './types'

export const informeVirgenDoloresVisitaList: InformeListItem = {
  slug: 'virgen-dolores-visita-2026',
  title: 'Virgen de Dolores — Visita conmemorativa',
  excerpt:
    'Informe de impacto digital del cortejo del 22 de agosto de 2026. 2,180 usuarios únicos, 4,620 visualizaciones y fuerte alcance desde Facebook.',
  dateLabel: 'Agosto 2026',
}

export const informeVirgenDoloresVisitaDetail: InformeDetail = {
  slug: 'virgen-dolores-visita-2026',
  meta: {
    title: 'Informe — Virgen de Dolores (Visita) | Turno a Tiempo',
    description:
      'Resultados y métricas del seguimiento en vivo de la Visita conmemorativa de la Santísima Virgen de Dolores del Templo de San Francisco el Grande de Antigua Guatemala a la Ciudad de Guatemala, 22 de agosto de 2026.',
    kicker: 'Turno a Tiempo — Informe de Impacto Digital',
    headline: 'Resultados y métricas del seguimiento en vivo',
    dateLocationLine:
      'Guatemala, 22 de agosto de 2026 · Visita conmemorativa — Santísima Virgen de Dolores (San Francisco el Grande, Antigua Guatemala)',
  },
  saludo: [
    'Estimados miembros de la Hermandad de la Consagrada Imagen de Jesús Nazareno del Perdón y Santísima Virgen de Dolores,',
    'Es un honor presentarles los resultados del acompañamiento tecnológico durante la Visita conmemorativa de la Santísima Virgen de Dolores del Templo de San Francisco el Grande de Antigua Guatemala a la Ciudad de Guatemala. La plataforma Turno a Tiempo registró una respuesta sobresaliente de la comunidad, con miles de consultas al seguimiento en vivo a lo largo del cortejo por el Centro Histórico.',
  ],
  kpis: [
    { label: 'Visualizaciones de Página', value: '4,620', delta: '↑ +155% vs. registro base' },
    { label: 'Usuarios Únicos', value: '2,180', delta: '↑ Seguimiento en directo' },
    { label: 'Acceso desde Celular', value: '96%', delta: 'Optimización Web Móvil' },
    { label: 'Tasa de rebote', value: '41%', delta: '↓ Mejorada vs. promedio web' },
  ],
  traffic: {
    sectionTitle: 'Tráfico durante el cortejo (22 de agosto)',
    chartTitle: 'Visitantes por hora — pico entre salida y ingreso a Catedral',
    points: [
      { label: '8am', value: 45 },
      { label: '9am', value: 95 },
      { label: '10am', value: 180 },
      { label: '11am', value: 320 },
      { label: '12pm', value: 410 },
      { label: '1pm', value: 485 },
      { label: '2pm', value: 540 },
      { label: '3pm', value: 580 },
      { label: '4pm', value: 420 },
      { label: '5pm', value: 260 },
      { label: '6pm', value: 145 },
      { label: '7pm', value: 70 },
      { label: '8pm', value: 28 },
      { label: '9pm', value: 12 },
    ],
  },
  referrers: {
    sectionTitle: 'Fuentes de tráfico y dispositivos',
    chartTitle: 'Origen del tráfico (visitantes)',
    rows: [
      { name: 'lm.facebook.com', value: 1090, color: '#1877f2' },
      { name: 'facebook.com', value: 350, color: '#4267B2' },
      { name: 'm.facebook.com', value: 175, color: '#3b5998' },
      { name: 'l.facebook.com', value: 95, color: '#8b9dc3' },
      { name: 'google.com / SEO', value: 85, color: '#ea4335' },
      { name: 'Directo / Otros', value: 65, color: '#6b7280' },
    ],
  },
  devices: {
    chartTitle: 'Distribución de dispositivos',
    slices: [
      { name: 'Móvil', value: 96, color: '#1a3a5c' },
      { name: 'Escritorio', value: 3, color: '#378add' },
      { name: 'Tablet', value: 1, color: '#b5d4f4' },
    ],
  },
  countries: {
    chartTitle: 'Visitantes por país',
    slices: [
      { name: 'Guatemala', value: 96, color: '#1a3a5c' },
      { name: 'EE.UU.', value: 2, color: '#378add' },
      { name: 'El Salvador', value: 1, color: '#b5d4f4' },
      { name: 'Otros', value: 1, color: '#94a3b8' },
    ],
  },
  os: {
    chartTitle: 'Sistema operativo',
    rows: [
      { name: 'Android', value: 72, color: '#3ddc84' },
      { name: 'iOS', value: 25, color: '#888' },
      { name: 'Windows', value: 3, color: '#0078d4' },
    ],
  },
  cierre: [
    'Estos números no son solo estadísticas; representan a 2,180 personas que pudieron localizar el cortejo con precisión durante la Visita al Centro Histórico, desde la salida del Templo de la Recolección hasta el ingreso a Catedral Metropolitana. El 96% de accesos desde celular confirma que la herramienta acompaña al fiel en calle.',
    'Facebook concentró la mayor parte del tráfico, lo que demuestra que la comunidad compartió activamente el enlace de seguimiento. El alcance también llegó a Estados Unidos, El Salvador y otros países, permitiendo que quienes están lejos se sintieran parte de esta Visita conmemorativa.',
    'Agradezco la confianza de la Hermandad y quedo a su disposición para seguir acompañándoles en futuras actividades, elevando juntos el estándar organizativo de nuestras tradiciones.',
  ],
  firma: {
    nombre: 'Ing. Jorge Alberto Romero Villanueva',
    cargo: 'Desarrollador — Turno a Tiempo',
    web: 'turnoatiempo.com',
  },
}
