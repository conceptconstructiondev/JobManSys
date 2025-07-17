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
    'ff10b084-2c7f-4c71-a8e7-3639fa3b8ff7': {
      email: 'es2037528@gmail.com',
      name: 'Edmund',
      updated_at: new Date().toISOString()
    },    
    'b4cc3f24-71fd-4ff2-89a4-c60c496351f3': {
      email: 'jolfivilanova04@gmail.com', 
      name: 'David',
      updated_at: new Date().toISOString()
    },
    '5a78e5b5-676b-4523-aebb-d6e2c0b79ac4': {
      email: 'chris@conceptconstructiontl.com', 
      name: 'Chris',
      updated_at: new Date().toISOString()
    },
    '4bbde6e9-02ed-46f1-8e08-da1badc58894': {
      email: 'jilfilanova04@gmail.com', 
      name: 'David',
      updated_at: new Date().toISOString()
    },    
    '04ba16d9-4dce-4786-96df-f5c19912f793':{
      email: 'alansyaif30@gmail.com', 
      name: 'Ali',
      updated_at: new Date().toISOString()
    },
    '2db99be7-6acc-4836-820e-9e2dcd466886':{
      email: 'litobruan@gmail.com', 
      name: 'Zaldy',
      updated_at: new Date().toISOString()
    },
    'c0720fbe-b408-4ee8-ab67-0fb297916b4c':{
      email: 'martinsj866@yahoo.com', 
      name: 'Jose',
      updated_at: new Date().toISOString()
    },
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
    console.log(`✅ Added user: ${name || email} (${userId.substring(0, 8)}...)`)
  }
}

export const UserCache = new UserCacheManager() 