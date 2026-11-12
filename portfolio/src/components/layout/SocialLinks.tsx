import type { ReactNode } from 'react'
import { profile } from '../../../../shared/data/profile'
import { ICON_BUTTON_CLASS, RESUME_HREF } from './navConfig'
import { GitHubIcon, LinkedInIcon, ResumeIcon } from './NavIcons'

interface SocialLink {
  readonly label: string
  readonly href: string
  readonly icon: ReactNode
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'GitHub', href: profile.githubUrl, icon: <GitHubIcon /> },
  { label: 'LinkedIn', href: profile.linkedinUrl, icon: <LinkedInIcon /> },
  { label: 'Resume', href: RESUME_HREF, icon: <ResumeIcon /> },
]

interface SocialLinksProps {
  className?: string
  itemClassName?: string
}

/** GitHub, LinkedIn and the resume, each opening in a new tab. */
export function SocialLinks({ className, itemClassName = ICON_BUTTON_CLASS }: SocialLinksProps) {
  return (
    <ul className={className}>
      {SOCIAL_LINKS.map(({ label, href, icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={itemClassName}
          >
            {icon}
          </a>
        </li>
      ))}
    </ul>
  )
}
