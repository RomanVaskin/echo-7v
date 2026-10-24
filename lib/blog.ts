import type { Locale } from '@/lib/i18n'

export const blogCategories = ['destinations', 'yacht-life', 'tips', 'stories'] as const
export type BlogCategory = (typeof blogCategories)[number]

/** One block of an article body: a paragraph or an image with an optional caption. */
export type BlogBlock =
  | { type: 'paragraph'; text: Record<Locale, string> }
  | { type: 'image'; src: string; alt: Record<Locale, string>; caption?: Record<Locale, string> }

/**
 * Journal articles for /blog and /blog/[slug]. Add an entry to publish it in both
 * languages — the list, the article page, its metadata and static generation all
 * read from here, so nothing else needs editing. Covers go in public/images/blog/.
 *
 * {
 *   slug: 'first-story',
 *   category: 'stories',
 *   date: '2026-11-01',            // ISO date, or null if not known
 *   cover: '/images/blog/first-story.jpg',
 *   title: { en: '…', ru: '…' },
 *   excerpt: { en: '…', ru: '…' },
 *   body: [{ type: 'paragraph', text: { en: '…', ru: '…' } }],
 * }
 */
export type BlogPost = {
  slug: string
  category: BlogCategory
  date: string | null
  cover: string
  title: Record<Locale, string>
  excerpt: Record<Locale, string>
  body: BlogBlock[]
}

export const blogPosts: BlogPost[] = []

export function getPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

/** Newest first; undated posts go last. */
export function getPosts() {
  return [...blogPosts].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export function formatPostDate(locale: Locale, date: string) {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`))
}
