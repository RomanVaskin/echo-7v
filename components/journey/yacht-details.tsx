import Image from 'next/image'
import type { Dictionary } from '@/lib/dictionaries'

export function YachtDetails({ dict, tba }: { dict: Dictionary['caribbean']['yacht']; tba: string }) {
  const specs: { label: string; value: string | null }[] = [
    { label: dict.specs.vesselType, value: null },
    { label: dict.specs.model, value: null },
    { label: dict.specs.cabins, value: null },
    { label: dict.specs.guests, value: null },
    { label: dict.specs.crew, value: dict.specs.crewValue },
  ]

  return (
    <section aria-labelledby="yacht-title" className="bg-card">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-32">
        <div className="reveal relative aspect-[4/5] overflow-hidden">
          <Image
            src="/images/yacht-cabin.png"
            alt={dict.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="reveal flex flex-col justify-center gap-10">
          <div className="flex flex-col gap-6">
            <p className="eyebrow flex items-center gap-4">
              <span className="text-primary">04</span>
              <span>{dict.eyebrow}</span>
            </p>
            <h2 id="yacht-title" className="font-display text-balance text-5xl md:text-6xl">
              {dict.titleLead} <em className="text-primary">{dict.titleAccent}</em>
            </h2>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              {dict.description}
            </p>
          </div>
          <dl className="flex flex-col">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between border-b border-border py-4">
                <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                <dd className={spec.value ? 'text-foreground' : 'text-xs tracking-[0.2em] text-muted-foreground/80'}>
                  {spec.value ?? tba}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
