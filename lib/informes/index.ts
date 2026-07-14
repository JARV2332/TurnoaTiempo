import type { InformeDetail, InformeListItem, InformeSlug } from './types'
import { informeVirgenSocorroDetail, informeVirgenSocorroList } from './virgen-del-socorro-catedral-2026'
import { informeVirgenCarmenDetail, informeVirgenCarmenList } from './virgen-del-carmen-santuario-2026'

const LIST: InformeListItem[] = [informeVirgenCarmenList, informeVirgenSocorroList]

const DETAIL: Record<InformeSlug, InformeDetail> = {
  'virgen-del-socorro-catedral-2026': informeVirgenSocorroDetail,
  'virgen-del-carmen-santuario-2026': informeVirgenCarmenDetail,
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
