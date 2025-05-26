import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, FileText, AlertCircle, User, CheckCircle2, X, Camera } from "lucide-react"
import Link from "next/link"
import { getJobById } from "@/lib/jobs-data"
import { notFound } from "next/navigation"

interface JobPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params
  const job = getJobById(id)

  if (!job) {
    notFound()
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
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
    return `${formattedDate} at ${formattedTime}`
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
                <div className="flex items-center">
                  {job.invoiced ? (
                    <span title="Invoiced">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </span>
                  ) : (
                    <span title="Not invoiced">
                      <X className="h-5 w-5 text-red-500" />
                    </span>
                  )}
                </div>
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
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                </div>

                {job.acceptedBy && (
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Accepted by {job.acceptedBy}</p>
                      <p className="text-sm text-muted-foreground">Job assigned to contractor</p>
                    </div>
                  </div>
                )}

                {job.onsiteTime && (
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Work Started</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {formatDateTime(job.onsiteTime)}
                      </p>
                      
                      {job.workStartedImage && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">Problem Photo:</p>
                          <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border">
                            <img
                              src={job.workStartedImage}
                              alt="Problem photo - before work"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {job.workStartedNotes && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Contractor Notes</span>
                          </div>
                          <p className="text-sm">{job.workStartedNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {job.completedTime && (
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Job Completed</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {formatDateTime(job.completedTime)}
                      </p>
                      
                      {job.workCompletedImage && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">Completed Work Photo:</p>
                          <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border">
                            <img
                              src={job.workCompletedImage}
                              alt="Completed work photo - after fix"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {job.workCompletedNotes && (
                        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">Completion Report</span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300">{job.workCompletedNotes}</p>
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
                <p className="text-sm text-muted-foreground">
                  {job.invoiced ? "Yes" : "No"}
                </p>
              </div>

              {job.acceptedBy && (
                <div>
                  <p className="font-medium">Assigned Contractor</p>
                  <p className="text-sm text-muted-foreground">{job.acceptedBy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 