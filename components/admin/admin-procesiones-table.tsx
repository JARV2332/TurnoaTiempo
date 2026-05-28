'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExternalLink, Pencil, Radio } from 'lucide-react'
import { DeleteProcesionButton } from '@/components/admin/delete-procesion-button'
import { estadoProcesionClass, estadoProcesionLabel } from '@/lib/procesion-estado'
import { formatearFechaISO } from '@/lib/fecha'
import type { ProcesionEstado } from '@/lib/types'

export type ProcesionListItem = {
  id: string
  nombre: string
  fecha: string | null
  estado: ProcesionEstado
  hermandad: { nombre: string } | null
}

export function AdminProcesionesTable({ procesiones }: { procesiones: ProcesionListItem[] }) {
  const [nombre, setNombre] = useState('')
  const [hermandad, setHermandad] = useState('')
  const [estado, setEstado] = useState<string>('todas')

  const filtradas = useMemo(() => {
    const qNombre = nombre.trim().toLowerCase()
    const qHermandad = hermandad.trim().toLowerCase()

    return procesiones.filter((p) => {
      if (estado !== 'todas' && p.estado !== estado) return false
      if (qNombre && !p.nombre.toLowerCase().includes(qNombre)) return false
      if (qHermandad && !(p.hermandad?.nombre || '').toLowerCase().includes(qHermandad)) {
        return false
      }
      return true
    })
  }, [procesiones, nombre, hermandad, estado])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium align-bottom">Procesión</th>
            <th className="pb-2 pr-4 font-medium align-bottom hidden md:table-cell">Hermandad</th>
            <th className="pb-2 pr-4 font-medium align-bottom hidden sm:table-cell">Fecha</th>
            <th className="pb-2 pr-4 font-medium align-bottom">Estado</th>
            <th className="pb-2 font-medium text-right align-bottom">Acciones</th>
          </tr>
          <tr className="border-b border-border">
            <th className="py-2 pr-4 font-normal">
              <Input
                placeholder="Buscar..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-8 text-xs bg-input/50"
              />
            </th>
            <th className="py-2 pr-4 font-normal hidden md:table-cell">
              <Input
                placeholder="Buscar..."
                value={hermandad}
                onChange={(e) => setHermandad(e.target.value)}
                className="h-8 text-xs bg-input/50"
              />
            </th>
            <th className="py-2 pr-4 hidden sm:table-cell" />
            <th className="py-2 pr-4 font-normal">
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="h-8 text-xs bg-input/50">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos</SelectItem>
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="en_curso">En curso</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {filtradas.length > 0 ? (
            filtradas.map((procesion) => (
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
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${estadoProcesionClass(procesion.estado)}`}
                  >
                    {estadoProcesionLabel(procesion.estado)}
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
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-12 text-center text-muted-foreground">
                No hay procesiones con estos filtros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
