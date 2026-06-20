import { lazy } from 'react'

export const AgentDashboard = lazy(() => import('./agent/AgentDashboard'))
export const AllTickets = lazy(() => import('./agent/AllTickets'))
export const AgentTicketDetail = lazy(() => import('./agent/AgentTicketDetail'))
export const ManageKb = lazy(() => import('./agent/ManageKb'))
export const KbForm = lazy(() => import('./agent/KbForm'))
export const ManageForum = lazy(() => import('./agent/ManageForum'))
