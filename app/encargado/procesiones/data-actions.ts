'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function revalidateEncargado(procesionId?: string) {
  revalidatePath('/encargado')
  if (procesionId) {
    revalidatePath(`/encargado/procesiones/${procesionId}`)
    revalidatePath(`/encargado/control/${procesionId}`)
    revalidatePath(`/seguimiento/${procesionId}`)
  }
}

export async function guardarProcesion(input: {
  id?: string
  nombre: string
  descripcion: string | null
  fecha: string
  hermandad_id: string
  estado?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const payload = {
    nombre: input.nombre,
    descripcion: input.descripcion,
    fecha: input.fecha,
    hermandad_id: input.hermandad_id,
    total_turnos: 1,
    estado: (input.estado || 'programada') as string,
  }

  if (input.id) {
    const { error } = await supabase.from('procesiones').update(payload).eq('id', input.id)
    if (error) return { ok: false as const, error: error.message }
    revalidateEncargado(input.id)
    return { ok: true as const }
  }

  const { error } = await supabase.from('procesiones').insert(payload)
  if (error) return { ok: false as const, error: error.message }
  revalidateEncargado()
  return { ok: true as const }
}

export async function eliminarProcesion(procesionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase.from('procesiones').delete().eq('id', procesionId)
  if (error) return { ok: false as const, error: error.message }
  revalidateEncargado()
  return { ok: true as const }
}

export async function duplicarProcesion(input: {
  sourceId: string
  nombre: string
  fecha: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { data: orig, error: origError } = await supabase
    .from('procesiones')
    .select('*')
    .eq('id', input.sourceId)
    .single()

  if (origError || !orig) return { ok: false as const, error: origError?.message || 'No encontrada' }

  const [{ data: marchas, error: marchasError }, { data: puntos, error: puntosError }] =
    await Promise.all([
      supabase.from('marchas').select('*').eq('procesion_id', input.sourceId).order('orden'),
      supabase.from('puntos_ruta').select('*').eq('procesion_id', input.sourceId).order('orden'),
    ])

  if (marchasError) return { ok: false as const, error: marchasError.message }
  if (puntosError) return { ok: false as const, error: puntosError.message }

  const { data: nueva, error: insertErr } = await supabase
    .from('procesiones')
    .insert({
      hermandad_id: orig.hermandad_id,
      nombre: input.nombre.trim() || `${orig.nombre} (copia)`,
      descripcion: orig.descripcion ?? null,
      fecha: input.fecha,
      total_turnos: orig.total_turnos ?? 1,
      avatar_url: orig.avatar_url ?? null,
      turno_actual: 1,
      marcha_actual: null,
      ubicacion_lat: null,
      ubicacion_lng: null,
      transmitiendo: false,
      estado: 'programada',
    })
    .select()
    .single()

  if (insertErr || !nueva) return { ok: false as const, error: insertErr?.message || 'Error al crear' }

  if (marchas && marchas.length > 0) {
    const payload = marchas.map((m) => ({
      procesion_id: nueva.id,
      nombre: m.nombre,
      autor: m.autor ?? null,
      orden: m.orden ?? 0,
    }))
    const { error } = await supabase.from('marchas').insert(payload)
    if (error) return { ok: false as const, error: error.message }
  }

  if (puntos && puntos.length > 0) {
    const payload = puntos.map((p) => ({
      procesion_id: nueva.id,
      direccion: p.direccion,
      lat: p.lat ?? null,
      lng: p.lng ?? null,
      orden: p.orden,
      tipo: p.tipo,
    }))
    const { error } = await supabase.from('puntos_ruta').insert(payload)
    if (error) return { ok: false as const, error: error.message }
  }

  revalidateEncargado(nueva.id)
  return { ok: true as const, newId: nueva.id }
}

export async function insertarMarcha(input: {
  procesionId: string
  nombre: string
  autor: string | null
  orden: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { data, error } = await supabase
    .from('marchas')
    .insert({
      procesion_id: input.procesionId,
      nombre: input.nombre,
      autor: input.autor,
      orden: input.orden,
    })
    .select()
    .single()

  if (error) return { ok: false as const, error: error.message }
  revalidateEncargado(input.procesionId)
  return { ok: true as const, marcha: data }
}

export async function eliminarMarcha(marchaId: string, procesionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase.from('marchas').delete().eq('id', marchaId)
  if (error) return { ok: false as const, error: error.message }
  revalidateEncargado(procesionId)
  return { ok: true as const }
}

export async function actualizarOrdenMarchas(
  procesionId: string,
  ordenPorId: { id: string; orden: number }[],
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  for (const row of ordenPorId) {
    const { error } = await supabase.from('marchas').update({ orden: row.orden }).eq('id', row.id)
    if (error) return { ok: false as const, error: error.message }
  }
  revalidateEncargado(procesionId)
  return { ok: true as const }
}

export async function insertarPuntoRuta(input: {
  procesionId: string
  direccion: string
  tipo: 'ida' | 'regreso'
  lat: number
  lng: number
  orden: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { data, error } = await supabase
    .from('puntos_ruta')
    .insert({
      procesion_id: input.procesionId,
      direccion: input.direccion,
      tipo: input.tipo,
      lat: input.lat,
      lng: input.lng,
      orden: input.orden,
    })
    .select()
    .single()

  if (error) return { ok: false as const, error: error.message }
  revalidateEncargado(input.procesionId)
  return { ok: true as const, punto: data }
}

export async function eliminarPuntoRuta(puntoId: string, procesionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase.from('puntos_ruta').delete().eq('id', puntoId)
  if (error) return { ok: false as const, error: error.message }
  revalidateEncargado(procesionId)
  return { ok: true as const }
}
