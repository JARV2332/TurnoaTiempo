import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://turnoatiempo.com'),
  title: 'Turno a Tiempo | Seguimiento de procesiones en vivo',
  description:
    'Plataforma de seguimiento en tiempo real de procesiones. Recorrido en mapa, turno actual y marcha. Para cofradías y público.',
  keywords: ['semana santa', 'procesiones', 'seguimiento', 'hermandades', 'cofradías', 'turno a tiempo'],
  icons: {
    icon: [{ url: '/turnoatiempo.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/turnoatiempo.jpg', type: 'image/jpeg' }],
  },
  openGraph: {
    title: 'Turno a Tiempo',
    description: 'Seguimiento de procesiones en mapa en tiempo real.',
    url: 'https://turnoatiempo.com',
    siteName: 'Turno a Tiempo',
    locale: 'es',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e1b4b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <div className="fixed bottom-4 right-4 z-[60]">
            <ThemeToggle />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
