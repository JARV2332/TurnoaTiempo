import { HermandadForm } from '@/components/admin/hermandad-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NuevaHermandadPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/admin/hermandades" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a hermandades
        </Link>
        <h1 className="text-2xl font-bold">Nueva Hermandad</h1>
        <p className="text-muted-foreground">
          Registra una nueva hermandad en el sistema
        </p>
      </div>
      
      <HermandadForm />
    </div>
  )
}
