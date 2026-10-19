import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  index?: string
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
  id?: string
}

export function SectionHeading({ index, eyebrow, title, description, className, id }: SectionHeadingProps) {
  return (
    <div className={cn('reveal flex flex-col gap-6 border-t border-border pt-8', className)}>
      <p className="eyebrow flex items-center gap-4">
        {index && <span className="text-primary">{index}</span>}
        <span>{eyebrow}</span>
      </p>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <h2 id={id} className="font-display text-balance text-4xl md:text-6xl">
          {title}
        </h2>
        {description && <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}
