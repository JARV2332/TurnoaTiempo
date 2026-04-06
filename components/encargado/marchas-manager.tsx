'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Music, GripVertical, Trash2, Save } from 'lucide-react'
import type { Marcha } from '@/lib/types'

interface MarchasManagerProps {
  procesionId: string
  initialMarchas: Marcha[]
}

export function MarchasManager({ procesionId, initialMarchas }: MarchasManagerProps) {
  const router = useRouter()
  const [marchas, setMarchas] = useState<Marcha[]>(initialMarchas)
  const [newMarcha, setNewMarcha] = useState({ nombre: '', autor: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleAddMarcha = async () => {
    if (!newMarcha.nombre.trim()) return
    
    setIsLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('marchas')
      .insert({
        procesion_id: procesionId,
        nombre: newMarcha.nombre,
        autor: newMarcha.autor || null,
        orden: marchas.length,
      })
      .select()
      .single()
    
    if (!error && data) {
      setMarchas([...marchas, data])
      setNewMarcha({ nombre: '', autor: '' })
    }
    
    setIsLoading(false)
    router.refresh()
  }

  const handleDeleteMarcha = async (id: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('marchas')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setMarchas(marchas.filter(m => m.id !== id))
    }
    
    router.refresh()
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newMarchas = [...marchas]
    const [moved] = newMarchas.splice(fromIndex, 1)
    newMarchas.splice(toIndex, 0, moved)
    
    // Update orden
    const updated = newMarchas.map((m, i) => ({ ...m, orden: i }))
    setMarchas(updated)
    
    // Save to database
    const supabase = createClient()
    for (const marcha of updated) {
      await supabase
        .from('marchas')
        .update({ orden: marcha.orden })
        .eq('id', marcha.id)
    }
    
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-secondary" />
            Lista de Marchas
          </CardTitle>
          <CardDescription>
            Añade las marchas que se interpretarán durante la procesión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new marcha */}
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la marcha"
              value={newMarcha.nombre}
              onChange={(e) => setNewMarcha({ ...newMarcha, nombre: e.target.value })}
              className="bg-input/50 flex-1"
            />
            <Input
              placeholder="Autor (opcional)"
              value={newMarcha.autor}
              onChange={(e) => setNewMarcha({ ...newMarcha, autor: e.target.value })}
              className="bg-input/50 flex-1"
            />
            <Button onClick={handleAddMarcha} disabled={isLoading || !newMarcha.nombre.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Marchas list */}
          {marchas.length > 0 ? (
            <div className="space-y-2">
              {marchas.map((marcha, index) => (
                <div 
                  key={marcha.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
                >
                  <div className="cursor-move text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{marcha.nombre}</p>
                    {marcha.autor && (
                      <p className="text-sm text-muted-foreground truncate">{marcha.autor}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteMarcha(marcha.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Music className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay marchas añadidas todavía
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
