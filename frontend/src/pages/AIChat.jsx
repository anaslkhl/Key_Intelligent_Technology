import { Bot, RotateCcw, SendHorizonal, UserRound } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { sendMessage } from '../api/ai'
import { useAuth } from '../contexts/auth'

const starterMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Hello. I can help with KIT support questions, documents, troubleshooting, weather, web search, calculations, QR codes, and more.',
  },
]

export default function AIChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState(starterMessages)
  const [prompt, setPrompt] = useState('')
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef(null)

  const submitMessage = async (event) => {
    event.preventDefault()

    const nextPrompt = prompt.trim()
    if (!nextPrompt || isSending) return

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: nextPrompt,
    }

    setMessages((current) => [...current, userMessage])
    setPrompt('')
    setIsSending(true)

    try {
      const data = await sendMessage(nextPrompt)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
        },
      ])
    } catch (error) {
      toast.error(error.response?.data?.message || 'The AI assistant is unavailable.')
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'I could not process that request right now. Please try again in a moment.',
          isError: true,
        },
      ])
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <section className="min-h-[calc(100vh-102px)] bg-slate-50 py-6 text-slate-900 dark:bg-black dark:text-white sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111111]">
          <header className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Bot size={22} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                  KIT AI Agent
                </p>
                <h1 className="!text-xl !font-bold text-slate-950 dark:text-white">
                  AI Assistant
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMessages(starterMessages)}
              className="button button-secondary"
              disabled={isSending}
            >
              <RotateCcw size={16} />
              Clear conversation
            </button>
          </header>

          <div className="flex h-[58vh] min-h-[420px] flex-col gap-4 overflow-y-auto p-4 dark:bg-black/20 sm:p-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} user={user} />
            ))}
            {isSending && (
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                  <Bot size={18} />
                </span>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={submitMessage} className="border-t border-slate-200 p-4 dark:border-zinc-800 sm:p-5">
            <label className="sr-only" htmlFor="ai-prompt">
              Message the AI assistant
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                ref={inputRef}
                id="ai-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                rows={2}
                maxLength={5000}
                placeholder="Ask about a robot, troubleshooting step, document, calculation, or web search..."
                className="min-h-14 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-700 dark:bg-[#111111] dark:text-white"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isSending}
                className="button button-primary min-h-14 sm:self-end"
              >
                <SendHorizonal size={18} />
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
              Press Enter to send, Shift+Enter for a new line.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

function ChatMessage({ message, user }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
          <Bot size={18} />
        </span>
      )}
      <div className={`max-w-[min(720px,82%)] ${isUser ? 'order-1' : ''}`}>
        <div className={`mb-1 flex items-center gap-2 text-xs font-semibold ${isUser ? 'justify-end text-slate-500' : 'text-blue-600 dark:text-blue-300'}`}>
          <span>{isUser ? user?.name || 'You' : 'KIT AI'}</span>
        </div>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
            isUser
              ? 'bg-blue-600 text-white'
              : message.isError
                ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
                : 'border border-slate-200 bg-white text-slate-700 dark:border-zinc-800 dark:bg-[#111111] dark:text-zinc-200'
          }`}
        >
          {message.content}
        </div>
      </div>
      {isUser && (
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
          {user?.name?.charAt(0).toUpperCase() || <UserRound size={17} />}
        </span>
      )}
    </div>
  )
}
