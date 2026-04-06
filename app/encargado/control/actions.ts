'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function revalidateProcesion(procesionId: string) {
  revalidatePath('/encargado')
  revalidatePath(`/encargado/control/${procesionId}`)
  revalidatePath(`/encargado/procesiones/${procesionId}`)
  revalidatePath(`/seguimiento/${procesionId}`)
}

export async function iniciarProcesion(procesionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase
    .from('procesiones')
    .update({ estado: 'en_curso' })
    .eq('id', procesionId)

  if (error) return { ok: false as const, error: error.message }
  revalidateProcesion(procesionId)
  return { ok: true as const }
}

export async function finalizarProcesion(procesionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase
    .from('procesiones')
    .update({
      estado: 'finalizada',
      ubicacion_lat: null,
      ubicacion_lng: null,
      turno_actual: null,
      marcha_actual: null,
    })
    .eq('id', procesionId)

  if (error) return { ok: false as const, error: error.message }
  revalidateProcesion(procesionId)
  return { ok: true as const }
}

export async function aplicarTurnoProcesion(
  procesionId: string,
  payload: {
    turno_actual: number
    marcha_actual: string | null
    ubicacion_lat: number | null
    ubicacion_lng: number | null
  },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase
    .from('procesiones')
    .update({
      turno_actual: payload.turno_actual,
      marcha_actual: payload.marcha_actual,
      ubicacion_lat: payload.ubicacion_lat,
      ubicacion_lng: payload.ubicacion_lng,
    })
    .eq('id', procesionId)

  if (error) return { ok: false as const, error: error.message }
  revalidateProcesion(procesionId)
  return { ok: true as const }
}

export async function actualizarMarchaProcesion(
  procesionId: string,
  marcha_actual: string | null,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase
    .from('procesiones')
    .update({ marcha_actual: marcha_actual })
    .eq('id', procesionId)

  if (error) return { ok: false as const, error: error.message }
  revalidateProcesion(procesionId)
  return { ok: true as const }
}
