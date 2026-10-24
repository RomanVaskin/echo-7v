import type { MetadataRoute } from 'next'
import { getPosts } from '@/lib/blog'
import { localePath, siteUrl } from '@/lib/i18n'

/** Indexable pages. Add a path here when a new public page is created. */
const pages: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/journeys', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/journeys/caribbean', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/team', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/contacts', priority: 0.6, changeFrequency: 'monthly' },
]

const absolute = (path: string) => new URL(path, siteUrl).toString()

/** One entry per language, each listing both language versions (hreflang alternates). */
function entries(path: string, extra: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>): MetadataRoute.Sitemap {
  const languages = { en: absolute(localePath('en', path)), ru: absolute(localePath('ru', path)) }
  return (['en', 'ru'] as const).map((locale) => ({
    url: languages[locale],
    alternates: { languages },
    ...extra,
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  // Only articles listed in lib/blog.ts are published; there is nothing else to include.
  const posts = getPosts().map((post) =>
    entries(`/blog/${post.slug}`, {
      lastModified: post.date ? new Date(`${post.date}T00:00:00Z`) : lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    }),
  )

  return [...pages.flatMap(({ path, ...rest }) => entries(path, { lastModified, ...rest })), ...posts.flat()]
}
