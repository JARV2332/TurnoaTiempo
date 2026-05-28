import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Church, Users, Radio, MapPin, ExternalLink, Pencil } from 'lucide-react'
import Link from 'next/link'
import { formatearFechaISO } from '@/lib/fecha'
import { estadoProcesionClass, estadoProcesionLabel } from '@/lib/procesion-estado'
import type { ProcesionEstado } from '@/lib/types'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: hermandadesCount },
    { count: usuariosCount },
    { count: procesionesTotal },
    { count: procesionesActivasCount },
    { count: procesionesFinalizadasCount },
    { data: recentProcesiones },
  ] = await Promise.all([
    supabase.from('hermandades').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('procesiones').select('*', { count: 'exact', head: true }),
    supabase.from('procesiones').select('*', { count: 'exact', head: true }).eq('estado', 'en_curso'),
    supabase.from('procesiones').select('*', { count: 'exact', head: true }).eq('estado', 'finalizada'),
    supabase
      .from('procesiones')
      .select(`
        id,
        nombre,
        estado,
        fecha,
        created_at,
        hermandad:hermandades(nombre)
      `)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = [
    {
      label: 'Hermandades',
      value: hermandadesCount || 0,
      icon: Church,
      href: '/admin/hermandades',
      color: 'text-primary',
    },
    {
      label: 'Usuarios',
      value: usuariosCount || 0,
      icon: Users,
      href: '/admin/usuarios',
      color: 'text-secondary',
    },
    {
      label: 'Procesiones',
      value: procesionesTotal || 0,
      icon: MapPin,
      href: '/admin/procesiones',
      color: 'text-primary',
    },
    {
      label: 'En curso',
      value: procesionesActivasCount || 0,
      icon: Radio,
      href: '/admin/procesiones?estado=en_curso',
      color: 'text-green-500',
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="glass-card hover:border-primary/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                {stat.label === 'Procesiones' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {procesionesFinalizadasCount || 0} finalizadas
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Procesiones recientes
            </CardTitle>
            <CardDescription>
              Últimas procesiones registradas — activas, programadas y pasadas
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/procesiones">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentProcesiones && recentProcesiones.length > 0 ? (
            <div className="space-y-3">
              {recentProcesiones.map((procesion) => (
                <div
                  key={procesion.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{procesion.nombre}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {procesion.hermandad?.nombre}
                      {procesion.fecha &&
                        ` · ${formatearFechaISO(procesion.fecha, { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${estadoProcesionClass(procesion.estado as ProcesionEstado)}`}
                    >
                      {estadoProcesionLabel(procesion.estado as ProcesionEstado)}
                    </span>
                    <Button variant="ghost" size="icon" asChild title="Pública">
                      <Link href={`/seguimiento/${procesion.id}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Gestionar">
                      <Link href={`/encargado/procesiones/${procesion.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
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
