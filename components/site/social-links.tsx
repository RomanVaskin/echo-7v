import type { Dictionary } from '@/lib/dictionaries'
import { socialLinks } from '@/lib/social'

export type Network = keyof typeof socialLinks

/* Monochrome outline icons drawn in currentColor, 24px grid */
export const socialIcons: Record<Network, React.ReactNode> = {
  whatsapp: (
    <>
      <path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.2Z" />
      <path d="M9 8.6c.2-.5.6-.6.9-.6h.4c.2 0 .4.1.5.4l.7 1.6c.1.3 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.4c0 .3-.1.7-.6.9-.6.3-1.4.4-2.4 0-2.3-.9-4.1-2.7-5-5-.4-1-.3-1.8 0-2.4Z" />
    </>
  ),
  telegram: (
    <>
      <path d="M21 4.5 3.5 11.3c-.6.2-.6 1.1 0 1.3l4.3 1.4 1.7 5.1c.2.6.9.7 1.3.3l2.4-2.3 4.3 3.2c.5.4 1.2.1 1.3-.5L21.9 5.4c.1-.6-.4-1.1-.9-.9Z" />
      <path d="m7.8 14 9.7-6.4-7 7.2" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </>
  ),
}

/**
 * Round PANTONE 437 C buttons with light icons, centred. Shows only networks with a real URL in
 * lib/social.ts and renders nothing while none is set.
 */
export function SocialLinks({ dict }: { dict: Dictionary['social'] }) {
  const networks = (Object.keys(socialLinks) as Network[]).filter((network) => socialLinks[network])
  if (networks.length === 0) return null

  return (
    <nav aria-label={dict.label} className="mx-auto flex max-w-7xl justify-center px-6 pb-16 lg:px-10 lg:pb-20">
      <ul className="flex items-center gap-5">
        {networks.map((network) => (
          <li key={network}>
            <a
              href={socialLinks[network]!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict[network]}
              className="social-button"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[26px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {socialIcons[network]}
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
