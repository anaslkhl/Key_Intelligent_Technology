import { BadgeCheck, Star } from 'lucide-react'
import Reveal from './Reveal'
import coficabLogo from '../../assets/logos/coficab.png'
import hyundaiLogo from '../../assets/logos/hyundai.png'
import leoniLogo from '../../assets/logos/leoni.png'
import toyotaLogo from '../../assets/logos/toyota.png'
import yazakiLogo from '../../assets/logos/yazaki.png'

const companyLogos = [
  { name: 'Toyota', logo: toyotaLogo },
  { name: 'Hyundai', logo: hyundaiLogo },
  { name: 'Yazaki', logo: yazakiLogo },
  { name: 'Leoni', logo: leoniLogo },
  { name: 'Coficab', logo: coficabLogo },
]
const reviews = [{ quote: 'KIT Support Hub solved our issue in hours!', author: 'Emma', company: 'KIT Robotics' }, { quote: 'Best support platform for robotics.', author: 'John', company: 'Warehouse Solutions' }]

export default function SocialProof() {
  const marqueeLogos = [...companyLogos, ...companyLogos]

  return <section className="bg-white px-3 py-20 dark:bg-slate-900 sm:px-4" aria-labelledby="trust-title"><div className="mx-auto max-w-[1200px]"><Reveal><div className="text-center"><h2 id="trust-title" className="!text-[32px] !font-bold !leading-[1.3] text-slate-900 dark:text-slate-50">Trusted by Industry Leaders</h2><p className="mt-3 text-lg leading-7 text-slate-600 dark:text-slate-400">Support built for teams that keep autonomous systems moving</p></div></Reveal><Reveal className="mt-10"><div className="trusted-logo-marquee border-y border-slate-200 dark:border-slate-700" aria-label="Trusted companies"><div className="trusted-logo-track">{marqueeLogos.map((company, index) => <div className="trusted-logo-item" key={`${company.name}-${index}`} aria-hidden={index >= companyLogos.length}><img className="trusted-logo" src={company.logo} alt={`${company.name} logo`} loading="lazy" /></div>)}</div></div></Reveal><div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr_320px]">{reviews.map((review, index) => <Reveal key={review.author} delay={index * 100}><figure className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800"><div className="flex gap-1 text-amber-500" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, star) => <Star key={star} size={17} fill="currentColor" />)}</div><blockquote className="mt-5 text-lg font-semibold leading-7 text-slate-900 dark:text-slate-50">“{review.quote}”</blockquote><figcaption className="mt-5 text-sm text-slate-500 dark:text-slate-400">{review.author} from {review.company}</figcaption></figure></Reveal>)}<Reveal delay={200}><div className="flex h-full flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-900 dark:bg-blue-950/40"><BadgeCheck size={34} className="text-blue-600 dark:text-blue-400" /><strong className="mt-4 text-3xl text-slate-900 dark:text-slate-50">94%</strong><span className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">of users found this helpful</span></div></Reveal></div></div></section>
}
