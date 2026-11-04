import type { Locale } from '@/lib/i18n'

/**
 * Team members for /team. Add a member here to show their card; while the list is
 * empty the page shows neutral placeholder cards. Put photos in public/images/team/.
 *
 * {
 *   id: 'first-member',
 *   photo: '/images/team/first-member.jpg',
 *   name: { en: '…', ru: '…' },
 *   role: { en: '…', ru: '…' },
 *   bio: { en: '…', ru: '…' },
 * }
 */
export type TeamMember = {
  id: string
  photo: string | null
  name: Record<Locale, string>
  role: Record<Locale, string>
  bio: Record<Locale, string>
}

export const teamMembers: TeamMember[] = []

/** Number of placeholder cards shown until real members are added. */
export const TEAM_PLACEHOLDERS = 3

/** Photos for the placeholder cards, in order, until names and roles are added above. */
export const teamPlaceholderPhotos: string[] = ['/images/team/artem.jpg', '/images/team/galya.jpg']
