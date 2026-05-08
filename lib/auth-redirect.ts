export function getAuthEmailRedirectUrl(): string {
  const explicitRedirect = process.env.NEXT_PUBLIC_AUTH_EMAIL_REDIRECT_URL
  if (explicitRedirect) return explicitRedirect

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) return `${siteUrl.replace(/\/$/, '')}/auth/login`

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/login`
  }

  return '/auth/login'
}
