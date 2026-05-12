import type { InformeDetail, InformeListItem, InformeSlug } from './types'
import { informeVirgenSocorroDetail, informeVirgenSocorroList } from './virgen-del-socorro-catedral-2026'

const LIST: InformeListItem[] = [informeVirgenSocorroList]

const DETAIL: Record<InformeSlug, InformeDetail> = {
  'virgen-del-socorro-catedral-2026': informeVirgenSocorroDetail,
}

export function getInformesList(): InformeListItem[] {
  return LIST
}

export function getInformeBySlug(slug: string): InformeDetail | undefined {
  return DETAIL[slug as InformeSlug]
}

export function getInformeSlugs(): InformeSlug[] {
  return LIST.map((i) => i.slug)
}
