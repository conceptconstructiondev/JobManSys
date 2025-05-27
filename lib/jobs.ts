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
  onSnapshot
} from 'firebase/firestore'
import { db } from './firebase'
import { Job } from './jobs-data'

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
    console.error('Error fetching jobs:', error)
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

// Real-time listener for ALL jobs (no user filter)
export function subscribeToJobs(callback: (jobs: Job[]) => void) {
  const q = query(jobsCollection, orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (querySnapshot) => {
    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Job[]
    
    callback(jobs)
  }, (error) => {
    console.error('Error listening to jobs:', error)
  })
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