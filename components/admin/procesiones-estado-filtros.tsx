'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
const filtros: { value: string; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'programada', label: 'Programadas' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizadas' },
]

type ProcesionesEstadoFiltrosProps = {
  conteos: Record<string, number>
}

export function ProcesionesEstadoFiltros({ conteos }: ProcesionesEstadoFiltrosProps) {
  const searchParams = useSearchParams()
  const actual = searchParams.get('estado') || 'todas'

  return (
    <div className="flex flex-wrap gap-2">
      {filtros.map((f) => {
        const count = conteos[f.value] ?? 0
        const activo = actual === f.value
        const href =
          f.value === 'todas' ? '/admin/procesiones' : `/admin/procesiones?estado=${f.value}`

        return (
          <Link
            key={f.value}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors border',
              activo
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50',
            )}
          >
            {f.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                activo ? 'bg-primary-foreground/20' : 'bg-background',
              )}
            >
              {count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
