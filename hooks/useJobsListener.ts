import { useState, useEffect, useRef } from 'react'
import { Job } from '@/lib/jobs-data'
import { subscribeToJobs } from '@/lib/jobs'

export function useJobsListener() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const isActiveRef = useRef(true)

  useEffect(() => {
    // Listen for page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, unsubscribe to save reads
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
          unsubscribeRef.current = null
        }
        isActiveRef.current = false
      } else {
        // Page is visible, resubscribe
        if (!unsubscribeRef.current && isActiveRef.current === false) {
          setupListener()
        }
        isActiveRef.current = true
      }
    }

    const setupListener = () => {
      unsubscribeRef.current = subscribeToJobs((updatedJobs) => {
        setJobs(updatedJobs)
        setLoading(false)
      })
    }

    // Initial setup
    setupListener()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return { jobs, loading }
} 