import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, UserCog, Shield } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

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
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usuarios.map((usuario) => (
                <div 
                  key={usuario.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      usuario.role === 'superadmin' 
                        ? 'bg-primary/20' 
                        : 'bg-secondary/20'
                    }`}>
                      {usuario.role === 'superadmin' 
                        ? <Shield className="h-5 w-5 text-primary" />
                        : <UserCog className="h-5 w-5 text-secondary" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{usuario.nombre || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">
                        {usuario.hermandad?.nombre || 'Sin hermandad asignada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={usuario.role === 'superadmin' ? 'default' : 'secondary'}>
                      {usuario.role === 'superadmin' ? 'SuperAdmin' : 'Encargado'}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/usuarios/${usuario.id}`}>
                        Editar
                      </Link>
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
            <h3 className="text-lg font-medium mb-1">
              No hay usuarios
            </h3>
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
