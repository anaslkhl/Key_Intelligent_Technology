import { useMemo, useState } from 'react'
import {
  FaBold,
  FaImage,
  FaItalic,
  FaLink,
  FaListUl,
  FaPaperclip,
  FaUnderline,
} from 'react-icons/fa'
import PageHeader from '../../components/common/PageHeader'

const tickets = [
  {
    id: 'dean-taylor',
    initials: 'DT',
    name: 'Dean Taylor',
    email: 'dean.taylor@example.com',
    timeAgo: '2 mins ago',
    status: 'open',
    priority: 'high',
    department: 'Sales',
    title: 'Need help with sales quote automation',
    preview: 'I need help configuring the sales workflow and quote approval process for our robotics deployment.',
    dateLabel: '23rd of June at 8 am',
    body: `Hello Support Team,

I need help configuring the sales workflow and quote approval process for our robotics deployment.

The team is trying to align the quote steps with product family approvals, but the system keeps routing requests to the wrong queue.

Can you review the setup and let me know what needs to be adjusted?`,
    attachments: [
      { name: 'doc.pdf', size: '29 KB' },
      { name: 'image.jpg', size: '30 KB' },
    ],
    comments: [
      {
        id: 'comment-1',
        author: 'Amina Clarke',
        initial: 'A',
        timeAgo: '1 min ago',
        text: 'I checked the routing rules and the Sales Department queue is receiving the request correctly now.',
      },
      {
        id: 'comment-2',
        author: 'Omar Benali',
        initial: 'O',
        timeAgo: 'just now',
        text: 'I will verify the quote approval step and update the client once the final condition is confirmed.',
      },
    ],
    reply: `Hi Dean,

Thanks for the details. We reviewed the routing setup and found that one approval condition was pointing to the wrong department queue.

We are correcting it now and will confirm once the sales workflow is ready for testing.`,
  },
  {
    id: 'jenny-wilson',
    initials: 'JW',
    name: 'Jenny Wilson',
    email: 'jenny.wilson@example.com',
    timeAgo: '5 mins ago',
    status: 'new',
    priority: 'high',
    department: 'Marketing',
    title: 'Robot brochure assets are missing',
    preview: 'The latest product brochure is not available in the document library for the marketing launch.',
    dateLabel: '23rd of June at 7:55 am',
    body: 'The latest product brochure is not available in the document library for the marketing launch.',
    attachments: [],
    comments: [],
    reply: 'Hi Jenny,\n\nWe are checking the document library permissions and will upload the latest brochure shortly.',
  },
  {
    id: 'blake-gilmore',
    initials: 'BG',
    name: 'Blake Gilmore',
    email: 'blake.gilmore@example.com',
    timeAgo: '8 mins ago',
    status: 'new',
    priority: 'high',
    department: 'Support',
    title: 'Support dashboard ticket sync issue',
    preview: 'Ticket counts are not updating after new client messages are added to existing conversations.',
    dateLabel: '23rd of June at 7:52 am',
    body: 'Ticket counts are not updating after new client messages are added to existing conversations.',
    attachments: [],
    comments: [],
    reply: 'Hi Blake,\n\nWe are reviewing the queue refresh behavior and will follow up with a fix.',
  },
  {
    id: 'robert-gulliver',
    initials: 'RG',
    name: 'Robert Gulliver',
    email: 'robert.gulliver@example.com',
    timeAgo: '10 mins ago',
    status: 'open',
    priority: 'medium',
    department: 'Sales',
    title: 'Need updated commercial proposal',
    preview: 'Please update the commercial proposal with the newest product pricing and delivery timeline.',
    dateLabel: '23rd of June at 7:50 am',
    body: 'Please update the commercial proposal with the newest product pricing and delivery timeline.',
    attachments: [],
    comments: [
      {
        id: 'comment-3',
        author: 'Sara Haddad',
        initial: 'S',
        timeAgo: '4 mins ago',
        text: 'Proposal template has been updated. Waiting for final pricing confirmation.',
      },
    ],
    reply: 'Hi Robert,\n\nWe are updating the commercial proposal and will send the revised version today.',
  },
]

export default function AllTickets() {
  const [selectedId, setSelectedId] = useState(tickets[0].id)
  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0],
    [selectedId],
  )

  return (
    <AgentPage>
      <PageHeader
        eyebrow="Support operations"
        title="Ticket management"
        description="Review the full support queue, inspect client requests, and prepare replies."
      />

      <div className="mt-6 grid min-h-[720px] gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <TicketQueue selectedId={selectedId} onSelect={setSelectedId} />
        <TicketDetail ticket={selectedTicket} />
      </div>
    </AgentPage>
  )
}

function TicketQueue({ selectedId, onSelect }) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-bold text-slate-950">Ticket Queue</h2>
        <p className="mt-1 text-sm text-slate-500">{tickets.length} available tickets</p>
      </div>

      <div className="max-h-[650px] overflow-y-auto py-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            onClick={() => onSelect(ticket.id)}
            className={`block w-full border-l-4 px-5 py-4 text-left transition ${
              selectedId === ticket.id
                ? 'border-blue-600 bg-blue-50/80'
                : 'border-transparent bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar initials={ticket.initials} />
                <span className="truncate text-sm font-bold text-slate-950">{ticket.name}</span>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-400">{ticket.timeAgo}</span>
            </div>

            <p className="mt-3 truncate text-sm font-semibold text-slate-800">{ticket.title}</p>
            <p className="mt-1 truncate text-sm text-slate-500">{ticket.preview}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill status={ticket.status} />
              <PriorityPill priority={ticket.priority} />
              <DepartmentPill department={ticket.department} />
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}

function TicketDetail({ ticket }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="!text-2xl !font-bold text-slate-950">{ticket.title}</h1>
              <StatusPill status={ticket.status} />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{ticket.preview}</p>
          </div>
        </div>
      </header>

      <div className="max-h-[650px] overflow-y-auto p-5 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] sm:p-6">
        <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar initials={ticket.initials} size="lg" />
              <div>
                <h2 className="text-base font-bold text-slate-950">{ticket.name}</h2>
                <p className="text-sm text-slate-500">{ticket.email}</p>
              </div>
            </div>
            <time className="text-sm font-medium text-slate-500">{ticket.dateLabel}</time>
          </div>

          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">{ticket.body}</p>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-950">Attachments</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {ticket.attachments.length ? (
                ticket.attachments.map((attachment) => (
                  <div
                    key={attachment.name}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <FaPaperclip className="text-slate-400" />
                    <span className="font-semibold text-slate-800">{attachment.name}</span>
                    <span className="ml-auto text-slate-400">{attachment.size}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">
                  No attachments.
                </p>
              )}
            </div>
          </div>
        </article>

        <section className="mt-6">
          <h2 className="text-base font-bold text-slate-950">Comments</h2>
          <div className="mt-3 grid gap-3">
            {ticket.comments.length ? (
              ticket.comments.map((comment) => (
                <article key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar initials={comment.initial} tone="slate" />
                      <span className="truncate text-sm font-bold text-slate-950">{comment.author}</span>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-400">{comment.timeAgo}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{comment.text}</p>
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-400">
                No comments yet.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <label className="block text-sm font-bold text-slate-950">
            Reply to:
            <span className="ml-2 font-semibold text-slate-500">{ticket.name} &lt;{ticket.email}&gt;</span>
          </label>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
              <ToolbarButton label="Paragraph">Paragraph</ToolbarButton>
              <ToolbarButton label="Bold"><FaBold /></ToolbarButton>
              <ToolbarButton label="Italic"><FaItalic /></ToolbarButton>
              <ToolbarButton label="Underline"><FaUnderline /></ToolbarButton>
              <ToolbarButton label="List"><FaListUl /></ToolbarButton>
              <ToolbarButton label="Attach"><FaPaperclip /></ToolbarButton>
              <ToolbarButton label="Link"><FaLink /></ToolbarButton>
              <ToolbarButton label="Image"><FaImage /></ToolbarButton>
            </div>
            <textarea
              className="min-h-44 w-full resize-none border-0 bg-white p-4 text-sm leading-7 text-slate-700 outline-none"
              defaultValue={ticket.reply}
            />
          </div>
        </section>
      </div>
    </section>
  )
}

function Avatar({ initials, size = 'md', tone = 'blue' }) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm'
  const toneClass = tone === 'slate' ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white'

  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-bold ${sizeClass} ${toneClass}`}>
      {initials}
    </span>
  )
}

function StatusPill({ status }) {
  const isOpen = status === 'open'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
      {isOpen ? 'Open' : 'New'}
    </span>
  )
}

function PriorityPill({ priority }) {
  const isHigh = priority === 'high'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
      {isHigh ? 'High Priority' : 'Medium Priority'}
    </span>
  )
}

function DepartmentPill({ department }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {department} Department
    </span>
  )
}

function ToolbarButton({ label, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex min-h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
    >
      {children}
    </button>
  )
}

function AgentPage({ children }) {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}
