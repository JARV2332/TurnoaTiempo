import type { InformeDetail, InformeListItem } from './types'

export const informeVirgenSocorroList: InformeListItem = {
  slug: 'virgen-del-socorro-catedral-2026',
  title: 'Virgen del Socorro — Catedral Metropolitana',
  excerpt:
    'Informe de uso y métricas del seguimiento en vivo del cortejo procesional (9 de mayo de 2026).',
  dateLabel: 'Mayo 2026',
}

export const informeVirgenSocorroDetail: InformeDetail = {
  slug: 'virgen-del-socorro-catedral-2026',
  meta: {
    title: 'Informe — Virgen del Socorro | Turno a Tiempo',
    description:
      'Resultados y métricas del seguimiento en vivo de la procesión de la Virgen del Socorro, Santa Iglesia Catedral Metropolitana, Guatemala.',
    kicker: 'Turno a Tiempo — Informe oficial',
    headline: 'Resultados y métricas del seguimiento en vivo',
    dateLocationLine:
      'Guatemala, 12 de mayo de 2026 · Cortejo procesional — Santa Iglesia Catedral Metropolitana',
  },
  saludo: [
    'Estimados miembros de la Junta Directiva y Encargados de Logística,',
    'Es un gusto saludarles y agradecerles la confianza depositada en la plataforma Turno a Tiempo. Tras finalizar la actividad, es grato confirmar que la implementación tecnológica fue un éxito rotundo, superando ampliamente nuestras proyecciones iniciales.',
  ],
  kpis: [
    { label: 'Visitantes únicos', value: '1,840', delta: '↑ +1,100% vs. anterior' },
    { label: 'Visualizaciones', value: '4,730', delta: '↑ +810% vs. anterior' },
    { label: 'Tasa de rebote', value: '38%', delta: '↓ Mejorada vs. promedio' },
    { label: 'Minutos prom./sesión', value: '7.4', delta: '↑ Alta retención' },
  ],
  traffic: {
    sectionTitle: 'Tráfico durante el cortejo (9 de mayo)',
    chartTitle: 'Visitantes por hora — pico a las 3:00 p.m.',
    points: [
      { label: '12am', value: 0 },
      { label: '2am', value: 0 },
      { label: '4am', value: 0 },
      { label: '6am', value: 80 },
      { label: '7am', value: 120 },
      { label: '8am', value: 70 },
      { label: '9am', value: 100 },
      { label: '10am', value: 95 },
      { label: '11am', value: 110 },
      { label: '12pm', value: 120 },
      { label: '1pm', value: 140 },
      { label: '2pm', value: 220 },
      { label: '3pm', value: 420 },
      { label: '4pm', value: 380 },
      { label: '5pm', value: 170 },
      { label: '6pm', value: 100 },
      { label: '7pm', value: 40 },
      { label: '8pm', value: 12 },
      { label: '9pm', value: 6 },
      { label: '10pm', value: 2 },
    ],
  },
  referrers: {
    sectionTitle: 'Fuentes de tráfico y dispositivos',
    chartTitle: 'Referencia de tráfico (visitantes)',
    rows: [
      { name: 'lm.facebook.com', value: 760, color: '#1877f2' },
      { name: 'facebook.com', value: 312, color: '#4267B2' },
      { name: 'QR Code', value: 148, color: '#e53935' },
      { name: 'google.com', value: 96, color: '#4285F4' },
      { name: 'Otros', value: 44, color: '#aaa' },
    ],
  },
  devices: {
    chartTitle: 'Distribución de dispositivos',
    slices: [
      { name: 'Móvil', value: 95, color: '#1a3a5c' },
      { name: 'Escritorio', value: 4, color: '#378add' },
      { name: 'Tablet', value: 1, color: '#b5d4f4' },
    ],
  },
  countries: {
    chartTitle: 'Visitantes por país',
    slices: [
      { name: 'Guatemala', value: 96, color: '#1a3a5c' },
      { name: 'EE.UU.', value: 3, color: '#378add' },
      { name: 'Otros', value: 1, color: '#b5d4f4' },
    ],
  },
  os: {
    chartTitle: 'Sistema operativo',
    rows: [
      { name: 'Android', value: 72, color: '#3ddc84' },
      { name: 'iOS', value: 24, color: '#888' },
      { name: 'Windows', value: 3, color: '#0078d4' },
      { name: 'Linux', value: 1, color: '#e95420' },
    ],
  },
  cierre: [
    'Estos números no son solo estadísticas; representan a 1,840 personas que pudieron localizar el cortejo con precisión, optimizando su tiempo y mejorando la fluidez en las calles de la ciudad. El 95% de los accesos desde dispositivos móviles confirma que la herramienta está diseñada para el devoto que se encuentra en las calles.',
    'El alcance internacional —con presencia en Estados Unidos, Canadá y Centroamérica— permitió que quienes están lejos se sintieran parte de la festividad. El tráfico proveniente de Facebook como principal referente demuestra que la comunidad valora y comparte herramientas que modernizan nuestras tradiciones sin perder su esencia.',
    'Agradezco la apertura para innovar juntos. Estoy a su entera disposición para planificar futuras actividades y seguir elevando el estándar organizativo de nuestras tradiciones.',
  ],
  firma: {
    nombre: 'Ing. Jorge Alberto Romero Villanueva',
    cargo: 'Desarrollador — Turno a Tiempo',
    web: 'turnoatiempo.com',
  },
}
