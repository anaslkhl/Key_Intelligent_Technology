import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import PortalPage from './pages/PortalPage'
import Register from './pages/Register'
import RegisterRobot from './pages/robots/RegisterRobot'
import RobotList from './pages/robots/RobotList'
import CreateTicket from './pages/tickets/CreateTicket'
import TicketDetail from './pages/tickets/TicketDetail'
import TicketList from './pages/tickets/TicketList'

const page = (eyebrow, title, description) => (
  <PortalPage eyebrow={eyebrow} title={title} description={description} />
)

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      {
        element: <ProtectedRoute allowedRoles={['client']} />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/tickets', element: <TicketList /> },
          { path: '/tickets/create', element: <CreateTicket /> },
          { path: '/tickets/:id', element: <TicketDetail /> },
          { path: '/robots', element: <RobotList /> },
          { path: '/robots/register', element: <RegisterRobot /> },
          { path: '/reviews/my', element: page('Client workspace', 'Your reviews', 'Track submitted and approved product reviews.') },
          { path: '/feature-requests', element: page('Client workspace', 'Feature ideas', 'Submit ideas and vote for product improvements.') },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['agent', 'admin']} />,
        children: [
          { path: '/agent/tickets', element: page('Support operations', 'Ticket queue', 'Review, assign, and respond to client tickets.') },
          { path: '/agent/knowledge-base', element: page('Support operations', 'Knowledge base', 'Create and maintain support documentation.') },
          { path: '/forum', element: page('Community moderation', 'Community forum', 'Review questions and moderate discussions.') },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { path: '/admin/dashboard', element: page('Administration', 'Admin dashboard', 'Monitor support operations across KIT Robotics.') },
          { path: '/admin/users', element: page('Administration', 'User management', 'Manage user roles and account status.') },
          { path: '/admin/reviews', element: page('Administration', 'Review moderation', 'Approve or reject client product reviews.') },
          { path: '/admin/analytics', element: page('Administration', 'Analytics', 'Inspect ticket, CSAT, and knowledge-base trends.') },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default router
