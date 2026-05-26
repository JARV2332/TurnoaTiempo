'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { Download, QrCode, Copy, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const LOGO_SRC = '/turnoatiempo.jpg'
const QR_SIZE = 280

type ProcesionQrShareProps = {
  procesionId: string
  publicBaseUrl: string
}

export function ProcesionQrShare({ procesionId, publicBaseUrl }: ProcesionQrShareProps) {
  const [open, setOpen] = useState(false)
  const [clientOrigin, setClientOrigin] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    setClientOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])

  const shareUrl = useMemo(() => {
    const base = (publicBaseUrl || 'https://turnoatiempo.com').replace(/\/$/, '')
    return `${base}/seguimiento/${procesionId}`
  }, [publicBaseUrl, procesionId])

  const generateQr = useCallback(async () => {
    if (!shareUrl) {
      setQrDataUrl(null)
      setQrError('No hay URL base (configura NEXT_PUBLIC_SITE_URL o recarga la página).')
      return
    }
    setIsGenerating(true)
    setQrError(null)
    try {
      const url = await QRCode.toDataURL(shareUrl, {
        width: QR_SIZE,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#1e1b4b', light: '#ffffff' },
      })
      setQrDataUrl(url)
    } catch (e) {
      console.error(e)
      setQrDataUrl(null)
      setQrError('No se pudo generar el código QR.')
      toast({
        title: 'Error al generar QR',
        description: e instanceof Error ? e.message : 'Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [shareUrl])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    const run = () => {
      if (cancelled) return
      void generateQr()
    }

    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run)
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
  }, [open, shareUrl, generateQr])

  const handleDownload = () => {
    if (!qrDataUrl) return

    const canvas = document.createElement('canvas')
    canvas.width = QR_SIZE
    canvas.height = QR_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const qrImg = new Image()
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, QR_SIZE, QR_SIZE)

      const logo = new Image()
      logo.onload = () => {
        const logoSize = Math.round(QR_SIZE * 0.18)
        const pad = 6
        const x = (QR_SIZE - logoSize) / 2
        const y = (QR_SIZE - logoSize) / 2
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2)
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        ctx.strokeRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2)
        ctx.drawImage(logo, x, y, logoSize, logoSize)

        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/png')
        a.download = `turno-a-tiempo-seguimiento-${procesionId.slice(0, 8)}.png`
        a.click()
        toast({ title: 'Imagen descargada' })
      }
      logo.onerror = () => {
        toast({
          title: 'No se pudo añadir el logo',
          description: 'Se descargará el QR sin logo.',
        })
        const a = document.createElement('a')
        a.href = qrDataUrl
        a.download = `turno-a-tiempo-seguimiento-${procesionId.slice(0, 8)}.png`
        a.click()
      }
      logo.src = LOGO_SRC
    }
    qrImg.onerror = () => {
      toast({ title: 'Error', description: 'No se pudo preparar la descarga.', variant: 'destructive' })
    }
    qrImg.src = qrDataUrl
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

  const logoBox = Math.round(QR_SIZE * 0.18) + 12

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQrDataUrl(null)
          setQrError(null)
        }
      }}
    >
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
            El QR apunta a la página pública de esta procesión. El logo va en el centro para identificar Turno a Tiempo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative flex min-h-[280px] min-w-[280px] items-center justify-center rounded-lg border border-border bg-white p-3 shadow-sm">
            {isGenerating && (
              <Loader2 className="absolute z-10 h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
            )}
            {qrError && !isGenerating && (
              <p className="max-w-[260px] text-center text-sm text-destructive">{qrError}</p>
            )}
            {qrDataUrl && (
              <div className="relative" style={{ width: QR_SIZE, height: QR_SIZE }}>
                <img src={qrDataUrl} alt="" width={QR_SIZE} height={QR_SIZE} className="block" />
                <div
                  className="pointer-events-none absolute flex items-center justify-center rounded border border-neutral-200 bg-white shadow-sm"
                  style={{
                    width: logoBox,
                    height: logoBox,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <img
                    src={LOGO_SRC}
                    alt=""
                    width={Math.round(QR_SIZE * 0.18)}
                    height={Math.round(QR_SIZE * 0.18)}
                    className="rounded-sm object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground">Enlace público</p>
            <Input readOnly value={shareUrl || '—'} className="font-mono text-xs" />
          </div>
          <div className="flex w-full flex-wrap gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleCopy} disabled={!shareUrl}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar enlace
            </Button>
            <Button type="button" className="flex-1" onClick={handleDownload} disabled={!qrDataUrl}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
