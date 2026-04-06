import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Church, Users, Radio, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  
  // Get counts
  const [
    { count: hermandadesCount },
    { count: usuariosCount },
    { count: procesionesActivasCount },
    { data: recentProcesiones }
  ] = await Promise.all([
    supabase.from('hermandades').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('procesiones').select('*', { count: 'exact', head: true }).eq('estado', 'en_curso'),
    supabase
      .from('procesiones')
      .select(`
        id,
        nombre,
        estado,
        created_at,
        hermandad:hermandades(nombre)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const stats = [
    { 
      label: 'Hermandades', 
      value: hermandadesCount || 0, 
      icon: Church,
      href: '/admin/hermandades',
      color: 'text-primary'
    },
    { 
      label: 'Usuarios', 
      value: usuariosCount || 0, 
      icon: Users,
      href: '/admin/usuarios',
      color: 'text-secondary'
    },
    { 
      label: 'Procesiones Activas', 
      value: procesionesActivasCount || 0, 
      icon: Radio,
      href: '#',
      color: 'text-green-500'
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de administración de Turno en Tiempo Real
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="glass-card hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Recent Procesiones */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Procesiones Recientes
          </CardTitle>
          <CardDescription>
            Últimas procesiones registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentProcesiones && recentProcesiones.length > 0 ? (
            <div className="space-y-3">
              {recentProcesiones.map((procesion) => (
                <div 
                  key={procesion.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{procesion.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {procesion.hermandad?.nombre}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    procesion.estado === 'en_curso' 
                      ? 'bg-green-500/20 text-green-400'
                      : procesion.estado === 'finalizada'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {procesion.estado === 'en_curso' ? 'En curso' 
                      : procesion.estado === 'finalizada' ? 'Finalizada' 
                      : 'Programada'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay procesiones registradas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
