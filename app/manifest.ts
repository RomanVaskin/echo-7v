import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'seasmates — United by the Sea',
    short_name: 'seasmates',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a2326',
    theme_color: '#0a2326',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  }
}
