import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Church, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { DeleteHermandadButton } from '@/components/admin/delete-hermandad-button'

export default async function HermandadesPage() {
  const supabase = await createClient()
  
  const { data: hermandades } = await supabase
    .from('hermandades')
    .select('*')
    .order('nombre')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hermandades</h1>
          <p className="text-muted-foreground">
            Gestiona las hermandades registradas en el sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/hermandades/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Hermandad
          </Link>
        </Button>
      </div>
      
      {hermandades && hermandades.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hermandades.map((hermandad) => (
            <Card key={hermandad.id} className="glass-card">
              <CardHeader className="flex flex-row items-start gap-4">
                {hermandad.escudo_url ? (
                  <img 
                    src={hermandad.escudo_url} 
                    alt={`Escudo de ${hermandad.nombre}`}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Church className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {hermandad.nombre}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {hermandad.descripcion || 'Sin descripción'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/admin/hermandades/${hermandad.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                  <DeleteHermandadButton 
                    hermandadId={hermandad.id} 
                    hermandadNombre={hermandad.nombre} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Church className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">
              No hay hermandades
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea la primera hermandad para comenzar
            </p>
            <Button asChild>
              <Link href="/admin/hermandades/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Hermandad
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
