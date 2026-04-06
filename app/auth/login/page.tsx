'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Get user profile to determine redirect
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      console.log('[v0] Profile data:', profile)
      console.log('[v0] Profile error:', profileError)
      console.log('[v0] User ID:', data.user.id)
      
      if (profile?.role === 'superadmin') {
        router.push('/admin')
      } else {
        router.push('/encargado')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-balance text-center">Turno en Tiempo Real</h1>
            <p className="text-sm text-muted-foreground text-center">Panel de Gestión de Procesiones</p>
          </div>
          
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Introduce tus credenciales para acceder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input/50"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                      {error}
                    </p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Entrar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link href="/auth/registro" className="text-primary hover:underline font-medium">
              Registrarse
            </Link>
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
