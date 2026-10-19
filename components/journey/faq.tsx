import { Plus } from 'lucide-react'
import { SectionHeading } from '@/components/site/section-heading'

export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section aria-labelledby="faq-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <SectionHeading id="faq-title" index="08" eyebrow="Questions" title="FAQ" />
      <div className="mt-14 flex flex-col lg:pl-[33%]">
        {items.map((item) => (
          <details key={item.question} className="reveal group border-t border-border last:border-b">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-2xl md:text-3xl">{item.question}</span>
              <Plus
                className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-45"
                aria-hidden="true"
              />
            </summary>
            <p className="max-w-xl pb-8 leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
