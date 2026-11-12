import { AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { ChatLauncher } from './chat/ChatLauncher'
import { ChatTerminal } from './chat/ChatTerminal'
import { useChat } from './chat/useChat'
import { useDocumentTheme } from './chat/useDocumentTheme'

export const CHAT_TERMINAL_ID = 'chat-terminal'

/**
 * Gens' AI assistant: a living 3D orb in the corner that opens the holo
 * terminal. The conversation lives here, so it survives closing and reopening.
 */
export function Chatbot() {
  const [open, setOpen] = useState(false)
  const chat = useChat()
  const theme = useDocumentTheme()
  const launcherRef = useRef<HTMLButtonElement>(null)

  // [×] and Escape close the terminal and hand focus back to the orb.
  const close = () => {
    setOpen(false)
    launcherRef.current?.focus()
  }

  return (
    <>
      <div
        data-testid="chat-stage"
        className="chat-stage pointer-events-none fixed right-4 bottom-24 z-50 h-[min(476px,calc(100dvh-13rem))] w-[calc(100vw-2rem)] sm:right-6 sm:bottom-27 sm:w-87.5"
      >
        <AnimatePresence>
          {open && <ChatTerminal key="terminal" id={CHAT_TERMINAL_ID} chat={chat} onClose={close} />}
        </AnimatePresence>
      </div>
      <ChatLauncher
        ref={launcherRef}
        open={open}
        controlsId={CHAT_TERMINAL_ID}
        theme={theme}
        onToggle={() => setOpen((isOpen) => !isOpen)}
      />
    </>
  )
}
