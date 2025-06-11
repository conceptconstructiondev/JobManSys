import * as XLSX from 'xlsx'
import { UserCache } from './userCache'

export interface ExportableJob {
  id: string
  created_at: string
  title: string
  description: string
  company: string
  status: string
  accepted_by: string | null
  time_spent: string | null
  onsite_time: string | null
  completed_time: string | null
  invoiced: boolean
}

// Helper function to format time spent
const formatTimeSpent = (timeString: string | null): string => {
  if (!timeString) return 'Not recorded'
  const [hours, minutes] = timeString.split(':')
  return `${hours} hours ${minutes} minutes`
}

// Helper function to format dates
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US')
}

// Helper function to get display name for accepted_by
const getAcceptedByName = (acceptedBy: string | null): string => {
  if (!acceptedBy) return '-'
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acceptedBy)
  if (isUUID) {
    const email = UserCache.getUserEmail(acceptedBy)
    const name = UserCache.getUserName(acceptedBy)
    return name || email || `Unknown (${acceptedBy.substring(0, 8)}...)`
  }
  return acceptedBy
}

export const exportJobsToExcel = (jobs: ExportableJob[], filename?: string): void => {
  // Transform data for Excel export
  const excelData = jobs.map((job) => ({
    'Job ID': job.id.substring(0, 8) + '...',
    'Date Created': formatDate(job.created_at),
    'Title': job.title,
    'Description': job.description,
    'Company': job.company,
    'Status': job.status,
    'Accepted By': getAcceptedByName(job.accepted_by),
    'Time Spent': formatTimeSpent(job.time_spent),
    'Onsite Time': formatDate(job.onsite_time),
    'Completed Time': formatDate(job.completed_time),
    'Invoiced': job.invoiced ? 'Yes' : 'No'
  }))

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Job ID
    { wch: 12 }, // Date Created
    { wch: 30 }, // Title
    { wch: 40 }, // Description
    { wch: 20 }, // Company
    { wch: 12 }, // Status
    { wch: 25 }, // Accepted By
    { wch: 15 }, // Time Spent
    { wch: 12 }, // Onsite Time
    { wch: 12 }, // Completed Time
    { wch: 10 }, // Invoiced
  ]
  worksheet['!cols'] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs')

  // Generate filename with current date
  const currentDate = new Date().toISOString().split('T')[0]
  const finalFilename = filename || `jobs-export-${currentDate}.xlsx`

  // Save file
  XLSX.writeFile(workbook, finalFilename)
}

// Helper to get common date ranges
export const getCommonDateRanges = () => {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  return {
    today: {
      from: startOfToday,
      to: today
    },
    yesterday: {
      from: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      to: new Date(today.getTime() - 24 * 60 * 60 * 1000)
    },
    thisWeek: {
      from: new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000)),
      to: today
    },
    thisMonth: {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: today
    },
    lastMonth: {
      from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      to: new Date(today.getFullYear(), today.getMonth(), 0)
    }
  }
}

// Optional: Export single job to Excel (for job details page)
export const exportSingleJobToExcel = (job: ExportableJob): void => {
  const jobTitle = job.title.replace(/[^\w\s]/gi, '').substring(0, 20)
  const filename = `job-${jobTitle}-${new Date().toISOString().split('T')[0]}.xlsx`
  exportJobsToExcel([job], filename)
} 