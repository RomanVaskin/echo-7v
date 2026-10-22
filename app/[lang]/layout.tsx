import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import 'leaflet/dist/leaflet.css'
import '../globals.css'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale, locales, siteUrl } from '@/lib/i18n'

// Serif is kept only for the hero "seasmates" wordmark.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cormorant',
})

// Inter with the optical-size axis: large sizes render with the Display cut.
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-inter',
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
      template: '%s — seasmates',
    },
    description: dict.meta.siteDescription,
    applicationName: 'seasmates',
    openGraph: {
      type: 'website',
      siteName: 'seasmates',
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      locale: lang === 'ru' ? 'ru_RU' : 'en_GB',
      images: [{ url: '/images/hero-sailing.png', alt: dict.hero.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      images: ['/images/hero-sailing.png'],
    },
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
  themeColor: '#062b30',
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return (
    <html lang={lang} className={`${cormorant.variable} ${inter.variable} bg-background`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
