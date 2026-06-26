import { Bot, MessageCircle, RotateCcw, SendHorizonal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sendMessage } from '../../api/ai'
import { useAuth } from '../../contexts/auth'
import './AIChatWidget.css'

const initialMessages = [
  {
    id: 'ai-widget-welcome',
    role: 'assistant',
    content: 'Hi, I am the KIT AI Assistant. Ask me about robots, tickets, documents, troubleshooting, web search, calculations, and more.',
  },
]



export default function AIChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [prompt, setPrompt] = useState('')
  const [isSending, setIsSending] = useState(false)
  const panelRef = useRef(null)
  const launcherRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    const handlePointerDown = (event) => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      if (!isDesktop) return
      if (panelRef.current?.contains(event.target)) return
      if (launcherRef.current?.contains(event.target)) return
      setIsOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())

    return () => window.cancelAnimationFrame(frame)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [isOpen, messages, isSending])

  useEffect(() => {
    if (!isOpen) return undefined

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const submitPrompt = async (event, retryPrompt = null) => {
    event?.preventDefault()

    const nextPrompt = (retryPrompt ?? prompt).trim()
    if (!nextPrompt || isSending) return

    const userMessage = {
      id: createId(),
      role: 'user',
      content: nextPrompt,
    }

    if (!retryPrompt) setPrompt('')
    setMessages((current) => [...current, userMessage])
    setIsSending(true)

    try {
      const data = await sendMessage(nextPrompt)
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: 'assistant',
          content: data.response,
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: 'assistant',
          content: error.response?.data?.message || 'The AI assistant is unavailable. Please try again.',
          isError: true,
          retryPrompt: nextPrompt,
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className={`ai-widget${isOpen ? ' is-open' : ''}`} aria-live="polite">
      {!isOpen && (
        <button
          ref={launcherRef}
          type="button"
          className="ai-widget-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={24} aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <section
          ref={panelRef}
          className="ai-widget-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="ai-widget-title"
        >
          <header className="ai-widget-header">
            <span className="ai-widget-mobile-handle" aria-hidden="true" />
            <div className="ai-widget-title-group">
              <span className="ai-widget-bot-mark">
                <Bot size={20} aria-hidden="true" />
              </span>
              <div>
                <p>KIT AI Agent</p>
                <h2 id="ai-widget-title">AI Assistant</h2>
              </div>
            </div>
            <div className="ai-widget-header-actions">
              <button
                type="button"
                className="ai-widget-icon-button"
                onClick={() => setMessages(initialMessages)}
                disabled={isSending}
                aria-label="Clear AI conversation"
                title="Clear conversation"
              >
                <RotateCcw size={17} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="ai-widget-icon-button"
                onClick={() => setIsOpen(false)}
                aria-label="Close AI Assistant"
                title="Close"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div ref={listRef} className="ai-widget-messages" role="log" aria-label="AI Assistant conversation">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                user={user}
                onRetry={(retryPrompt) => submitPrompt(null, retryPrompt)}
                isSending={isSending}
              />
            ))}
            {isSending && (
              <div className="ai-widget-row assistant">
                <span className="ai-widget-avatar assistant">
                  <Bot size={17} aria-hidden="true" />
                </span>
                <div className="ai-widget-bubble assistant typing" role="status">
                  <span />
                  <span />
                  <span />
                  <em className="sr-only">AI is thinking</em>
                </div>
              </div>
            )}
          </div>

          <form className="ai-widget-composer" onSubmit={submitPrompt}>
            <label className="sr-only" htmlFor="ai-widget-input">
              Message AI Assistant
            </label>
            <textarea
              ref={inputRef}
              id="ai-widget-input"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              rows={1}
              maxLength={5000}
              placeholder="Ask the AI assistant..."
              disabled={isSending}
            />
            <button
              type="submit"
              className="ai-widget-send"
              disabled={!prompt.trim() || isSending}
              aria-label="Send message"
            >
              <SendHorizonal size={18} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </div>
  )
}

function ChatMessage({ message, user, onRetry, isSending }) {
  const isUser = message.role === 'user'

  return (
    <div className={`ai-widget-row ${isUser ? 'user' : 'assistant'} ai-widget-message-enter`}>
      {!isUser && (
        <span className="ai-widget-avatar assistant">
          <Bot size={17} aria-hidden="true" />
        </span>
      )}
      <div className="ai-widget-message-stack">
        <span className="ai-widget-message-author">
          {isUser ? user?.name || 'You' : 'KIT AI'}
        </span>
        <div className={`ai-widget-bubble ${isUser ? 'user' : 'assistant'}${message.isError ? ' error' : ''}`}>
          {message.content}
          {message.isError && message.retryPrompt && (
            <button
              type="button"
              className="ai-widget-retry"
              onClick={() => onRetry(message.retryPrompt)}
              disabled={isSending}
            >
              Retry
            </button>
          )}
        </div>
      </div>
      {isUser && (
        <span className="ai-widget-avatar user" aria-hidden="true">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </span>
      )}
    </div>
  )
}

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
