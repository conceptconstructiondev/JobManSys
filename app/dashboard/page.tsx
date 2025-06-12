"use client"

import { JobsDataTable } from "@/components/jobs-data-table"
import { columns } from "@/components/columns"
import { useOptimizedJobs } from "@/hooks/useOptimizedJobs"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus } from "lucide-react"
import Link from "next/link"

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
       {/* Header Section */}
       <div className="flex items-center justify-end">
       
       <div className="flex items-center gap-4">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <div className="h-2 w-2 rounded-full animate-pulse bg-status-completed"></div>
           {jobs.length} total jobs • Auto-refresh every 10min
         </div>
         <Button 
           variant="outline" 
           size="sm" 
           onClick={refresh}
           className="flex items-center gap-2"
         >
           <RefreshCw className="h-4 w-4" />
           Refresh
         </Button>
       </div>
     </div>
      <div className="space-y-4">
        {/* Full-width Add Job Button */}
        <Button asChild className="w-full h-12 text-lg">
          <Link href="/dashboard/add-job" className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Job
          </Link>
        </Button>

       
        
        {/* Jobs Table */}
        <JobsDataTable columns={columns} data={jobs} />
      </div>
    </ProtectedRoute>
  )
}
