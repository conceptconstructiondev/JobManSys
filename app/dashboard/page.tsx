"use client"

import { JobsDataTable } from "@/components/jobs-data-table"
import { columns } from "@/components/columns"
import { useOptimizedJobs } from "@/hooks/useOptimizedJobs"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const { jobs, loading, refresh } = useOptimizedJobs()
  const { user } = useAuth()

  console.log('Current user:', user?.email)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Job Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className="text-sm text-muted-foreground">
              {jobs.length} total jobs • Auto-refresh every 10min
            </div>
          </div>
        </div>
        
        <JobsDataTable columns={columns} data={jobs} />
      </div>
    </ProtectedRoute>
  )
}
