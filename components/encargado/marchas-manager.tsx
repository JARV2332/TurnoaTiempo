'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  insertarMarcha,
  eliminarMarcha,
  eliminarTodasMarchas,
  limpiarProgramaProcesion,
} from '@/app/encargado/procesiones/data-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Music, Trash2, Loader2 } from 'lucide-react'
import { ImportMarchasDialog } from '@/components/encargado/import-marchas-dialog'
import { ImportProgramaDialog } from '@/components/encargado/import-programa-dialog'
import type { Marcha } from '@/lib/types'

interface MarchasManagerProps {
  procesionId: string
  initialMarchas: Marcha[]
  totalTurnos: number
  turnosRuta: { turno: number; direccion: string }[]
}

export function MarchasManager({
  procesionId,
  initialMarchas,
  totalTurnos,
  turnosRuta,
}: MarchasManagerProps) {
  const router = useRouter()
  const [marchas, setMarchas] = useState<Marcha[]>(initialMarchas)
  const [newMarcha, setNewMarcha] = useState({ nombres: '', autor: '', turnoInicial: '1' })
  const [isLoading, setIsLoading] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    setMarchas(initialMarchas)
  }, [initialMarchas])

  const maxTurnoExistente = marchas.reduce((max, m) => Math.max(max, m.turno ?? 0), 0)
  const turnosFallback = Array.from(
    { length: Math.max(totalTurnos, maxTurnoExistente, 1) },
    (_, i) => ({ turno: i + 1, direccion: '' }),
  )
  const turnosDisponibles = turnosRuta.length > 0 ? turnosRuta : turnosFallback

  const handleAddMarcha = async () => {
    const nombres = newMarcha.nombres
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean)
    const turnoInicial = parseInt(newMarcha.turnoInicial, 10)
    if (!nombres.length || Number.isNaN(turnoInicial) || turnoInicial < 1) return

    setIsLoading(true)

    const nuevasMarchas: Marcha[] = []
    for (const [index, nombre] of nombres.entries()) {
      const res = await insertarMarcha({
        procesionId,
        nombre,
        autor: newMarcha.autor || null,
        orden: marchas.length + index,
        turno: turnoInicial,
      })
      if (res.ok && res.marcha) {
        nuevasMarchas.push(res.marcha)
      }
    }

    if (nuevasMarchas.length > 0) {
      setMarchas([...marchas, ...nuevasMarchas])
      setNewMarcha({ ...newMarcha, nombres: '' })
    }

    setIsLoading(false)
    router.refresh()
  }

  const handleDeleteMarcha = async (id: string) => {
    const res = await eliminarMarcha(id, procesionId)
    if (res.ok) {
      setMarchas(marchas.filter((m) => m.id !== id))
    }
    router.refresh()
  }

  const handleEliminarTodasMarchas = async () => {
    setIsClearing(true)
    const res = await eliminarTodasMarchas(procesionId)
    if (res.ok) setMarchas([])
    setIsClearing(false)
    router.refresh()
  }

  const handleLimpiarTodo = async () => {
    setIsClearing(true)
    const res = await limpiarProgramaProcesion(procesionId)
    if (res.ok) setMarchas([])
    setIsClearing(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-secondary" />
            Sones y Alabados
          </CardTitle>
          <CardDescription>
            Agrega varias piezas y asignalas al turno seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            <ImportProgramaDialog
              procesionId={procesionId}
              hasExistingData={marchas.length > 0 || turnosRuta.length > 0}
            />
            <ImportMarchasDialog procesionId={procesionId} existingCount={marchas.length} />
          </div>

          {(marchas.length > 0 || turnosRuta.length > 0) && (
            <div className="flex flex-wrap gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isClearing || marchas.length === 0}
                    className="text-destructive border-destructive/40 hover:bg-destructive/10"
                  >
                    {isClearing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Borrar todos los sones ({marchas.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Borrar todos los sones y alabados?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminarán las {marchas.length} piezas de esta procesión. La ruta/turnos se
                      mantienen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEliminarTodasMarchas}>
                      Sí, borrar sones
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm" disabled={isClearing}>
                    {isClearing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Borrar todo (sones + ruta)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Borrar el programa completo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminarán todos los sones/alabados y todos los puntos de ruta/turnos de
                      esta procesión. Luego puedes volver a subir el archivo correcto.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLimpiarTodo}>
                      Sí, borrar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label>Nombres (uno por línea)</Label>
              <Textarea
                placeholder={'Sones del silencio\nAlabado de la aurora'}
                value={newMarcha.nombres}
                onChange={(e) => setNewMarcha({ ...newMarcha, nombres: e.target.value })}
                className="bg-input/50 min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                Todo el listado se guardara en el mismo turno elegido.
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Autor (opcional)</Label>
                <Input
                  placeholder="Autor o banda"
                  value={newMarcha.autor}
                  onChange={(e) => setNewMarcha({ ...newMarcha, autor: e.target.value })}
                  className="bg-input/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Turno inicial</Label>
                <Select
                  value={newMarcha.turnoInicial}
                  onValueChange={(value) => setNewMarcha({ ...newMarcha, turnoInicial: value })}
                >
                  <SelectTrigger className="bg-input/50">
                    <SelectValue placeholder="Selecciona turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {turnosDisponibles.map((item) => (
                      <SelectItem key={item.turno} value={String(item.turno)}>
                        Turno {item.turno}
                        {item.direccion ? ` — ${item.direccion}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddMarcha}
                disabled={isLoading || !newMarcha.nombres.trim() || !newMarcha.turnoInicial}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          {marchas.length > 0 ? (
            <div className="space-y-2">
              {marchas.map((marcha, index) => (
                <div
                  key={marcha.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
                >
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{marcha.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      Turno asignado: {marcha.turno ?? 'Sin turno'}
                    </p>
                    {marcha.autor && (
                      <p className="text-sm text-muted-foreground truncate">{marcha.autor}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteMarcha(marcha.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Music className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay sones o alabados añadidos todavia
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
