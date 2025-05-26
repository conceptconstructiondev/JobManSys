"use client"
import { useState, useEffect } from 'react'
import { getAllJobs, getJobsByStatus, getJobsByUser } from '@/lib/jobs'
import { Job } from '@/lib/jobs-data'

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const jobsData = await getAllJobs()
      setJobs(jobsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs
  }
}

export function useJobsByStatus(status: Job['status']) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        const jobsData = await getJobsByStatus(status)
        setJobs(jobsData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [status])

  return { jobs, loading, error }
} 