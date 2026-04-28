'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import type { Procesion, PuntoRuta } from '@/lib/types'
import { construirTurnosRuta } from '@/lib/turnos'

interface TrackingMapProps {
  procesion: Procesion
  puntosRuta: PuntoRuta[]
  avatarUrl?: string
  escudoUrl?: string
}

// Default center (Seville, Spain - heart of Semana Santa)
const DEFAULT_CENTER = { lat: 37.3891, lng: -5.9845 }
const DEFAULT_ZOOM = 15
const FOCUS_ZOOM = 18

export function TrackingMap({ procesion, puntosRuta, avatarUrl, escudoUrl }: TrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const marker = useRef<any>(null)
  const routeMarkers = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
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

  const getInitialCenter = () => {
    if (procesion.ubicacion_lat != null && procesion.ubicacion_lng != null) {
      return { lat: procesion.ubicacion_lat, lng: procesion.ubicacion_lng }
    }
    const turnoActual = typeof procesion.turno_actual === 'number' ? procesion.turno_actual : 0
    if (turnoActual > 0) {
      const turnosRuta = construirTurnosRuta(puntosRuta)
      const puntoTurno = turnosRuta.find((t) => t.turno === turnoActual)?.punto
      if (puntoTurno?.lat != null && puntoTurno?.lng != null) {
        return { lat: puntoTurno.lat, lng: puntoTurno.lng }
      }
    }
    if (puntosRuta.length > 0 && puntosRuta[0].lat != null && puntosRuta[0].lng != null) {
      return { lat: puntosRuta[0].lat, lng: puntosRuta[0].lng }
    }
    return DEFAULT_CENTER
  }

  const getInitialZoom = () => {
    if (procesion.ubicacion_lat != null && procesion.ubicacion_lng != null) {
      return FOCUS_ZOOM
    }
    const turnoActual = typeof procesion.turno_actual === 'number' ? procesion.turno_actual : 0
    if (turnoActual > 0) {
      const turnosRuta = construirTurnosRuta(puntosRuta)
      const puntoTurno = turnosRuta.find((t) => t.turno === turnoActual)?.punto
      if (puntoTurno?.lat != null && puntoTurno?.lng != null) {
        return FOCUS_ZOOM
      }
    }
    return DEFAULT_ZOOM
  }

  // (Re)inicia el mapa cuando cambia el tema para alternar tiles claros/oscuros.
  useEffect(() => {
    const el = mapContainer.current
    if (!el) return

    const initialCenter = getInitialCenter()
    const initialZoom = getInitialZoom()

    const runInit = () => {
      const maplibregl = (window as any).maplibregl
      if (!maplibregl || map.current) return

      setMapLoaded(false)
      marker.current = null
      map.current = new maplibregl.Map({
        container: el,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles,
              tileSize: 256,
              attribution:
                '&copy; OpenStreetMap &copy; CARTO',
            },
          },
          layers: [
            { id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 },
          ],
        },
        center: [initialCenter.lng, initialCenter.lat],
        zoom: initialZoom,
      })

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
      map.current.on('load', () => {
        setMapLoaded(true)
        addRouteLines(maplibregl)
        addRouteMarkers(maplibregl)
        if (procesion.ubicacion_lat != null && procesion.ubicacion_lng != null) {
          addProcesionMarker(maplibregl)
        }
      })
    }

    const win = window as any
    if (win.maplibregl) {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
      runInit()
      return () => {
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    }

    if (document.querySelector('script[data-maplibre]')) {
      const t = setInterval(() => {
        if (win.maplibregl) {
          clearInterval(t)
          runInit()
        }
      }, 100)
      return () => {
        clearInterval(t)
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    }

    const link = document.createElement('link')
    link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.setAttribute('data-maplibre', '1')
    script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js'
    script.async = true
    script.onload = runInit
    script.onerror = () => {
      console.error('No se pudo cargar MapLibre GL.')
    }
    document.head.appendChild(script)

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (!map.current || !mapLoaded) return
    const maplibregl = (window as any).maplibregl
    const lat = procesion.ubicacion_lat
    const lng = procesion.ubicacion_lng
    if (lat != null && lng != null) {
      if (marker.current) {
        marker.current.setLngLat([lng, lat])
      } else {
        addProcesionMarker(maplibregl)
      }
      map.current.easeTo({ center: [lng, lat], duration: 1000 })
    } else if (marker.current) {
      marker.current.remove()
      marker.current = null
    }
  }, [procesion.ubicacion_lat, procesion.ubicacion_lng, mapLoaded])

  // Actualizar la línea de progreso cuando cambia el turno
  useEffect(() => {
    if (!map.current || !mapLoaded) return
    const maplibregl = (window as any).maplibregl
    addRouteMarkers(maplibregl)

    const source = map.current.getSource('route-ida-progress')
    if (!source) return

    const puntosIda = getPuntosIda()
    if (puntosIda.length < 2) return

    const turno = typeof procesion.turno_actual === 'number' ? procesion.turno_actual : 0
    const hasta = Math.min(Math.max(turno, 0) + 1, puntosIda.length)
    const progressCoords =
      hasta >= 2
        ? puntosIda.slice(0, hasta).map((p) => [p.lng!, p.lat!] as [number, number])
        : []

    const p0 = puntosIda[0]
    const firstPos: [number, number] = [p0.lng!, p0.lat!]
    const coordinates =
      progressCoords.length >= 2 ? progressCoords : [firstPos, firstPos]

    source.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    })
  }, [mapLoaded, procesion.turno_actual, puntosRuta, avatarUrl, escudoUrl])

  const getPuntosIda = () =>
    puntosRuta
      .filter((p) => p.tipo === 'ida' && p.lat != null && p.lng != null)
      .sort((a, b) => a.orden - b.orden)

  const addRouteLines = (maplibregl: any) => {
    const puntosIda = getPuntosIda()
    const puntosRegreso = puntosRuta
      .filter((p) => p.tipo === 'regreso' && p.lat != null && p.lng != null)
      .sort((a, b) => a.orden - b.orden)

    // Ruta completa de ida (línea fija, más tenue)
    if (puntosIda.length > 1) {
      const fullCoords = puntosIda.map((p) => [p.lng!, p.lat!] as [number, number])
      map.current.addSource('route-ida', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: fullCoords },
        },
      })
      map.current.addLayer({
        id: 'route-ida',
        type: 'line',
        source: 'route-ida',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#7c3aed',
          'line-width': 3,
          'line-opacity': 0.35,
        },
      })

      // Línea de progreso (se va pintando según el turno)
      const turno = typeof procesion.turno_actual === 'number' ? procesion.turno_actual : 0
      const hasta = Math.min(Math.max(turno, 0) + 1, puntosIda.length)
      const progressCoords =
        hasta >= 2
          ? puntosIda.slice(0, hasta).map((p) => [p.lng!, p.lat!] as [number, number])
          : []

      map.current.addSource('route-ida-progress', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: progressCoords.length >= 2 ? progressCoords : [fullCoords[0], fullCoords[0]],
          },
        },
      })
      map.current.addLayer({
        id: 'route-ida-progress',
        type: 'line',
        source: 'route-ida-progress',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#22c55e',
          'line-width': 5,
          'line-opacity': 0.95,
        },
      })
    }

    if (puntosRegreso.length > 1) {
      map.current.addSource('route-regreso', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: puntosRegreso.map(p => [p.lng!, p.lat!])
          }
        }
      })
      
      map.current.addLayer({
        id: 'route-regreso',
        type: 'line',
        source: 'route-regreso',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#fbbf24',
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1]
        }
      })
    }
  }

  const addRouteMarkers = (maplibregl: any) => {
    routeMarkers.current.forEach((m) => m.remove?.())
    routeMarkers.current = []

    const withCoords = puntosRuta.filter(p => p.lat != null && p.lng != null)
    const puntosIda = withCoords
      .filter((p) => p.tipo === 'ida')
      .sort((a, b) => a.orden - b.orden)
    const puntosRegreso = withCoords
      .filter((p) => p.tipo === 'regreso')
      .sort((a, b) => a.orden - b.orden)
    const mapaTurnos = new Map<string, number>()
    puntosIda.forEach((p, idx) => mapaTurnos.set(p.id, idx + 1))
    puntosRegreso.forEach((p, idx) => mapaTurnos.set(p.id, puntosIda.length + idx + 1))
    const turnoActual = typeof procesion.turno_actual === 'number' ? procesion.turno_actual : 0
    const turnosRuta = construirTurnosRuta(withCoords)
    const puntoActualId = turnosRuta.find((t) => t.turno === turnoActual)?.punto.id
    const markerImage = avatarUrl || escudoUrl

    withCoords.forEach((punto) => {
      const el = document.createElement('div')
      el.className = 'route-marker'
      const esPuntoActual = punto.id === puntoActualId

      if (esPuntoActual && markerImage) {
        el.style.cssText = `
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: #111827;
          border: 4px solid ${punto.tipo === 'ida' ? '#7c3aed' : '#fbbf24'};
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.4), 0 0 30px rgba(251, 191, 36, 0.35);
          overflow: hidden;
          cursor: pointer;
        `
        const img = document.createElement('img')
        img.src = markerImage
        img.alt = 'Punto actual'
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;'
        el.appendChild(img)
      } else {
        el.style.cssText = `
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${punto.tipo === 'ida' ? '#7c3aed' : '#fbbf24'};
          border: 3px solid ${punto.tipo === 'ida' ? '#4c1d95' : '#92400e'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: ${punto.tipo === 'ida' ? 'white' : '#1f2937'};
          cursor: pointer;
        `
        el.innerHTML = `${mapaTurnos.get(punto.id) ?? 0}`
      }

      const mk = new maplibregl.Marker({ element: el })
        .setLngLat([punto.lng!, punto.lat!])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 8px; color: #1f2937;">
                <strong>${punto.direccion || 'Punto'}</strong>
                <br/>
                <small style="color: ${punto.tipo === 'ida' ? '#7c3aed' : '#b45309'}">
                  ${punto.tipo === 'ida' ? 'Ida' : 'Regreso'} · Turno ${mapaTurnos.get(punto.id) ?? '-'}
                </small>
              </div>
            `)
        )
        .addTo(map.current)
      routeMarkers.current.push(mk)
    })
  }

  const addProcesionMarker = (maplibregl: any) => {
    const lat = procesion.ubicacion_lat
    const lng = procesion.ubicacion_lng
    if (lat == null || lng == null) return
    const el = document.createElement('div')
    el.className = 'procesion-marker'
    el.style.cssText = `
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #111827;
      border: 3px solid #fbbf24;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 14px rgba(251, 191, 36, 0.35), 0 0 28px rgba(124, 58, 237, 0.25);
      animation: pulse 2s ease-in-out infinite;
      overflow: hidden;
    `
    
    // Add pulse animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(124, 58, 237, 0.5), 0 0 40px rgba(251, 191, 36, 0.3); }
        50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(124, 58, 237, 0.7), 0 0 60px rgba(251, 191, 36, 0.5); }
      }
    `
    document.head.appendChild(style)
    
    const markerImage = avatarUrl || escudoUrl
    if (markerImage) {
      const img = document.createElement('img')
      img.src = markerImage
      img.alt = 'Imagen de referencia'
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;'
      el.appendChild(img)
    } else {
      el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      `
    }
    
    marker.current = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map.current)
  }

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 w-full h-full min-h-[300px]"
      style={{ background: '#0f172a' }}
    />
  )
}
