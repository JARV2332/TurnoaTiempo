import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Radio, Calendar, Play, Settings } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatearFechaISO } from '@/lib/fecha'

export default async function EncargadoDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('hermandad_id, role')
    .eq('id', user.id)
    .single()
  
  // Get procesiones for this user's hermandad (or all if superadmin)
  let query = supabase
    .from('procesiones')
    .select(`
      *,
      hermandad:hermandades(nombre, escudo_url)
    `)
    .order('fecha', { ascending: false })
  
  if (profile?.role !== 'superadmin' && profile?.hermandad_id) {
    query = query.eq('hermandad_id', profile.hermandad_id)
  }
  
  const { data: procesiones } = await query

  const procesionActiva = procesiones?.find(p => p.estado === 'en_curso')
  const procesionesProgram = procesiones?.filter(p => p.estado === 'programada') || []
  const procesionesFinalizadas = procesiones?.filter(p => p.estado === 'finalizada') || []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis Procesiones</h1>
          <p className="text-muted-foreground">
            Gestiona las procesiones de tu hermandad
          </p>
        </div>
        <Button asChild>
          <Link href="/encargado/procesiones/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Procesión
          </Link>
        </Button>
      </div>
      
      {/* Active Procesion Alert */}
      {procesionActiva && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <CardTitle className="text-lg text-green-400">Procesión en Curso</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-medium text-lg">{procesionActiva.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {procesionActiva.hermandad?.nombre}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/encargado/procesiones/${procesionActiva.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Gestionar
                  </Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href={`/encargado/control/${procesionActiva.id}`}>
                    <Radio className="mr-2 h-4 w-4" />
                    Control en Vivo
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Programadas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Procesiones Programadas
        </h2>
        
        {procesionesProgram.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {procesionesProgram.map((procesion) => (
              <Card key={procesion.id} className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{procesion.nombre}</CardTitle>
                  <CardDescription>
                    {procesion.fecha 
                      ? formatearFechaISO(procesion.fecha, {
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Fecha por determinar'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/encargado/procesiones/${procesion.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link href={`/encargado/control/${procesion.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay procesiones programadas</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Finalizadas */}
      {procesionesFinalizadas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            Procesiones Finalizadas
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {procesionesFinalizadas.slice(0, 6).map((procesion) => (
              <Card key={procesion.id} className="glass-card opacity-75">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{procesion.nombre}</CardTitle>
                  <CardDescription>
                    {procesion.fecha 
                      ? formatearFechaISO(procesion.fecha)
                      : 'Sin fecha'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href={`/encargado/procesiones/${procesion.id}`}>
                      Ver detalles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {(!procesiones || procesiones.length === 0) && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">
              No hay procesiones
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu primera procesión para comenzar
            </p>
            <Button asChild>
              <Link href="/encargado/procesiones/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Procesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
