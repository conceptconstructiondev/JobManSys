import { Job } from './jobs-data'

interface CachedJobs {
  jobs: Job[]
  timestamp: number
  version: string
}

const CACHE_KEY = 'jobs_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const CACHE_VERSION = '1.0' // Increment to invalidate cache

export class JobsCache {
  static get(): Job[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const data: CachedJobs = JSON.parse(cached)
      const now = Date.now()

      // Check if cache is still valid
      if (
        data.version === CACHE_VERSION &&
        (now - data.timestamp) < CACHE_DURATION
      ) {
        console.log('Using cached jobs data')
        return data.jobs
      }

      // Cache expired
      this.clear()
      return null
    } catch {
      return null
    }
  }

  static set(jobs: Job[]): void {
    try {
      const data: CachedJobs = {
        jobs,
        timestamp: Date.now(),
        version: CACHE_VERSION
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      console.log('Jobs cached locally')
    } catch (error) {
      console.warn('Failed to cache jobs:', error)
    }
  }

  static clear(): void {
    localStorage.removeItem(CACHE_KEY)
  }

  static isValid(): boolean {
    const cached = this.get()
    return cached !== null
  }
} 