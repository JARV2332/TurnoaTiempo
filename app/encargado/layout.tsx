import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EncargadoHeader } from '@/components/encargado/encargado-header'

export default async function EncargadoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user profile with hermandad
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      hermandad:hermandades(*)
    `)
    .eq('id', user.id)
    .single()
  
  // Superadmins can access but will be redirected to admin
  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-svh flex flex-col">
      <EncargadoHeader 
        userName={profile.nombre || user.email || 'Usuario'} 
        hermandadNombre={profile.hermandad?.nombre}
        isSuperAdmin={profile.role === 'superadmin'}
      />
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
