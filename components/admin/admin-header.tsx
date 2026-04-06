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
import { LogOut, User, Menu, Shield, Church, Users, Settings, LayoutDashboard } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/hermandades', label: 'Hermandades', icon: Church },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

interface AdminHeaderProps {
  userName: string
}

export function AdminHeader({ userName }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await cerrarSesion()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">SuperAdmin</span>
                  <span className="text-xs text-muted-foreground">Panel de Control</span>
                </div>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/admin' && pathname.startsWith(item.href))
                    
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                            isActive 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="hidden lg:block" />
      
      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline-block text-sm">{userName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/admin/configuracion">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
