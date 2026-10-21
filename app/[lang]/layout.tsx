import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import { notFound } from 'next/navigation'
import 'leaflet/dist/leaflet.css'
import '../globals.css'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale, locales, siteUrl } from '@/lib/i18n'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
})

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.meta.siteTitle,
      template: '%s — Seasemates',
    },
    description: dict.meta.siteDescription,
    generator: 'v0.app',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon-32x32.png', type: 'image/png', sizes: '32x32' },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a2326',
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return (
    <html lang={lang} className={`${cormorant.variable} ${manrope.variable} bg-background`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
