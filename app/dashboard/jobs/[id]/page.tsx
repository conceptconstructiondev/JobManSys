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
import { getSignedImageUrl } from "@/lib/supabase"
import { JOB_STATUS_CONFIG } from "@/lib/status-config"
import { JobsCache } from "@/lib/jobsCache"

export default function JobPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingInvoice, setUpdatingInvoice] = useState(false)
  
  // Add state for image URLs
  const [imageUrls, setImageUrls] = useState<{
    workStarted?: string | null
    workCompleted?: string | null
  }>({})
  const [loadingImages, setLoadingImages] = useState(false)

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

  // Load image URLs when job loads
  useEffect(() => {
    async function loadImageUrls() {
      if (!job) return
      
      setLoadingImages(true)
      const urls: any = {}
      
      try {
        if (job.work_started_image) {
          console.log('📸 Loading work started image:', job.work_started_image)
          urls.workStarted = await getSignedImageUrl(job.work_started_image)
        }
        
        if (job.work_completed_image) {
          console.log('📸 Loading work completed image:', job.work_completed_image)
          urls.workCompleted = await getSignedImageUrl(job.work_completed_image)
        }
        
        setImageUrls(urls)
      } catch (error) {
        console.error('Error loading image URLs:', error)
      } finally {
        setLoadingImages(false)
      }
    }
    
    loadImageUrls()
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
      return 'Invalid Date'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading job details...</p>
        </div>
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
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                          <div className="relative w-full rounded-lg overflow-hidden border">
                            {loadingImages || !imageUrls.workStarted ? (
                              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">Loading image...</span>
                              </div>
                            ) : (
                              <Image
                                src={imageUrls.workStarted}
                                alt="Problem photo - before work"
                                width={800}
                                height={600}
                                className="w-full h-auto object-contain"
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', job.work_started_image)
                                }}
                              />
                            )}
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
                          <div className="relative w-full rounded-lg overflow-hidden border">
                            {loadingImages || !imageUrls.workCompleted ? (
                              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">Loading image...</span>
                              </div>
                            ) : (
                              <Image
                                src={imageUrls.workCompleted}
                                alt="Completed work photo - after fix"
                                width={800}
                                height={600}
                                className="w-full h-auto object-contain"
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', job.work_completed_image)
                                }}
                              />
                            )}
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 