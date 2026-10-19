import Image from 'next/image'

const specs: { label: string; value: string | null }[] = [
  { label: 'Vessel type', value: null },
  { label: 'Model', value: null },
  { label: 'Cabins', value: null },
  { label: 'Guests', value: null },
  { label: 'Crew', value: 'Professional skipper' },
]

export function YachtDetails() {
  return (
    <section aria-labelledby="yacht-title" className="bg-card">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-32">
        <div className="reveal relative aspect-[4/5] overflow-hidden">
          <Image
            src="/images/yacht-cabin.png"
            alt="Teak-lined yacht cabin with linen bedding and soft daylight"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="reveal flex flex-col justify-center gap-10">
          <div className="flex flex-col gap-6">
            <p className="eyebrow flex items-center gap-4">
              <span className="text-primary">04</span>
              <span>Yacht & accommodation</span>
            </p>
            <h2 id="yacht-title" className="font-display text-balance text-5xl md:text-6xl">
              A quiet home <em className="text-primary">on the water.</em>
            </h2>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              Guests stay in private cabins with fresh linen and natural light, with generous deck space for
              sunbathing, dining and watching the islands drift by. Yacht specifications will be published once
              confirmed.
            </p>
          </div>
          <dl className="flex flex-col">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between border-b border-border py-4">
                <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                <dd className={spec.value ? 'text-foreground' : 'text-xs tracking-[0.2em] text-muted-foreground/80'}>
                  {spec.value ?? 'TBA'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
