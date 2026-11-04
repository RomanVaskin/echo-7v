import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SectionHeading } from '@/components/site/section-heading'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale, localePath } from '@/lib/i18n'
import { TEAM_PLACEHOLDERS, teamMembers, teamPlaceholderNames, teamPlaceholderPhotos } from '@/lib/team'

const PATH = '/team'

export async function generateMetadata({ params }: PageProps<'/[lang]/team'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    title: dict.meta.teamTitle,
    description: dict.meta.teamDescription,
    alternates: alternates(lang, PATH),
  }
}

export default async function TeamPage({ params }: PageProps<'/[lang]/team'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const t = dict.teamPage

  return (
    <>
      <SiteHeader locale={locale} path={PATH} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        {/* First screen: a catamaran under sail among white cliffs, toned down for the white text */}
        <section className="relative flex min-h-[78svh] items-end overflow-hidden">
          <Image
            src="/images/team/team-hero.jpg"
            alt={t.imageAlt}
            fill
            priority
            sizes="100vw"
            // Portrait photo: keep the catamaran (lower half) in frame on wide screens
            className="object-cover object-[50%_70%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-background/45" />
          <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-40 lg:px-10 lg:pb-24">
            <div className="hero-fade flex max-w-3xl flex-col gap-6">
              <p className="eyebrow text-foreground/80">{t.eyebrow}</p>
              <h1 className="font-display text-balance text-5xl md:text-7xl">{t.title}</h1>
              <p className="max-w-2xl text-pretty text-lg leading-relaxed text-foreground/85">{t.lead}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="team-title" className="theme-light">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <SectionHeading
              id="team-title"
              index="01"
              eyebrow={t.membersEyebrow}
              title={t.membersTitle}
              
            />
            <ul className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.length > 0
                ? teamMembers.map((member) => (
                    <li key={member.id} className="reveal flex flex-col gap-5">
                      <div className="relative aspect-[4/5] overflow-hidden bg-foreground/10">
                        {member.photo && (
                          <Image
                            src={member.photo}
                            alt={member.name[locale]}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-2 border-t border-border pt-5">
                        <h3 className="font-display text-3xl">{member.name[locale]}</h3>
                        <p className="eyebrow">{member.role[locale]}</p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{member.bio[locale]}</p>
                      </div>
                    </li>
                  ))
                : Array.from({ length: TEAM_PLACEHOLDERS }, (_, i) => (
                    // photo (or an empty frame) and first name until full profiles are added in lib/team.ts
                    <li key={i} className="reveal flex flex-col gap-5">
                      {teamPlaceholderPhotos[i] ? (
                        <div className="relative aspect-[4/5] overflow-hidden bg-foreground/10">
                          <Image
                            src={teamPlaceholderPhotos[i]}
                            alt={teamPlaceholderNames[i]?.[locale] ?? ''}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[4/5] items-end bg-foreground/10 p-6">
                          <span className="eyebrow">{t.photoPending}</span>
                        </div>
                      )}
                      {teamPlaceholderNames[i] ? (
                        <h3 className="border-t border-border pt-5 font-display text-3xl">{teamPlaceholderNames[i][locale]}</h3>
                      ) : (
                        <div className="border-t border-border" />
                      )}
                    </li>
                  ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="approach-title" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <SectionHeading id="approach-title" index="02" eyebrow={t.approachEyebrow} title={t.approachTitle} />
          {/* A short list of what matters to us: no numbers or rules, smaller titles, tighter spacing */}
          <ul className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {t.approach.map((item) => (
              <li key={item.title} className="reveal flex flex-col gap-2">
                <h3 className="font-display text-2xl md:text-3xl">{item.title}</h3>
                <p className="max-w-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-20 flex justify-center">
            <Link
              href={localePath(locale, '/journeys')}
              className="group flex items-center gap-3 rounded-full border border-foreground/60 px-9 py-4 text-xs uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {t.cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
