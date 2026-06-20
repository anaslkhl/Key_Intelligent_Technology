import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'

export default function CTA() {
  return <section className="bg-slate-50 px-3 py-20 text-center dark:bg-slate-950 sm:px-4" aria-labelledby="cta-title"><Reveal className="mx-auto max-w-[760px]"><h2 id="cta-title" className="!text-[32px] !font-bold !leading-[1.3] text-slate-900 dark:text-slate-50">Ready to get started?</h2><p className="mt-4 text-lg leading-7 text-slate-600 dark:text-slate-400">Join thousands of KIT Robotics users already using KIT Support Hub</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-blue-700">Get Started <ArrowRight size={18} /></Link><Link to="/knowledge-base" className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-blue-600 px-8 font-semibold text-blue-600 transition duration-200 hover:scale-[1.02] hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50">View Documentation</Link></div></Reveal></section>
}
