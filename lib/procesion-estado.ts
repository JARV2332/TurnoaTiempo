import type { ProcesionEstado } from '@/lib/types'

export function estadoProcesionLabel(estado: ProcesionEstado): string {
  switch (estado) {
    case 'en_curso':
      return 'En curso'
    case 'finalizada':
      return 'Finalizada'
    default:
      return 'Programada'
  }
}

export function estadoProcesionClass(estado: ProcesionEstado): string {
  switch (estado) {
    case 'en_curso':
      return 'bg-green-500/20 text-green-400'
    case 'finalizada':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-primary/20 text-primary'
  }
}
