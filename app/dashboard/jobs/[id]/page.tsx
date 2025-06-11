"use client"

import JobImage from '@/components/JobImage'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { getJobById, toggleJobInvoiced } from "@/lib/jobs"
import { Job } from "@/lib/jobs-data"
import { JobsCache } from "@/lib/jobsCache"
import { UserCache } from "@/lib/userCache"
import { JOB_STATUS_CONFIG } from "@/lib/status-config"
import { AlertCircle, ArrowLeft, Calendar, Camera, CheckCircle2, Clock, FileText, Receipt, User, X, Printer } from "lucide-react"
import Link from "next/link"
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const JobSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
)

const getDisplayName = (acceptedBy: string | null): string => {
  if (!acceptedBy) return 'Not assigned'
  
  // Check if it's a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acceptedBy)
  
  if (isUUID) {
    const name = UserCache.getUserName(acceptedBy)
    const email = UserCache.getUserEmail(acceptedBy)
    
    if (name) return name
    if (email) return email
    return `Unknown user (${acceptedBy.substring(0, 8)}...)`
  }
  
  // It's already an email or name
  return acceptedBy
}

const getDisplayEmail = (acceptedBy: string | null): string | null => {
  if (!acceptedBy) return null
  
  // Check if it's a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acceptedBy)
  
  if (isUUID) {
    return UserCache.getUserEmail(acceptedBy)
  }
  
  // It's already an email
  return acceptedBy
}

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .printable, .printable * {
      visibility: visible;
    }
    .printable {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
    .print-break {
      page-break-before: always;
    }
  }
`

const handlePrint = () => {
  window.print()
}

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

  useEffect(() => {
    if (job) {
      console.log('🔍 Job Debug Info:');
      console.log('Status:', job.status);
      console.log('Work started image:', job.work_started_image);
      console.log('Work completed image:', job.work_completed_image);
      console.log('Onsite time:', job.onsite_time);
      console.log('Completed time:', job.completed_time);
    }
  }, [job])

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

      // Clear cache so dashboard will fetch fresh data
      JobsCache.clear()
      console.log('Jobs cache cleared after invoice status update')
    } catch (error) {
      console.error('Failed to update invoice status:', error)
    } finally {
      setUpdatingInvoice(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Invalid date:', error)
      return 'Invalid Date'
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Invalid date:', error)
      return 'Invalid Date'
    }
  }

  const formatTimeSpent = (timeString: string | null) => {
    if (!timeString) return 'Not recorded';
    const [hours, minutes] = timeString.split(':');
    return `${hours} hours ${minutes} minutes`;
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <JobSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p>Job not found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Remove the local statusConfig and use the global one
  const config = JOB_STATUS_CONFIG[job.status]
  const StatusIcon = config.icon

  return (
    <>
      <style>{printStyles}</style>
      <div className="container mx-auto p-6 max-w-6xl printable">
        {/* Header - hide print button when printing */}
        <div className="mb-6 no-print">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs Dashboard
              </Link>
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print/Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <p className="text-muted-foreground">{job.company}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            {/* Timeline/Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Job Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Job Created - Always show */}
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

                  {/* Job Accepted - Show if accepted */}
                  {job.accepted_by && (
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Accepted by {getDisplayName(job.accepted_by)}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.accepted_at ? formatDateTime(job.accepted_at) : 'Job assigned to contractor'}
                          {getDisplayEmail(job.accepted_by) && getDisplayEmail(job.accepted_by) !== getDisplayName(job.accepted_by) && (
                            <span className="block">Email: {getDisplayEmail(job.accepted_by)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Work Started - Show if onsite_time OR work_started_image OR work_started_notes */}
                  {(job.onsite_time || job.work_started_image || job.work_started_notes) && (
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        {job.onsite_time ? (
                          <Clock className="h-4 w-4 text-white" />
                        ) : (
                          <Camera className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {job.onsite_time ? 'Work Started' : 'Work Documentation Added'}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {job.onsite_time 
                            ? `Started: ${formatDateTime(job.onsite_time)}` 
                            : 'Contractor has added documentation'
                          }
                        </p>
                        
                        {/* Show image if exists */}
                        {job.work_started_image && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-2">Problem Photo:</p>
                            <JobImage
                              imagePath={job.work_started_image}
                              alt="Work started photo"
                              className="w-full h-48 sm:h-64 rounded-lg border"
                            />
                          </div>
                        )}
                        
                        {/* Show notes if exist */}
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

                  {/* Work Completed - Show if completed_time OR work_completed_image OR work_completed_notes */}
                  {(job.completed_time || job.work_completed_image || job.work_completed_notes) && (
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {job.completed_time ? 'Job Completed' : 'Completion Documentation Added'}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {job.completed_time 
                            ? `Completed: ${formatDateTime(job.completed_time)}` 
                            : 'Contractor has added completion documentation'
                          }
                        </p>
                        
                        {/* Show image if exists */}
                        {job.work_completed_image && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-2">Completed Work Photo:</p>
                            <JobImage
                              imagePath={job.work_completed_image}
                              alt="Work completed photo"
                              className="w-full h-48 sm:h-64 rounded-lg border"
                            />
                          </div>
                        )}
                        
                        {/* Show notes if exist */}
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

                  {/* Time Spent - Show if completed and time_spent exists */}
                  {job.status === 'completed' && job.time_spent && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Time Spent</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {formatTimeSpent(job.time_spent)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{getDisplayName(job.accepted_by)}</p>
                      {getDisplayEmail(job.accepted_by) && getDisplayEmail(job.accepted_by) !== getDisplayName(job.accepted_by) && (
                        <p>{getDisplayEmail(job.accepted_by)}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {job.accepted_by.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                )}

                {job.time_spent && (
                  <div>
                    <p className="font-medium">Time Spent</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {formatTimeSpent(job.time_spent)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Management - Only show for completed jobs */}
            {job.status === 'completed' && (
              <Card className="no-print">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 ">
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 