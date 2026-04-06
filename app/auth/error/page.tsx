import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="glass-card border-destructive/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl">
                Error de Autenticación
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error ? (
                <p className="text-sm text-muted-foreground mb-4">
                  {params.error === 'access_denied' 
                    ? 'Acceso denegado. Por favor, verifica tus credenciales.'
                    : `Error: ${params.error}`}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  Ha ocurrido un error inesperado.
                </p>
              )}
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Volver al inicio de sesión
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
