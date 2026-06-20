import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import { useTheme } from '../../contexts/theme'
import { ROLE_LABELS } from '../../utils/roles'
import ConfirmDialog from './ConfirmDialog'

export default function Header({ onOpenNavigation }) {
  const { isAuthenticated, logout, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

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
    }
  }

  return (
    <>
      <header className={`site-header${isAuthPage ? ' auth-header' : ''}`}>
        <div className="header-inner">
          {isAuthenticated && (
            <button type="button" className="icon-button menu-button" onClick={onOpenNavigation} aria-label="Open navigation" title="Open navigation">
              <Menu size={20} />
            </button>
          )}

          <NavLink to="/" className="brand" aria-label="KIT Support Hub home">
            <span className="brand-mark">K</span>
            <span><strong>KIT</strong><small>Support Hub</small></span>
          </NavLink>

          {!isAuthenticated && !isAuthPage && (
            <nav className="public-nav" aria-label="Public navigation">
              <NavLink to="/knowledge-base">Knowledge base</NavLink>
              <NavLink to="/forum">Community</NavLink>
            </nav>
          )}

          <div className="account-nav">
            <button type="button" className="icon-button" onClick={toggleTheme} aria-label={`Use ${isDark ? 'light' : 'dark'} mode`} title={`Use ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            {isAuthenticated ? (
              <>
                <div className="user-summary">
                  <strong>{user.name}</strong>
                  <span>{ROLE_LABELS[user.role] || user.role}</span>
                </div>
                <NavLink to="/notifications" className="icon-button" aria-label="Notifications" title="Notifications"><Bell size={19} /></NavLink>
                <NavLink to="/profile" className="user-avatar" aria-label="Profile" title="Profile">{user.name?.charAt(0).toUpperCase()}</NavLink>
                <button type="button" className="icon-button logout-button" onClick={() => setShowLogoutDialog(true)} aria-label="Log out" title="Log out">
                  <LogOut size={19} />
                </button>
              </>
            ) : !isAuthPage && (
              <>
                <NavLink to="/login" className="header-login">Log in</NavLink>
                <NavLink to="/register" className="button button-primary button-md">Create account</NavLink>
              </>
            )}
          </div>
        </div>
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
