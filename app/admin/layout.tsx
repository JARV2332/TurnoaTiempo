import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Check if user is superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'superadmin') {
    redirect('/encargado')
  }

  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:pl-64">
        <AdminHeader userName={profile.email || user.email || 'Admin'} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
