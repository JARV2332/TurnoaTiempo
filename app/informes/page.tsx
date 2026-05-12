import Link from 'next/link'
import { FileText } from 'lucide-react'
import { getInformesList } from '@/lib/informes'

export default function InformesIndexPage() {
  const items = getInformesList()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-foreground">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">
          Informes de uso y casos de éxito
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Documentos públicos con métricas y resultados del seguimiento en vivo. Puedes compartir el enlace con
          juntas directivas, encargados de logística o hermanos de la cofradía.
        </p>
      </div>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/informes/${item.slug}`}
              className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.excerpt}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.dateLabel}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
