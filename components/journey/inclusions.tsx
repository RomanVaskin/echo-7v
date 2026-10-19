import { Check, Minus } from 'lucide-react'
import { SectionHeading } from '@/components/site/section-heading'

function List({ title, items, included }: { title: string; items: string[]; included: boolean }) {
  return (
    <div className="reveal flex flex-col gap-4">
      <h3 className="eyebrow">{title}</h3>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-4 border-b border-border py-4">
            {included ? (
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <span className={included ? 'text-foreground' : 'text-muted-foreground'}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Inclusions({ included, notIncluded }: { included: string[]; notIncluded: string[] }) {
  return (
    <section aria-labelledby="inclusions-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <SectionHeading
        id="inclusions-title"
        index="05"
        eyebrow="Inclusions"
        title="What’s included"
        description="Indicative list — final inclusions are confirmed with each departure."
      />
      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <List title="Included" items={included} included />
        <List title="Not included" items={notIncluded} included={false} />
      </div>
    </section>
  )
}
