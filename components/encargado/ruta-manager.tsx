'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, MapPin, GripVertical, Trash2, Navigation } from 'lucide-react'
import type { Marcha, PuntoRuta } from '@/lib/types'
import { RutaMapEditor } from './ruta-map-editor'

interface RutaManagerProps {
  procesionId: string
  initialPuntos: PuntoRuta[]
  marchas: Marcha[]
}

export function RutaManager({ procesionId, initialPuntos, marchas }: RutaManagerProps) {
  const router = useRouter()
  const [puntos, setPuntos] = useState<PuntoRuta[]>(initialPuntos)
  const [newPunto, setNewPunto] = useState({ 
    direccion: '', 
    tipo: 'ida' as 'ida' | 'regreso',
    lat: '',
    lng: ''
  })
  const [useMapEditor, setUseMapEditor] = useState(true)
  const [pendingClick, setPendingClick] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const marchasPreview = useMemo(() => marchas, [marchas])

  const handleAddPunto = async () => {
    if (!newPunto.direccion.trim() || !newPunto.lat || !newPunto.lng) return
    
    setIsLoading(true)
    const supabase = createClient()
    
    const puntosDelTipo = puntos.filter(p => p.tipo === newPunto.tipo)
    
    const { data, error } = await supabase
      .from('puntos_ruta')
      .insert({
        procesion_id: procesionId,
        direccion: newPunto.direccion,
        tipo: newPunto.tipo,
        lat: parseFloat(newPunto.lat),
        lng: parseFloat(newPunto.lng),
        orden: puntosDelTipo.length,
      })
      .select()
      .single()
    
    if (!error && data) {
      setPuntos([...puntos, data])
      setNewPunto({ direccion: '', tipo: newPunto.tipo, lat: '', lng: '' })
    }
    
    setIsLoading(false)
    router.refresh()
  }

  const handleMapClick = (lat: number, lng: number) => {
    setPendingClick({ lat, lng })
    setNewPunto((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }))
  }

  const handleDeletePunto = async (id: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('puntos_ruta')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setPuntos(puntos.filter(p => p.id !== id))
    }
    
    router.refresh()
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewPunto((prev) => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const puntosIda = puntos.filter(p => p.tipo === 'ida').sort((a, b) => a.orden - b.orden)
  const puntosRegreso = puntos.filter(p => p.tipo === 'regreso').sort((a, b) => a.orden - b.orden)

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Editor visual de ruta
          </CardTitle>
          <CardDescription>
            Haz clic para crear puntos y ver la línea unida. Cada punto se numera como turno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Modo: {useMapEditor ? 'Mapa' : 'Manual'}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUseMapEditor((v) => !v)}
            >
              Cambiar a {useMapEditor ? 'Manual' : 'Mapa'}
            </Button>
          </div>

          {useMapEditor && (
            <RutaMapEditor
              puntos={puntos}
              tipo={newPunto.tipo}
              marchas={marchasPreview}
              onMapClick={handleMapClick}
            />
          )}

          {pendingClick && (
            <p className="text-xs text-muted-foreground">
              Punto seleccionado: {pendingClick.lat.toFixed(6)}, {pendingClick.lng.toFixed(6)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add new punto */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Añadir Punto de Ruta
          </CardTitle>
          <CardDescription>
            Define los puntos del recorrido de ida y regreso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Dirección / nombre del punto</Label>
              <Input
                placeholder="Ej: Salida de la Iglesia"
                value={newPunto.direccion}
                onChange={(e) => setNewPunto({ ...newPunto, direccion: e.target.value })}
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de ruta</Label>
              <Select 
                value={newPunto.tipo} 
                onValueChange={(v: 'ida' | 'regreso') => setNewPunto({ ...newPunto, tipo: v })}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ida">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Ida (Morado)
                    </span>
                  </SelectItem>
                  <SelectItem value="regreso">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      Regreso (Oro)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Latitud</Label>
              <Input
                placeholder="37.3891"
                value={newPunto.lat}
                onChange={(e) => setNewPunto({ ...newPunto, lat: e.target.value })}
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Longitud</Label>
              <Input
                placeholder="-5.9845"
                value={newPunto.lng}
                onChange={(e) => setNewPunto({ ...newPunto, lng: e.target.value })}
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="invisible">Acción</Label>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleGetCurrentLocation}
              >
                <Navigation className="mr-2 h-4 w-4" />
                Usar mi ubicación
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleAddPunto} 
            disabled={isLoading || !newPunto.direccion.trim() || !newPunto.lat || !newPunto.lng}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Añadir Punto
          </Button>
          <p className="text-xs text-muted-foreground">
            Turno asignado automáticamente por orden dentro de {newPunto.tipo}. Marcha sugerida: {marchas.length ? marchas[(puntos.filter(p => p.tipo === newPunto.tipo).length) % marchas.length]?.nombre : '—'}
          </p>
        </CardContent>
      </Card>
      
      {/* Ruta Ida */}
      <Card className="glass-card border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" />
            Ruta de Ida
          </CardTitle>
        </CardHeader>
        <CardContent>
          {puntosIda.length > 0 ? (
            <div className="space-y-2">
              {puntosIda.map((punto, index) => (
                <div 
                  key={punto.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 group"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-primary w-6">{index + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{punto.direccion}</p>
                    <p className="text-xs text-muted-foreground">
                      {punto.lat != null && punto.lng != null ? `${Number(punto.lat).toFixed(4)}, ${Number(punto.lng).toFixed(4)}` : ''}
                    </p>
                    {marchas.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Marcha sugerida: {marchas[index % marchas.length]?.nombre}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => handleDeletePunto(punto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay puntos de ida definidos
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Ruta Regreso */}
      <Card className="glass-card border-secondary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-secondary" />
            Ruta de Regreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {puntosRegreso.length > 0 ? (
            <div className="space-y-2">
              {puntosRegreso.map((punto, index) => (
                <div 
                  key={punto.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 group"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-secondary w-6">{index + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{punto.direccion}</p>
                    <p className="text-xs text-muted-foreground">
                      {punto.lat != null && punto.lng != null ? `${Number(punto.lat).toFixed(4)}, ${Number(punto.lng).toFixed(4)}` : ''}
                    </p>
                    {marchas.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Marcha sugerida: {marchas[index % marchas.length]?.nombre}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => handleDeletePunto(punto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay puntos de regreso definidos
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
