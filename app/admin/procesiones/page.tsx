import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, ExternalLink, Pencil, Radio } from 'lucide-react'
import Link from 'next/link'
import { DeleteProcesionButton } from '@/components/admin/delete-procesion-button'
import { ProcesionesEstadoFiltros } from '@/components/admin/procesiones-estado-filtros'
import { estadoProcesionClass, estadoProcesionLabel } from '@/lib/procesion-estado'
import { formatearFechaISO } from '@/lib/fecha'
import type { ProcesionEstado } from '@/lib/types'

type SearchParams = Promise<{ estado?: string }>

export default async function AdminProcesionesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { estado: estadoFiltro } = await searchParams
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

  const filtro = estadoFiltro || 'todas'
  const procesiones =
    filtro === 'todas'
      ? lista
      : lista.filter((p) => p.estado === filtro)

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

      <Suspense fallback={<div className="h-10" />}>
        <ProcesionesEstadoFiltros conteos={conteos} />
      </Suspense>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Listado
          </CardTitle>
          <CardDescription>
            {procesiones.length}{' '}
            {procesiones.length === 1 ? 'procesión' : 'procesiones'}
            {filtro !== 'todas' ? ` (${estadoProcesionLabel(filtro as ProcesionEstado)})` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {procesiones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Procesión</th>
                    <th className="pb-3 pr-4 font-medium hidden md:table-cell">Hermandad</th>
                    <th className="pb-3 pr-4 font-medium hidden sm:table-cell">Fecha</th>
                    <th className="pb-3 pr-4 font-medium">Estado</th>
                    <th className="pb-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {procesiones.map((procesion) => (
                    <tr key={procesion.id} className="group">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{procesion.nombre}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {procesion.hermandad?.nombre}
                        </p>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell text-muted-foreground">
                        {procesion.hermandad?.nombre || '—'}
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                        {procesion.fecha
                          ? formatearFechaISO(procesion.fecha, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${estadoProcesionClass(procesion.estado as ProcesionEstado)}`}
                        >
                          {estadoProcesionLabel(procesion.estado as ProcesionEstado)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild title="Página pública">
                            <Link
                              href={`/seguimiento/${procesion.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild title="Gestionar">
                            <Link href={`/encargado/procesiones/${procesion.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          {procesion.estado === 'en_curso' && (
                            <Button variant="ghost" size="sm" asChild title="Control en vivo">
                              <Link href={`/encargado/control/${procesion.id}`}>
                                <Radio className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <DeleteProcesionButton
                            procesionId={procesion.id}
                            procesionNombre={procesion.nombre}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              No hay procesiones con este filtro
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
