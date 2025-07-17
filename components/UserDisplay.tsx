'use client'
import { useState, useEffect } from 'react'
import { UserCache } from '@/lib/userCache'

interface UserDisplayProps {
  userId: string
  className?: string
  showId?: boolean
}

export function UserDisplay({ userId, className = '', showId = false }: UserDisplayProps) {
  const [userInfo, setUserInfo] = useState<{
    email: string | null
    name: string | null
    role: string | null
    loading: boolean
  }>({
    email: null,
    name: null,
    role: null,
    loading: true
  })

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const email = await UserCache.getUserEmail(userId)
        const name = await UserCache.getUserName(userId)
        const role = await UserCache.getUserRole(userId)
        setUserInfo({
          email,
          name,
          role,
          loading: false
        })
      } catch (error) {
        console.error('Error loading user info:', error)
        setUserInfo({
          email: null,
          name: null,
          role: null,
          loading: false
        })
      }
    }

    loadUserInfo()
  }, [userId])

  if (userInfo.loading) {
    return (
      <span className={`text-sm ${className}`}>
        Loading...
      </span>
    )
  }

  if (!userInfo.email && !userInfo.name) {
    // Unknown user - show truncated ID
    const truncated = userId.substring(0, 8) + "..."
    return (
      <span className={`text-sm text-status-accepted ${className}`} title={`Unknown user: ${userId}`}>
        {truncated} ❓
      </span>
    )
  }

  // Display name, email, or role
  let displayText = userInfo.name || userInfo.email || userInfo.role || 'Unknown'
  const truncated = displayText.length > 15 ? displayText.substring(0, 15) + "..." : displayText

  return (
    <span className={`text-sm ${className}`} title={`${userInfo.name || ''} (${userInfo.email || ''}) ${userInfo.role ? `[${userInfo.role}]` : ''}`}>
      {truncated}
      {showId && (
        <span className="text-xs text-muted-foreground ml-1">
          ({userId.substring(0, 8)}...)
        </span>
      )}
    </span>
  )
} 