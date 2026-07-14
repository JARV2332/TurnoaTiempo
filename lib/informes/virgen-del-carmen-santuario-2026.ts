import type { InformeDetail, InformeListItem } from './types'

export const informeVirgenCarmenList: InformeListItem = {
  slug: 'virgen-del-carmen-santuario-2026',
  title: 'Virgen del Carmen — Santuario de Santa Teresa',
  excerpt:
    'Informe de impacto digital del cortejo procesional (Julio 2026). 625 usuarios únicos, 1,380 visualizaciones y alcance internacional.',
  dateLabel: 'Julio 2026',
}

export const informeVirgenCarmenDetail: InformeDetail = {
  slug: 'virgen-del-carmen-santuario-2026',
  meta: {
    title: 'Informe — Virgen del Carmen | Turno a Tiempo',
    description:
      'Resultados y métricas del seguimiento en vivo del Cortejo Procesional de la Santísima Virgen del Carmen, Santuario de Santa Teresa, Julio 2026.',
    kicker: 'Turno a Tiempo — Informe de Impacto Digital',
    headline: 'Resultados y métricas del seguimiento en vivo',
    dateLocationLine:
      'Guatemala, Julio 2026 · Cortejo Procesional de la Santísima Virgen del Carmen — Santuario de Santa Teresa',
  },
  saludo: [
    'Estimados miembros de la Junta Directiva, Comisión de Logística y Vocalía de Comunicación,',
    'Es un honor presentarles los resultados del acompañamiento tecnológico realizado durante el Cortejo Procesional de la Santísima Virgen del Carmen. La plataforma Turno a Tiempo registró una respuesta extraordinaria de la comunidad devota, reflejando el interés y la participación activa de cientos de fieles que siguieron el recorrido en tiempo real.',
  ],
  kpis: [
    { label: 'Visualizaciones de Página', value: '1,380', delta: '↑ +940% Crecimiento' },
    { label: 'Usuarios Únicos', value: '625', delta: 'Seguimiento en directo' },
    { label: 'Acceso desde Celular', value: '93%', delta: 'Optimización Web Móvil' },
    { label: 'Alcance en Calle', value: '~1,500', delta: 'Devotos impactados*' },
  ],
  traffic: {
    sectionTitle: 'Tráfico durante el cortejo (Julio 2026)',
    chartTitle: 'Visitantes por hora — pico en el recorrido central',
    points: [
      { label: '6am', value: 10 },
      { label: '7am', value: 25 },
      { label: '8am', value: 40 },
      { label: '9am', value: 55 },
      { label: '10am', value: 70 },
      { label: '11am', value: 90 },
      { label: '12pm', value: 110 },
      { label: '1pm', value: 130 },
      { label: '2pm', value: 160 },
      { label: '3pm', value: 185 },
      { label: '4pm', value: 210 },
      { label: '5pm', value: 195 },
      { label: '6pm', value: 150 },
      { label: '7pm', value: 80 },
      { label: '8pm', value: 35 },
      { label: '9pm', value: 15 },
      { label: '10pm', value: 5 },
    ],
  },
  referrers: {
    sectionTitle: 'Fuentes de tráfico y dispositivos',
    chartTitle: 'Origen del tráfico (visitantes)',
    rows: [
      { name: 'lm.facebook.com', value: 382, color: '#1877f2' },
      { name: 'm.facebook.com', value: 168, color: '#4267B2' },
      { name: 'google.com / SEO', value: 56, color: '#ea4335' },
      { name: 'Otros / Yahoo', value: 19, color: '#6b7280' },
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
  testimonios: [
    {
      quote:
        'La integración del mapa en vivo de Turno a Tiempo fue un éxito logístico. Nos permitió mantener informados a los devotos de forma inmediata y redujo drásticamente los mensajes en redes sociales preguntando por la ubicación del anda, permitiendo un flujo en calle mucho más ordenado.',
      source: 'Comisión de Orden y Logística, Asociación de Devotos',
    },
    {
      quote:
        'Una herramienta excelente, especialmente para los hermanos que se encuentran fuera del país. Pudieron seguir el minuto a minuto del recorrido y sentir la cercanía con la Santísima Virgen desde la distancia. Definitivamente moderniza la organización sin perder la esencia.',
      source: 'Vocalía de Comunicación y Redes Sociales',
    },
  ],
  cierre: [
    'Estos números no son solo estadísticas; representan a 625 personas que pudieron localizar el cortejo con precisión, reduciendo la incertidumbre y mejorando la experiencia del devoto en calle. El 93% de accesos desde dispositivos móviles confirma que la herramienta responde exactamente al perfil del fiel que acompaña la procesión.',
    'El alcance internacional —con presencia en Estados Unidos, El Salvador, Costa Rica y España— permitió que quienes están lejos se sintieran parte de la festividad. El 88% del tráfico proveniente de Facebook demuestra que la comunidad comparte y valora activamente estas herramientas de modernización sin perder la esencia de nuestra tradición.',
    'Agradezco profundamente la confianza de la Asociación de Devotos de la Santísima Virgen del Carmen. Quedo a su disposición para seguir acompañándoles en futuras actividades y elevar juntos el estándar organizativo de nuestras tradiciones.',
  ],
  firma: {
    nombre: 'Ing. Jorge Alberto Romero Villanueva',
    cargo: 'Desarrollador — Turno a Tiempo',
    web: 'turnoatiempo.com',
  },
}
