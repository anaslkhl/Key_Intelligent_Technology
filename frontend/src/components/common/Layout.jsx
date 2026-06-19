import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  const { isAuthenticated } = useAuth()
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  return (
    <div className={`app-shell${isAuthenticated ? ' authenticated-shell' : ''}`}>
      <Header onOpenNavigation={() => setIsNavigationOpen(true)} />
      {isAuthenticated && <Sidebar isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} />}
      <main className="main-content page-enter">
        <Outlet />
      </main>
      {!isAuthenticated && (
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
