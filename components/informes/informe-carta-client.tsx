'use client'

import { useId } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { InformeDetail } from '@/lib/informes/types'

const NAVY = '#1a3a5c'
const GRID = 'rgba(0,0,0,0.06)'
const LABEL = '#666666'

type Props = {
  detail: InformeDetail
}

export function InformeCartaClient({ detail }: Props) {
  const gradId = useId().replace(/:/g, '')
  const trafficData = detail.traffic.points.map((p) => ({ label: p.label, v: p.value }))
  const refData = detail.referrers.rows.map((r) => ({ name: r.name, value: r.value, color: r.color }))
  const deviceData = detail.devices.slices.map((s) => ({ name: s.name, value: s.value, color: s.color }))
  const countryData = detail.countries.slices.map((s) => ({ name: s.name, value: s.value, color: s.color }))
  const osData = detail.os.rows.map((r) => ({ name: r.name, value: r.value, color: r.color }))

  return (
    <div className="informe-carta-scope">
      <div className="carta-wrap">
        <header className="carta-header">
          <div className="logo-title">{detail.meta.kicker}</div>
          <h1>{detail.meta.headline}</h1>
          <p className="fecha-ref">{detail.meta.dateLocationLine}</p>
        </header>

        <div className="saludo">
          {detail.saludo.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="section-label">Indicadores clave de rendimiento (KPIs)</div>
        <div className="kpi-grid">
          {detail.kpis.map((k) => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-delta">{k.delta}</div>
            </div>
          ))}
        </div>

        <div className="section-label">{detail.traffic.sectionTitle}</div>
        <div className="chart-card">
          <div className="chart-title">{detail.traffic.chartTitle}</div>
          <div className="chart-h-220">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`informeTrafficFill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NAVY} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: LABEL, fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickMargin={6}
                />
                <YAxis tick={{ fill: LABEL, fontSize: 10 }} width={36} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v: number) => [`${v}`, 'Visitantes']}
                  labelFormatter={(l) => String(l)}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  name="Visitantes"
                  stroke={NAVY}
                  strokeWidth={2}
                  fill={`url(#informeTrafficFill-${gradId})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-label">{detail.referrers.sectionTitle}</div>
        <div className="two-col">
          <div className="chart-card">
            <div className="chart-title">{detail.referrers.chartTitle}</div>
            <div className="legend-row">
              {detail.referrers.rows.map((r) => (
                <span key={r.name} className="legend-item">
                  <span className="legend-swatch" style={{ background: r.color }} />
                  {r.name} {r.value}
                </span>
              ))}
            </div>
            <div className="chart-h-180">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={refData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: LABEL, fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={108}
                    tick={{ fill: LABEL, fontSize: 9 }}
                  />
                  <Tooltip formatter={(v: number) => [v, 'Visitantes']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {refData.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">{detail.devices.chartTitle}</div>
            <div className="legend-row">
              {detail.devices.slices.map((s) => (
                <span key={s.name} className="legend-item">
                  <span className="legend-swatch" style={{ background: s.color }} />
                  {s.name} {s.value}%
                </span>
              ))}
            </div>
            <div className="chart-h-180">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={0}
                  >
                    {deviceData.map((e) => (
                      <Cell key={e.name} fill={e.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="section-label">Geografía y sistema operativo</div>
        <div className="two-col">
          <div className="chart-card">
            <div className="chart-title">{detail.countries.chartTitle}</div>
            <div className="legend-row">
              {detail.countries.slices.map((s) => (
                <span key={s.name} className="legend-item">
                  <span className="legend-swatch" style={{ background: s.color }} />
                  {s.name} {s.value}%
                </span>
              ))}
            </div>
            <div className="chart-h-160">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="78%"
                  >
                    {countryData.map((e) => (
                      <Cell key={e.name} fill={e.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">{detail.os.chartTitle}</div>
            <div className="legend-row">
              {detail.os.rows.map((r) => (
                <span key={r.name} className="legend-item">
                  <span className="legend-swatch" style={{ background: r.color }} />
                  {r.name} {r.name === 'Linux' ? '<1%' : `${r.value}%`}
                </span>
              ))}
            </div>
            <div className="chart-h-160">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={osData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: LABEL, fontSize: 10 }} />
                  <YAxis
                    tick={{ fill: LABEL, fontSize: 10 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    width={36}
                  />
                  <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {osData.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="carta-body">
          {detail.slug === 'virgen-del-socorro-catedral-2026' ? (
            <>
              <p>
                Estos números no son solo estadísticas; representan a{' '}
                <span className="highlight-stat">1,840 personas</span> que pudieron localizar el cortejo con
                precisión, optimizando su tiempo y mejorando la fluidez en las calles de la ciudad. El{' '}
                <span className="highlight-stat">95% de los accesos desde dispositivos móviles</span> confirma
                que la herramienta está diseñada para el devoto que se encuentra en las calles.
              </p>
              <p>
                El alcance internacional —con presencia en Estados Unidos, Canadá y Centroamérica— permitió que
                quienes están lejos se sintieran parte de la festividad. El tráfico proveniente de{' '}
                <span className="highlight-stat">Facebook como principal referente</span> demuestra que la
                comunidad valora y comparte herramientas que modernizan nuestras tradiciones sin perder su
                esencia.
              </p>
              <p>{detail.cierre[2]}</p>
            </>
          ) : (
            detail.cierre.map((p, i) => <p key={i}>{p}</p>)
          )}
        </div>

        <footer className="firma">
          <div className="firma-nombre">{detail.firma.nombre}</div>
          <div className="firma-cargo">{detail.firma.cargo}</div>
          <div className="firma-web">{detail.firma.web}</div>
        </footer>
      </div>
    </div>
  )
}
