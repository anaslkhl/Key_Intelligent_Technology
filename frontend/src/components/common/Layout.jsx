import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import Header from './Header'
import RouteEnhancements from './RouteEnhancements'
import Sidebar from './Sidebar'

export default function Layout() {
  const { isAuthenticated, user } = useAuth()
  const { pathname } = useLocation()
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const isLanding = pathname === '/'
  const isAuthPage = ['/login', '/register'].includes(pathname)
  const hasWorkspace = isAuthenticated && ['agent', 'admin'].includes(user?.role) && !isLanding
  return (
    <div className={`app-shell${hasWorkspace ? ' authenticated-shell' : ''}`}>
      <Header showNavigation={hasWorkspace} onOpenNavigation={() => setIsNavigationOpen(true)} />
      {hasWorkspace && <Sidebar isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} />}
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
    </div>
  )
}
