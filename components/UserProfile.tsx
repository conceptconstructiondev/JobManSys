'use client'
import { useAuth } from '@/contexts/AuthContext'

export default function UserProfile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-3 p-3">
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
        <span className="text-xs text-primary-foreground font-medium">
          {user.email?.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.email}</p>
        <p className="text-xs text-muted-foreground">Authenticated</p>
      </div>
    </div>
  )
} 