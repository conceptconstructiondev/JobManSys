"use client"

import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Concept Construction</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col gap-4 p-4">
          {children}
        </div>
      </main>
    </ProtectedRoute>
  )
}
