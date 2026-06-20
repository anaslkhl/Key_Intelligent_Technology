import {
  BarChart3,
  BookOpen,
  Bot,
  CircleHelp,
  Gauge,
  Lightbulb,
  MessageSquareText,
  ShieldCheck,
  Star,
  TicketCheck,
  Users,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'

const navigation = {
  client: [
    { to: '/dashboard', label: 'Dashboard', icon: Gauge },
    { to: '/tickets', label: 'Tickets', icon: TicketCheck },
    { to: '/robots', label: 'Robots', icon: Bot },
    { to: '/knowledge-base', label: 'Knowledge base', icon: BookOpen },
    { to: '/forum', label: 'Community', icon: MessageSquareText },
    { to: '/reviews/my', label: 'My reviews', icon: Star },
    { to: '/features', label: 'Feature requests', icon: Lightbulb },
  ],
  agent: [
    { to: '/agent/dashboard', label: 'Dashboard', icon: Gauge },
    { to: '/agent/tickets', label: 'Ticket queue', icon: TicketCheck },
    { to: '/agent/kb/manage', label: 'Knowledge base', icon: BookOpen },
    { to: '/agent/forum/manage', label: 'Forum moderation', icon: MessageSquareText },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: Gauge },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/reviews', label: 'Review moderation', icon: ShieldCheck },
    { to: '/admin/features', label: 'Feature roadmap', icon: Lightbulb },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/export', label: 'Export data', icon: Download },
  ],
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const items = navigation[user?.role] || []

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
          <div><strong>{user?.role === 'client' ? 'Need urgent help?' : 'Support workspace'}</strong><span>{user?.role === 'client' ? 'Create a priority ticket for the support team.' : 'Keep client requests moving forward.'}</span></div>
        </div>
      </aside>
    </>
  )
}
