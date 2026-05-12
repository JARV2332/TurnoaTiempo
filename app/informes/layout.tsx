import type { Metadata } from 'next'
import Link from 'next/link'
import { Playfair_Display, Source_Serif_4 } from 'next/font/google'
import './informes-carta.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-informe-display',
  weight: ['400', '600', '700'],
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-informe-serif',
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Informes y casos de éxito | Turno a Tiempo',
  description:
    'Informes públicos de uso y métricas del seguimiento de procesiones en vivo. Material para compartir con cofradías y hermandades.',
  openGraph: {
    title: 'Informes | Turno a Tiempo',
    description: 'Casos de éxito y métricas del seguimiento en vivo.',
  },
}

export default function InformesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${sourceSerif.variable} min-h-svh bg-[#faf8f5]`}>
      <header className="sticky top-0 z-10 border-b border-[#e8e4dc] bg-[#faf8f5]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          <Link href="/" className="text-[#1a3a5c] hover:underline">
            ← turnoatiempo.com
          </Link>
          <Link href="/informes" className="font-medium text-[#1a3a5c] hover:underline">
            Informes y casos de éxito
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
