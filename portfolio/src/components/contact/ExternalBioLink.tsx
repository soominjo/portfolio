import type { ReactNode } from 'react'

const bioLinkClass =
  'text-cyan-400 light:text-cyan-700 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400 transition-colors'

interface ExternalBioLinkProps {
  readonly href: string
  readonly children: ReactNode
}

/** An inline bio link that opens another site in a new tab. */
export function ExternalBioLink({ href, children }: ExternalBioLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={bioLinkClass}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
