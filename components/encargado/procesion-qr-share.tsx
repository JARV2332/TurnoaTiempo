'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Download, QrCode, Copy } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const LOGO_SRC = '/turnoatiempo.jpg'

type ProcesionQrShareProps = {
  procesionId: string
  /** Preferir NEXT_PUBLIC_SITE_URL o base desde el servidor */
  publicBaseUrl: string
}

export function ProcesionQrShare({ procesionId, publicBaseUrl }: ProcesionQrShareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [open, setOpen] = useState(false)
  const [clientOrigin, setClientOrigin] = useState('')

  useEffect(() => {
    setClientOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])

  const shareUrl = useMemo(() => {
    const base = (publicBaseUrl || clientOrigin).replace(/\/$/, '')
    return `${base}/seguimiento/${procesionId}`
  }, [publicBaseUrl, clientOrigin, procesionId])

  const drawQr = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 280
    await QRCode.toCanvas(canvas, shareUrl, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#1e1b4b', light: '#ffffff' },
    })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const logoSize = Math.round(size * 0.18)
      const pad = 6
      const x = (canvas.width - logoSize) / 2
      const y = (canvas.height - logoSize) / 2
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.strokeRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2)
      ctx.drawImage(img, x, y, logoSize, logoSize)
    }
    img.src = LOGO_SRC
  }, [shareUrl])

  useEffect(() => {
    if (open && shareUrl) {
      void drawQr()
    }
  }, [open, shareUrl, drawQr])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `turno-a-tiempo-seguimiento-${procesionId.slice(0, 8)}.png`
    a.click()
    toast({ title: 'Imagen descargada' })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({ title: 'Enlace copiado al portapapeles' })
    } catch {
      toast({
        title: 'No se pudo copiar',
        description: 'Copia el enlace manualmente.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          Código QR público
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir seguimiento</DialogTitle>
          <DialogDescription>
            El QR apunta a la página pública de esta procesión. Incluye el logo de Turno a Tiempo en el centro.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
            <canvas ref={canvasRef} className="block max-h-[280px] max-w-full" />
          </div>
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground">Enlace público</p>
            <Input readOnly value={shareUrl} className="font-mono text-xs" />
          </div>
          <div className="flex w-full flex-wrap gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar enlace
            </Button>
            <Button type="button" className="flex-1" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
