'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  iniciarProcesion,
  finalizarProcesion,
  aplicarTurnoProcesion,
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
import { Radio, Music, Play, Square, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Procesion, Marcha, PuntoRuta } from '@/lib/types'
import { obtenerPiezaPorTurno, obtenerPiezasPorTurno } from '@/lib/musica'
import { construirTurnosRuta } from '@/lib/turnos'

interface LiveControlPanelProps {
  procesion: Procesion & { hermandad?: { nombre: string; escudo_url?: string } }
  marchas: Marcha[]
  puntosRuta: PuntoRuta[]
}

export function LiveControlPanel({ procesion, marchas, puntosRuta }: LiveControlPanelProps) {
  const router = useRouter()
  const turnosRuta = construirTurnosRuta(puntosRuta)
  const totalTurnos = Math.max(procesion.total_turnos || 1, turnosRuta.length, 1)

  const [isLive, setIsLive] = useState(procesion.estado === 'en_curso')
  const turnoActualDb = typeof procesion.turno_actual === 'number' ? procesion.turno_actual : 0
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string>('')
  const [mostrarUsados, setMostrarUsados] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Aplicar numero de turno: actualiza turno, pieza y posicion en el mapa
  const aplicarTurno = async () => {
    const num = parseInt(turnoSeleccionado, 10)
    if (Number.isNaN(num) || num < 1 || num > totalTurnos) return
    setIsUpdating(true)

    const piezaParaTurno = obtenerPiezaPorTurno(marchas, num)?.nombre ?? null
    const punto = turnosRuta.find((t) => t.turno === num)?.punto
    const lat = punto && punto.lat != null ? punto.lat : null
    const lng = punto && punto.lng != null ? punto.lng : null

    const res = await aplicarTurnoProcesion(procesion.id, {
      turno_actual: num,
      marcha_actual: piezaParaTurno,
      ubicacion_lat: lat,
      ubicacion_lng: lng,
    })

    if (res.ok) {
      // Ocultar el turno ya usado: limpiamos selección y la UI mostrará solo pendientes
      setTurnoSeleccionado('')
    }
    setIsUpdating(false)
    router.refresh()
  }

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
      router.push('/encargado')
    }
    setIsUpdating(false)
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] flex flex-col -m-4 md:-m-6">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={`/encargado/procesiones/${procesion.id}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-sm truncate max-w-[200px]">
                {procesion.nombre}
              </h1>
              <p className="text-xs text-muted-foreground">
                {procesion.hermandad?.nombre}
              </p>
            </div>
          </div>
          
          {isLive && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-400 font-medium">EN VIVO</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {/* Status Card */}
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
                className="w-full bg-green-600 hover:bg-green-700"
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

        {/* Número de turno: al aplicarlo se actualiza turno, marcha y posición en el mapa */}
        {isLive && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                  T
                </span>
                Turno (pendientes)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={turnoSeleccionado} onValueChange={setTurnoSeleccionado}>
                  <SelectTrigger className="bg-input/50 h-12 text-base flex-1">
                    <SelectValue placeholder="Selecciona el turno siguiente" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: totalTurnos }, (_, i) => i + 1)
                      // Oculta turnos ya usados: todos los <= turno_actual guardado
                      .filter((t) => (mostrarUsados ? true : t > turnoActualDb))
                      .map((t) => {
                        const punto = turnosRuta.find((item) => item.turno === t)?.punto
                        const marchasTurno = obtenerPiezasPorTurno(marchas, t)
                        const marcha = marchasTurno.map((m) => m.nombre).join(', ')
                        const labelDireccion = punto?.direccion ? ` — ${punto.direccion}` : ''
                        return (
                          <SelectItem key={t} value={String(t)}>
                            <div className="flex flex-col">
                              <span className="font-medium">Turno {t}{labelDireccion}</span>
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
                  <p className="text-xs text-muted-foreground">
                    Mostrar turnos usados para corregir si hubo un error
                  </p>
                </div>
                <Switch checked={mostrarUsados} onCheckedChange={setMostrarUsados} />
              </div>
              <p className="text-xs text-muted-foreground">
                {mostrarUsados
                  ? 'Mostrando todos los turnos (incluye usados). Al aplicar se corrige turno, son/alabado y posicion en el mapa.'
                  : 'Se muestran solo los turnos pendientes. Al aplicar se actualiza turno, son/alabado y posicion en el mapa.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Son/Alabado actual (se determina por turno aplicado) */}
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
                <p className="text-xs text-muted-foreground mb-1">Sonando ahora:</p>
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
                  Ver seguimiento publico
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
