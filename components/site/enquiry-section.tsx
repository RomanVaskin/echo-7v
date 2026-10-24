import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import { EnquiryForm } from './enquiry-form'
import { SocialLinks } from './social-links'

type EnquirySectionProps = {
  index?: string
  title: React.ReactNode
  description: string
  /** Journey the enquiry is about; omitted on the home page. */
  journey?: string
  locale: Locale
  eyebrow: string
  form: Dictionary['form']
  social: Dictionary['social']
  /** `light`: warm light section (home page); default is the dark card surface. */
  tone?: 'dark' | 'light'
}

export function EnquirySection({
  index,
  title,
  description,
  journey,
  locale,
  eyebrow,
  form,
  social,
  tone = 'dark',
}: EnquirySectionProps) {
  return (
    <section id="enquire" aria-labelledby="enquire-title" className={tone === 'light' ? 'theme-light' : 'bg-card'}>
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-10 lg:py-24">
        <div className="reveal flex flex-col gap-5">
          <p className="eyebrow flex items-center gap-4">
            {index && <span className="text-primary">{index}</span>}
            <span>{eyebrow}</span>
          </p>
          <h2 id="enquire-title" className="font-display text-balance text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="max-w-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-10 lg:justify-self-end">
          <EnquiryForm journey={journey} locale={locale} dict={form} />
          <SocialLinks dict={social} />
        </div>
      </div>
    </section>
  )
}
