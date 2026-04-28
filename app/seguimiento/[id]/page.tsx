import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicTrackingView } from '@/components/public/public-tracking-view'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: procesion } = await supabase
    .from('procesiones')
    .select(`
      nombre,
      hermandad:hermandades(nombre)
    `)
    .eq('id', id)
    .single()

  if (!procesion) {
    return { title: 'Procesión no encontrada' }
  }

  return {
    title: `${procesion.nombre} | Turno en Tiempo Real`,
    description: `Sigue en tiempo real la procesión ${procesion.nombre} de ${procesion.hermandad?.nombre}. Ubicación, turno y marcha actual.`,
  }
}

export default async function SeguimientoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
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
  
  // Get route points
  const [{ data: puntosRuta }, { data: marchas }] = await Promise.all([
    supabase
      .from('puntos_ruta')
      .select('*')
      .eq('procesion_id', id)
      .order('orden'),
    supabase.from('marchas').select('*').eq('procesion_id', id).order('orden'),
  ])

  return (
    <PublicTrackingView 
      initialProcesion={procesion} 
      puntosRuta={puntosRuta || []} 
      marchas={marchas || []}
    />
  )
}
