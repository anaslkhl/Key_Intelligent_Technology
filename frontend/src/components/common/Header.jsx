import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import { useTheme } from '../../contexts/theme'
import { ROLE_LABELS } from '../../utils/roles'
import ConfirmDialog from './ConfirmDialog'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/knowledge-base', label: 'Knowledge Base' },
  { to: '/error-codes', label: 'Error Codes' },
  { to: '/forum', label: 'Forum' },
  { to: '/reviews', label: 'Reviews' },
]

const clientLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/knowledge-base', label: 'Knowledge Base' },
  { to: '/error-codes', label: 'Error Codes' },
  { to: '/documents', label: 'Documents' },
  { to: '/forum', label: 'Forum' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/features', label: 'Features' },
  { to: '/robots', label: 'Robots' },
]

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  const isTransparent = location.pathname === '/' && !isAuthPage && !scrolled
  const links = isAuthenticated ? clientLinks : publicLinks

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 10)

    updateScrolled()
    window.addEventListener('scroll', updateScrolled, { passive: true })

    return () => window.removeEventListener('scroll', updateScrolled)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Signed out successfully')
      navigate('/login')
    } catch {
      toast.error('You were signed out locally')
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
      setIsUserMenuOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <header className={`site-header app-header${isAuthPage ? ' auth-header' : ''}${isTransparent ? ' is-transparent' : ' is-solid'}`}>
        <div className="header-inner app-header-inner">
          {showPrimaryNavigation(isAuthPage) && (
            <button
              type="button"
              className="mobile-nav-button app-mobile-nav-button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-primary-navigation"
            >
              {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          )}

          <NavLink to="/" className="brand app-brand" aria-label="KIT Support Hub home">
            <span className="brand-mark">K</span>
            <span className="brand-copy">
              <strong>KIT</strong>
              <small>Support Hub</small>
            </span>
          </NavLink>

          {showPrimaryNavigation(isAuthPage) && (
            <nav className="marketing-nav app-desktop-nav" aria-label="Primary navigation">
              {links.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `header-nav-link${isActive ? ' active' : ''}`}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="account-nav app-account-nav">
            {!isAuthPage && (
              <button
                type="button"
                className="icon-button app-header-icon-button"
                onClick={toggleTheme}
                aria-label={`Use ${isDark ? 'light' : 'dark'} mode`}
                title={`Use ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun size={19} /> : <Moon size={19} />}
              </button>
            )}

            {isAuthenticated ? (
              <div className="header-user-menu">
                <button
                  type="button"
                  className="header-user-trigger"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="user-avatar" aria-hidden="true">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="header-user-copy">
                    <strong>{user?.name}</strong>
                    <small>{ROLE_LABELS[user?.role] || user?.role}</small>
                  </span>
                  <ChevronDown size={15} aria-hidden="true" />
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown" role="menu">
                    <NavLink to="/profile" role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                      <UserRound size={16} />
                      Profile
                    </NavLink>
                    <NavLink to="/notifications" role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                      <Bell size={16} />
                      Notifications
                    </NavLink>
                    <button type="button" role="menuitem" onClick={() => setShowLogoutDialog(true)}>
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !isAuthPage && (
                <div className="desktop-auth-actions">
                  <NavLink to="/login" className="button button-secondary button-md header-login-button">
                    Log in
                  </NavLink>
                  <NavLink to="/register" className="button button-primary button-md header-cta">
                    Get started
                  </NavLink>
                </div>
              )
            )}
          </div>
        </div>

        {showPrimaryNavigation(isAuthPage) && (
          <nav
            id="mobile-primary-navigation"
            className={`mobile-marketing-menu app-mobile-menu${isMobileMenuOpen ? ' open' : ''}`}
            aria-label="Mobile navigation"
          >
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="mobile-auth-actions">
                <Link to="/login" onClick={closeMobileMenu} className="button button-secondary">
                  Log in
                </Link>
                <Link to="/register" onClick={closeMobileMenu} className="button button-primary">
                  Get started
                </Link>
              </div>
            )}
          </nav>
        )}
      </header>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Log out of KIT Support Hub?"
        message="You will need to enter your credentials again to access protected support pages."
        confirmLabel="Log out"
        isBusy={isLoggingOut}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}

function showPrimaryNavigation(isAuthPage) {
  return !isAuthPage
}
