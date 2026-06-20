import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

const stats = [{ value: 1234, label: 'Tickets Resolved' }, { value: 567, label: 'Community Answers' }, { value: 45, label: 'Knowledge Articles' }, { value: 94, suffix: '%', label: 'Customer Satisfaction' }]

export default function Statistics() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.25 })
  return <section ref={ref} className="bg-blue-600 px-3 py-[60px] text-white dark:bg-[#0B1120] sm:px-4" aria-label="Platform statistics"><div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 text-center lg:grid-cols-4">{stats.map((stat) => <div key={stat.label}><AnimatedNumber {...stat} active={inView} /><p className="mt-2 text-base leading-6 text-blue-100 dark:text-slate-300">{stat.label}</p></div>)}</div></section>
}

function AnimatedNumber({ value, suffix = '', active }) { const [count, setCount] = useState(0); useEffect(() => { if (!active) return undefined; const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduceMotion) { const timer = window.setTimeout(() => setCount(value), 0); return () => window.clearTimeout(timer) } const start = performance.now(); let frame; const tick = (now) => { const progress = Math.min((now - start) / 1200, 1); setCount(Math.round(value * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) frame = requestAnimationFrame(tick) }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame) }, [active, value]); return <strong className="block text-4xl font-bold leading-[1.2]">{count.toLocaleString()}{suffix}</strong> }
