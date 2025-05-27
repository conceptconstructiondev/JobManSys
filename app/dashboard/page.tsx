"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, BriefcaseIcon,  Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { JobsDataTable } from "@/components/jobs-data-table"
import { columns } from "@/components/columns"
import { subscribeToJobs } from "@/lib/jobs"
import { Job } from "@/lib/jobs-data"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToJobs((updatedJobs) => {
      setJobs(updatedJobs)
      setLoading(false)
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

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

  // Calculate metrics for cards
  const outstandingJobs = jobs.filter(job => job.status === 'open').length
  const onsiteJobs = jobs.filter(job => job.status === 'onsite').length
  const completedJobs = jobs.filter(job => job.status === 'completed').length

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Job Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            {jobs.length} total jobs • Real-time updates enabled
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button asChild className="w-full ">
            <Link href="/dashboard/add-job">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New Job
            </Link>
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Jobs</CardTitle>
              <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outstandingJobs}</div>
              <p className="text-xs text-muted-foreground">
                Open jobs awaiting acceptance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onsite</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onsiteJobs}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                Finished jobs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Jobs</CardTitle>
            <CardDescription>
              Manage and track all your field contractor jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobsDataTable columns={columns} data={jobs} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
