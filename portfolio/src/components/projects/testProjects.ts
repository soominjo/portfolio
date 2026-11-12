import type { Project } from '../../../../shared/types/project'

// Hand-written fixtures for the showcase tests, independent of shared/data.
export const ENGINEERING_PROJECT: Project = {
  id: 'flinki',
  title: 'Flinki',
  tagline: 'An AI-powered identity engine for sport and adventure.',
  purpose: 'Lets athletes build a digital sports CV.',
  techStack: ['Flutter', 'Dart', 'React'],
  role: 'Full-Stack Developer',
  category: 'engineering',
  type: 'professional',
  imageUrl: '/projects/flinki.webp',
  mobileImageUrl: '/projects/flinki-mobile.webp',
  showPhone: true,
  deviceFinish: 'silver',
  order: 1,
  isFeatured: true,
}

export const QA_PROJECT: Project = {
  id: 'reviva',
  title: 'Reviva',
  tagline: 'End-to-end QA for a recovery and wellness platform.',
  purpose: 'A health and wellness platform.',
  techStack: ['Manual Testing', 'Functional Testing'],
  role: 'QA Engineer',
  category: 'qa',
  type: 'personal',
  imageUrl: '/projects/reviva.webp',
  showPhone: true,
  deviceFinish: 'black',
  order: 5,
  isFeatured: true,
}

/**
 * jsdom has no matchMedia. Installs one where the given queries match;
 * `change` re-evaluates with new matches and notifies listeners.
 */
export function mockMediaQueries(initial: Readonly<Record<string, boolean>>) {
  let current = initial
  const listeners = new Set<() => void>()
  window.matchMedia = ((query: string) => ({
    get matches() {
      return current[query] ?? false
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia
  return {
    change(next: Readonly<Record<string, boolean>>) {
      current = next
      for (const listener of listeners) listener()
    },
    restore() {
      Reflect.deleteProperty(window, 'matchMedia')
    },
  }
}

/** jsdom has <dialog> but not showModal/close; tests install minimal stand-ins. */
export function installDialogPolyfill(): void {
  const proto = HTMLDialogElement.prototype
  if (typeof proto.showModal === 'function') return
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  proto.close = function close(this: HTMLDialogElement) {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}
