import { BookOpen, Lightbulb, MessageSquareText, TicketPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'

const actions = [
  { icon: TicketPlus, title: 'Report an Issue', description: 'Submit a support ticket to our team', to: '/tickets/create', tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300' },
  { icon: BookOpen, title: 'Browse Solutions', description: 'Search our knowledge base for answers', to: '/knowledge-base', tone: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-300' },
  { icon: MessageSquareText, title: 'Ask Community', description: 'Get help from other KIT Robotics users', to: '/forum', tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { icon: Lightbulb, title: 'Suggest Feature', description: 'Propose ideas and vote on new features', to: '/features', tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300' },
]

export default function QuickActions() {
  return <section className="bg-slate-50 px-3 py-8 dark:bg-slate-950 sm:px-4 sm:py-20" aria-labelledby="quick-actions-title"><div className="mx-auto max-w-[1200px]"><Reveal><div className="text-center"><h2 id="quick-actions-title" className="!text-[32px] !font-bold !leading-[1.3] text-slate-900 dark:text-slate-50">What would you like to do?</h2><p className="mt-3 text-lg leading-7 text-slate-600 dark:text-slate-400">Choose the fastest path to the support you need.</p></div></Reveal><div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{actions.map(({ icon: Icon, title, description, to, tone }, index) => <Reveal key={title} delay={index * 100}><Link to={to} className="group block min-h-56 rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition duration-300 hover:scale-[1.03] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-800"><span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}><Icon size={23} /></span><h3 className="mt-6 text-lg font-semibold leading-7 text-slate-900 dark:text-slate-50">{title}</h3><p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">{description}</p><span className="mt-5 inline-block text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400">Get started →</span></Link></Reveal>)}</div></div></section>
}
