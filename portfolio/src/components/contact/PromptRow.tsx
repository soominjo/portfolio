import type { UseFormRegisterReturn } from 'react-hook-form'

export type PromptRowProps = {
  readonly id: string
  /** The key shown before the chevron, and the field's accessible name. */
  readonly label: string
  /** A four-row textarea instead of a one-line input. */
  readonly multiline?: boolean
  readonly type?: 'text' | 'email'
  readonly autoComplete?: string
  readonly maxLength?: number
  readonly placeholder?: string
  readonly error?: string
} & UseFormRegisterReturn

// The focused row gets a 2px cyan bar and a faint wash, like a live line in the chat terminal.
const ROW_CLASS = [
  'group flex flex-col gap-1 border-b border-l-2 border-b-cyan-400/12 border-l-transparent px-3 py-3 transition-colors',
  'focus-within:border-l-cyan-400 focus-within:bg-linear-to-r focus-within:from-cyan-400/8 focus-within:to-transparent',
  'light:border-b-cyan-700/15 light:focus-within:border-l-cyan-600 light:focus-within:from-cyan-600/8',
  'min-[401px]:flex-row min-[401px]:items-start min-[401px]:gap-3.5',
].join(' ')

// The chevron is generated content with empty alt text, so the label's text
// and the field's accessible name stay exactly the key.
const KEY_CLASS = [
  'w-24 shrink-0 font-mono-label text-[13px] leading-6 text-indigo-400 transition-colors light:text-indigo-600',
  'group-focus-within:text-cyan-400 light:group-focus-within:text-cyan-700',
  "after:ml-1.5 after:text-cyan-400 after:content-['›'_/_''] light:after:text-cyan-600",
].join(' ')

const FIELD_CLASS = [
  'min-w-0 flex-1 resize-none bg-transparent text-[15px] leading-6 text-slate-200 caret-cyan-400 outline-none',
  'placeholder:text-slate-500/75 light:text-slate-800 light:caret-cyan-700 light:placeholder:text-slate-400',
].join(' ')

/** One prompt line of the terminal form: `key ›` then the field, with its error beneath. */
export function PromptRow({ id, label, multiline = false, type = 'text', error, ref, ...field }: PromptRowProps) {
  const errorId = `${id}-error`
  const shared = {
    id,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    className: FIELD_CLASS,
    ...field,
  }

  return (
    <>
      <label htmlFor={id} className={ROW_CLASS}>
        <span className={KEY_CLASS}>{label}</span>
        {multiline ? <textarea {...shared} ref={ref} rows={4} /> : <input {...shared} ref={ref} type={type} />}
      </label>
      {error && (
        <p id={errorId} role="alert" className="px-3 pt-1 pb-2 font-mono-label text-xs text-red-400 light:text-red-600">
          ✗ {error}
        </p>
      )}
    </>
  )
}
