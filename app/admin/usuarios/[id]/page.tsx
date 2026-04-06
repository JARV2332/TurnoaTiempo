import { createClient } from '@/lib/supabase/server'
import { UsuarioForm } from '@/components/admin/usuario-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const [{ data: usuario }, { data: hermandades }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('hermandades').select('*').order('nombre'),
  ])

  if (!usuario) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/admin/usuarios" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a usuarios
        </Link>
        <h1 className="text-2xl font-bold">Editar Usuario</h1>
        <p className="text-muted-foreground">
          Modifica los datos de {usuario.nombre || 'este usuario'}
        </p>
      </div>
      
      <UsuarioForm usuario={usuario} hermandades={hermandades || []} />
    </div>
  )
}
