import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Radio, Users, Shield } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get active procesiones for public tracking
  const { data: procesiones } = await supabase
    .from('procesiones')
    .select(`
      id,
      nombre,
      estado,
      hermandad:hermandades(
        nombre,
        escudo_url
      )
    `)
    .eq('estado', 'en_curso')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-svh">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
            <Radio className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Turno en Tiempo Real
          </h1>
          
          <p className="text-lg text-muted-foreground text-pretty max-w-lg">
            Sigue el recorrido de las procesiones de Semana Santa en tiempo real. 
            Visualiza la ubicación, el turno actual y la marcha que suena.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="#procesiones">
                <MapPin className="mr-2 h-5 w-5" />
                Ver Procesiones
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">
                <Shield className="mr-2 h-5 w-5" />
                Acceso Gestores
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Active Procesiones Section */}
      <section id="procesiones" className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Procesiones en Curso
            </h2>
            <p className="text-muted-foreground">
              Selecciona una procesión para seguir su recorrido en tiempo real
            </p>
          </div>
          
          {procesiones && procesiones.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {procesiones.map((procesion) => (
                <Link key={procesion.id} href={`/seguimiento/${procesion.id}`}>
                  <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                      {procesion.hermandad?.escudo_url ? (
                        <img 
                          src={procesion.hermandad.escudo_url} 
                          alt="" 
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {procesion.nombre}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {procesion.hermandad?.nombre}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-green-400">En directo</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="glass-card max-w-md mx-auto">
              <CardContent className="flex flex-col items-center py-10 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">
                  Sin procesiones activas
                </h3>
                <p className="text-sm text-muted-foreground">
                  No hay ninguna procesión en curso en este momento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="px-6 py-16 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Ubicación en Tiempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Visualiza la posición exacta de la procesión sobre el mapa con actualizaciones en directo.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Radio className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Turno y Marcha Actual</h3>
              <p className="text-sm text-muted-foreground">
                Conoce qué turno está sonando y qué marcha está interpretando la banda en cada momento.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Recorrido Completo</h3>
              <p className="text-sm text-muted-foreground">
                Consulta el itinerario de ida y regreso con los puntos clave del recorrido.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Turno en Tiempo Real</p>
          <Link href="/auth/login" className="hover:text-primary transition-colors">
            Acceso para gestores
          </Link>
        </div>
      </footer>
    </main>
  )
}
