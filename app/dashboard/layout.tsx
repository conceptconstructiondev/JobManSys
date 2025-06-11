"use client"

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { signOut, user } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <ProtectedRoute>
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Concept Construction</h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <div className="flex-1 flex flex-col gap-4 p-4">
          {children}
        </div>
      </main>
    </ProtectedRoute>
  )
}
