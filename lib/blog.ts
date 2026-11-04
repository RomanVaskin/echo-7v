import type { Locale } from '@/lib/i18n'

export const blogCategories = ['travel', 'destinations', 'yacht-life', 'tips', 'stories'] as const
export type BlogCategory = (typeof blogCategories)[number]

type Localized = Record<Locale, string>
type BlogImage = { src: string; alt: Localized; caption?: Localized }

/**
 * One block of an article body: the lead (larger opening paragraph), a paragraph, a wide image, two
 * images side by side, or the closing invitation with a button (href is a site path, localised on render).
 */
export type BlogBlock =
  | { type: 'lead'; text: Localized }
  | { type: 'paragraph'; text: Localized }
  | ({ type: 'image' } & BlogImage)
  | { type: 'image-pair'; images: [BlogImage, BlogImage] }
  | { type: 'cta'; title: Localized; text: Localized[]; label: Localized; href: string }

/**
 * Journal articles for /blog and /blog/[slug]. Add an entry to publish it in both
 * languages — the list, the article page, its metadata and static generation all
 * read from here, so nothing else needs editing. Covers go in public/images/blog/.
 *
 * {
 *   slug: 'first-story',
 *   category: 'stories',
 *   date: '2026-11-01',            // ISO date, or null if not known
 *   cover: '/images/blog/first-story.jpg',
 *   title: { en: '…', ru: '…' },
 *   excerpt: { en: '…', ru: '…' },
 *   body: [{ type: 'paragraph', text: { en: '…', ru: '…' } }],
 * }
 */
export type BlogPost = {
  slug: string
  category: BlogCategory
  date: string | null
  cover: string
  coverAlt: Localized
  title: Localized
  excerpt: Localized
  /** Search and social title and description; the title is used as is, without the site name suffix. */
  seo?: { title: Localized; description: Localized }
  body: BlogBlock[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'new-year-caribbean-yacht',
    category: 'travel',
    date: '2026-11-04',
    cover: '/images/blog/new-year-caribbean-yacht.jpg',
    coverAlt: {
      ru: 'Парусный катамаран на якоре в бухте на закате, вдали ещё одна яхта и холмистый берег',
      en: 'A sailing catamaran at anchor in a bay at sunset, another yacht and hilly shores beyond',
    },
    title: {
      ru: 'Новый год на Карибах: повторяем наше особенное путешествие',
      en: 'New Year in the Caribbean: We’re Bringing Back Our Special Journey',
    },
    excerpt: {
      ru: 'Встречаем Новый год среди бирюзовых вод Карибского моря. Частная яхта, всего 8 гостей, профессиональный шкипер и шеф-повар — путешествие, которое мы решили повторить.',
      en: 'Ring in the New Year among the turquoise waters of the Caribbean. A private yacht, just eight guests, a professional skipper and a chef on board — a journey we loved so much that we’re setting sail again.',
    },
    seo: {
      title: { ru: 'Новый год на Карибах на яхте — Seasmates', en: 'New Year in the Caribbean on a Private Yacht — Seasmates' },
      description: {
        ru: 'Встретьте Новый год на Карибах на борту частной яхты. Путешествие небольшой компанией, 8 гостей, профессиональный шкипер и шеф-повар.',
        en: 'Celebrate New Year in the Caribbean aboard a private yacht. A small-group journey for eight guests, with a professional skipper and a private chef.',
      },
    },
    body: [
      {
        type: 'lead',
        text: {
          ru: 'В прошлом году мы встретили Новый год на Карибах — среди бирюзовой воды, тропических островов, живописных бухт и удивительного ощущения свободы.',
          en: 'Last year we welcomed the New Year in the Caribbean — surrounded by turquoise water, tropical islands, picture-perfect bays and a rare, wonderful sense of freedom.',
        },
      },
      {
        type: 'paragraph',
        text: {
          ru: 'Это путешествие стало для нас особенным, и в этом году мы решили его повторить.',
          en: 'That journey became something special for us, so this year we’ve decided to do it all again.',
        },
      },
      {
        type: 'paragraph',
        text: {
          ru: 'Тёплое море, красивые стоянки, новые знакомства, праздничная атмосфера и возможность встретить Новый год вдали от зимы — всё это снова ждёт нас на борту.',
          en: 'Warm seas, beautiful anchorages, new friendships, a festive mood and the chance to see in the New Year far from winter — it’s all waiting for us on board once more.',
        },
      },
      {
        type: 'image',
        src: '/images/caribbean-page-hero.jpg',
        alt: {
          ru: 'Катамаран в бирюзовой бухте у тропического острова',
          en: 'A catamaran in a turquoise bay off a tropical island',
        },
      },
      {
        type: 'paragraph',
        text: {
          ru: 'Мы отправляемся в небольшом составе: всего 8 гостей на частной яхте.',
          en: 'We’re keeping it small: just eight guests on a private yacht.',
        },
      },
      {
        type: 'paragraph',
        text: {
          ru: 'С нами будет профессиональный шкипер, который проведёт нас по красивейшему маршруту Карибского моря, а шеф-повар позаботится о завтраках, обедах и ужинах на борту.',
          en: 'A professional skipper will guide us along one of the most beautiful routes in the Caribbean, while our chef takes care of breakfasts, lunches and dinners on board.',
        },
      },
      {
        type: 'paragraph',
        text: {
          ru: 'Это не массовый тур, а путешествие небольшой компании людей, которым близки море, природа, парусная жизнь и желание открывать новые места.',
          en: 'This isn’t a mass-market tour. It’s a journey for a small group of people who share a love of the sea, nature, life under sail and discovering new places.',
        },
      },
      {
        type: 'image-pair',
        images: [
          {
            src: '/images/day-01-martinique-le-marin.jpg',
            alt: { ru: 'Марина Ле-Марен на Мартинике с высоты', en: 'Le Marin marina in Martinique from above' },
            caption: { ru: 'Мартиника · Ле-Марен', en: 'Martinique · Le Marin' },
          },
          {
            src: '/images/day-07-wallilabou-bay.jpg',
            alt: { ru: 'Яхты на якоре в бухте Валлилабу на Сент-Винсенте', en: 'Yachts at anchor in Wallilabou Bay, Saint Vincent' },
            caption: { ru: 'Сент-Винсент · Валлилабу', en: 'Saint Vincent · Wallilabou' },
          },
        ],
      },
      {
        type: 'paragraph',
        text: {
          ru: 'В этом году мы снова собираемся вместе, чтобы встретить Новый год под парусами.',
          en: 'This year we’re gathering again to welcome the New Year under sail.',
        },
      },
      {
        type: 'cta',
        title: { ru: 'Присоединяйтесь к нам на борту', en: 'Join us on board' },
        text: [
          { ru: 'Даты путешествия: 28 декабря 2026 — 7 января 2027.', en: 'Dates: 28 December 2026 – 7 January 2027.' },
          { ru: 'Количество мест ограничено — всего 8 гостей.', en: 'Places are limited — just eight guests.' },
          {
            ru: 'Бронирование уже открыто. Если вам близок такой формат отдыха, будем рады видеть вас на борту.',
            en: 'Booking is now open. If this kind of journey speaks to you, we’d love to welcome you on board.',
          },
        ],
        label: { ru: 'Посмотреть путешествие', en: 'Explore the Journey' },
        href: '/journeys/caribbean',
      },
    ],
  },
]

export function getPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

/** Newest first; undated posts go last. */
export function getPosts() {
  return [...blogPosts].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export function formatPostDate(locale: Locale, date: string) {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`))
}
