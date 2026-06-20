import { BookOpen, CheckCircle2, MessageCircle, Star, TicketCheck, ThumbsUp } from 'lucide-react'
import Reveal from './Reveal'

const items = [
  { initials: 'AK', action: 'asked', title: 'How to calibrate OMNIE navigation?', meta: '8 minutes ago', detail: '3 answers · 12 upvotes', icon: MessageCircle },
  { initials: 'KT', action: 'resolved ticket #1024', title: 'Battery issue on F20MT', meta: '24 minutes ago', detail: 'Resolved', icon: TicketCheck },
  { initials: 'SM', action: 'reviewed', title: 'OMNIE is excellent!', meta: '1 hour ago', detail: '5 stars', icon: Star },
  { initials: 'KB', action: 'published', title: 'Battery troubleshooting guide', meta: '2 hours ago', detail: 'Knowledge article', icon: BookOpen },
  { initials: 'JR', action: 'asked', title: 'How to update firmware on SC50?', meta: '3 hours ago', detail: '2 answers', icon: ThumbsUp },
]

export default function ActivityFeed() {
  return <section className="bg-white px-3 py-20 dark:bg-slate-900 sm:px-4" aria-labelledby="activity-title"><div className="mx-auto max-w-[960px]"><Reveal><div className="text-center"><h2 id="activity-title" className="!text-[32px] !font-bold !leading-[1.3] text-slate-900 dark:text-slate-50">What&apos;s happening in the community</h2><p className="mt-3 text-lg leading-7 text-slate-600 dark:text-slate-400">Latest questions, answers, and activity from KIT Robotics users</p></div></Reveal><div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">{items.map((item, index) => <ActivityItem key={item.title} item={item} index={index} />)}</div></div></section>
}

function ActivityItem({ item, index }) { const Icon = item.icon; return <Reveal delay={index * 70}><article className="flex gap-4 border-b border-slate-200 p-5 last:border-0 dark:border-slate-700 sm:p-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{item.initials}</span><div className="min-w-0 flex-1"><p className="text-sm text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-50">{item.initials}</strong> {item.action}</p><h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">{item.title}</h3><div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400"><span>{item.meta}</span><span className="inline-flex items-center gap-1.5"><Icon size={14} />{item.detail}</span></div></div>{index === 1 && <CheckCircle2 size={19} className="shrink-0 text-emerald-500" aria-label="Resolved" />}</article></Reveal> }
