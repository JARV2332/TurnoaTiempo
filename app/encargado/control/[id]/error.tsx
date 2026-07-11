'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ControlError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ControlPanel Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 gap-4 text-center">
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 max-w-sm w-full text-left">
        <p className="text-sm font-semibold text-destructive mb-2">Error en el panel de control</p>
        <p className="text-xs text-muted-foreground font-mono break-all">
          {error.message || 'Error desconocido'}
        </p>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground mt-1">ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        Reintentar
      </Button>
    </div>
  )
}
