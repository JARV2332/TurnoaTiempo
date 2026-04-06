'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cerrarSesion } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'
import { LogOut, User, Radio, Shield } from 'lucide-react'
import Link from 'next/link'

interface EncargadoHeaderProps {
  userName: string
  hermandadNombre?: string
  isSuperAdmin?: boolean
}

export function EncargadoHeader({ userName, hermandadNombre, isSuperAdmin }: EncargadoHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await cerrarSesion()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
          <Radio className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Panel de Encargado</span>
          {hermandadNombre && (
            <span className="text-xs text-muted-foreground">{hermandadNombre}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isSuperAdmin && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
                <User className="h-4 w-4 text-secondary" />
              </div>
              <span className="hidden sm:inline-block text-sm">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/">Ver sitio público</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
