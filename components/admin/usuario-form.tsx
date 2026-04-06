'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { actualizarPerfilUsuario } from '@/app/admin/admin-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Profile, Hermandad } from '@/lib/types'

interface UsuarioFormProps {
  usuario?: Profile
  hermandades: Hermandad[]
  isNewUser?: boolean
}

export function UsuarioForm({ usuario, hermandades, isNewUser = false }: UsuarioFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState(usuario?.role || 'encargado')
  const [hermandadId, setHermandadId] = useState<string>(usuario?.hermandad_id || '')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      if (isNewUser) {
        // signUp debe ir en el cliente: si se hace en el servidor con la sesión del admin,
        // Supabase puede sustituir la sesión por la del usuario recién creado.
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const supabase = createClient()
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role, hermandad_id: hermandadId || null },
            emailRedirectTo: `${window.location.origin}/auth/login`,
          },
        })
        if (authError) throw authError
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            email,
            role,
            hermandad_id: hermandadId || null,
          })
          if (profileError) throw profileError
        }
      } else if (usuario) {
        const res = await actualizarPerfilUsuario({
          userId: usuario.id,
          role: role as 'superadmin' | 'encargado',
          hermandad_id: hermandadId || null,
        })
        if (!res.ok) throw new Error(res.error)
      }

      router.push('/admin/usuarios')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>
            {isNewUser ? 'Introduce los datos del nuevo usuario' : 'Modifica los datos del usuario'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email - only for new users */}
          {isNewUser && (
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="correo@ejemplo.com"
                className="bg-input/50"
              />
            </div>
          )}

          {/* Password - only for new users */}
          {isNewUser && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="bg-input/50"
              />
            </div>
          )}

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-input/50">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="encargado">Encargado</SelectItem>
                <SelectItem value="superadmin">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === 'superadmin' 
                ? 'Acceso completo al sistema' 
                : 'Gestión de procesiones de su hermandad'}
            </p>
          </div>

          {/* Hermandad - only for encargado */}
          {role === 'encargado' && (
            <div className="space-y-2">
              <Label htmlFor="hermandad">Hermandad</Label>
              <Select value={hermandadId} onValueChange={setHermandadId}>
                <SelectTrigger className="bg-input/50">
                  <SelectValue placeholder="Selecciona una hermandad" />
                </SelectTrigger>
                <SelectContent>
                  {hermandades.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Hermandad que podrá gestionar este usuario
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : isNewUser ? 'Crear Usuario' : 'Actualizar'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
