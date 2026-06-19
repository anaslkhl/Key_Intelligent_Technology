import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import { getRoleHome } from '../../utils/roles'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isInitializing, user } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <div className="route-loading" role="status">Loading your workspace...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  return <Outlet />
}
