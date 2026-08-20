import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, UserCog, Shield, Mail } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatearFechaISO } from '@/lib/fecha'

function displayName(usuario: { nombre?: string | null; email?: string | null }) {
  const nombre = usuario.nombre?.trim()
  if (nombre) return nombre
  const email = usuario.email?.trim()
  if (email) return email.split('@')[0] || email
  return 'Usuario'
}

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: usuarios } = await supabase
    .from('profiles')
    .select(`
      *,
      hermandad:hermandades(nombre)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios y sus permisos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/usuarios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      {usuarios && usuarios.length > 0 ? (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado
              {usuarios.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                        usuario.role === 'superadmin' ? 'bg-primary/20' : 'bg-secondary/20'
                      }`}
                    >
                      {usuario.role === 'superadmin' ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <UserCog className="h-5 w-5 text-secondary" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium truncate">{displayName(usuario)}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{usuario.email || 'Sin correo'}</span>
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {usuario.hermandad?.nombre || 'Sin hermandad asignada'}
                      </p>
                      {usuario.created_at && (
                        <p className="text-xs text-muted-foreground">
                          Alta: {formatearFechaISO(usuario.created_at.slice(0, 10))}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <Badge variant={usuario.role === 'superadmin' ? 'default' : 'secondary'}>
                      {usuario.role === 'superadmin' ? 'SuperAdmin' : 'Encargado'}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/usuarios/${usuario.id}`}>Editar</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No hay usuarios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea el primer usuario para comenzar
            </p>
            <Button asChild>
              <Link href="/admin/usuarios/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
