import { headers } from 'next/headers'
import { siteUrl } from '@/lib/i18n'

/**
 * Public origin for links back to the site (PayPal return/cancel URLs). The configured SITE_URL wins,
 * so a spoofed Host header can never redirect a payer elsewhere; the request host is a fallback
 * for previews and local runs.
 */
export async function requestOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '')
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return siteUrl
  const proto = h.get('x-forwarded-proto') ?? (/^(localhost|127\.)/.test(host) ? 'http' : 'https')
  return `${proto}://${host}`
}
