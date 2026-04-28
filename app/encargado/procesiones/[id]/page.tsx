import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Music, MapPin, Settings, Play, Radio, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { MarchasManager } from '@/components/encargado/marchas-manager'
import { RutaManager } from '@/components/encargado/ruta-manager'
import { ProcesionActions } from '@/components/encargado/procesion-actions'

export default async function ProcesionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: procesion } = await supabase
    .from('procesiones')
    .select(`
      *,
      hermandad:hermandades(*)
    `)
    .eq('id', id)
    .single()

  if (!procesion) {
    notFound()
  }
  
  // Get marchas
  const { data: marchas } = await supabase
    .from('marchas')
    .select('*')
    .eq('procesion_id', id)
    .order('orden')
  
  // Get ruta points
  const { data: puntosRuta } = await supabase
    .from('puntos_ruta')
    .select('*')
    .eq('procesion_id', id)
    .order('orden')

  const puntosIda = (puntosRuta || [])
    .filter((p) => p.tipo === 'ida')
    .sort((a, b) => a.orden - b.orden)
  const puntosRegreso = (puntosRuta || [])
    .filter((p) => p.tipo === 'regreso')
    .sort((a, b) => a.orden - b.orden)

  const turnosRuta = [
    ...puntosIda.map((p, index) => ({
      turno: index + 1,
      direccion: p.direccion ? `Ida — ${p.direccion}` : 'Ida',
    })),
    ...puntosRegreso.map((p, index) => ({
      turno: puntosIda.length + index + 1,
      direccion: p.direccion ? `Regreso — ${p.direccion}` : 'Regreso',
    })),
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link 
          href="/encargado" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {procesion.hermandad?.escudo_url ? (
              <img 
                src={procesion.hermandad.escudo_url} 
                alt="" 
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Radio className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{procesion.nombre}</h1>
              <p className="text-muted-foreground">
                {procesion.hermandad?.nombre}
              </p>
              <div className="mt-1">
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
            </div>
          </div>
          
          {procesion.estado !== 'finalizada' && (
            <div className="flex gap-2">
              {procesion.estado === 'en_curso' ? (
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href={`/encargado/control/${procesion.id}`}>
                    <Radio className="mr-2 h-4 w-4" />
                    Control en Vivo
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href={`/encargado/control/${procesion.id}`}>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Procesión
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="marchas" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="marchas" className="gap-2">
            <Music className="h-4 w-4" />
            Sones y Alabados
          </TabsTrigger>
          <TabsTrigger value="ruta" className="gap-2">
            <MapPin className="h-4 w-4" />
            Ruta
          </TabsTrigger>
          <TabsTrigger value="ajustes" className="gap-2">
            <Settings className="h-4 w-4" />
            Ajustes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="marchas">
          <MarchasManager
            procesionId={procesion.id}
            initialMarchas={marchas || []}
            totalTurnos={procesion.total_turnos || 1}
            turnosRuta={turnosRuta}
          />
        </TabsContent>
        
        <TabsContent value="ruta">
          <RutaManager
            procesionId={procesion.id}
            initialPuntos={puntosRuta || []}
            marchas={marchas || []}
          />
        </TabsContent>
        
        <TabsContent value="ajustes">
          <ProcesionActions procesion={procesion} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
