import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import AIChatWidget from '../ai/AIChatWidget'
import Header from './Header'
import RouteEnhancements from './RouteEnhancements'
import Sidebar from './Sidebar'

export default function Layout() {
  const { isAuthenticated, user } = useAuth()
  const { pathname } = useLocation()
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const isLanding = pathname === '/'
  const isAuthPage = ['/login', '/register'].includes(pathname)
  const hasWorkspace = isAuthenticated && ['agent', 'admin'].includes(user?.role) && !isAuthPage
  return (
    <div className={`app-shell${hasWorkspace ? ' authenticated-shell' : ''}`}>
      {!hasWorkspace && <Header />}
      {hasWorkspace && <Sidebar isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} />}
      {hasWorkspace && (
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setIsNavigationOpen(true)}
          aria-label="Open workspace navigation"
          title="Open navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      )}
      <main className="main-content page-enter">
        <RouteEnhancements />
        <Outlet />
      </main>
      {!isAuthenticated && !isLanding && !isAuthPage && (
        <footer className="site-footer">
          <div className="container footer-inner">
            <span>KIT Robotics Support Hub</span>
            <span>Autonomous systems support, organized.</span>
          </div>
        </footer>
      )}
      {isAuthenticated && !isAuthPage && <AIChatWidget />}
    </div>
  )
}
