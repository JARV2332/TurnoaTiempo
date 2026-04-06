'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function revalidateAdmin() {
  revalidatePath('/admin')
  revalidatePath('/admin/hermandades')
  revalidatePath('/admin/usuarios')
}

export async function actualizarPerfilUsuario(input: {
  userId: string
  role: 'superadmin' | 'encargado'
  hermandad_id: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .update({
      role: input.role,
      hermandad_id: input.hermandad_id,
    })
    .eq('id', input.userId)

  if (error) return { ok: false as const, error: error.message }
  revalidateAdmin()
  return { ok: true as const }
}

export async function guardarHermandad(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const hermandadId = (formData.get('hermandad_id') as string) || ''
  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre) return { ok: false as const, error: 'Nombre obligatorio' }

  const existingEscudo = (formData.get('existing_escudo_url') as string) || null
  const file = formData.get('escudo')

  let escudo_url: string | null = existingEscudo

  if (file instanceof File && file.size > 0) {
    const ext = file.name.split('.').pop() || 'png'
    const filePath = `escudos/${Date.now()}.${ext}`
    const buf = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabase.storage.from('escudos').upload(filePath, buf, {
      contentType: file.type || 'image/png',
      upsert: false,
    })
    if (uploadError) return { ok: false as const, error: uploadError.message }

    const { data: pub } = supabase.storage.from('escudos').getPublicUrl(filePath)
    escudo_url = pub.publicUrl
  }

  const row = { nombre, escudo_url }

  if (hermandadId) {
    const { error } = await supabase.from('hermandades').update(row).eq('id', hermandadId)
    if (error) return { ok: false as const, error: error.message }
  } else {
    const { error } = await supabase.from('hermandades').insert(row)
    if (error) return { ok: false as const, error: error.message }
  }

  revalidateAdmin()
  revalidatePath('/encargado')
  return { ok: true as const }
}

export async function eliminarHermandad(hermandadId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase.from('hermandades').delete().eq('id', hermandadId)
  if (error) return { ok: false as const, error: error.message }
  revalidateAdmin()
  revalidatePath('/encargado')
  return { ok: true as const }
}
