import { Component, type ReactNode } from 'react'

interface DecorativeBoundaryProps {
  children: ReactNode
}

interface DecorativeBoundaryState {
  failed: boolean
}

/**
 * Error boundary for purely decorative subtrees. If one fails, for example a
 * lazy chunk that won't load or a WebGL error, it disappears instead of
 * unmounting the whole page. React still reports the error to the console.
 */
export class DecorativeBoundary extends Component<DecorativeBoundaryProps, DecorativeBoundaryState> {
  state: DecorativeBoundaryState = { failed: false }

  static getDerivedStateFromError(): DecorativeBoundaryState {
    return { failed: true }
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children
  }
}
