import type { Dictionary } from '@/lib/dictionaries'
import { SectionHeading } from '@/components/site/section-heading'

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="reveal flex flex-col gap-6 py-10 md:px-12 md:py-2 md:first:pl-0 md:last:pr-0">
      <h3 className="eyebrow text-foreground">{title}</h3>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item} className="flex items-baseline gap-4 text-lg">
            <span aria-hidden="true" className="h-px w-4 shrink-0 translate-y-[-0.35em] bg-foreground/60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Two equal columns with a thin divider on desktop, stacked on phones. Lists are preliminary. */
export function Inclusions({ dict }: { dict: Dictionary['caribbean']['inclusions'] }) {
  return (
    <section aria-labelledby="inclusions-title" className="theme-light">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <SectionHeading id="inclusions-title" index="05" eyebrow={dict.eyebrow} title={dict.title} description={dict.note} />
        <div className="mt-10 grid divide-y divide-border md:mt-14 md:grid-cols-2 md:divide-x md:divide-y-0">
          <List title={dict.includedTitle} items={dict.included} />
          <List title={dict.notIncludedTitle} items={dict.notIncluded} />
        </div>
      </div>
    </section>
  )
}
