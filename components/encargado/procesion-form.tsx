'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarProcesion } from '@/app/encargado/procesiones/data-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Procesion, Hermandad } from '@/lib/types'

interface ProcesionFormProps {
  procesion?: Procesion
  hermandades: Hermandad[]
  userHermandadId?: string
  isSuperAdmin?: boolean
}

export function ProcesionForm({ procesion, hermandades, userHermandadId, isSuperAdmin }: ProcesionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hermandadId, setHermandadId] = useState(procesion?.hermandad_id || userHermandadId || '')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await guardarProcesion({
        id: procesion?.id,
        nombre: formData.get('nombre') as string,
        descripcion: (formData.get('descripcion') as string) || null,
        fecha: (formData.get('fecha') as string) || new Date().toISOString().slice(0, 10),
        hermandad_id: hermandadId,
        estado: procesion?.estado || 'programada',
      })

      if (!res.ok) throw new Error(res.error)

      router.push('/encargado')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Información de la Procesión</CardTitle>
          <CardDescription>
            Introduce los datos de la procesión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hermandad selector - only for superadmin */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="hermandad">Hermandad *</Label>
              <Select value={hermandadId} onValueChange={setHermandadId} required>
                <SelectTrigger className="bg-input/50">
                  <SelectValue placeholder="Selecciona una hermandad" />
                </SelectTrigger>
                <SelectContent>
                  {hermandades.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Procesión *</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              defaultValue={procesion?.nombre}
              placeholder="Ej: Procesión del Viernes Santo 2024"
              className="bg-input/50"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha *</Label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              required
              defaultValue={procesion?.fecha?.slice(0, 10) || ''}
              className="bg-input/50"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              defaultValue={procesion?.descripcion ?? ''}
              placeholder="Descripción opcional de la procesión"
              className="bg-input/50 min-h-20"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : procesion ? 'Actualizar' : 'Crear Procesión'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
