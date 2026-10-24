import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { blogPosts, formatPostDate, getPost } from '@/lib/blog'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale, localePath } from '@/lib/i18n'

// Only articles listed in lib/blog.ts exist; any other slug is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[lang]/blog/[slug]'>): Promise<Metadata> {
  const { lang, slug } = await params
  const post = getPost(slug)
  if (!isLocale(lang) || !post) return {}

  return {
    title: post.title[lang],
    description: post.excerpt[lang],
    alternates: alternates(lang, `/blog/${post.slug}`),
    openGraph: { type: 'article', title: post.title[lang], description: post.excerpt[lang], images: [post.cover] },
  }
}

export default async function BlogPostPage({ params }: PageProps<'/[lang]/blog/[slug]'>) {
  const { lang: locale, slug } = await params
  const post = getPost(slug)
  if (!isLocale(locale) || !post) notFound()

  const dict = getDictionary(locale)
  const t = dict.blogPage
  const path = `/blog/${post.slug}`

  return (
    <>
      <SiteHeader locale={locale} path={path} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        <article>
          <header className="mx-auto max-w-4xl px-6 pb-12 pt-36 lg:px-10 lg:pt-44">
            <div className="hero-fade flex flex-col gap-6 border-t border-border pt-8">
              <p className="eyebrow flex gap-3">
                <span>{t.categories[post.category]}</span>
                {post.date && (
                  <time dateTime={post.date} className="text-foreground/60">
                    {formatPostDate(locale, post.date)}
                  </time>
                )}
              </p>
              <h1 className="font-display text-balance text-5xl md:text-6xl">{post.title[locale]}</h1>
            </div>
          </header>

          <div className="relative mx-auto aspect-[16/9] max-w-6xl overflow-hidden">
            <Image src={post.cover} alt={post.title[locale]} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
          </div>

          <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16 text-lg leading-relaxed lg:px-10 lg:py-24">
            {post.body.map((block, i) =>
              block.type === 'paragraph' ? (
                <p key={i} className="text-pretty text-foreground/90">
                  {block.text[locale]}
                </p>
              ) : (
                <figure key={i} className="flex flex-col gap-3">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image src={block.src} alt={block.alt[locale]} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
                  </div>
                  {block.caption && <figcaption className="eyebrow">{block.caption[locale]}</figcaption>}
                </figure>
              ),
            )}

            <Link
              href={localePath(locale, '/blog')}
              className="group mt-6 inline-flex items-center gap-3 self-start border-t border-border pt-6 text-xs uppercase tracking-[0.14em]"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              {t.back}
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
