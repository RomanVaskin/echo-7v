import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { blogPosts, formatPostDate, getPost } from '@/lib/blog'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale, localePath, siteUrl } from '@/lib/i18n'

// Only articles listed in lib/blog.ts exist; any other slug is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[lang]/blog/[slug]'>): Promise<Metadata> {
  const { lang, slug } = await params
  const post = getPost(slug)
  if (!isLocale(lang) || !post) return {}

  const title = post.seo?.title[lang] ?? post.title[lang]
  const description = post.seo?.description[lang] ?? post.excerpt[lang]
  return {
    // The SEO title already names the site, so it skips the "— seasmates" template
    title: post.seo ? { absolute: title } : title,
    description,
    alternates: alternates(lang, `/blog/${post.slug}`),
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      title,
      description,
      url: localePath(lang, `/blog/${post.slug}`),
      locale: lang === 'ru' ? 'ru_RU' : 'en_GB',
      publishedTime: post.date ?? undefined,
      images: [{ url: post.cover, alt: post.coverAlt[lang] }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [post.cover] },
  }
}

const bodyText = 'mx-auto w-full max-w-2xl'

export default async function BlogPostPage({ params }: PageProps<'/[lang]/blog/[slug]'>) {
  const { lang: locale, slug } = await params
  const post = getPost(slug)
  if (!isLocale(locale) || !post) notFound()

  const dict = getDictionary(locale)
  const t = dict.blogPage
  const path = `/blog/${post.slug}`

  // schema.org Article for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title[locale],
    description: post.seo?.description[locale] ?? post.excerpt[locale],
    image: [new URL(post.cover, siteUrl).toString()],
    datePublished: post.date ?? undefined,
    inLanguage: locale,
    mainEntityOfPage: new URL(localePath(locale, path), siteUrl).toString(),
    author: { '@type': 'Organization', name: 'seasmates' },
    publisher: { '@type': 'Organization', name: 'seasmates' },
  }

  return (
    <>
      <SiteHeader locale={locale} path={path} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        <article>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          {/* Magazine opening: category, date and title beside a tall cover photo */}
          <header className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-36 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-end lg:gap-16 lg:px-10 lg:pb-24 lg:pt-44">
            <div className="hero-fade flex flex-col gap-6 border-t border-border pt-8">
              <p className="eyebrow flex flex-wrap gap-x-3 gap-y-1">
                <span className="text-primary">{t.categories[post.category]}</span>
                {post.date && (
                  <time dateTime={post.date} className="text-foreground/60">
                    {formatPostDate(locale, post.date)}
                  </time>
                )}
              </p>
              <h1 className="font-display text-balance text-5xl leading-[1.04] md:text-6xl xl:text-7xl">{post.title[locale]}</h1>
            </div>
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
              <Image src={post.cover} alt={post.coverAlt[locale]} fill priority sizes="(min-width: 1024px) 27rem, 100vw" className="object-cover" />
            </div>
          </header>

          <div className="flex flex-col gap-8 px-6 pb-20 text-lg leading-[1.8] lg:px-10 lg:pb-28">
            {post.body.map((block, i) => {
              switch (block.type) {
                case 'lead':
                  return (
                    <p key={i} className={`${bodyText} text-pretty font-display text-2xl leading-snug tracking-[-0.01em] md:text-[2rem]`}>
                      {block.text[locale]}
                    </p>
                  )
                case 'paragraph':
                  return (
                    <p key={i} className={`${bodyText} text-pretty text-foreground/85`}>
                      {block.text[locale]}
                    </p>
                  )
                case 'image':
                  return (
                    <figure key={i} className="mx-auto my-6 flex w-full max-w-5xl flex-col gap-3">
                      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
                        <Image src={block.src} alt={block.alt[locale]} fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
                      </div>
                      {block.caption && <figcaption className="eyebrow">{block.caption[locale]}</figcaption>}
                    </figure>
                  )
                case 'image-pair':
                  return (
                    <div key={i} className="mx-auto my-6 grid w-full max-w-5xl gap-4 sm:grid-cols-2 sm:gap-6">
                      {block.images.map((image) => (
                        <figure key={image.src} className="flex flex-col gap-3">
                          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                            <Image src={image.src} alt={image.alt[locale]} fill sizes="(min-width: 1024px) 32rem, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                          </div>
                          {image.caption && <figcaption className="eyebrow">{image.caption[locale]}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  )
                case 'cta':
                  return (
                    // Closing invitation on the light band, with the button to the journey page
                    <aside key={i} className="theme-light mx-auto mt-10 flex w-full max-w-3xl flex-col gap-5 rounded-2xl px-6 py-10 md:px-12 md:py-14">
                      <h2 className="font-display text-balance text-3xl md:text-4xl">{block.title[locale]}</h2>
                      {block.text.map((line) => (
                        <p key={line[locale]} className="text-base leading-relaxed">
                          {line[locale]}
                        </p>
                      ))}
                      <Link
                        href={localePath(locale, block.href)}
                        className="enquiry-submit enquiry-submit--ringed group mt-3 inline-flex items-center gap-3 self-start rounded-full px-8 py-4 text-xs uppercase tracking-[0.14em]"
                      >
                        {block.label[locale]}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </aside>
                  )
              }
            })}

            <Link
              href={localePath(locale, '/blog')}
              className={`${bodyText} group mt-6 inline-flex items-center gap-3 border-t border-border pt-6 text-xs uppercase tracking-[0.14em]`}
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
