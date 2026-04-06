'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MapPin, 
  Music, 
  Radio, 
  ChevronUp, 
  ChevronDown,
  Home,
  Navigation,
  AlertCircle,
  Printer
} from 'lucide-react'
import Link from 'next/link'
import type { Procesion, PuntoRuta } from '@/lib/types'
import { TrackingMap } from './tracking-map'

interface PublicTrackingViewProps {
  initialProcesion: Procesion & { hermandad?: { nombre: string; escudo_url?: string } }
  puntosRuta: PuntoRuta[]
}

export function PublicTrackingView({ initialProcesion, puntosRuta }: PublicTrackingViewProps) {
  const [procesion, setProcesion] = useState(initialProcesion)
  const [isPanelExpanded, setIsPanelExpanded] = useState(true)

  useEffect(() => {
    const client = createClient()
    const channel = client
      .channel(`procesion-${procesion.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'procesiones',
          filter: `id=eq.${procesion.id}`,
        },
        (payload) => {
          setProcesion((prev) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [procesion.id])

  const isLive = procesion.estado === 'en_curso'
  const hasLocation = procesion.ubicacion_lat != null && procesion.ubicacion_lng != null

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Map Container: flex-1 + min-h para que el mapa tenga altura y cargue */}
      <div className="flex-1 relative min-h-[300px]">
        <TrackingMap
          procesion={procesion}
          puntosRuta={puntosRuta}
          escudoUrl={procesion.hermandad?.escudo_url}
        />
        
        {/* Back button */}
        <Link 
          href="/"
          className="absolute top-4 left-4 z-10"
        >
          <Button variant="outline" size="icon" className="glass h-10 w-10">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          {isLive ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full glass">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-400">En directo</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full glass">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground"></span>
              <span className="text-sm font-medium text-muted-foreground">
                {procesion.estado === 'finalizada' ? 'Finalizada' : 'No iniciada'}
              </span>
            </div>
          )}
        </div>

        {/* Print */}
        <div className="absolute bottom-4 right-4 z-10">
          <Button variant="outline" className="glass" asChild>
            <Link href={`/seguimiento/${procesion.id}/imprimir`} target="_blank">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir mapa
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Info Panel */}
      <div className={`floating-panel bottom-0 left-0 right-0 transition-all duration-300 ${
        isPanelExpanded ? 'max-h-[60vh]' : 'max-h-24'
      }`}>
        {/* Drag Handle */}
        <button 
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground"
        >
          {isPanelExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
        
        {/* Header */}
        <div className="px-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            {procesion.hermandad?.escudo_url ? (
              <img 
                src={procesion.hermandad.escudo_url} 
                alt="" 
                className="h-12 w-12 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                <Radio className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate">{procesion.nombre}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {procesion.hermandad?.nombre}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        {isPanelExpanded && (
          <div className="p-4 space-y-4 overflow-auto max-h-[calc(60vh-8rem)]">
            {/* Current Status */}
            {isLive ? (
              <>
                {/* Turno */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-5 w-5 rounded bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                      T
                    </span>
                    Turno actual
                  </div>
                  <p className="text-xl font-semibold text-balance">
                    {procesion.turno_actual || 'Sin información'}
                  </p>
                </div>
                
                {/* Marcha */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Music className="h-5 w-5 text-secondary" />
                    Marcha sonando
                  </div>
                  <p className="text-xl font-semibold text-secondary text-balance">
                    {procesion.marcha_actual || 'Sin información'}
                  </p>
                </div>
                
                {/* Location indicator */}
                {hasLocation && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Navigation className="h-4 w-4" />
                    Ubicación actualizada en tiempo real
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">
                  {procesion.estado === 'finalizada' 
                    ? 'Procesión finalizada' 
                    : 'Procesión no iniciada'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {procesion.estado === 'finalizada' 
                    ? 'Esta procesión ya ha concluido su recorrido.'
                    : 'El seguimiento en tiempo real comenzará cuando la procesión se inicie.'}
                </p>
                {procesion.fecha && procesion.estado === 'programada' && (
                  <p className="text-sm mt-2 text-primary">
                    Programada para: {new Date(procesion.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                )}
              </div>
            )}
            
            {/* Route Legend */}
            {puntosRuta.length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Recorrido</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm">Ida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-secondary" />
                    <span className="text-sm">Regreso</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
