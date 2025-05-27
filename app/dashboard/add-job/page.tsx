"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createJob } from "@/lib/jobs"
import { JobsCache } from "@/lib/jobsCache"

export default function AddJobPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const jobId = await createJob({
        title: formData.title,
        description: formData.description,
        company: formData.company,
        status: "open",
        acceptedBy: null,
        acceptedAt: null,
        onsiteTime: null,
        completedTime: null,
        invoiced: false,
      })

      console.log("New job created with ID:", jobId)
      
      // Clear cache so dashboard will fetch fresh data including the new job
      JobsCache.clear()
      
      // Navigate back to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating job:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title.trim() && formData.description.trim() && formData.company.trim()

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>
      
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2 p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Job Details</CardTitle>
          <CardDescription className="text-sm">
            Fill in the details for the new job
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Job Title *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., HVAC System Maintenance"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">Company *</Label>
              <Input
                id="company"
                name="company"
                type="text"
                placeholder="e.g., Tech Corp"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[100px] md:min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Describe the job requirements, location, and any special instructions..."
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-2 md:pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="flex-1 min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    Creating Job...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Job
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="min-h-[44px]">
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 