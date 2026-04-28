'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useTheme } from 'next-themes'
import type { PuntoRuta, Marcha } from '@/lib/types'
import { obtenerPiezaPorTurno } from '@/lib/musica'

type RutaTipo = 'ida' | 'regreso'

export interface RutaMapEditorProps {
  puntos: PuntoRuta[]
  tipo: RutaTipo
  marchas: Marcha[]
  onMapClick: (lat: number, lng: number) => void
  heightClassName?: string
}

// Centro aproximado de Guatemala Z1 (solo fallback visual)
const DEFAULT_CENTER = { lat: 14.6407, lng: -90.5133 }
const DEFAULT_ZOOM = 15

export function RutaMapEditor({
  puntos,
  tipo,
  marchas,
  onMapClick,
  heightClassName = 'h-[420px]',
}: RutaMapEditorProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markers = useRef<any[]>([])
  const { resolvedTheme } = useTheme()

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
      .filter((p) => p.tipo === tipo && p.lat != null && p.lng != null)
      .sort((a, b) => a.orden - b.orden)
  }, [puntos, tipo])
  const totalIda = useMemo(
    () => puntos.filter((p) => p.tipo === 'ida' && p.lat != null && p.lng != null).length,
    [puntos],
  )

  const center = useMemo(() => {
    if (puntosOrdenados.length > 0) {
      return { lat: puntosOrdenados[0].lat!, lng: puntosOrdenados[0].lng! }
    }
    return DEFAULT_CENTER
  }, [puntosOrdenados])

  // Init map (MapLibre via unpkg; reusa el mismo script si ya existe)
  useEffect(() => {
    const el = mapContainer.current
    if (!el) return

    const runInit = () => {
      const maplibregl = (window as any).maplibregl
      if (!maplibregl || map.current) return

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
        center: [center.lng, center.lat],
        zoom: DEFAULT_ZOOM,
      })

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

      map.current.on('click', (e: any) => {
        const lat = e.lngLat?.lat
        const lng = e.lngLat?.lng
        if (typeof lat === 'number' && typeof lng === 'number') onMapClick(lat, lng)
      })

      map.current.on('load', () => {
        // Source/layer para la línea del recorrido
        map.current.addSource('ruta-linea', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [] },
          },
        })
        map.current.addLayer({
          id: 'ruta-linea',
          type: 'line',
          source: 'ruta-linea',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': tipo === 'ida' ? '#7c3aed' : '#fbbf24',
            'line-width': 4,
            'line-opacity': 0.85,
          },
        })
      })
    }

    const win = window as any
    if (win.maplibregl) {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
      runInit()
    } else if (document.querySelector('script[data-maplibre]')) {
      const t = setInterval(() => {
        if (win.maplibregl) {
          clearInterval(t)
          runInit()
        }
      }, 100)
      return () => clearInterval(t)
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
      // No destruimos el mapa aquí para evitar parpadeos si el usuario cambia tabs;
      // se limpia en hot reload / navegación.
    }
  }, [center.lat, center.lng, onMapClick, tipo, resolvedTheme])

  // Update markers + line when points change
  useEffect(() => {
    if (!map.current) return
    const maplibregl = (window as any).maplibregl
    if (!maplibregl) return

    // Clear existing markers
    markers.current.forEach((m) => m.remove?.())
    markers.current = []

    const coords: [number, number][] = []
    puntosOrdenados.forEach((p, idx) => {
      const turno = tipo === 'ida' ? idx + 1 : totalIda + idx + 1
      const marcha = obtenerPiezaPorTurno(marchas, turno)

      coords.push([p.lng!, p.lat!])

      const el = document.createElement('div')
      el.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 999px;
        background: ${tipo === 'ida' ? '#7c3aed' : '#fbbf24'};
        border: 3px solid ${tipo === 'ida' ? '#4c1d95' : '#92400e'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: ${tipo === 'ida' ? 'white' : '#111827'};
      `
      el.textContent = String(turno)

      const popupHtml = `
        <div style="padding:8px; color:#111827; max-width:240px;">
          <div style="font-weight:700;">Turno ${turno}</div>
          <div style="margin-top:4px;">${p.direccion || 'Punto'}</div>
          <div style="margin-top:6px; font-size:12px; color:#6b7280;">
            Son/Alabado: ${marcha ? `${marcha.nombre}${marcha.autor ? ` — ${marcha.autor}` : ''}` : '—'}
          </div>
        </div>
      `

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lng!, p.lat!])
        .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml))
        .addTo(map.current)

      markers.current.push(marker)
    })

    const source = map.current.getSource('ruta-linea')
    if (source?.setData) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: coords },
      })
    }
  }, [marchas, puntosOrdenados, tipo, totalIda])

  return (
    <div className={`relative w-full ${heightClassName} rounded-lg overflow-hidden border border-border/50`}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded">
        Click en el mapa para añadir un punto ({tipo}). Se numera por orden.
      </div>
    </div>
  )
}

