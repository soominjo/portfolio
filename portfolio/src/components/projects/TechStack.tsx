import type { CSSProperties } from 'react'
import { readableOn } from '../../lib/brandColor'
import { getTechIcon } from '../../lib/techIcons'
import { techInitials } from './techInitials'

export const MAX_ICONS = 6
export const MAX_CHIPS = 4

// Tile fills and the ink a failing brand colour falls back to, per theme.
// They match the skills block's tiles so marks read the same site-wide.
const DARK_TILE = '#0e121b'
const DARK_INK = '#e2e8f0'
const LIGHT_TILE = '#f8fafc'
const LIGHT_INK = '#1e293b'

interface TechStackProps {
  readonly items: readonly string[]
  /** Logo tiles for tools; text chips for practices that have no logo. */
  readonly variant: 'icons' | 'chips'
}

/**
 * A project's stack as a short row: up to six logo tiles or four chips, then
 * "+N more". Screen readers hear the hidden remainder too.
 */
export function TechStack({ items, variant }: TechStackProps) {
  const limit = variant === 'icons' ? MAX_ICONS : MAX_CHIPS
  const shown = items.slice(0, limit)
  const rest = items.slice(limit)

  return (
    // role="list": Safari drops list semantics under Tailwind's list-style: none.
    <ul role="list" aria-label="Tech stack" className="flex flex-wrap items-center gap-2">
      {shown.map((name) => (
        <li key={name}>{variant === 'icons' ? <TechTile name={name} /> : <TechChip name={name} />}</li>
      ))}
      {rest.length > 0 && (
        <li className="font-mono-label rounded-full border border-slate-400/25 px-3 py-1.5 text-[11px] text-slate-400 light:border-slate-900/15 light:text-slate-600">
          <span aria-hidden="true">+{rest.length} more</span>
          <span className="sr-only">Also: {rest.join(', ')}</span>
        </li>
      )}
    </ul>
  )
}

function TechTile({ name }: { readonly name: string }) {
  const icon = getTechIcon(name)
  const ink = icon
    ? ({
        '--mark-dark': readableOn(icon.hex, DARK_TILE, DARK_INK),
        '--mark-light': readableOn(icon.hex, LIGHT_TILE, LIGHT_INK),
      } as CSSProperties)
    : undefined

  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className="flex size-10 items-center justify-center rounded-[10px] border border-indigo-500/25 bg-[#0e121b] light:border-slate-900/10 light:bg-[#f8fafc]"
    >
      {icon ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-(--mark-dark) light:fill-(--mark-light)" style={ink}>
          <path d={icon.path} />
        </svg>
      ) : (
        <span aria-hidden="true" className="font-mono-label text-[11px] text-indigo-300 light:text-indigo-700">
          {techInitials(name)}
        </span>
      )}
    </span>
  )
}

function TechChip({ name }: { readonly name: string }) {
  return (
    <span className="font-mono-label inline-block rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-indigo-200 light:border-indigo-200 light:bg-indigo-50 light:text-indigo-700">
      {name}
    </span>
  )
}
