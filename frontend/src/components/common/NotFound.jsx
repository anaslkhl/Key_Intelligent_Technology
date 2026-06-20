import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import { getRoleHome } from '../../utils/roles'

export default function NotFound() {
  const { isAuthenticated, user } = useAuth()
  const destination = isAuthenticated ? getRoleHome(user.role) : '/'
  return <section className="grid min-h-[calc(100vh-64px)] place-items-center bg-slate-50 px-4 py-12 text-center"><div><span className="state-icon mx-auto h-16 w-16"><SearchX size={30} /></span><p className="mt-6 text-sm font-bold uppercase text-blue-600">404 error</p><h1 className="mt-3 !text-4xl !font-bold text-slate-900">Page not found</h1><p className="mx-auto mt-3 max-w-md text-slate-500">The page may have moved, or the address may be incorrect.</p><Link to={destination} className="button button-primary mt-7"><ArrowLeft size={17} />Back to {isAuthenticated ? 'dashboard' : 'home'}</Link></div></section>
}
