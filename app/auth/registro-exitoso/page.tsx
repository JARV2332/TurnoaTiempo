import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MapPin, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RegistroExitosoPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Turno en Tiempo Real
              </span>
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl text-foreground">
                ¡Registro exitoso!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Revisa tu correo para confirmar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Te hemos enviado un correo de confirmación. 
                  Haz clic en el enlace para activar tu cuenta.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">
                  Ir a iniciar sesión
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
