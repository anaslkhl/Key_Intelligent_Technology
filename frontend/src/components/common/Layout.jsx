import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <span>KIT Robotics Support Hub</span>
          <span>Autonomous systems support, organized.</span>
        </div>
      </footer>
    </div>
  )
}
