/** Modo app Android de campo: solo login, lista y control en vivo. */
export const APP_CONTROL_QUERY = 'app=control'

export function isAppControlSearchParams(
  params: { app?: string | string[] } | URLSearchParams | null | undefined,
): boolean {
  if (!params) return false
  if (params instanceof URLSearchParams) {
    return params.get('app') === 'control'
  }
  const v = params.app
  return v === 'control' || (Array.isArray(v) && v.includes('control'))
}

export function withAppControl(href: string, appControl: boolean): string {
  if (!appControl) return href
  const [path, hash = ''] = href.split('#')
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}app=control${hash ? `#${hash}` : ''}`
}

export const APP_CONTROL_STORAGE_KEY = 'tat_app_control'

/** Solo cliente: URL o sesión de la app Capacitor. */
export function isAppControlClient(): boolean {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).get('app') === 'control') return true
  try {
    return sessionStorage.getItem(APP_CONTROL_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function persistAppControlSession(): void {
  if (typeof window === 'undefined') return
  if (new URLSearchParams(window.location.search).get('app') === 'control') {
    try {
      sessionStorage.setItem(APP_CONTROL_STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }
}
