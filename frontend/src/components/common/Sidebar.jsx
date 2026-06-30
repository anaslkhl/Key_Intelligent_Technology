import {
  BarChart3,
  BookOpen,
  Bot,
  CircleHelp,
  Download,
  Files,
  Gauge,
  Lightbulb,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  TicketCheck,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import ConfirmDialog from './ConfirmDialog'

const navigation = {
  agent: [
    { to: '/agent/dashboard', label: 'Dashboard', icon: Gauge },
    { to: '/ai-chat', label: 'AI Assistant', icon: Bot },
    { to: '/agent/tickets', label: 'Ticket queue', icon: TicketCheck },
    { to: '/agent/kb/manage', label: 'Knowledge base', icon: BookOpen },
    { to: '/agent/documents', label: 'Documents', icon: Files },
    { to: '/agent/forum/manage', label: 'Forum moderation', icon: MessageSquareText },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: Gauge },
    { to: '/ai-chat', label: 'AI Assistant', icon: Bot },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/reviews', label: 'Review moderation', icon: ShieldCheck },
    { to: '/admin/features', label: 'Feature roadmap', icon: Lightbulb },
    { to: '/admin/documents', label: 'Documents', icon: Files },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/statistics', label: 'Statistics', icon: BarChart3 },
    { to: '/admin/analytics/knowledge-base', label: 'KB analytics', icon: BookOpen },
    { to: '/admin/export', label: 'Export data', icon: Download },
  ],
}

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const items = navigation[user?.role] || []

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Signed out successfully')
    } catch {
      toast.error('You were signed out locally')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
      onClose()
      navigate('/login')
    }
  }

  return (
    <>
      <button type="button" className={`sidebar-backdrop${isOpen ? ' open' : ''}`} aria-label="Close navigation" onClick={onClose} />
      <aside className={`sidebar${isOpen ? ' open' : ''}`} aria-label="Workspace navigation">
        <div className="sidebar-mobile-header">
          <span>Workspace</span>
          <button type="button" className="icon-button icon-button-dark" onClick={onClose} aria-label="Close navigation" title="Close navigation">
            <X size={19} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <p className="sidebar-label">Workspace</p>
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-support">
          <CircleHelp size={20} />
          <div><strong>Support workspace</strong><span>Keep client requests moving forward.</span></div>
        </div>
        <button type="button" className="sidebar-logout" onClick={() => setShowLogoutDialog(true)}>
          <LogOut size={18} strokeWidth={1.9} />
          <span>Log out</span>
        </button>
      </aside>
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
