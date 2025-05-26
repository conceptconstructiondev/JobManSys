'use client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
} 