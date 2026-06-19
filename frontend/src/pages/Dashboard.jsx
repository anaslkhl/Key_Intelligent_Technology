import { useAuth } from '../contexts/auth'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <section className="dashboard-section">
      <div className="container">
        <p className="eyebrow">{user.role} dashboard</p>
        <h1>Welcome, {user.name}</h1>
        <p className="lead">Your support workspace is ready. Ticket and robot data will appear here next.</p>

        <div className="dashboard-grid">
          <article className="metric"><span>Open tickets</span><strong>0</strong></article>
          <article className="metric"><span>Registered robots</span><strong>0</strong></article>
          <article className="metric"><span>Resolved requests</span><strong>0</strong></article>
        </div>
      </div>
    </section>
  )
}
