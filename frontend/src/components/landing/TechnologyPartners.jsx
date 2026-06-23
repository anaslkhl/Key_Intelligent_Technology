import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import aiInActionLogo from '../../assets/logos/AIVISON.png'
import auboLogo from '../../assets/logos/aubo.png'
import gausiumLogo from '../../assets/logos/gausium.png'
import geekLogo from '../../assets/logos/geek.png'
import hikrobotLogo from '../../assets/logos/hikrobot.png'
import ombrullaLogo from '../../assets/logos/ombrulla.png'
import reemanLogo from '../../assets/logos/reeman.png'
import ubtechLogo from '../../assets/logos/ubtech.png'
import wheelMeLogo from '../../assets/logos/wheelme.png'
import Reveal from './Reveal'

const partners = [
  { name: 'Gausium', logo: gausiumLogo },
  { name: 'Geek+', logo: geekLogo },
  { name: 'Keenon' },
  { name: 'wheel_me', logo: wheelMeLogo },
  { name: 'EEMAN', logo: reemanLogo },
  { name: 'AIINACTION', logo: aiInActionLogo },
  { name: 'ombrulla', logo: ombrullaLogo, darkTile: true },
  { name: 'AUBO', logo: auboLogo },
  { name: 'UBTECH', logo: ubtechLogo },
  { name: 'HIKROBOT', logo: hikrobotLogo },
]

export default function TechnologyPartners() {
  return (
    <section className="technology-partners bg-white px-3 py-20 dark:bg-slate-900 sm:px-4" aria-labelledby="technology-partners-title">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="max-w-[760px]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">
              TRUSTED BY INDUSTRY LEADERS
            </p>
            <h2 id="technology-partners-title" className="mt-6 !text-[32px] !font-bold !leading-[1.2] text-slate-950 dark:text-slate-50 md:!text-[44px]">
              Our Technology & Industry Partners
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              We collaborate with leading technology providers, manufacturers, and industrial organizations to deliver reliable, scalable, and intelligent automation solutions.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {partners.map((partner, index) => (
            <Reveal key={partner.name} delay={index * 50}>
              <article className={`partner-logo-card ${partner.darkTile ? 'partner-logo-card-dark' : ''}`}>
                {partner.logo ? (
                  <img className="partner-logo" src={partner.logo} alt={`${partner.name} logo`} loading="lazy" />
                ) : (
                  <span className="partner-logo-fallback" aria-label={`${partner.name} logo`}>
                    {partner.name}
                  </span>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <Link to="/knowledge-base" className="partner-case-studies-button">
            View Case Studies
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
