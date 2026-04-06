import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PrintMapView } from '@/components/public/print-map-view'

export default async function SeguimientoImprimirPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: procesion } = await supabase
    .from('procesiones')
    .select(
      `
      *,
      hermandad:hermandades(nombre, escudo_url)
    `,
    )
    .eq('id', id)
    .single()

  if (!procesion) notFound()

  const { data: puntosRuta } = await supabase
    .from('puntos_ruta')
    .select('*')
    .eq('procesion_id', id)
    .order('orden')

  return (
    <PrintMapView
      procesion={procesion}
      puntosRuta={puntosRuta || []}
      escudoUrl={procesion.hermandad?.escudo_url}
    />
  )
}

