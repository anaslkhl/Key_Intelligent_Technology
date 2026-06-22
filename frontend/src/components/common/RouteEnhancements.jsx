import { useEffect } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import { getRoleHome } from '../../utils/roles'

const labels = { agent: 'Agent', admin: 'Admin', tickets: 'Tickets', kb: 'Knowledge base', manage: 'Manage', create: 'Create', edit: 'Edit', forum: 'Forum', 'knowledge-base': 'Knowledge base', reviews: 'Reviews', features: 'Features', documents: 'Documents', permissions: 'Permissions', 'my-products': 'My products', analytics: 'Analytics', export: 'Export', users: 'Users', profile: 'Profile', notifications: 'Notifications', robots: 'Robots', register: 'Register', ask: 'Ask question', write: 'Write review', submit: 'Submit feature', dashboard: 'Dashboard', login: 'Log in' }

const titles = [
  [/^\/$/, 'KIT Support Hub'], [/^\/login$/, 'Log in'], [/^\/register$/, 'Create account'], [/^\/dashboard$/, 'Dashboard'],
  [/^\/tickets\/create$/, 'Create ticket'], [/^\/tickets\/[^/]+$/, 'Ticket details'], [/^\/tickets$/, 'Support tickets'],
  [/^\/robots\/register$/, 'Register robot'], [/^\/robots$/, 'Robots'], [/^\/knowledge-base\/[^/]+$/, 'Knowledge article'], [/^\/knowledge-base$/, 'Knowledge base'],
  [/^\/forum\/ask$/, 'Ask a question'], [/^\/forum\/[^/]+$/, 'Forum question'], [/^\/forum$/, 'Community forum'],
  [/^\/reviews$/, 'Customer reviews'], [/^\/reviews\/my$/, 'My reviews'], [/^\/reviews\/write$/, 'Write a review'], [/^\/features\/submit$/, 'Submit a feature'], [/^\/features$/, 'Feature requests'],
  [/^\/documents\/my-products$/, 'My product documents'], [/^\/documents\/[^/]+$/, 'Document details'], [/^\/documents$/, 'Document library'],
  [/^\/agent\/dashboard$/, 'Agent dashboard'], [/^\/agent\/tickets\/[^/]+$/, 'Agent ticket'], [/^\/agent\/tickets$/, 'Ticket queue'], [/^\/agent\/kb\/create$/, 'Create KB article'], [/^\/agent\/kb\/edit\/[^/]+$/, 'Edit KB article'], [/^\/agent\/kb\/manage$/, 'Manage knowledge base'], [/^\/agent\/forum\/manage$/, 'Forum moderation'],
  [/^\/agent\/documents\/create$/, 'Create document'], [/^\/agent\/documents\/[^/]+\/edit$/, 'Edit document'], [/^\/agent\/documents$/, 'Manage documents'],
  [/^\/admin\/dashboard$/, 'Admin dashboard'], [/^\/admin\/users$/, 'User management'], [/^\/admin\/reviews$/, 'Review moderation'], [/^\/admin\/features$/, 'Feature roadmap'], [/^\/admin\/analytics$/, 'Support analytics'], [/^\/admin\/export$/, 'Export data'],
  [/^\/admin\/documents\/[^/]+\/permissions$/, 'Document permissions'], [/^\/admin\/documents$/, 'Document administration'],
  [/^\/profile$/, 'Profile'], [/^\/notifications$/, 'Notifications'],
]

const knownPaths = new Set(['/dashboard', '/tickets', '/robots', '/knowledge-base', '/forum', '/reviews', '/features', '/documents', '/agent/dashboard', '/agent/tickets', '/agent/kb/manage', '/agent/forum/manage', '/agent/documents', '/admin/dashboard', '/admin/users', '/admin/reviews', '/admin/features', '/admin/documents', '/admin/analytics', '/admin/export', '/profile', '/notifications'])

export default function RouteEnhancements() {
  const location = useLocation(); const { isAuthenticated, user } = useAuth(); const pathname = location.pathname
  useEffect(() => { const title = titles.find(([pattern]) => pattern.test(pathname))?.[1] || 'Page not found'; document.title = pathname === '/' ? title : `${title} | KIT Support Hub` }, [pathname])
  if (['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/knowledge-base')) return null
  const segments = pathname.split('/').filter(Boolean); const home = isAuthenticated ? getRoleHome(user.role) : '/'

  return <nav className="breadcrumb-bar" aria-label="Breadcrumb"><Link to={home} aria-label="Dashboard"><Home size={14} /></Link>{segments.map((segment, index) => { const path = `/${segments.slice(0, index + 1).join('/')}`; const isLast = index === segments.length - 1; const label = /^[0-9a-f-]{30,}$/i.test(segment) ? 'Details' : labels[segment] || segment.replaceAll('-', ' '); return <span key={path} className="breadcrumb-item"><ChevronRight size={13} aria-hidden="true" />{!isLast && knownPaths.has(path) ? <Link to={path}>{label}</Link> : <span aria-current={isLast ? 'page' : undefined}>{label}</span>}</span> })}</nav>
}
