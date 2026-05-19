'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Radio, Play } from 'lucide-react'
import Link from 'next/link'
import { formatearFechaISO } from '@/lib/fecha'
import { withAppControl } from '@/lib/app-control'
import type { Procesion } from '@/lib/types'

type ProcesionRow = Procesion & { hermandad?: { nombre: string; escudo_url?: string } }

type EncargadoAppHomeProps = {
  procesionActiva?: ProcesionRow
  procesionesProgram: ProcesionRow[]
}

/** Vista reducida para la app Android (?app=control). */
export function EncargadoAppHome({ procesionActiva, procesionesProgram }: EncargadoAppHomeProps) {
  const link = (href: string) => withAppControl(href, true)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Control en campo</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Elige la procesión y abre el panel en vivo. Ruta y sones se configuran desde la web en el ordenador.
        </p>
      </div>

      {procesionActiva && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-400 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              En curso ahora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-lg">{procesionActiva.nombre}</p>
              <p className="text-sm text-muted-foreground">{procesionActiva.hermandad?.nombre}</p>
            </div>
            <Button asChild className="w-full h-12 bg-green-600 hover:bg-green-700">
              <Link href={link(`/encargado/control/${procesionActiva.id}`)}>
                <Radio className="mr-2 h-5 w-5" />
                Abrir control en vivo
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {procesionesProgram.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Programadas</h2>
          {procesionesProgram.map((procesion) => (
            <Card key={procesion.id} className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{procesion.nombre}</CardTitle>
                <CardDescription>
                  {procesion.fecha
                    ? formatearFechaISO(procesion.fecha, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })
                    : 'Sin fecha'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full h-11">
                  <Link href={link(`/encargado/control/${procesion.id}`)}>
                    <Play className="mr-2 h-4 w-4" />
                    Panel de control
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!procesionActiva && procesionesProgram.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            No hay procesiones programadas ni en curso. Configúralas desde turnoatiempo.com en el navegador.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
