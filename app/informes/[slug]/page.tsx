import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InformeCartaClient } from '@/components/informes/informe-carta-client'
import { getInformeBySlug, getInformeSlugs } from '@/lib/informes'

export function generateStaticParams() {
  return getInformeSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const detail = getInformeBySlug(slug)
  if (!detail) return { title: 'Informe no encontrado' }

  return {
    title: detail.meta.title,
    description: detail.meta.description,
    openGraph: {
      title: detail.meta.headline,
      description: detail.meta.description,
      type: 'article',
    },
  }
}

export default async function InformeDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const detail = getInformeBySlug(slug)
  if (!detail) notFound()

  return <InformeCartaClient detail={detail} />
}
