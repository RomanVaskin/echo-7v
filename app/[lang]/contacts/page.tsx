import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageIntro } from '@/components/site/page-intro'
import { EnquirySection } from '@/components/site/enquiry-section'
import { socialIcons, type Network } from '@/components/site/social-links'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale } from '@/lib/i18n'
import { socialLinks } from '@/lib/social'

const PATH = '/contacts'
const networks: Network[] = ['whatsapp', 'telegram', 'instagram']

export async function generateMetadata({ params }: PageProps<'/[lang]/contacts'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    title: dict.meta.contactsTitle,
    description: dict.meta.contactsDescription,
    alternates: alternates(lang, PATH),
  }
}

export default async function ContactsPage({ params }: PageProps<'/[lang]/contacts'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const t = dict.contactsPage

  return (
    <>
      <SiteHeader locale={locale} path={PATH} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        <PageIntro eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

        {/* The three channels. A channel becomes a link only once its real URL is set in lib/social.ts. */}
        <section aria-labelledby="channels-title" className="mx-auto max-w-7xl px-6 pb-20 lg:px-10 lg:pb-28">
          <h2 id="channels-title" className="eyebrow">
            {t.channelsTitle}
          </h2>
          <ul className="mt-8 grid border-t border-border sm:grid-cols-3">
            {networks.map((network) => {
              const href = socialLinks[network]
              const content = (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    className="size-[28px] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {socialIcons[network]}
                  </svg>
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-3xl">{t.channels[network]}</span>
                    {!href && <span className="eyebrow">{t.channelPending}</span>}
                  </span>
                </>
              )
              return (
                <li key={network} className="border-b border-border sm:border-b-0 sm:border-r sm:last:border-r-0">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={dict.social[network]}
                      className="flex items-center gap-5 py-8 transition-opacity hover:opacity-70 sm:px-8 sm:first:pl-0"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="flex items-center gap-5 py-8 text-foreground/70 sm:px-8">{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {/* The same enquiry form and server action as on the home page */}
        <EnquirySection
          tone="light"
          locale={locale}
          eyebrow={t.formEyebrow}
          form={dict.form}
          title={t.formTitle}
          description={t.formDescription}
        />

        <section aria-label={t.motto} className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-24 text-center lg:px-10 lg:py-32">
          <p className="font-display text-4xl uppercase tracking-[0.12em] md:text-6xl">{t.motto}</p>
          {t.mottoTranslation && <p className="eyebrow">{t.mottoTranslation}</p>}
        </section>
      </main>
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
