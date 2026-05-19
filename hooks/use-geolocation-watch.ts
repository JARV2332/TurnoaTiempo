'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type GeoPosition = {
  lat: number
  lng: number
  accuracy: number | null
}

export function useGeolocationWatch(enabled: boolean) {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    watchIdRef.current = null
  }, [])

  useEffect(() => {
    if (!enabled) {
      stop()
      setPosition(null)
      setError(null)
      return
    }

    if (!navigator.geolocation) {
      setError('Este dispositivo no soporta geolocalización.')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
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

    return () => stop()
  }, [enabled, stop])

  return { position, error, stop }
}
