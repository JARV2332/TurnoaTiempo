'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarHermandad } from '@/app/admin/admin-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Church, Upload, X } from 'lucide-react'
import type { Hermandad } from '@/lib/types'

interface HermandadFormProps {
  hermandad?: Hermandad
}

export function HermandadForm({ hermandad }: HermandadFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [escudoPreview, setEscudoPreview] = useState<string | null>(hermandad?.escudo_url || null)
  const [escudoFile, setEscudoFile] = useState<File | null>(null)

  const comprimirImagen = async (file: File): Promise<File> => {
    const imageBitmap = await createImageBitmap(file)
    const maxSide = 1600
    const scale = Math.min(1, maxSide / Math.max(imageBitmap.width, imageBitmap.height))
    const width = Math.max(1, Math.round(imageBitmap.width * scale))
    const height = Math.max(1, Math.round(imageBitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(imageBitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.82),
    )
    imageBitmap.close()
    if (!blob) return file

    const maxBytes = 8 * 1024 * 1024 // 8MB final para evitar fallos en request
    if (blob.size <= maxBytes) {
      return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' })
    }

    // Segunda pasada más agresiva
    const blob2 = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.68),
    )
    if (!blob2) return file
    return new File([blob2], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' })
  }

  const handleEscudoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setError(null)
      setIsProcessingImage(true)
      try {
        const processed = await comprimirImagen(file)
        setEscudoFile(processed)
        const reader = new FileReader()
        reader.onloadend = () => {
          setEscudoPreview(reader.result as string)
        }
        reader.readAsDataURL(processed)
      } catch {
        setError('No se pudo procesar la imagen. Intenta con otra.')
      } finally {
        setIsProcessingImage(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    if (escudoFile) {
      formData.set('escudo', escudoFile)
    }

    try {
      const res = await guardarHermandad(formData)
      if (!res.ok) throw new Error(res.error)

      router.push('/admin/hermandades')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {hermandad && (
        <>
          <input type="hidden" name="hermandad_id" value={hermandad.id} />
          <input type="hidden" name="existing_escudo_url" value={hermandad.escudo_url ?? ''} />
        </>
      )}
      {!hermandad && <input type="hidden" name="existing_escudo_url" value="" />}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Información de la Hermandad</CardTitle>
          <CardDescription>
            Introduce los datos de la hermandad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Escudo upload */}
          <div className="space-y-2">
            <Label>Escudo</Label>
            <div className="flex items-center gap-4">
              {escudoPreview ? (
                <div className="relative">
                  <img 
                    src={escudoPreview} 
                    alt="Preview" 
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => {
                      setEscudoPreview(null)
                      setEscudoFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center">
                  <Church className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <Label
                  htmlFor="escudo"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Subir imagen
                </Label>
                <Input
                  id="escudo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEscudoChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Puedes subir imagen grande; se optimiza automaticamente antes de guardar.
                </p>
                {isProcessingImage && (
                  <p className="text-xs text-primary mt-1">Procesando imagen...</p>
                )}
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              defaultValue={hermandad?.nombre}
              placeholder="Nombre de la hermandad"
              className="bg-input/50"
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
        <Button type="submit" disabled={isLoading || isProcessingImage}>
          {isLoading ? 'Guardando...' : hermandad ? 'Actualizar' : 'Crear Hermandad'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
