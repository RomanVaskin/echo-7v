import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageIntro } from '@/components/site/page-intro'
import { BlogGrid } from '@/components/blog/blog-grid'
import { getPosts } from '@/lib/blog'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale } from '@/lib/i18n'

const PATH = '/blog'

export async function generateMetadata({ params }: PageProps<'/[lang]/blog'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    title: dict.meta.blogTitle,
    description: dict.meta.blogDescription,
    alternates: alternates(lang, PATH),
  }
}

export default async function BlogPage({ params }: PageProps<'/[lang]/blog'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const t = dict.blogPage

  return (
    <>
      <SiteHeader locale={locale} path={PATH} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        <PageIntro eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
        <section aria-label={t.title} className="theme-light">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <BlogGrid locale={locale} posts={getPosts()} dict={t} />
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
