import { createClient } from '@/lib/supabase/server'
import { HermandadForm } from '@/components/admin/hermandad-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditHermandadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: hermandad } = await supabase
    .from('hermandades')
    .select('*')
    .eq('id', id)
    .single()

  if (!hermandad) {
    notFound()
  }

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
        <h1 className="text-2xl font-bold">Editar Hermandad</h1>
        <p className="text-muted-foreground">
          Modifica los datos de {hermandad.nombre}
        </p>
      </div>
      
      <HermandadForm hermandad={hermandad} />
    </div>
  )
}
