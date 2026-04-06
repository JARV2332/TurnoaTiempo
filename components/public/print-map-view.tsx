'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'
import { TrackingMap } from './tracking-map'
import type { Procesion, PuntoRuta } from '@/lib/types'

export function PrintMapView({
  procesion,
  puntosRuta,
  escudoUrl,
}: {
  procesion: Procesion
  puntosRuta: PuntoRuta[]
  escudoUrl?: string
}) {
  useEffect(() => {
    // Espera un tick para que el mapa pinte antes de abrir el diálogo.
    const t = setTimeout(() => {
      window.print()
    }, 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="print-page">
      <div className="print-hide fixed top-4 left-4 z-20 flex gap-2">
        <Button variant="outline" asChild className="glass">
          <Link href={`/seguimiento/${procesion.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Button variant="outline" className="glass" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>

      <div className="print-header print-only px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          {escudoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={escudoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted" />
          )}
          <div className="min-w-0">
            <div className="font-semibold truncate">{procesion.nombre}</div>
            <div className="text-sm text-muted-foreground truncate">
              {(procesion as any).hermandad?.nombre ?? ''}
            </div>
          </div>
        </div>
      </div>

      <div className="print-map relative">
        <TrackingMap procesion={procesion} puntosRuta={puntosRuta} escudoUrl={escudoUrl} />

        <div className="print-only absolute bottom-4 left-4 text-xs bg-background/80 border border-border rounded px-2 py-1">
          Ida (morado) / Regreso (oro). Progreso (verde) según turno.
        </div>
      </div>
    </div>
  )
}

