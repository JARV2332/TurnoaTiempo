import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Radio } from 'lucide-react'
import Link from 'next/link'
import { AdminProcesionesTable, type ProcesionListItem } from '@/components/admin/admin-procesiones-table'

export default async function AdminProcesionesPage() {
  const supabase = await createClient()

  const { data: todas } = await supabase
    .from('procesiones')
    .select(`
      id,
      nombre,
      fecha,
      estado,
      created_at,
      hermandad:hermandades(nombre)
    `)
    .order('created_at', { ascending: false })

  const lista = (todas || []).sort((a, b) => {
    const fa = a.fecha || ''
    const fb = b.fecha || ''
    if (fa !== fb) return fb.localeCompare(fa)
    return (b.created_at || '').localeCompare(a.created_at || '')
  })

  const conteos = {
    todas: lista.length,
    programada: lista.filter((p) => p.estado === 'programada').length,
    en_curso: lista.filter((p) => p.estado === 'en_curso').length,
    finalizada: lista.filter((p) => p.estado === 'finalizada').length,
  }

  const procesiones: ProcesionListItem[] = lista.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    fecha: p.fecha,
    estado: p.estado,
    hermandad: p.hermandad ? { nombre: p.hermandad.nombre } : null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Procesiones</h1>
          <p className="text-muted-foreground">
            Todas las procesiones del sistema: activas, programadas y pasadas
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/encargado/procesiones/nueva">
            <MapPin className="mr-2 h-4 w-4" />
            Nueva procesión
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conteos.todas}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En curso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">{conteos.en_curso}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Programadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{conteos.programada}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Finalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conteos.finalizada}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Listado
          </CardTitle>
          <CardDescription>
            Usa los filtros en los encabezados de la tabla para buscar y filtrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminProcesionesTable procesiones={procesiones} />
        </CardContent>
      </Card>
    </div>
  )
}
