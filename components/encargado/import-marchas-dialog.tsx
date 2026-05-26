'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { importarMarchasBulk } from '@/app/encargado/procesiones/data-actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'

type ParsedRow = {
  turno: number
  turnoLabel: string
  nombre: string
  autor: string | null
}

function parseBulkText(text: string): ParsedRow[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const rows: ParsedRow[] = []
  let currentTurno = 0
  let currentTurnoLabel = ''

  for (const line of lines) {
    const parts = line.split('\t')
    if (parts.length < 2) continue

    const turnoRaw = parts[0].trim()
    const nombre = (parts[1] ?? '').trim()
    const autor = (parts[2] ?? '').trim() || null

    if (!nombre) continue

    if (turnoRaw) {
      currentTurno++
      currentTurnoLabel = turnoRaw
    }

    if (currentTurno < 1) currentTurno = 1

    rows.push({
      turno: currentTurno,
      turnoLabel: turnoRaw || currentTurnoLabel,
      nombre,
      autor,
    })
  }

  return rows
}

type GroupedTurno = {
  turno: number
  label: string
  piezas: { nombre: string; autor: string | null }[]
}

function groupByTurno(rows: ParsedRow[]): GroupedTurno[] {
  const map = new Map<number, GroupedTurno>()
  for (const row of rows) {
    if (!map.has(row.turno)) {
      map.set(row.turno, { turno: row.turno, label: row.turnoLabel, piezas: [] })
    }
    map.get(row.turno)!.piezas.push({ nombre: row.nombre, autor: row.autor })
  }
  return Array.from(map.values())
}

interface ImportMarchasDialogProps {
  procesionId: string
  existingCount: number
}

export function ImportMarchasDialog({ procesionId, existingCount }: ImportMarchasDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const parsed = parseBulkText(text)
  const grouped = groupByTurno(parsed)

  const handleImport = async () => {
    if (!parsed.length) return
    setIsImporting(true)
    setError(null)
    setSuccess(null)

    const items = parsed.map((row, i) => ({
      nombre: row.nombre,
      autor: row.autor,
      turno: row.turno,
      orden: existingCount + i,
    }))

    const res = await importarMarchasBulk(procesionId, items)
    if (!res.ok) {
      setError(res.error || 'Error al importar')
    } else {
      setSuccess(`Se importaron ${items.length} piezas en ${grouped.length} turnos.`)
      setText('')
      router.refresh()
    }
    setIsImporting(false)
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
        <Button type="button" variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar lista
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar sones y alabados</DialogTitle>
          <DialogDescription>
            Pega la tabla con formato: <strong>Turno [tab] Son/Alabado [tab] Autor</strong>.
            Si el turno está vacío, la pieza se asigna al mismo turno anterior (múltiples piezas por turno).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Textarea
            placeholder={`Honor Salida\tHimno a la Virgen\tLuis Pirir\n\tPues Concebida\tCanto Popular\n1\tEl Jilguero\tD.R.A.\n2\tEl Costumbro\tDesiderio Gallardo`}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError(null)
              setSuccess(null)
            }}
            className="bg-input/50 min-h-40 font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Copia desde Excel o Google Sheets (columnas separadas por tabulador). Columna 1: Turno,
            Columna 2: Nombre del son/alabado, Columna 3: Autor (opcional).
          </p>

          {parsed.length > 0 && (
            <div className="rounded-md border border-border bg-muted/30 p-3 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium mb-2">
                Vista previa: {parsed.length} piezas en {grouped.length} turnos
              </p>
              <div className="space-y-2 text-xs">
                {grouped.map((g) => (
                  <div key={g.turno} className="pl-2 border-l-2 border-primary/40">
                    <p className="font-semibold text-primary">
                      Turno {g.turno} {g.label !== String(g.turno) ? `(${g.label})` : ''}
                    </p>
                    {g.piezas.map((p, i) => (
                      <p key={i} className="text-muted-foreground pl-2">
                        {p.nombre}
                        {p.autor ? ` — ${p.autor}` : ''}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={isImporting || parsed.length === 0}
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importar {parsed.length} piezas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
