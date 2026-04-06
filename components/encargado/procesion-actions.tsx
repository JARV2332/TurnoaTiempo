'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Trash2, ExternalLink, AlertTriangle, Copy } from 'lucide-react'
import Link from 'next/link'
import type { Procesion } from '@/lib/types'

interface ProcesionActionsProps {
  procesion: Procesion
}

export function ProcesionActions({ procesion }: ProcesionActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [dupNombre, setDupNombre] = useState(`${procesion.nombre} (copia)`)
  const [dupFecha, setDupFecha] = useState(
    (procesion.fecha ? procesion.fecha.slice(0, 10) : new Date().toISOString().slice(0, 10))
  )
  const [dupError, setDupError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('procesiones')
      .delete()
      .eq('id', procesion.id)
    
    if (!error) {
      router.push('/encargado')
      router.refresh()
    }
    
    setIsDeleting(false)
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    setDupError(null)
    const supabase = createClient()

    try {
      // 1) Traer marchas y puntos de la procesión original
      const [{ data: marchas, error: marchasError }, { data: puntos, error: puntosError }] =
        await Promise.all([
          supabase.from('marchas').select('*').eq('procesion_id', procesion.id).order('orden'),
          supabase.from('puntos_ruta').select('*').eq('procesion_id', procesion.id).order('orden'),
        ])

      if (marchasError) throw marchasError
      if (puntosError) throw puntosError

      // 2) Crear la nueva procesión (reseteada para “reiniciar”)
      const { data: nuevaProcesion, error: insertProcesionError } = await supabase
        .from('procesiones')
        .insert({
          hermandad_id: procesion.hermandad_id,
          nombre: dupNombre.trim() || `${procesion.nombre} (copia)`,
          descripcion: procesion.descripcion ?? null,
          fecha: dupFecha,
          total_turnos: procesion.total_turnos ?? 1,
          avatar_url: procesion.avatar_url ?? null,
          turno_actual: 1,
          marcha_actual: null,
          ubicacion_lat: null,
          ubicacion_lng: null,
          transmitiendo: false,
          estado: 'programada',
        })
        .select()
        .single()

      if (insertProcesionError) throw insertProcesionError

      // 3) Copiar marchas
      if (marchas && marchas.length > 0) {
        const payload = marchas.map((m: any) => ({
          procesion_id: nuevaProcesion.id,
          nombre: m.nombre,
          autor: m.autor ?? null,
          orden: m.orden ?? 0,
        }))
        const { error } = await supabase.from('marchas').insert(payload)
        if (error) throw error
      }

      // 4) Copiar puntos de ruta
      if (puntos && puntos.length > 0) {
        const payload = puntos.map((p: any) => ({
          procesion_id: nuevaProcesion.id,
          direccion: p.direccion,
          lat: p.lat ?? null,
          lng: p.lng ?? null,
          orden: p.orden,
          tipo: p.tipo,
        }))
        const { error } = await supabase.from('puntos_ruta').insert(payload)
        if (error) throw error
      }

      router.push(`/encargado/procesiones/${nuevaProcesion.id}`)
      router.refresh()
    } catch (e: unknown) {
      setDupError(e instanceof Error ? e.message : 'Error al duplicar la procesión')
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Información de la Procesión</CardTitle>
          <CardDescription>
            Detalles y configuración general
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{procesion.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {procesion.fecha 
                  ? new Date(procesion.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Sin fecha definida'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="font-medium capitalize">{procesion.estado.replace('_', ' ')}</p>
            </div>
            {procesion.descripcion && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{procesion.descripcion}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <Button variant="outline" asChild>
              <Link href={`/seguimiento/${procesion.id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver página pública
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Duplicar / reutilizar */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Reutilizar procesión</CardTitle>
          <CardDescription>
            Duplica esta procesión con su ruta y marchas para iniciar otra fecha.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dup-nombre">Nombre</Label>
              <Input
                id="dup-nombre"
                value={dupNombre}
                onChange={(e) => setDupNombre(e.target.value)}
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dup-fecha">Fecha</Label>
              <Input
                id="dup-fecha"
                type="date"
                value={dupFecha}
                onChange={(e) => setDupFecha(e.target.value)}
                className="bg-input/50"
              />
            </div>
          </div>

          {dupError && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {dupError}
            </p>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isDuplicating || !dupFecha}>
                <Copy className="mr-2 h-4 w-4" />
                {isDuplicating ? 'Duplicando...' : 'Duplicar procesión'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Duplicar procesión?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se creará una nueva procesión con la misma ruta y marchas, en estado “programada”.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDuplicate}>
                  Duplicar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      
      {/* Danger Zone */}
      <Card className="glass-card border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones irreversibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Procesión
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar procesión?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la procesión {'"'}{procesion.nombre}{'"'} 
                  junto con todas sus marchas y puntos de ruta. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
