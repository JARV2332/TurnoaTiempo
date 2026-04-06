import { createClient } from '@/lib/supabase/server'
import { ProcesionForm } from '@/components/encargado/procesion-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NuevaProcesionPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('hermandad_id, role')
    .eq('id', user.id)
    .single()
  
  const { data: hermandades } = await supabase
    .from('hermandades')
    .select('*')
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link 
          href="/encargado" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold">Nueva Procesión</h1>
        <p className="text-muted-foreground">
          Crea una nueva procesión para tu hermandad
        </p>
      </div>
      
      <ProcesionForm 
        hermandades={hermandades || []} 
        userHermandadId={profile?.hermandad_id || undefined}
        isSuperAdmin={profile?.role === 'superadmin'}
      />
    </div>
  )
}
