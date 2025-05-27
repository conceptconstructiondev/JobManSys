import { useState, useEffect, useRef } from 'react'
import { Job } from '@/lib/jobs-data'
import { getAllJobs } from '@/lib/jobs'
import { JobsCache } from '@/lib/jobsCache'

export function useOptimizedJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)

  const fetchJobs = async (force = false) => {
    const now = Date.now()
    
    // Check cooldown unless forced
    if (!force && (now - lastFetch) < 30000) {
      console.log('Skipping fetch due to cooldown')
      return
    }

    try {
      console.log('Fetching jobs from Firestore...')
      const freshJobs = await getAllJobs()
      setJobs(freshJobs)
      setLoading(false)
      setLastFetch(now)
      
      // Cache the results
      JobsCache.set(freshJobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setLoading(false)
    }
  }

  const loadInitialJobs = async () => {
    // Try cache first
    const cachedJobs = JobsCache.get()
    if (cachedJobs) {
      setJobs(cachedJobs)
      setLoading(false)
      console.log('Loaded from cache, no Firestore read')
      return
    }

    // No cache, fetch from Firestore
    await fetchJobs(true)
  }

  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false
        // Clear polling when page is hidden
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else if (!isActiveRef.current) {
        isActiveRef.current = true
        // Resume polling when page becomes visible
        // Check if we need fresh data
        if (!JobsCache.isValid()) {
          fetchJobs(true)
        }
        // Restart polling
        startPolling()
      }
    }

    const startPolling = () => {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Start new polling interval (every 10 minutes)
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          fetchJobs()
        }
      }, 10 * 60 * 1000) // Changed from 2 minutes to 10 minutes
    }

    // Initial load
    loadInitialJobs()

    // Start polling
    startPolling()

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Manual refresh function
  const refresh = () => {
    JobsCache.clear()
    setLoading(true)
    fetchJobs(true)
  }

  return { jobs, loading, refresh }
} 