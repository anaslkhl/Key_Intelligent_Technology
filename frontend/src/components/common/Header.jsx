import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/auth'
import { ROLE_LABELS } from '../../utils/roles'
import ConfirmDialog from './ConfirmDialog'

const roleNavigation = {
  client: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tickets', label: 'Tickets' },
    { to: '/robots', label: 'Robots' },
    { to: '/feature-requests', label: 'Ideas' },
  ],
  agent: [
    { to: '/agent/tickets', label: 'Tickets' },
    { to: '/agent/knowledge-base', label: 'Knowledge base' },
    { to: '/forum', label: 'Forum' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Admin' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/reviews', label: 'Reviews' },
    { to: '/admin/analytics', label: 'Analytics' },
  ],
}

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

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

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`
  const navigation = isAuthenticated ? roleNavigation[user.role] || [] : []

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand" aria-label="KIT Support Hub home">
            <span className="brand-mark">K</span>
            <span>
              <strong>KIT</strong>
              <small>Support Hub</small>
            </span>
          </NavLink>

          <nav className="primary-nav" aria-label="Primary navigation">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>{item.label}</NavLink>
            ))}
          </nav>

          <div className="account-nav">
            {isAuthenticated ? (
              <>
                <div className="user-summary">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <span className={`role-badge role-${user.role}`}>{ROLE_LABELS[user.role] || user.role}</span>
                <button type="button" className="button button-secondary" onClick={() => setShowLogoutDialog(true)}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Log in</NavLink>
                <NavLink to="/register" className="button button-primary">Create account</NavLink>
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
