import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import NotFound from './components/common/NotFound'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import { AskQuestion, DocumentDetail, DocumentLibrary, ErrorCodeList, FeatureList, KbDetail, KbList, MyProductDocuments, MyReviews, QuestionDetail, QuestionList, ReviewList, SubmitFeature, WriteReview } from './pages/phase3'
import { AgentDashboard, AgentDocuments, AgentTicketDetail, AllTickets, DocumentForm, KbForm, ManageForum, ManageKb } from './pages/phase4'
import { AdminDashboard, AdminDocuments, Analytics, DocumentPermissions, ExportData, KbAnalytics, ManageFeatures, ManageReviews, ManageUsers } from './pages/phase5'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
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

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/knowledge-base', element: deferred(<KbList />) },
      { path: '/knowledge-base/:slug', element: deferred(<KbDetail />) },
      { path: '/error-codes', element: deferred(<ErrorCodeList />) },
      { path: '/forum', element: deferred(<QuestionList />) },
      { path: '/forum/:id', element: deferred(<QuestionDetail />) },
      { path: '/reviews', element: deferred(<ReviewList />) },
      { path: '/features', element: deferred(<FeatureList />) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/profile', element: <Profile /> },
          { path: '/notifications', element: <Notifications /> },
        ],
      },
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
          { path: '/features/submit', element: deferred(<SubmitFeature />) },
          { path: '/documents', element: deferred(<DocumentLibrary />) },
          { path: '/documents/my-products', element: deferred(<MyProductDocuments />) },
          { path: '/documents/:slug', element: deferred(<DocumentDetail />) },
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
          { path: '/agent/documents', element: deferred(<AgentDocuments />) },
          { path: '/agent/documents/create', element: deferred(<DocumentForm />) },
          { path: '/agent/documents/:id/edit', element: deferred(<DocumentForm />) },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { path: '/admin/dashboard', element: deferred(<AdminDashboard />) },
          { path: '/admin/users', element: deferred(<ManageUsers />) },
          { path: '/admin/reviews', element: deferred(<ManageReviews />) },
          { path: '/admin/features', element: deferred(<ManageFeatures />) },
          { path: '/admin/analytics', element: deferred(<Analytics />) },
          { path: '/admin/analytics/knowledge-base', element: deferred(<KbAnalytics />) },
          { path: '/admin/export', element: deferred(<ExportData />) },
          { path: '/admin/documents', element: deferred(<AdminDocuments />) },
          { path: '/admin/documents/:id/permissions', element: deferred(<DocumentPermissions />) },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default router
