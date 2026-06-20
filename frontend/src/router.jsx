import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import { AskQuestion, FeatureList, KbDetail, KbList, MyReviews, QuestionDetail, QuestionList, SubmitFeature, WriteReview } from './pages/phase3'
import { AgentDashboard, AgentTicketDetail, AllTickets, KbForm, ManageForum, ManageKb } from './pages/phase4'
import PortalPage from './pages/PortalPage'
import Register from './pages/Register'
import RegisterRobot from './pages/robots/RegisterRobot'
import RobotList from './pages/robots/RobotList'
import CreateTicket from './pages/tickets/CreateTicket'
import TicketDetail from './pages/tickets/TicketDetail'
import TicketList from './pages/tickets/TicketList'

const deferred = (element) => (
  <Suspense fallback={<div className="route-loading" role="status">Loading page...</div>}>
    {element}
  </Suspense>
)

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
      { path: '/knowledge-base', element: deferred(<KbList />) },
      { path: '/knowledge-base/:slug', element: deferred(<KbDetail />) },
      { path: '/forum', element: deferred(<QuestionList />) },
      { path: '/forum/:id', element: deferred(<QuestionDetail />) },
      {
        element: <ProtectedRoute allowedRoles={['client']} />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/tickets', element: <TicketList /> },
          { path: '/tickets/create', element: <CreateTicket /> },
          { path: '/tickets/:id', element: <TicketDetail /> },
          { path: '/robots', element: <RobotList /> },
          { path: '/robots/register', element: <RegisterRobot /> },
          { path: '/forum/ask', element: deferred(<AskQuestion />) },
          { path: '/reviews/my', element: deferred(<MyReviews />) },
          { path: '/reviews/write', element: deferred(<WriteReview />) },
          { path: '/features', element: deferred(<FeatureList />) },
          { path: '/features/submit', element: deferred(<SubmitFeature />) },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['agent', 'admin']} />,
        children: [
          { path: '/agent/dashboard', element: deferred(<AgentDashboard />) },
          { path: '/agent/tickets', element: deferred(<AllTickets />) },
          { path: '/agent/tickets/:id', element: deferred(<AgentTicketDetail />) },
          { path: '/agent/kb/manage', element: deferred(<ManageKb />) },
          { path: '/agent/kb/create', element: deferred(<KbForm />) },
          { path: '/agent/kb/edit/:id', element: deferred(<KbForm />) },
          { path: '/agent/forum/manage', element: deferred(<ManageForum />) },
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
