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