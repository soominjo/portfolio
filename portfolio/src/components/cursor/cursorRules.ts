// Where the rocket cursor shows and how it reacts. index.css holds the
// matching cursor rules, and cursorRules.test.ts checks the two agree.

/** RocketCursor puts this class on <html> to switch the cursor rules on. */
export const ROCKET_CURSOR_CLASS = 'rocket-cursor'

/** Mouse and trackpad screens, outside Windows high-contrast mode, which keeps the system cursors. */
export const ROCKET_CURSOR_QUERY = '(hover: hover) and (pointer: fine) and (forced-colors: none)'

/** The exhaust trail also stays off for people who ask for less motion. */
export const EXHAUST_QUERY = `${ROCKET_CURSOR_QUERY} and (prefers-reduced-motion: no-preference)`

/** Controls that show the lit rocket, with its engine burning. */
export const LIT_SELECTOR =
  "a[href], button, input[type='button'], input[type='submit'], input[type='reset'], [role='button'], summary, label[for], select, .cursor-pointer"

/** Text fields keep the I-beam, so the exhaust skips them. */
export const TEXT_FIELD_SELECTOR =
  "input:not([type='button'], [type='submit'], [type='reset'], [type='checkbox'], [type='radio'], [type='range'], [type='color'], [type='file'], [type='image'], [type='hidden']), textarea, [contenteditable]:not([contenteditable='false'])"

/** What the pointer shows over an element: the rocket, the lit rocket, or something else (an I-beam, a disabled control). */
export type CursorZone = 'rocket' | 'lit' | 'other'

export function cursorZone(target: EventTarget | null): CursorZone {
  if (!(target instanceof Element)) return 'rocket'
  if (target.closest(TEXT_FIELD_SELECTOR)) return 'other'
  const control = target.closest(LIT_SELECTOR)
  if (control) return control.matches(':disabled') ? 'other' : 'lit'
  // Checkboxes, sliders, file pickers and the like keep the browser's own cursor.
  return target.closest('input') ? 'other' : 'rocket'
}
