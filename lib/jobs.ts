import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  limit
} from 'firebase/firestore'
import { db } from './firebase'
import { Job } from './jobs-data'
import { useState, useEffect } from 'react'

// Collection reference
const jobsCollection = collection(db, 'jobs')

// Create a new job
export async function createJob(jobData: Omit<Job, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(jobsCollection, {
      ...jobData,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating job:', error)
    throw error
  }
}

// Get all jobs
export async function getAllJobs(): Promise<Job[]> {
  try {
    const q = query(jobsCollection, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Job[]
  } catch (error) {
    console.error('Error fetching all jobs:', error)
    throw error
  }
}

// Get jobs by status
export async function getJobsByStatus(status: Job['status']): Promise<Job[]> {
  try {
    const q = query(
      jobsCollection, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Job[]
  } catch (error) {
    console.error('Error fetching jobs by status:', error)
    throw error
  }
}

// Get jobs by user email instead of user ID
export async function getJobsByUser(userEmail: string): Promise<Job[]> {
  try {
    const q = query(
      jobsCollection, 
      where('acceptedBy', '==', userEmail),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Job[]
  } catch (error) {
    console.error('Error fetching user jobs:', error)
    throw error
  }
}

// Get a single job by ID
export async function getJobById(jobId: string): Promise<Job | null> {
  try {
    const docRef = doc(db, 'jobs', jobId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Job
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching job:', error)
    throw error
  }
}

// Update a job
export async function updateJob(jobId: string, updates: Partial<Job>) {
  try {
    const docRef = doc(db, 'jobs', jobId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating job:', error)
    throw error
  }
}

// Delete a job
export async function deleteJob(jobId: string) {
  try {
    const docRef = doc(db, 'jobs', jobId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting job:', error)
    throw error
  }
}

// Accept a job
export async function acceptJob(jobId: string, userId: string, userEmail: string) {
  try {
    await updateJob(jobId, {
      status: 'accepted',
      acceptedBy: userEmail, // or userId, depending on your preference
      acceptedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error accepting job:', error)
    throw error
  }
}

// Mark job as onsite
export async function markJobOnsite(jobId: string, onsiteTime?: string) {
  try {
    await updateJob(jobId, {
      status: 'onsite',
      onsiteTime: onsiteTime || new Date().toISOString()
    })
  } catch (error) {
    console.error('Error marking job onsite:', error)
    throw error
  }
}

// Complete a job
export async function completeJob(
  jobId: string, 
  completionData: {
    workCompletedImage?: string
    workCompletedNotes?: string
  }
) {
  try {
    await updateJob(jobId, {
      status: 'completed',
      completedTime: new Date().toISOString(),
      ...completionData
    })
  } catch (error) {
    console.error('Error completing job:', error)
    throw error
  }
}

// Mark job as invoiced/not invoiced
export async function toggleJobInvoiced(jobId: string, invoiced: boolean) {
  try {
    await updateJob(jobId, {
      invoiced: invoiced
    })
  } catch (error) {
    console.error('Error updating invoice status:', error)
    throw error
  }
}

// Real-time listener for ALL jobs with better error handling
export function subscribeToJobs(callback: (jobs: Job[]) => void) {
  console.log('Setting up Firestore listener for all jobs')
  
  const q = query(jobsCollection, orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, 
    (querySnapshot) => {
      console.log('Firestore snapshot received, docs:', querySnapshot.docs.length)
      
      const jobs = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      }) as Job[]
      
      console.log('Processed jobs:', jobs.length)
      callback(jobs)
    }, 
    (error) => {
      console.error('Firestore listener error:', error)
      // You might want to call an error callback here
    }
  )
}

// This is the separate function for user-specific jobs (if needed elsewhere)
export function subscribeToJobsByUser(userEmail: string, callback: (jobs: Job[]) => void) {
  const q = query(
    jobsCollection, 
    where('acceptedBy', '==', userEmail),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (querySnapshot) => {
    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Job[]
    
    callback(jobs)
  }, (error) => {
    console.error('Error listening to user jobs:', error)
  })
}

// Only listen to jobs from the last 30 days
export function subscribeToRecentJobs(callback: (jobs: Job[]) => void) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const q = query(
    jobsCollection,
    where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
    orderBy('createdAt', 'desc'),
    limit(100) // Reasonable limit
  )
  
  return onSnapshot(q, (querySnapshot) => {
    // Only update on actual server changes
    if (querySnapshot.metadata.fromCache && !querySnapshot.metadata.hasPendingWrites) {
      return
    }

    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Job[]
    
    callback(jobs)
  })
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

// Listen only to status changes, not all field updates
export function subscribeToJobStatusChanges(callback: (jobs: Job[]) => void) {
  const q = query(
    jobsCollection,
    where('status', 'in', ['open', 'accepted', 'onsite', 'completed']),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  
  return onSnapshot(q, (querySnapshot) => {
    // Process only documents that actually changed
    const changes = querySnapshot.docChanges()
    
    if (changes.length === 0) return // No actual changes
    
    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Job[]
    
    callback(jobs)
  })
} 