interface UserMapping {
  [userId: string]: {
    email: string
    name?: string
    updated_at: string
  }
}

class UserCacheManager {
  private cache: UserMapping = {}
  private cacheKey = 'user_mapping_cache'

  // Pre-populated user mappings - add your known users here!
  private staticMappings: UserMapping = {
    '8e08c810-8a76-4ca9-a484-059d994cad08': {
      email: 'john@example.com',
      name: 'John Smith',
      updated_at: new Date().toISOString()
    },
    // Add more users as you discover them:
    // 'another-uuid-here': {
    //   email: 'jane@contractor.com', 
    //   name: 'Jane Wilson',
    //   updated_at: new Date().toISOString()
    // }
  }

  constructor() {
    this.loadFromStorage()
    this.mergeStaticMappings()
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.cacheKey)
        if (stored) {
          this.cache = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Error loading user cache:', error)
      }
    }
  }

  private mergeStaticMappings() {
    this.cache = { ...this.cache, ...this.staticMappings }
    this.saveToStorage()
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.cacheKey, JSON.stringify(this.cache))
      } catch (error) {
        console.error('Error saving user cache:', error)
      }
    }
  }

  // Core methods used by the UI
  getUserEmail(userId: string): string | null {
    return this.cache[userId]?.email || null
  }

  getUserName(userId: string): string | null {
    return this.cache[userId]?.name || null
  }

  hasUser(userId: string): boolean {
    return !!this.cache[userId]
  }

  // Simple method to add users when needed
  addUser(userId: string, email: string, name?: string) {
    this.cache[userId] = {
      email,
      name,
      updated_at: new Date().toISOString()
    }
    this.saveToStorage()
  }
}

export const UserCache = new UserCacheManager() 