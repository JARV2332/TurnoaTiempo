'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useTheme } from 'next-themes'
import type { PuntoRuta, Marcha } from '@/lib/types'
import { obtenerPiezasPorTurno } from '@/lib/musica'
import { lineaManhattan, separarMarcadoresCercanos } from '@/lib/geo'

type RutaTipo = 'ida' | 'regreso'

export interface RutaMapEditorProps {
  puntos: PuntoRuta[]
  tipo: RutaTipo
  marchas: Marcha[]
  onMapClick: (lat: number, lng: number) => void
  heightClassName?: string
}

const DEFAULT_CENTER = { lat: 14.6407, lng: -90.5133 }
const DEFAULT_ZOOM = 15

function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function RutaMapEditor({
  puntos,
  tipo,
  marchas,
  onMapClick,
  heightClassName = 'h-[480px]',
}: RutaMapEditorProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markers = useRef<any[]>([])
  const onMapClickRef = useRef(onMapClick)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  const tiles =
    resolvedTheme === 'light'
      ? [
          'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        ]
      : [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        ]

  const puntosOrdenados = useMemo(() => {
    return puntos
      .filter((p) => p.tipo === tipo && toNum(p.lat) != null && toNum(p.lng) != null)
      .sort((a, b) => a.orden - b.orden)
      .map((p) => ({ ...p, lat: toNum(p.lat)!, lng: toNum(p.lng)! }))
  }, [puntos, tipo])

  const totalIda = useMemo(
    () => puntos.filter((p) => p.tipo === 'ida' && toNum(p.lat) != null && toNum(p.lng) != null).length,
    [puntos],
  )

  const lineColor = tipo === 'ida' ? '#7c3aed' : '#f59e0b'
  const markerBg = tipo === 'ida' ? '#7c3aed' : '#fbbf24'
  const markerBorder = tipo === 'ida' ? '#4c1d95' : '#92400e'
  const markerFg = tipo === 'ida' ? '#fff' : '#111827'

  useEffect(() => {
    const el = mapContainer.current
    if (!el) return

    let cancelled = false

    const ensureLayers = (m: any) => {
      if (!m.getSource('ruta-linea')) {
        m.addSource('ruta-linea', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [] },
          },
        })
      }
      if (!m.getLayer('ruta-linea-halo')) {
        m.addLayer({
          id: 'ruta-linea-halo',
          type: 'line',
          source: 'ruta-linea',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ffffff',
            'line-width': 8,
            'line-opacity': 0.55,
          },
        })
      }
      if (!m.getLayer('ruta-linea')) {
        m.addLayer({
          id: 'ruta-linea',
          type: 'line',
          source: 'ruta-linea',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': lineColor,
            'line-width': 5,
            'line-opacity': 0.95,
          },
        })
      }
    }

    const runInit = () => {
      if (cancelled) return
      const maplibregl = (window as any).maplibregl
      if (!maplibregl) return

      if (map.current) {
        markers.current.forEach((mk) => mk.remove?.())
        markers.current = []
        map.current.remove()
        map.current = null
      }

      map.current = new maplibregl.Map({
        container: el,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles,
              tileSize: 256,
              attribution: '&copy; OpenStreetMap &copy; CARTO',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }],
        },
        center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
        zoom: DEFAULT_ZOOM,
      })

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

      map.current.on('click', (e: any) => {
        const lat = e.lngLat?.lat
        const lng = e.lngLat?.lng
        if (typeof lat === 'number' && typeof lng === 'number') onMapClickRef.current(lat, lng)
      })

      map.current.on('load', () => {
        if (!map.current || cancelled) return
        ensureLayers(map.current)
        el.dispatchEvent(new Event('ruta-map-ready'))
      })
    }

    const win = window as any
    if (win.maplibregl) {
      runInit()
    } else if (document.querySelector('script[data-maplibre]')) {
      const t = setInterval(() => {
        if (win.maplibregl) {
          clearInterval(t)
          runInit()
        }
      }, 100)
      return () => {
        cancelled = true
        clearInterval(t)
      }
    } else {
      const link = document.createElement('link')
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.setAttribute('data-maplibre', '1')
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js'
      script.async = true
      script.onload = runInit
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      markers.current.forEach((mk) => mk.remove?.())
      markers.current = []
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme])

  useEffect(() => {
    if (!map.current?.getLayer?.('ruta-linea')) return
    map.current.setPaintProperty('ruta-linea', 'line-color', lineColor)
  }, [lineColor])

  useEffect(() => {
    const draw = () => {
      if (!map.current) return false
      const maplibregl = (window as any).maplibregl
      if (!maplibregl) return false
      if (!map.current.getSource('ruta-linea')) return false

      markers.current.forEach((m) => m.remove?.())
      markers.current = []

      const basePts = puntosOrdenados.map((p) => ({ lat: p.lat, lng: p.lng }))
      const lineCoords = lineaManhattan(basePts)
      const markerPts = separarMarcadoresCercanos(basePts, 32)

      const source = map.current.getSource('ruta-linea')
      if (source?.setData) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates:
              lineCoords.length >= 2
                ? lineCoords
                : lineCoords.length === 1
                  ? [lineCoords[0], lineCoords[0]]
                  : [],
          },
        })
      }

      puntosOrdenados.forEach((p, idx) => {
        const turno = tipo === 'ida' ? idx + 1 : totalIda + idx + 1
        const piezas = obtenerPiezasPorTurno(marchas, turno)
        const display = markerPts[idx] || p

        const el = document.createElement('div')
        el.style.cssText = `
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: ${markerBg};
          border: 2px solid ${markerBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: ${markerFg};
          box-shadow: 0 1px 3px rgba(0,0,0,.3);
          cursor: pointer;
          user-select: none;
        `
        el.textContent = String(turno)

        const piezasHtml = piezas.length
          ? piezas
              .map(
                (m) =>
                  `<div style="margin-top:3px;font-size:12px;"><strong>${m.nombre}</strong>${
                    m.autor ? ` — ${m.autor}` : ''
                  }</div>`,
              )
              .join('')
          : '<div style="margin-top:3px;font-size:12px;color:#6b7280;">Sin marcha</div>'

        const popupHtml = `
          <div style="padding:8px; color:#111827; max-width:260px;">
            <div style="font-weight:700; font-size:14px;">Turno ${turno}</div>
            ${piezasHtml}
            <div style="margin-top:8px; font-size:12px; color:#6b7280;">${p.direccion || ''}</div>
          </div>
        `

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([display.lng, display.lat])
          .setPopup(new maplibregl.Popup({ offset: 14 }).setHTML(popupHtml))
          .addTo(map.current)

        markers.current.push(marker)
      })

      if (lineCoords.length === 1) {
        map.current.flyTo({ center: lineCoords[0], zoom: 16 })
      } else if (lineCoords.length > 1) {
        const bounds = lineCoords.reduce(
          (b, c) => b.extend(c),
          new maplibregl.LngLatBounds(lineCoords[0], lineCoords[0]),
        )
        map.current.fitBounds(bounds, { padding: 56, maxZoom: 15.5, duration: 500 })
      }

      map.current.resize?.()
      return true
    }

    if (draw()) return

    const el = mapContainer.current
    const onReady = () => draw()
    el?.addEventListener('ruta-map-ready', onReady)
    const poll = setInterval(() => {
      if (draw()) clearInterval(poll)
    }, 150)

    return () => {
      el?.removeEventListener('ruta-map-ready', onReady)
      clearInterval(poll)
    }
  }, [marchas, puntosOrdenados, tipo, totalIda, markerBg, markerBorder, markerFg])

  return (
    <div className={`relative w-full ${heightClassName} rounded-lg overflow-hidden border border-border/50`}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded">
        {puntosOrdenados.length > 0
          ? `${puntosOrdenados.length} turnos · línea por calles (${tipo})`
          : `Click en el mapa para añadir un punto (${tipo})`}
      </div>
    </div>
  )
}
