import { supabase, Job } from './supabase'
import { useState, useEffect } from 'react'

// Create a new job
export async function createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        title: jobData.title,
        description: jobData.description,
        company: jobData.company,
        status: jobData.status,
        accepted_by: jobData.accepted_by,
        accepted_at: jobData.accepted_at,
        onsite_time: jobData.onsite_time,
        completed_time: jobData.completed_time,
        invoiced: jobData.invoiced,
        work_started_image: jobData.work_started_image,
        work_started_notes: jobData.work_started_notes,
        work_completed_image: jobData.work_completed_image,
        work_completed_notes: jobData.work_completed_notes,
      }])
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error creating job:', error)
    throw error
  }
}

// Get all jobs
export async function getAllJobs(): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Debug: Log the first job to see date format
    if (data && data.length > 0) {
      console.log('Sample job data:', data[0])
      console.log('created_at value:', data[0].created_at)
      console.log('created_at type:', typeof data[0].created_at)
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching all jobs:', error)
    throw error
  }
}

// Get available jobs (for mobile - only open jobs)
export async function getAvailableJobs(): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching available jobs:', error)
    throw error
  }
}

// Get jobs by user
export async function getJobsByUser(userEmail: string): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('accepted_by', userEmail)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user jobs:', error)
    throw error
  }
}

// Get jobs by status
export async function getJobsByStatus(status: Job['status']): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching jobs by status:', error)
    throw error
  }
}

// Get a single job by ID
export async function getJobById(jobId: string): Promise<Job | null> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  } catch (error) {
    console.error('Error fetching job:', error)
    throw error
  }
}

// Update a job
export async function updateJob(jobId: string, updates: Partial<Job>) {
  try {
    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating job:', error)
    throw error
  }
}

// Delete a job
export async function deleteJob(jobId: string) {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting job:', error)
    throw error
  }
}

// Accept a job (works for both web and mobile)
export async function acceptJob(jobId: string, userEmail: string) {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'accepted',
        accepted_by: userEmail,
        accepted_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (error) throw error
    console.log('Job accepted successfully')
    return true
  } catch (error) {
    console.error('Error accepting job:', error)
    throw error
  }
}

// Mark job as onsite (with optional image/notes for mobile)
export async function markJobOnsite(jobId: string, onsiteData?: {
  onsite_time?: string
  work_started_image?: string
  work_started_notes?: string
}) {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'onsite',
        onsite_time: onsiteData?.onsite_time || new Date().toISOString(),
        work_started_image: onsiteData?.work_started_image,
        work_started_notes: onsiteData?.work_started_notes
      })
      .eq('id', jobId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking job onsite:', error)
    throw error
  }
}

// Complete a job
export async function completeJob(
  jobId: string, 
  completionData: {
    work_completed_image?: string
    work_completed_notes?: string
  }
) {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'completed',
        completed_time: new Date().toISOString(),
        ...completionData
      })
      .eq('id', jobId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error completing job:', error)
    throw error
  }
}

// Toggle job invoiced status
export async function toggleJobInvoiced(jobId: string, invoiced: boolean) {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({
        invoiced: invoiced
      })
      .eq('id', jobId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating invoice status:', error)
    throw error
  }
}

// Real-time subscription for all jobs (web dashboard)
export function subscribeToJobs(callback: (jobs: Job[]) => void) {
  const subscription = supabase
    .channel('jobs-channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'jobs' 
      }, 
      async () => {
        // Fetch fresh data when changes occur
        const jobs = await getAllJobs()
        callback(jobs)
      }
    )
    .subscribe()

  // Initial data fetch
  getAllJobs().then(callback)

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription)
  }
}

// Real-time subscription for available jobs (mobile)
export function subscribeToAvailableJobs(callback: (jobs: Job[]) => void) {
  const subscription = supabase
    .channel('available-jobs-channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'jobs',
        filter: `status=eq.open`
      }, 
      async () => {
        // Fetch fresh data when available jobs change
        const jobs = await getAvailableJobs()
        callback(jobs)
      }
    )
    .subscribe()

  // Initial data fetch
  getAvailableJobs().then(callback)

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription)
  }
}

// Listen only to status changes, not all field updates
export function subscribeToJobStatusChanges(callback: (jobs: Job[]) => void) {
  const subscription = supabase
    .channel('jobs-status-channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'jobs',
        filter: `status=in.(${'open,accepted,onsite,completed'})`
      }, 
      async () => {
        // Fetch fresh data when status changes occur
        const jobs = await getAllJobs()
        callback(jobs)
      }
    )
    .subscribe()

  // Initial data fetch
  getAllJobs().then(callback)

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription)
  }
}

// Only listen to jobs from the last 30 days
export function subscribeToRecentJobs(callback: (jobs: Job[]) => void) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const subscription = supabase
    .channel('jobs-recent-channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'jobs',
        filter: `created_at>=date(${thirtyDaysAgo.toISOString()})`
      }, 
      async () => {
        // Fetch fresh data when jobs from the last 30 days occur
        const jobs = await getAllJobs()
        callback(jobs)
      }
    )
    .subscribe()

  // Initial data fetch
  getAllJobs().then(callback)

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription)
  }
}

// Alternative: Polling approach (fewer reads, slight delay)
export function useJobsPolling(intervalMs = 30000) { // Poll every 30 seconds
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await getAllJobs() // Your existing function
        setJobs(jobsData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }

    // Initial fetch
    fetchJobs()

    // Set up polling
    const interval = setInterval(fetchJobs, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])

  return { jobs, loading }
} 