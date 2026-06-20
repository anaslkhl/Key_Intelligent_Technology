import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import Header from './Header'
import RouteEnhancements from './RouteEnhancements'
import Sidebar from './Sidebar'

export default function Layout() {
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const isLanding = pathname === '/'
  const hasWorkspace = isAuthenticated && !isLanding
  return (
    <div className={`app-shell${hasWorkspace ? ' authenticated-shell' : ''}`}>
      <Header showNavigation={hasWorkspace} onOpenNavigation={() => setIsNavigationOpen(true)} />
      {hasWorkspace && <Sidebar isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} />}
      <main className="main-content page-enter">
        <RouteEnhancements />
        <Outlet />
      </main>
      {!isAuthenticated && !isLanding && (
        <footer className="site-footer">
          <div className="container footer-inner">
            <span>KIT Robotics Support Hub</span>
            <span>Autonomous systems support, organized.</span>
          </div>
        </footer>
      )}
    </div>
  )
}
