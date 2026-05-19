'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  iniciarProcesion,
  finalizarProcesion,
  aplicarTurnoProcesion,
  actualizarUbicacionEnVivo,
} from '@/app/encargado/control/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Radio, Music, Play, Square, ArrowLeft, Loader2, Navigation, SkipForward } from 'lucide-react'
import Link from 'next/link'
import type { Procesion, Marcha, PuntoRuta } from '@/lib/types'
import { obtenerPiezaPorTurno, obtenerPiezasPorTurno } from '@/lib/musica'
import { construirTurnosRuta } from '@/lib/turnos'
import { distanciaMetros, RADIO_TURNO_METROS } from '@/lib/geo'
import { useGeolocationWatch } from '@/hooks/use-geolocation-watch'
import { isAppControlClient, persistAppControlSession, withAppControl } from '@/lib/app-control'

const AUTO_COOLDOWN_MS = 45_000
const UBICACION_THROTTLE_MS = 12_000

interface LiveControlPanelProps {
  procesion: Procesion & { hermandad?: { nombre: string; escudo_url?: string } }
  marchas: Marcha[]
  puntosRuta: PuntoRuta[]
}

export function LiveControlPanel({ procesion, marchas, puntosRuta }: LiveControlPanelProps) {
  const router = useRouter()
  const turnosRuta = construirTurnosRuta(puntosRuta)
  const totalTurnos = Math.max(procesion.total_turnos || 1, turnosRuta.length, 1)

  const [appControl, setAppControl] = useState(false)
  const [isLive, setIsLive] = useState(procesion.estado === 'en_curso')
  const turnoActualDb = typeof procesion.turno_actual === 'number' ? procesion.turno_actual : 0
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('')
  const [mostrarUsados, setMostrarUsados] = useState(false)
  const [modoAutomatico, setModoAutomatico] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [autoStatus, setAutoStatus] = useState<string | null>(null)

  const lastAutoRef = useRef(0)
  const lastUbicacionRef = useRef(0)
  const turnoActualRef = useRef(turnoActualDb)
  turnoActualRef.current = turnoActualDb

  const gpsEnabled = isLive && (modoAutomatico || appControl)
  const { position: gpsPosition, error: gpsError } = useGeolocationWatch(gpsEnabled)

  useEffect(() => {
    persistAppControlSession()
    setAppControl(isAppControlClient())
  }, [])

  const link = (href: string) => withAppControl(href, appControl)

  const aplicarTurnoNumero = useCallback(
    async (num: number) => {
      if (num < 1 || num > totalTurnos) return false
      setIsUpdating(true)

      const piezaParaTurno = obtenerPiezaPorTurno(marchas, num)?.nombre ?? null
      const punto = turnosRuta.find((t) => t.turno === num)?.punto
      const lat = punto?.lat != null ? punto.lat : null
      const lng = punto?.lng != null ? punto.lng : null

      const res = await aplicarTurnoProcesion(procesion.id, {
        turno_actual: num,
        marcha_actual: piezaParaTurno,
        ubicacion_lat: lat,
        ubicacion_lng: lng,
      })

      setIsUpdating(false)
      if (res.ok) {
        setTurnoSeleccionado('')
        router.refresh()
        return true
      }
      return false
    },
    [marchas, procesion.id, router, totalTurnos, turnosRuta],
  )

  const aplicarTurno = () => {
    const num = parseInt(turnoSeleccionado, 10)
    if (Number.isNaN(num)) return
    void aplicarTurnoNumero(num)
  }

  const handleSiguienteTurno = async () => {
    const siguiente = turnoActualRef.current < 1 ? 1 : turnoActualRef.current + 1
    if (siguiente > totalTurnos) return
    await aplicarTurnoNumero(siguiente)
  }

  useEffect(() => {
    if (!isLive || !gpsPosition) return

    const now = Date.now()
    if (now - lastUbicacionRef.current >= UBICACION_THROTTLE_MS) {
      lastUbicacionRef.current = now
      void actualizarUbicacionEnVivo(procesion.id, gpsPosition.lat, gpsPosition.lng)
    }
  }, [gpsPosition, isLive, procesion.id])

  useEffect(() => {
    if (!isLive || !modoAutomatico || !gpsPosition) {
      setAutoStatus(null)
      return
    }

    const siguiente = turnoActualRef.current < 1 ? 1 : turnoActualRef.current + 1
    if (siguiente > totalTurnos) {
      setAutoStatus('Todos los turnos aplicados.')
      return
    }

    const punto = turnosRuta.find((t) => t.turno === siguiente)?.punto
    if (punto?.lat == null || punto?.lng == null) {
      setAutoStatus(`Turno ${siguiente} sin coordenadas en la ruta.`)
      return
    }

    const dist = distanciaMetros(gpsPosition.lat, gpsPosition.lng, punto.lat, punto.lng)
    setAutoStatus(
      `Siguiente: turno ${siguiente} · ~${Math.round(dist)} m (umbral ${RADIO_TURNO_METROS} m)`,
    )

    if (dist <= RADIO_TURNO_METROS) {
      const now = Date.now()
      if (now - lastAutoRef.current < AUTO_COOLDOWN_MS) return
      lastAutoRef.current = now
      void aplicarTurnoNumero(siguiente)
    }
  }, [
    gpsPosition,
    isLive,
    modoAutomatico,
    totalTurnos,
    turnosRuta,
    aplicarTurnoNumero,
    turnoActualDb,
  ])

  const handleStartProcesion = async () => {
    setIsUpdating(true)
    const res = await iniciarProcesion(procesion.id)
    if (res.ok) setIsLive(true)
    setIsUpdating(false)
    router.refresh()
  }

  const handleStopProcesion = async () => {
    setIsUpdating(true)
    const res = await finalizarProcesion(procesion.id)
    if (res.ok) {
      setIsLive(false)
      setModoAutomatico(false)
      router.push(link('/encargado'))
    }
    setIsUpdating(false)
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] flex flex-col -m-4 md:-m-6">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={link('/encargado')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-sm truncate max-w-[200px]">{procesion.nombre}</h1>
              <p className="text-xs text-muted-foreground">{procesion.hermandad?.nombre}</p>
            </div>
          </div>

          {isLive && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="text-xs text-green-400 font-medium">EN VIVO</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
        <Card className={`glass-card ${isLive ? 'border-green-500/50' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className={`h-5 w-5 ${isLive ? 'text-green-500' : 'text-muted-foreground'}`} />
              Estado de la Procesión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLive ? (
              <Button
                onClick={handleStartProcesion}
                className="w-full bg-green-600 hover:bg-green-700 h-12"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Iniciar Procesión
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={isUpdating}>
                    <Square className="mr-2 h-4 w-4" />
                    Finalizar Procesión
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Finalizar procesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esto detendrá el seguimiento en tiempo real y marcará la procesión como finalizada.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleStopProcesion}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Finalizar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>

        {isLive && (
          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Avance de turno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                className="w-full h-14 text-base"
                onClick={handleSiguienteTurno}
                disabled={isUpdating || turnoActualDb >= totalTurnos}
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <SkipForward className="mr-2 h-5 w-5" />
                )}
                Siguiente turno
                {turnoActualDb < totalTurnos
                  ? ` (${turnoActualDb < 1 ? 1 : turnoActualDb + 1} / ${totalTurnos})`
                  : ''}
              </Button>

              <div className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-3">
                <div className="space-y-0.5 pr-3">
                  <p className="text-sm font-medium">Modo automático (GPS)</p>
                  <p className="text-xs text-muted-foreground">
                    Al acercarte al punto del siguiente turno (~{RADIO_TURNO_METROS} m), se aplica solo.
                  </p>
                </div>
                <Switch checked={modoAutomatico} onCheckedChange={setModoAutomatico} />
              </div>

              {modoAutomatico && (
                <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground space-y-1">
                  {gpsError && <p className="text-destructive">{gpsError}</p>}
                  {gpsPosition && (
                    <p>
                      GPS: {gpsPosition.lat.toFixed(5)}, {gpsPosition.lng.toFixed(5)}
                      {gpsPosition.accuracy != null ? ` (±${Math.round(gpsPosition.accuracy)} m)` : ''}
                    </p>
                  )}
                  {autoStatus && <p>{autoStatus}</p>}
                  {!gpsError && !gpsPosition && <p>Esperando señal GPS…</p>}
                  <p className="text-[11px]">
                    Mantén la app abierta y concede ubicación. En la calle puedes corregir con manual abajo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isLive && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                  T
                </span>
                Turno manual / corrección
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={turnoSeleccionado} onValueChange={setTurnoSeleccionado}>
                  <SelectTrigger className="bg-input/50 h-12 text-base flex-1">
                    <SelectValue placeholder="Elegir turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: totalTurnos }, (_, i) => i + 1)
                      .filter((t) => (mostrarUsados ? true : t > turnoActualDb))
                      .map((t) => {
                        const punto = turnosRuta.find((item) => item.turno === t)?.punto
                        const marchasTurno = obtenerPiezasPorTurno(marchas, t)
                        const marcha = marchasTurno.map((m) => m.nombre).join(', ')
                        const labelDireccion = punto?.direccion ? ` — ${punto.direccion}` : ''
                        return (
                          <SelectItem key={t} value={String(t)}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Turno {t}
                                {labelDireccion}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Sones/Alabados: {marcha || '—'}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
                <Button
                  onClick={aplicarTurno}
                  disabled={isUpdating || !turnoSeleccionado}
                  className="h-12 px-6"
                >
                  {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Aplicar'}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Modo corrección</p>
                  <p className="text-xs text-muted-foreground">Mostrar turnos ya usados</p>
                </div>
                <Switch checked={mostrarUsados} onCheckedChange={setMostrarUsados} />
              </div>
            </CardContent>
          </Card>
        )}

        {isLive && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Music className="h-5 w-5 text-secondary" />
                Son/Alabado Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const piezas = obtenerPiezasPorTurno(marchas, turnoActualDb)
                return (
                  <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">Sonando ahora (turno {turnoActualDb || '—'}):</p>
                    {piezas.length > 0 ? (
                      <div className="space-y-1">
                        {piezas.map((pieza) => (
                          <p key={pieza.id} className="font-medium text-secondary">
                            {pieza.nombre}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium text-secondary">
                        {procesion.marcha_actual || 'Sin son/alabado'}
                      </p>
                    )}
                  </div>
                )
              })()}
              <Button variant="outline" size="sm" asChild className="mt-3">
                <Link href={`/seguimiento/${procesion.id}`} target="_blank">
                  Ver seguimiento público
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
