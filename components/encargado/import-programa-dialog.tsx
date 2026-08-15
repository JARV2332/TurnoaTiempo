'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { importarProgramaCompleto } from '@/app/encargado/procesiones/data-actions'
import {
  parseProgramaBulkText,
  resumenPrograma,
  type ProgramaImportPayload,
} from '@/lib/programa-import'
import { PRESET_VIRGEN_ASUNCION } from '@/lib/presets/virgen-asuncion-programa'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, Loader2, CheckCircle2, FileUp, Sparkles } from 'lucide-react'

interface ImportProgramaDialogProps {
  procesionId: string
  hasExistingData?: boolean
}

export function ImportProgramaDialog({
  procesionId,
  hasExistingData = false,
}: ImportProgramaDialogProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [reemplazar, setReemplazar] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const parsed: ProgramaImportPayload = useMemo(() => {
    if (text.trim()) return parseProgramaBulkText(text)
    return { turnos: [] }
  }, [text])
  const resumen = useMemo(() => resumenPrograma(parsed), [parsed])
  const presetResumen = useMemo(() => resumenPrograma(PRESET_VIRGEN_ASUNCION), [])

  const runImport = async (payload: ProgramaImportPayload) => {
    if (!payload.turnos.length) return
    setIsImporting(true)
    setError(null)
    setSuccess(null)

    const res = await importarProgramaCompleto(procesionId, payload.turnos, { reemplazar })
    if (!res.ok) {
      setError(res.error || 'Error al importar')
    } else {
      setSuccess(
        `Listo: ${res.turnos} turnos, ${res.piezas} sones/alabados y direcciones con coordenadas.`,
      )
      router.refresh()
    }
    setIsImporting(false)
  }

  const handleOneClickAsuncion = async () => {
    await runImport(PRESET_VIRGEN_ASUNCION)
  }

  const handleImportPasted = async () => {
    await runImport(parsed)
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    const content = await file.text()
    setText(content)
    setFileName(file.name)
    setShowAdvanced(true)
    setError(null)
    setSuccess(null)
  }

  const handleClose = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setError(null)
      setSuccess(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button type="button" variant="default">
          <Upload className="mr-2 h-4 w-4" />
          Subir programa completo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir programa completo</DialogTitle>
          <DialogDescription>
            Carga turnos, direcciones, coordenadas, sones y alabados de una sola vez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div>
              <p className="font-medium">Virgen de la Asunción (desde tu PDF)</p>
              <p className="text-sm text-muted-foreground">
                {presetResumen.turnos} turnos · {presetResumen.piezas} sones/alabados · direcciones y GPS
              </p>
            </div>
            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={handleOneClickAsuncion}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Subir todo ahora
            </Button>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="font-medium text-sm">O sube un archivo .tsv / .csv / .txt</p>
            <input
              ref={fileRef}
              type="file"
              accept=".tsv,.csv,.txt,text/plain,text/csv,text/tab-separated-values"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileRef.current?.click()}
              disabled={isImporting}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {fileName ? `Archivo: ${fileName}` : 'Elegir archivo'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Archivo listo en Descargas: <code>PROGRAMA-ASUNCION-LISTO-PARA-SUBIR.tsv</code>
            </p>
            {fileName && resumen.turnos > 0 && (
              <Button
                type="button"
                className="w-full"
                onClick={handleImportPasted}
                disabled={isImporting || resumen.turnos === 0}
              >
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Importar archivo ({resumen.turnos} turnos)
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
            <div>
              <Label htmlFor="reemplazar-programa">Reemplazar datos actuales</Label>
              <p className="text-xs text-muted-foreground">
                {hasExistingData
                  ? 'Borra sones y ruta actuales antes de cargar.'
                  : 'Recomendado al cargar un programa nuevo.'}
              </p>
            </div>
            <Switch
              id="reemplazar-programa"
              checked={reemplazar}
              onCheckedChange={setReemplazar}
            />
          </div>

          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-2"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? 'Ocultar pegado manual' : 'Mostrar pegado manual (avanzado)'}
          </button>

          {showAdvanced && (
            <div className="space-y-3">
              <Textarea
                placeholder="Pega aquí la tabla con tabuladores…"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setFileName(null)
                  setError(null)
                  setSuccess(null)
                }}
                className="bg-input/50 min-h-40 font-mono text-xs"
              />
              {resumen.turnos > 0 && (
                <p className="text-xs text-muted-foreground">
                  Vista previa: {resumen.turnos} turnos · {resumen.piezas} piezas ·{' '}
                  {resumen.conCoords} con GPS
                </p>
              )}
              <Button
                type="button"
                onClick={handleImportPasted}
                disabled={isImporting || resumen.turnos === 0}
              >
                Importar texto pegado
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 bg-green-500/10 p-2 rounded-md flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
