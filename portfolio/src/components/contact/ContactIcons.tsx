// Icon paths from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.

interface IconProps {
  className?: string
}

function Icon({ className, path }: IconProps & { path: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}

export function SendIcon({ className }: IconProps) {
  return <Icon className={className} path="M2.01 21 23 12 2.01 3 2 10l15 2-15 2 .01 7Z" />
}
