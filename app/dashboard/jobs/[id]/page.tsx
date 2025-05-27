"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, FileText, AlertCircle, User, CheckCircle2, X, Camera, Receipt } from "lucide-react"
import Link from "next/link"
import { getJobById, toggleJobInvoiced } from "@/lib/jobs"
import { useAuth } from "@/contexts/AuthContext"
import { Job } from "@/lib/jobs-data"
import Image from "next/image"

export default function JobPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingInvoice, setUpdatingInvoice] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      if (!user) return
      
      try {
        setLoading(true)
        const jobData = await getJobById(params.id as string)
        setJob(jobData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchJob()
    }
  }, [params.id, user, authLoading])

  const handleToggleInvoiced = async () => {
    if (!job) return

    setUpdatingInvoice(true)
    try {
      const newInvoicedStatus = !job.invoiced
      await toggleJobInvoiced(job.id, newInvoicedStatus)
      
      // Update local state
      setJob({
        ...job,
        invoiced: newInvoicedStatus
      })
    } catch (error) {
      console.error('Failed to update invoice status:', error)
      // You could add a toast notification here
    } finally {
      setUpdatingInvoice(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to view job details.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Show loading while fetching job
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading job...</div>
  }

  // Show error if fetch failed
  if (error) {
    return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>
  }

  // Show not found if job doesn't exist
  if (!job) {
    return <div className="flex items-center justify-center min-h-screen">Job not found</div>
  }

  const statusConfig = {
    open: { label: "Open", variant: "secondary" as const, icon: FileText },
    accepted: { label: "Accepted", variant: "default" as const, icon: User },
    onsite: { label: "Onsite", variant: "destructive" as const, icon: AlertCircle },
    completed: { label: "Completed", variant: "outline" as const, icon: CheckCircle2 },
  }

  const config = statusConfig[job.status]
  const StatusIcon = config.icon

  // Helper function for consistent date formatting
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
    
    return `${formattedDate} ${formattedTime}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <Badge variant={config.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground">{job.company}</p>
                  <p className="text-sm text-muted-foreground">Job ID: {job.id}</p>
                </div>
                {/* <div className="flex items-center">
                  {job.invoiced ? (
                    <span title="Invoiced">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </span>
                  ) : (
                    <span title="Not invoiced">
                      <X className="h-5 w-5 text-red-500" />
                    </span>
                  )}
                </div> */}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline/Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Job Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Job Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(job.created_at)}
                    </p>
                  </div>
                </div>

                {job.accepted_by && (
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Accepted by {job.accepted_by}</p>
                      <p className="text-sm text-muted-foreground">Job assigned to contractor</p>
                    </div>
                  </div>
                )}

                {job.onsite_time && (
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Work Started</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {formatDateTime(job.onsite_time)}
                      </p>
                      
                      {job.work_started_image && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">Problem Photo:</p>
                          <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border">
                            <Image
                              src={job.work_started_image}
                              alt="Problem photo - before work"
                              width={400}
                              height={192}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {job.work_started_notes && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Contractor Notes</span>
                          </div>
                          <p className="text-sm">{job.work_started_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {job.completed_time && (
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Job Completed</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {formatDateTime(job.completed_time)}
                      </p>
                      
                      {job.work_completed_image && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">Completed Work Photo:</p>
                          <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border">
                            <Image
                              src={job.work_completed_image}
                              alt="Completed work photo - after fix"
                              width={400}
                              height={192}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {job.work_completed_notes && (
                        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">Completion Report</span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300">{job.work_completed_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Job Details - Simplified */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Status</p>
                <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>

              <div>
                <p className="font-medium">Invoiced</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {job.invoiced ? "Yes" : "No"}
                  </p>
                  {job.invoiced ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              {job.accepted_by && (
                <div>
                  <p className="font-medium">Assigned Contractor</p>
                  <p className="text-sm text-muted-foreground">{job.accepted_by}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Management - Only show for completed jobs */}
          {job.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Invoice Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Invoice Status:</span>
                    <Badge variant={job.invoiced ? "default" : "secondary"}>
                      {job.invoiced ? "Invoiced" : "Not Invoiced"}
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={handleToggleInvoiced}
                    disabled={updatingInvoice}
                    variant={job.invoiced ? "outline" : "default"}
                    className="w-full"
                  >
                    {updatingInvoice ? (
                      "Updating..."
                    ) : job.invoiced ? (
                      "Mark as Not Invoiced"
                    ) : (
                      "Mark as Invoiced"
                    )}
                  </Button>
                  
                  {job.invoiced && (
                    <p className="text-xs text-muted-foreground">
                      This job has been marked as invoiced and will appear in your billing records.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 