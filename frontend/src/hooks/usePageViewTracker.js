import { useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import apiClient from '../api/client'

const SESSION_KEY = 'kit_visitor_session_id'

function getVisitorSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY)

  if (existing) {
    return existing
  }

  const next = crypto.randomUUID?.() ?? `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  sessionStorage.setItem(SESSION_KEY, next)

  return next
}

export default function usePageViewTracker() {
  const location = useLocation()
  const previousPathRef = useRef(null)
  const lastTrackedPathRef = useRef(null)

  const currentPath = useMemo(() => {
    return `${location.pathname}${location.search}${location.hash}`
  }, [location.hash, location.pathname, location.search])

  useEffect(() => {
    if (!currentPath || currentPath === lastTrackedPathRef.current) {
      return
    }

    if (currentPath.startsWith('/api')) {
      return
    }

    const startedAt = performance.now()
    const timeoutId = window.setTimeout(() => {
      apiClient
        .post('/page-view', {
          path: currentPath,
          referer: previousPathRef.current,
          session_id: getVisitorSessionId(),
          response_time: Math.round(performance.now() - startedAt),
        })
        .catch(() => {
          // Analytics should never interrupt the user's navigation.
        })

      previousPathRef.current = currentPath
      lastTrackedPathRef.current = currentPath
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [currentPath])
}
