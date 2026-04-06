import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { LiveControlPanel } from '@/components/encargado/live-control-panel'

export default async function LiveControlPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: procesion } = await supabase
    .from('procesiones')
    .select(`
      *,
      hermandad:hermandades(nombre, escudo_url)
    `)
    .eq('id', id)
    .single()

  if (!procesion) {
    notFound()
  }
  
  const [{ data: marchas }, { data: puntosRuta }] = await Promise.all([
    supabase.from('marchas').select('*').eq('procesion_id', id).order('orden'),
    supabase.from('puntos_ruta').select('*').eq('procesion_id', id).order('orden'),
  ])

  return (
    <LiveControlPanel
      procesion={procesion}
      marchas={marchas || []}
      puntosRuta={puntosRuta || []}
    />
  )
}
