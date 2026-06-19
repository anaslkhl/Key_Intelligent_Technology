import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/auth'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="home-section">
      <div className="container home-grid">
        <div className="home-copy">
          <p className="eyebrow">KIT Robotics customer support</p>
          <h1>KIT Support Hub</h1>
          <p className="lead">
            Track technical requests and keep every robot support conversation in one reliable place.
          </p>
          <div className="button-row">
            <Link className="button button-primary" to={isAuthenticated ? '/dashboard' : '/login'}>
              {isAuthenticated ? 'Open dashboard' : 'Log in to support'}
            </Link>
            {!isAuthenticated && <Link className="button button-secondary" to="/register">Create account</Link>}
          </div>
        </div>
        <div className="support-overview" aria-label="Support capabilities">
          <p className="overview-label">Support workspace</p>
          <div className="overview-row"><span>Ticket tracking</span><strong>End to end</strong></div>
          <div className="overview-row"><span>Product coverage</span><strong>6 families</strong></div>
          <div className="overview-row"><span>Knowledge base</span><strong>Self service</strong></div>
        </div>
      </div>
    </section>
  )
}
