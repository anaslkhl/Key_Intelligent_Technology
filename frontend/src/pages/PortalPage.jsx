export default function PortalPage({ eyebrow, title, description }) {
  return (
    <section className="dashboard-section">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        <div className="empty-state">
          <strong>{title}</strong>
          <p>This workspace is protected and ready for its feature implementation.</p>
        </div>
      </div>
    </section>
  )
}
