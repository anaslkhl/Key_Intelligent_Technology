import { lazy } from 'react'

export const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
export const ManageUsers = lazy(() => import('./admin/ManageUsers'))
export const ManageReviews = lazy(() => import('./admin/ManageReviews'))
export const ManageFeatures = lazy(() => import('./admin/ManageFeatures'))
export const Analytics = lazy(() => import('./admin/Analytics'))
export const ExportData = lazy(() => import('./admin/ExportData'))
