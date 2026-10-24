'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { blogCategories, formatPostDate, type BlogCategory, type BlogPost } from '@/lib/blog'
import { localePath, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** Category filter + card grid for /blog. Shows the empty state while there are no posts. */
export function BlogGrid({ locale, posts, dict }: { locale: Locale; posts: BlogPost[]; dict: Dictionary['blogPage'] }) {
  const [category, setCategory] = useState<BlogCategory | 'all'>('all')
  const visible = category === 'all' ? posts : posts.filter((post) => post.category === category)
  const filters: (BlogCategory | 'all')[] = ['all', ...blogCategories]

  return (
    <div className="flex flex-col gap-12">
      <div role="group" aria-label={dict.filterLabel} className="flex flex-wrap gap-3">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
            className={cn(
              'rounded-[var(--radius)] border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors',
              category === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground',
            )}
          >
            {value === 'all' ? dict.all : dict.categories[value]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p role="status" className="border-t border-border pt-10 font-display text-3xl text-balance md:text-4xl">
          {dict.empty}
        </p>
      ) : (
        <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => {
            const href = localePath(locale, `/blog/${post.slug}`)
            return (
              <li key={post.slug} className="reveal flex flex-col gap-5">
                <Link href={href} className="relative block aspect-[4/3] overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.title[locale]}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                </Link>
                <div className="flex flex-col gap-3 border-t border-border pt-5">
                  <p className="eyebrow flex gap-3">
                    <span>{dict.categories[post.category]}</span>
                    {post.date && (
                      <time dateTime={post.date} className="text-foreground/60">
                        {formatPostDate(locale, post.date)}
                      </time>
                    )}
                  </p>
                  <h2 className="font-display text-3xl text-balance">
                    <Link href={href}>{post.title[locale]}</Link>
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt[locale]}</p>
                  <Link
                    href={href}
                    className="group mt-1 inline-flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-foreground"
                  >
                    {dict.read}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
