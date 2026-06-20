import ActivityFeed from '../components/landing/ActivityFeed'
import CTA from '../components/landing/CTA'
import Footer from '../components/landing/Footer'
import Hero from '../components/landing/Hero'
import QuickActions from '../components/landing/QuickActions'
import SocialProof from '../components/landing/SocialProof'
import Statistics from '../components/landing/Statistics'
import UseCases from '../components/landing/UseCases'

export default function LandingPage() {
  return <div className="landing-page bg-white dark:bg-slate-900"><Hero /><QuickActions /><Statistics /><ActivityFeed /><UseCases /><SocialProof /><CTA /><Footer /></div>
}
