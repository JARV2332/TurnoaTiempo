'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type GeoPosition = {
  lat: number
  lng: number
  accuracy: number | null
}

/** Devuelve true si el código corre dentro de la app Android (Capacitor). */
function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

/**
 * Vigila la geolocalización del dispositivo.
 *
 * - En la app Android (Capacitor) usa el plugin nativo
 *   `@capacitor-community/background-geolocation`, que levanta un
 *   Foreground Service y sigue enviando coordenadas con la pantalla apagada.
 * - En el navegador usa el browser API `navigator.geolocation.watchPosition`.
 */
export function useGeolocationWatch(enabled: boolean) {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const browserWatchRef = useRef<number | null>(null)
  const bgWatcherIdRef = useRef<string | null>(null)

  const stopBrowser = useCallback(() => {
    if (browserWatchRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(browserWatchRef.current)
    }
    browserWatchRef.current = null
  }, [])

  const stopBackground = useCallback(() => {
    if (bgWatcherIdRef.current != null) {
      const bgGeo = (window as any).Capacitor?.Plugins?.BackgroundGeolocation
      bgGeo?.removeWatcher({ id: bgWatcherIdRef.current }).catch(() => {})
      bgWatcherIdRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    stopBrowser()
    stopBackground()
  }, [stopBrowser, stopBackground])

  useEffect(() => {
    if (!enabled) {
      stop()
      setPosition(null)
      setError(null)
      return
    }

    if (isCapacitorNative()) {
      // — Modo app Android: background geolocation nativo —
      const bgGeo = (window as any).Capacitor?.Plugins?.BackgroundGeolocation
      if (!bgGeo) {
        setError('Plugin de GPS en segundo plano no disponible en esta versión de la app.')
        return
      }

      bgGeo
        .addWatcher(
          {
            backgroundMessage:
              'Turno a Tiempo sigue rastreando tu ubicación para avanzar los turnos automáticamente.',
            backgroundTitle: 'GPS activo — Turno a Tiempo',
            requestPermissions: true,
            stale: false,
            distanceFilter: 2, // metros mínimos entre actualizaciones
          },
          (location: any, err: any) => {
            if (err) {
              if (err.code === 'NOT_AUTHORIZED') {
                setError('Permiso de ubicación denegado. Actívalo en Ajustes → Turno a Tiempo → Ubicación → Permitir siempre.')
              } else {
                setError(err.message ?? 'Error de geolocalización en segundo plano.')
              }
              return
            }
            if (location) {
              setPosition({
                lat: location.latitude,
                lng: location.longitude,
                accuracy: location.accuracy ?? null,
              })
              setError(null)
            }
          },
        )
        .then((watcherId: string) => {
          bgWatcherIdRef.current = watcherId
        })
        .catch((e: any) => {
          setError(e?.message ?? 'No se pudo iniciar el GPS en segundo plano.')
        })
    } else {
      // — Modo navegador: browser geolocation API —
      if (!navigator.geolocation) {
        setError('Este dispositivo no soporta geolocalización.')
        return
      }

      browserWatchRef.current = navigator.geolocation.watchPosition(
        (p) => {
          setPosition({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy,
          })
          setError(null)
        },
        () => setError('Permiso de ubicación denegado. Actívalo en ajustes del teléfono.'),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
      )
    }

    return () => stop()
  }, [enabled, stop])

  return { position, error, stop }
}
