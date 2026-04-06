import { createClient } from '@/lib/supabase/server'
import { UsuarioForm } from '@/components/admin/usuario-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NuevoUsuarioPage() {
  const supabase = await createClient()
  
  const { data: hermandades } = await supabase
    .from('hermandades')
    .select('*')
    .order('nombre')

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
        <h1 className="text-2xl font-bold">Nuevo Usuario</h1>
        <p className="text-muted-foreground">
          Registra un nuevo usuario en el sistema
        </p>
      </div>
      
      <UsuarioForm hermandades={hermandades || []} isNewUser />
    </div>
  )
}
