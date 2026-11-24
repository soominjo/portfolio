import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatLauncher } from './ChatLauncher'

const { orbMode, orbProps } = vi.hoisted(() => ({
  orbMode: { value: 'ready' as 'ready' | 'drawing' | 'throw' },
  orbProps: [] as Array<{ paused: boolean }>,
}))

// The real orb needs WebGL. This stand-in reports ready like a working orb,
// stays not-yet-drawn ('drawing'), or throws like a chunk that failed to load.
// It also records whether it was told to pause.
vi.mock('../three/ChatOrb', async () => {
  const { useEffect } = await import('react')
  return {
    default: function FakeChatOrb({ onReady, paused }: { onReady: () => void; paused: boolean }) {
      orbProps.push({ paused })
      useEffect(() => {
        if (orbMode.value === 'ready') onReady()
      }, [onReady])
      if (orbMode.value === 'throw') throw new Error('orb chunk failed to load')
      return <canvas />
    },
  }
})

// Lets the lazy chunk resolve and any error boundary settle.
function settle() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
  })
}

describe('ChatLauncher', () => {
  afterEach(() => {
    orbMode.value = 'ready'
    vi.restoreAllMocks()
  })

  it('is a labelled toggle for the terminal', () => {
    const { rerender } = render(
      <ChatLauncher open={false} controlsId="chat-terminal" theme="dark" onToggle={vi.fn()} />,
    )
    const closed = screen.getByRole('button', { name: 'Open chat' })
    expect(closed).toHaveAttribute('aria-expanded', 'false')
    expect(closed).toHaveAttribute('aria-controls', 'chat-terminal')

    rerender(<ChatLauncher open controlsId="chat-terminal" theme="dark" onToggle={vi.fn()} />)
    const open = screen.getByRole('button', { name: 'Close chat' })
    expect(open).toHaveAttribute('aria-expanded', 'true')
    expect(open).toHaveAttribute('data-open', 'true')
  })

  it('shows the CSS orb while the 3D orb has not drawn yet', async () => {
    orbMode.value = 'drawing'
    render(<ChatLauncher open={false} controlsId="chat-terminal" theme="dark" onToggle={vi.fn()} />)
    await settle()
    expect(screen.getByTestId('chat-orb-fallback')).toBeInTheDocument()
  })

  it('drops the CSS orb once the 3D orb has drawn', async () => {
    render(<ChatLauncher open={false} controlsId="chat-terminal" theme="dark" onToggle={vi.fn()} />)
    await waitFor(() => expect(screen.queryByTestId('chat-orb-fallback')).toBeNull())
  })

  // The orb's render loop only stops when it's paused. While the /contact page
  // hides the homepage, it must stop too, not keep drawing behind the form.
  it.each([
    [false, false, false],
    [true, false, true],
    [false, true, true],
  ])('pauses the orb when open=%s and pageHidden=%s', async (open, pageHidden, paused) => {
    orbProps.length = 0
    render(
      <ChatLauncher open={open} pageHidden={pageHidden} controlsId="chat-terminal" theme="dark" onToggle={vi.fn()} />,
    )
    await waitFor(() => expect(orbProps.at(-1)?.paused).toBe(paused))
  })

  it('keeps the CSS orb and still opens the chat when the 3D orb fails', async () => {
    orbMode.value = 'throw'
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onToggle = vi.fn()
    render(<ChatLauncher open={false} controlsId="chat-terminal" theme="dark" onToggle={onToggle} />)
    await settle()
    expect(screen.getByTestId('chat-orb-fallback')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    expect(onToggle).toHaveBeenCalled()
  })
})
